import type { Application, Stage } from '../types';
import { stages } from '../types';
import { formatDate } from '../lib/applications';
interface Props {
  applications: Application[];
  busy: boolean;
  onOpen: (item: Application) => void;
  onStageChange: (item: Application, stage: Stage) => Promise<void>;
}
export default function ApplicationBoard({
  applications,
  busy,
  onOpen,
  onStageChange,
}: Props) {
  return (
    <div
      className="application-board"
      role="region"
      aria-label="Application board"
      tabIndex={0}
    >
      {stages.map((stage) => {
        const items = applications.filter((item) => item.stage === stage);
        return (
          <section className="board-column" key={stage} aria-label={stage}>
            <header>
              <span className="status" data-stage={stage}>
                {stage}
              </span>
              <span>{items.length}</span>
            </header>
            <div className="board-cards">
              {items.map((item) => (
                <article className="board-card" key={item.id}>
                  <button className="company-link" onClick={() => onOpen(item)}>
                    {item.company}
                    <span className="sr-only">, {item.role}, view details</span>
                  </button>
                  <p className="role-name">{item.role}</p>
                  <p className="board-location">
                    {item.location || 'Location not specified'} · {item.mode}
                  </p>
                  {item.nextAction && (
                    <p className="board-next">
                      {item.nextAction}
                      {item.actionDate && (
                        <small>{formatDate(item.actionDate)}</small>
                      )}
                    </p>
                  )}
                  <label className="board-stage-label">
                    Stage for {item.company}
                    <select
                      value={item.stage}
                      disabled={busy}
                      onChange={(event) => {
                        void onStageChange(item, event.target.value as Stage);
                      }}
                    >
                      {stages.map((value) => (
                        <option key={value}>{value}</option>
                      ))}
                    </select>
                  </label>
                </article>
              ))}
              {!items.length && (
                <p className="board-empty">No applications here yet.</p>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
