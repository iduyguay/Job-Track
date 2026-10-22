import { useEffect, useRef, useState } from 'react';
import type { User } from 'firebase/auth';
import type { Application } from '../types';
import { createDemo, loadApplications, storageKey } from '../lib/applications';
import {
  deleteCloudApplication,
  saveCloudApplication,
  watchApplications,
} from '../lib/cloud';
import { describeError } from '../lib/errors';
import { nextApplication } from '../lib/history';
export function useApplications(user: User | null) {
  const [initial] = useState(() =>
    user ? { items: [], error: '' } : loadApplications(),
  );
  const [applications, setApplications] = useState<Application[]>(
    initial.items,
  );
  const [error, setError] = useState(initial.error);
  const [loading, setLoading] = useState(Boolean(user));
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const current = useRef(applications);
  current.current = applications;
  useEffect(() => {
    if (!user) return;
    return watchApplications(
      user.uid,
      (items) => {
        current.current = items;
        setApplications(items);
        setLoading(false);
        setError('');
      },
      (failure) => {
        setLoading(false);
        setError(describeError(failure));
      },
    );
  }, [user]);
  function persist(items: Application[]) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch {
      throw new Error(
        'Browser storage is unavailable or full. Your changes could not be saved.',
      );
    }
    current.current = items;
    setApplications(items);
  }
  async function execute(action: () => Promise<void>) {
    if (lock.current)
      throw new Error('Another change is being saved. Please wait.');
    lock.current = true;
    setBusy(true);
    try {
      await action();
      setError('');
    } catch (failure) {
      const message = describeError(failure);
      setError(message);
      throw new Error(message);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  async function save(input: Application, previous?: Application) {
    await execute(async () => {
      if (user) await saveCloudApplication(user.uid, input, previous);
      else {
        const existing = current.current.find((item) => item.id === input.id);
        if (
          previous &&
          (!existing || (existing.version ?? 0) !== (previous.version ?? 0))
        )
          throw new Error(
            'This application changed. Close and reopen it before saving.',
          );
        const updated = nextApplication(input, existing);
        persist(
          existing
            ? current.current.map((item) =>
                item.id === input.id ? updated : item,
              )
            : [updated, ...current.current],
        );
      }
    });
  }
  async function remove(item: Application) {
    await execute(async () => {
      if (user) await deleteCloudApplication(user.uid, item);
      else persist(current.current.filter((entry) => entry.id !== item.id));
    });
  }
  async function resetDemo() {
    if (user)
      throw new Error('Sample data is available only in the local workspace.');
    await execute(async () => persist(createDemo()));
  }
  return { applications, error, loading, busy, save, remove, resetDemo };
}
