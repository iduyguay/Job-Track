export const stages = [
  'Applied',
  'HR interview',
  'Technical interview',
  'Offer',
  'Rejected',
  'Withdrawn',
] as const;
export const workModes = ['Remote', 'Hybrid', 'On-site'] as const;
export type Stage = (typeof stages)[number];
export type WorkMode = (typeof workModes)[number];
export interface Application {
  id: string;
  company: string;
  role: string;
  location: string;
  mode: WorkMode;
  stage: Stage;
  appliedAt: string;
  nextAction: string;
  actionDate: string;
  notes: string;
  history?: StageEvent[];
  version?: number;
}
export interface StageEvent {
  id: string;
  from: Stage | null;
  to: Stage;
  at: string;
}
