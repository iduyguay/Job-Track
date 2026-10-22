import {
  collection,
  doc,
  onSnapshot,
  runTransaction,
} from 'firebase/firestore';
import { db } from './firebase';
import { isApplication } from './applications';
import { nextApplication, withHistory } from './history';
import type { Application } from '../types';
function database() {
  if (!db) throw new Error('Cloud storage is not configured.');
  return db;
}
export function watchApplications(
  uid: string,
  onData: (items: Application[]) => void,
  onError: (error: unknown) => void,
) {
  return onSnapshot(
    collection(database(), 'users', uid, 'applications'),
    (snapshot) => {
      const items: Application[] = [];
      for (const document of snapshot.docs) {
        const value: unknown = { ...document.data(), id: document.id };
        if (!isApplication(value)) {
          onError(
            new Error(
              'A cloud application could not be read. Reload after checking its data format.',
            ),
          );
          return;
        }
        items.push(withHistory(value));
      }
      onData(items);
    },
    onError,
  );
}
export async function saveCloudApplication(
  uid: string,
  input: Application,
  previous?: Application,
): Promise<void> {
  const reference = doc(database(), 'users', uid, 'applications', input.id);
  await runTransaction(database(), async (transaction) => {
    const snapshot = await transaction.get(reference);
    if (previous) {
      if (!snapshot.exists())
        throw new Error(
          'This application was deleted elsewhere. Close this window and refresh.',
        );
      if (snapshot.data().version !== previous.version)
        throw new Error(
          'This application changed in another window. Close this window and reopen it before saving.',
        );
    } else if (snapshot.exists())
      throw new Error('An application with this identifier already exists.');
    const updated = nextApplication(input, previous);
    transaction.set(reference, { ...updated, ownerId: uid });
  });
}
export async function deleteCloudApplication(
  uid: string,
  item: Application,
): Promise<void> {
  const reference = doc(database(), 'users', uid, 'applications', item.id);
  await runTransaction(database(), async (transaction) => {
    const snapshot = await transaction.get(reference);
    if (!snapshot.exists()) return;
    if (snapshot.data().version !== item.version)
      throw new Error(
        'This application changed in another window. Reopen it before deleting.',
      );
    transaction.delete(reference);
  });
}
