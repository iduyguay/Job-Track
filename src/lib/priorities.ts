import type { Application } from '../types';
import { isCalendarDate } from './applications';
export type PriorityGroup = 'overdue' | 'today' | 'upcoming';
export interface PriorityItem {
  application: Application;
  group: PriorityGroup;
  daysAway: number;
  reason: string;
}
export function calendarDistance(from: string, to: string): number {
  return (
    (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86400000
  );
}
export function buildPriorities(
  applications: Application[],
  today: string,
): PriorityItem[] {
  if (!isCalendarDate(today)) return [];
  return applications
    .flatMap<PriorityItem>((application) => {
      if (
        ['Rejected', 'Withdrawn'].includes(application.stage) ||
        !application.nextAction.trim() ||
        !isCalendarDate(application.actionDate)
      )
        return [];
      const daysAway = calendarDistance(today, application.actionDate);
      if (daysAway > 7) return [];
      const interview = ['HR interview', 'Technical interview'].includes(
        application.stage,
      );
      const subject = interview ? 'Interview action' : 'Next step';
      const group: PriorityGroup =
        daysAway < 0 ? 'overdue' : daysAway === 0 ? 'today' : 'upcoming';
      const reason =
        daysAway < 0
          ? `${subject} was due ${-daysAway} ${daysAway === -1 ? 'day' : 'days'} ago. Review or reschedule it.`
          : daysAway === 0
            ? `${subject} is scheduled for today.`
            : daysAway === 1
              ? `${subject} is scheduled for tomorrow.`
              : `${subject} is scheduled in ${daysAway} days.`;
      return [{ application, group, daysAway, reason }];
    })
    .sort(
      (a, b) =>
        a.daysAway - b.daysAway ||
        a.application.company.localeCompare(b.application.company) ||
        a.application.id.localeCompare(b.application.id),
    );
}
