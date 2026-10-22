import { describe, expect, it } from 'vitest';
import { buildPriorities, calendarDistance } from '../src/lib/priorities';
import { createDemo } from '../src/lib/applications';
import type { Application } from '../src/types';
const today = '2026-10-23';
const record = (input: Partial<Application> = {}): Application => ({
  ...createDemo()[0],
  id: 'test',
  stage: 'Applied',
  nextAction: 'Follow up',
  actionDate: today,
  ...input,
});
describe('Today priorities', () => {
  it('groups overdue, today, tomorrow, and the seven-day boundary in chronological order', () => {
    const results = buildPriorities(
      [
        record({ id: 'week', actionDate: '2026-10-30' }),
        record({ id: 'today' }),
        record({ id: 'late', actionDate: '2026-10-21' }),
        record({ id: 'tomorrow', actionDate: '2026-10-24' }),
        record({ id: 'later', actionDate: '2026-10-31' }),
      ],
      today,
    );
    expect(
      results.map((result) => [result.application.id, result.group]),
    ).toEqual([
      ['late', 'overdue'],
      ['today', 'today'],
      ['tomorrow', 'upcoming'],
      ['week', 'upcoming'],
    ]);
    expect(results[0].reason).toContain('2 days ago');
    expect(results[2].reason).toContain('tomorrow');
  });
  it('excludes closed applications, missing actions, invalid dates, and completed actions', () => {
    const results = buildPriorities(
      [
        record({ stage: 'Rejected' }),
        record({ stage: 'Withdrawn' }),
        record({ nextAction: '  ' }),
        record({ actionDate: '' }),
        record({ actionDate: '2026-02-30' }),
        record({ nextAction: '', actionDate: '' }),
      ],
      today,
    );
    expect(results).toEqual([]);
    expect(buildPriorities([record()], 'invalid')).toEqual([]);
  });
  it('keeps offer follow-ups and gives interviews an explicit reason', () => {
    expect(buildPriorities([record({ stage: 'Offer' })], today)).toHaveLength(
      1,
    );
    expect(
      buildPriorities([record({ stage: 'Technical interview' })], today)[0]
        .reason,
    ).toBe('Interview action is scheduled for today.');
    expect(
      buildPriorities([record({ actionDate: '2026-10-22' })], today)[0].reason,
    ).toContain('1 day ago');
  });
  it('breaks date ties deterministically without changing input order', () => {
    const input = [
      record({ id: 'b', company: 'Zebra' }),
      record({ id: 'c', company: 'Acme' }),
      record({ id: 'a', company: 'Acme' }),
    ];
    expect(
      buildPriorities(input, today).map((item) => item.application.id),
    ).toEqual(['a', 'c', 'b']);
    expect(input.map((item) => item.id)).toEqual(['b', 'c', 'a']);
  });
  it('measures calendar days across daylight saving, leap days and year boundaries', () => {
    expect(calendarDistance('2026-10-24', '2026-10-26')).toBe(2);
    expect(calendarDistance('2024-02-28', '2024-03-01')).toBe(2);
    expect(calendarDistance('2026-12-31', '2027-01-01')).toBe(1);
  });
});
