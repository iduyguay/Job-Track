import { describe, expect, it } from 'vitest';
import { nextApplication } from '../src/lib/history';
import {
  isApplication,
  isCalendarDate,
  createDemo,
} from '../src/lib/applications';
const item = () => createDemo()[0];
describe('application lifecycle', () => {
  it('records creation and stage transitions without mutating the previous version', () => {
    const created = nextApplication(item());
    const changed = nextApplication({ ...created, stage: 'Offer' }, created);
    expect(created.version).toBe(1);
    expect(created.history).toHaveLength(1);
    expect(changed.version).toBe(2);
    expect(changed.history?.[1]).toMatchObject({
      from: 'Technical interview',
      to: 'Offer',
    });
  });
  it('does not record a new transition when only notes change', () => {
    const created = nextApplication(item());
    const changed = nextApplication(
      { ...created, notes: 'Interview preparation' },
      created,
    );
    expect(changed.history).toEqual(created.history);
    expect(changed.version).toBe(2);
  });
  it('accepts legacy local records but rejects malformed history and invalid calendar dates', () => {
    expect(isApplication(item())).toBe(true);
    expect(isApplication({ ...item(), history: [{ to: 'Unknown' }] })).toBe(
      false,
    );
    expect(isApplication({ ...item(), version: -1 })).toBe(false);
    expect(isApplication({ ...item(), appliedAt: '2026-02-30' })).toBe(false);
    expect(isCalendarDate('2024-02-29')).toBe(true);
    expect(isCalendarDate('2026-02-29')).toBe(false);
  });
});
