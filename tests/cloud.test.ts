import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { deleteApp } from 'firebase/app';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import type { Application } from '../src/types';
import { createDemo } from '../src/lib/applications';
const suite =
  process.env.FIRESTORE_EMULATOR_HOST && process.env.FIREBASE_AUTH_EMULATOR_HOST
    ? describe
    : describe.skip;
suite('cloud application lifecycle', () => {
  let auth: Auth;
  let db: Firestore;
  let cloud: typeof import('../src/lib/cloud');
  beforeAll(async () => {
    vi.stubEnv('VITE_USE_FIREBASE_EMULATORS', 'true');
    const firebase = await import('../src/lib/firebase');
    auth = firebase.auth!;
    db = firebase.db!;
    cloud = await import('../src/lib/cloud');
  });
  afterAll(async () => {
    await signOut(auth);
    await deleteApp(auth.app);
    vi.unstubAllEnvs();
  });
  it('saves and updates with history, rejects stale edits and deletes, and removes the current record', async () => {
    const user = await createUserWithEmailAndPassword(
      auth,
      `cloud-${crypto.randomUUID()}@example.test`,
      'Testing-password-123',
    );
    const uid = user.user.uid;
    const input = { ...createDemo()[0], id: crypto.randomUUID() };
    const reference = doc(db, 'users', uid, 'applications', input.id);
    await cloud.saveCloudApplication(uid, input);
    const original = (await getDoc(reference)).data() as Application;
    expect(original.version).toBe(1);
    expect(original.history).toHaveLength(1);
    await cloud.saveCloudApplication(
      uid,
      { ...original, stage: 'Offer' },
      original,
    );
    const updated = (await getDoc(reference)).data() as Application;
    expect(updated.version).toBe(2);
    expect(updated.history?.[1]).toMatchObject({
      from: 'Technical interview',
      to: 'Offer',
    });
    await expect(
      cloud.saveCloudApplication(
        uid,
        { ...original, notes: 'Stale edit' },
        original,
      ),
    ).rejects.toThrow('changed in another window');
    await expect(cloud.deleteCloudApplication(uid, original)).rejects.toThrow(
      'changed in another window',
    );
    await cloud.deleteCloudApplication(uid, updated);
    expect((await getDoc(reference)).exists()).toBe(false);
  }, 30000);
});
