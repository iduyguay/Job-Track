import type { Application } from '../types';
import type { PriorityGroup, PriorityItem } from '../lib/priorities';
import { formatDate } from '../lib/applications';
import { ArrowUpRight, Check, CheckCheck } from 'lucide-react';
interface Props {
  items: PriorityItem[];
  loading: boolean;
  busy: boolean;
  onOpen: (item: Application) => void;
  onComplete: (item: Application) => Promise<void>;
  onBrowse: () => void;
}
const groups: { key: PriorityGroup; title: string; description: string }[] = [
  {
    key: 'overdue',
    title: 'Needs your attention',
    description: 'A date has passed. Check the outcome or make a new plan.',
  },
  {
    key: 'today',
    title: 'On your list today',
    description: 'Small steps that keep things moving.',
  },
  {
    key: 'upcoming',
    title: 'Coming up',
    description: 'A little preparation goes a long way.',
  },
];
export default function TodayView({
  items,
  loading,
  busy,
  onOpen,
  onComplete,
  onBrowse,
}: Props) {
  if (loading)
    return (
      <section className="empty-state" role="status">
        Finding your next steps…
      </section>
    );
  return (
    <section className="today-section" aria-labelledby="today-title">
      <div className="section-heading">
        <div>
          <h2 id="today-title" tabIndex={-1}>
            Your next steps <span>{items.length}</span>
          </h2>
          <p>Overdue actions, today, and the next seven days.</p>
        </div>
      </div>
      <div className="today-summary" aria-label="Next step summary">
        {groups.map((group) => (
          <div key={group.key} data-priority={group.key}>
            <span>
              {group.key === 'overdue'
                ? 'Overdue'
                : group.key === 'today'
                  ? 'Due today'
                  : 'Next 7 days'}
            </span>
            <strong>
              {items.filter((item) => item.group === group.key).length}
            </strong>
          </div>
        ))}
      </div>
      {items.length ? (
        groups.map((group) => {
          const entries = items.filter((item) => item.group === group.key);
          if (!entries.length) return null;
          return (
            <section
              className="priority-group"
              key={group.key}
              aria-labelledby={`priority-${group.key}`}
            >
              <header>
                <h3 id={`priority-${group.key}`}>
                  {group.title} <span>{entries.length}</span>
                </h3>
                <p>{group.description}</p>
              </header>
              <div className="priority-list">
                {entries.map(({ application, reason }) => (
                  <article
                    className="priority-item"
                    data-priority={group.key}
                    key={application.id}
                  >
                    <div className="priority-main">
                      <span className="priority-date">
                        {formatDate(application.actionDate)}
                      </span>
                      <h4>{application.nextAction}</h4>
                      <button
                        className="company-link"
                        onClick={() => onOpen(application)}
                      >
                        {application.company} · {application.role}
                        <ArrowUpRight size={13} aria-hidden="true" />
                      </button>
                      <p>{reason}</p>
                    </div>
                    <div className="priority-actions">
                      <span className="status" data-stage={application.stage}>
                        {application.stage}
                      </span>
                      <button
                        className="button secondary"
                        disabled={busy}
                        onClick={() => void onComplete(application)}
                        aria-label={`Mark next step complete for ${application.company}`}
                      >
                        <Check size={15} aria-hidden="true" />
                        Done
                      </button>
                      <button
                        className="text-button"
                        disabled={busy}
                        onClick={() => onOpen(application)}
                      >
                        Review or reschedule
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        })
      ) : (
        <div className="empty-state today-empty">
          <CheckCheck size={30} aria-hidden="true" />
          <h3>A little breathing room.</h3>
          <p>
            No open actions are due within seven days. Add a next step and date
            to an application to see it here.
          </p>
          <button className="button secondary" onClick={onBrowse}>
            Browse applications
          </button>
        </div>
      )}
      <p className="today-explanation">
        Ordered by action date, then company. Rejected and withdrawn
        applications are excluded. Marking an action done clears its next step
        and date; it does not change the application stage.
      </p>
    </section>
  );
}
