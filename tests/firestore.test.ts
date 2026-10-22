import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';
import type { RulesTestEnvironment } from '@firebase/rules-unit-testing';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { createDemo } from '../src/lib/applications';
import { nextApplication } from '../src/lib/history';
const suite = process.env.FIRESTORE_EMULATOR_HOST ? describe : describe.skip;
suite('Firestore ownership and validation', () => {
  let environment: RulesTestEnvironment;
  const path = 'users/alice/applications/application-1';
  const record = () => ({
    ...nextApplication({ ...createDemo()[0], id: 'application-1' }),
    ownerId: 'alice',
  });
  beforeAll(async () => {
    environment = await initializeTestEnvironment({
      projectId: 'demo-jobtrack',
      firestore: { rules: readFileSync('firestore.rules', 'utf8') },
    });
  }, 30000);
  beforeEach(async () => {
    await environment.clearFirestore();
  });
  afterAll(async () => {
    await environment.cleanup();
  });
  it('allows the owner to create, list, read, update, and delete', async () => {
    const database = environment.authenticatedContext('alice').firestore();
    const reference = doc(database, path);
    await assertSucceeds(setDoc(reference, record()));
    expect(
      (
        await assertSucceeds(
          getDocs(collection(database, 'users/alice/applications')),
        )
      ).size,
    ).toBe(1);
    await assertSucceeds(getDoc(reference));
    await assertSucceeds(
      updateDoc(reference, { notes: 'Follow up next week', version: 2 }),
    );
    await assertSucceeds(deleteDoc(reference));
  });
  it('denies every access path for another user and unauthenticated visitors', async () => {
    await setDoc(
      doc(environment.authenticatedContext('alice').firestore(), path),
      record(),
    );
    for (const database of [
      environment.authenticatedContext('bob').firestore(),
      environment.unauthenticatedContext().firestore(),
    ]) {
      await assertFails(getDoc(doc(database, path)));
      await assertFails(
        getDocs(collection(database, 'users/alice/applications')),
      );
      await assertFails(setDoc(doc(database, path), record()));
      await assertFails(
        updateDoc(doc(database, path), { notes: 'Changed', version: 2 }),
      );
      await assertFails(deleteDoc(doc(database, path)));
    }
  });
  it('rejects spoofed owners, extra fields, invalid stages and stale versions', async () => {
    const database = environment.authenticatedContext('alice').firestore();
    const reference = doc(database, path);
    await assertFails(setDoc(reference, { ...record(), ownerId: 'bob' }));
    await assertFails(setDoc(reference, { ...record(), stage: 'Unknown' }));
    await assertFails(setDoc(reference, { ...record(), secret: true }));
    await assertFails(setDoc(reference, { ...record(), company: '' }));
    await assertSucceeds(setDoc(reference, record()));
    await assertFails(updateDoc(reference, { notes: 'Stale', version: 1 }));
    await assertFails(updateDoc(reference, { ownerId: 'bob', version: 2 }));
  });
});
