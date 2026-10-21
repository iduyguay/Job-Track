import { stages, workModes } from '../types';
import type { Application } from '../types';
export const storageKey = 'jobtrack.applications.v1';
export function dateOffset(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function formatDate(value: string): string {
  return value
    ? new Intl.DateTimeFormat('en', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date(`${value}T12:00:00`))
    : 'Not scheduled';
}
export function createDemo(): Application[] {
  const rows: [
    string,
    string,
    string,
    Application['mode'],
    Application['stage'],
    number,
    string,
    number,
  ][] = [
    [
      'Linear',
      'Frontend Engineer',
      'London, UK',
      'Remote',
      'Technical interview',
      -8,
      'Prepare for the technical interview',
      1,
    ],
    [
      'Figma',
      'Design Engineer',
      'London, UK',
      'Hybrid',
      'HR interview',
      -6,
      'Meet the recruiting team',
      2,
    ],
    [
      'Notion',
      'Software Engineer',
      'Dublin, Ireland',
      'Hybrid',
      'Applied',
      -4,
      'Follow up with the recruiter',
      4,
    ],
    [
      'Buffer',
      'Frontend Developer',
      'Remote, Europe',
      'Remote',
      'Offer',
      -18,
      'Review the offer details',
      3,
    ],
    [
      'Vercel',
      'UI Engineer',
      'Berlin, Germany',
      'Remote',
      'Applied',
      -2,
      '',
      0,
    ],
    [
      'Miro',
      'Frontend Engineer',
      'Amsterdam, Netherlands',
      'Hybrid',
      'Rejected',
      -20,
      '',
      0,
    ],
    [
      'Intercom',
      'Product Engineer',
      'Dublin, Ireland',
      'On-site',
      'Applied',
      -1,
      '',
      0,
    ],
    [
      'Doist',
      'Web Developer',
      'Remote, Europe',
      'Remote',
      'Withdrawn',
      -15,
      '',
      0,
    ],
  ];
  return rows.map(
    (
      [company, role, location, mode, stage, days, nextAction, actionDays],
      index,
    ) => ({
      id: `demo-${index}`,
      company,
      role,
      location,
      mode,
      stage,
      appliedAt: dateOffset(days),
      nextAction,
      actionDate: nextAction ? dateOffset(actionDays) : '',
      notes: '',
    }),
  );
}
export function isApplication(value: unknown): value is Application {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  return (
    [
      'id',
      'company',
      'role',
      'location',
      'appliedAt',
      'nextAction',
      'actionDate',
      'notes',
    ].every((key) => typeof item[key] === 'string') &&
    stages.some((stage) => stage === item.stage) &&
    workModes.some((mode) => mode === item.mode) &&
    /^\d{4}-\d{2}-\d{2}$/.test(String(item.appliedAt))
  );
}
export function loadApplications(): { items: Application[]; error: string } {
  try {
    const saved = localStorage.getItem(storageKey);
    if (!saved) return { items: [], error: '' };
    const parsed: unknown = JSON.parse(saved);
    if (!Array.isArray(parsed) || !parsed.every(isApplication))
      throw new Error();
    return { items: parsed, error: '' };
  } catch {
    return {
      items: [],
      error:
        'Saved data could not be loaded. You can start again or load the sample applications.',
    };
  }
}
