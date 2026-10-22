import { afterAll, describe, expect, it } from 'vitest';
import { deleteApp, initializeApp } from 'firebase/app';
import {
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  getAuth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
const suite = process.env.FIREBASE_AUTH_EMULATOR_HOST
  ? describe
  : describe.skip;
suite('email account lifecycle', () => {
  const app = initializeApp(
    { apiKey: 'demo-key', projectId: 'demo-jobtrack' },
    'auth-tests',
  );
  const auth = getAuth(app);
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  afterAll(async () => {
    await deleteApp(app);
  });
  it('registers, signs out, rejects a wrong password, signs back in, and sends a reset email', async () => {
    const email = `tester-${crypto.randomUUID()}@example.test`;
    const password = 'Testing-password-123';
    const registration = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const uid = registration.user.uid;
    await signOut(auth);
    expect(auth.currentUser).toBeNull();
    await expect(
      signInWithEmailAndPassword(auth, email, 'incorrect-password'),
    ).rejects.toBeDefined();
    expect(
      (await signInWithEmailAndPassword(auth, email, password)).user.uid,
    ).toBe(uid);
    await sendPasswordResetEmail(auth, email);
    const response = await fetch(
      'http://127.0.0.1:9099/emulator/v1/projects/demo-jobtrack/oobCodes',
    );
    const result = (await response.json()) as {
      oobCodes: { email: string; requestType: string }[];
    };
    expect(
      result.oobCodes.some(
        (code) => code.email === email && code.requestType === 'PASSWORD_RESET',
      ),
    ).toBe(true);
  }, 30000);
});
