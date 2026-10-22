import type { Application, Stage, StageEvent } from '../types';
export function withHistory(item: Application): Application {
  return { ...item, version: item.version ?? 0, history: item.history ?? [] };
}
export function nextApplication(
  input: Application,
  previous?: Application,
): Application {
  const next = withHistory(input);
  const history = previous?.history ?? [];
  if (!previous || previous.stage !== next.stage) {
    const entry: StageEvent = {
      id: crypto.randomUUID(),
      from: previous?.stage ?? null,
      to: next.stage,
      at: new Date().toISOString(),
    };
    next.history = [...history, entry].slice(-100);
  } else next.history = history;
  next.version = (previous?.version ?? 0) + 1;
  return next;
}
export function stageIsValid(value: unknown): value is Stage {
  return [
    'Applied',
    'HR interview',
    'Technical interview',
    'Offer',
    'Rejected',
    'Withdrawn',
  ].includes(String(value));
}
export function formatTimestamp(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Date unavailable'
    : new Intl.DateTimeFormat('en', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(date);
}
