import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { X } from 'lucide-react';
import { stages, workModes } from '../types';
import type { Application } from '../types';
import { dateOffset, formatDate, isCalendarDate } from '../lib/applications';
import { formatTimestamp } from '../lib/history';
import { describeError } from '../lib/errors';
import Modal from './Modal';
interface Props {
  application: Application | null;
  onClose: () => void;
  onSave: (application: Application, previous?: Application) => Promise<void>;
  onDelete: (application: Application) => Promise<void>;
}
export default function ApplicationDialog({
  application,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const [editing, setEditing] = useState(!application);
  const [deleting, setDeleting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const identifier = useRef(application?.id ?? crypto.randomUUID());
  const close = () => {
    if (!busy) onClose();
  };
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const data = new FormData(event.currentTarget);
    const company = String(data.get('company')).trim();
    const role = String(data.get('role')).trim();
    const appliedAt = String(data.get('appliedAt'));
    const nextAction = String(data.get('nextAction')).trim();
    const actionDate = String(data.get('actionDate'));
    if (!company || !role) {
      setError('Enter a company and a position.');
      return;
    }
    if (
      !isCalendarDate(appliedAt) ||
      appliedAt > dateOffset(0) ||
      (actionDate && !isCalendarDate(actionDate))
    ) {
      setError(
        'Enter valid dates. The application date cannot be in the future.',
      );
      return;
    }
    if (actionDate && !nextAction) {
      setError('Add a next step for the action date.');
      return;
    }
    const item: Application = {
      id: identifier.current,
      company,
      role,
      location: String(data.get('location')).trim(),
      mode: String(data.get('mode')) as Application['mode'],
      stage: String(data.get('stage')) as Application['stage'],
      appliedAt,
      nextAction,
      actionDate,
      notes: String(data.get('notes')).trim(),
    };
    setBusy(true);
    setError('');
    try {
      await onSave(item, application ?? undefined);
      onClose();
    } catch (failure) {
      setError(describeError(failure));
    } finally {
      setBusy(false);
    }
  }
  async function remove() {
    if (!application || busy) return;
    setBusy(true);
    setError('');
    try {
      await onDelete(application);
      onClose();
    } catch (failure) {
      setError(describeError(failure));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal titleId="application-title" onClose={close} busy={busy}>
      <header className="dialog-header">
        <div>
          <p className="eyebrow">YOUR JOB SEARCH</p>
          <h2 id="application-title">
            {application
              ? editing
                ? 'Edit application'
                : application.company
              : 'A new opportunity'}
          </h2>
        </div>
        <button
          className="icon-button"
          disabled={busy}
          onClick={close}
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>
      </header>
      {!editing && application ? (
        <div className="detail-content">
          <h3>{application.role}</h3>
          <span className="status" data-stage={application.stage}>
            {application.stage}
          </span>
          <dl>
            <dt>Location</dt>
            <dd>
              {application.location || 'Not specified'} · {application.mode}
            </dd>
            <dt>Applied</dt>
            <dd>{formatDate(application.appliedAt)}</dd>
            <dt>Next step</dt>
            <dd>{application.nextAction || 'No next step yet'}</dd>
            <dt>Scheduled for</dt>
            <dd>{formatDate(application.actionDate)}</dd>
            <dt>Notes</dt>
            <dd className="notes">{application.notes || 'No notes yet.'}</dd>
          </dl>
          <section className="activity" aria-labelledby="activity-title">
            <h3 id="activity-title">Stage history</h3>
            {application.history?.length ? (
              <ol>
                {application.history
                  .slice()
                  .reverse()
                  .map((entry) => (
                    <li key={entry.id}>
                      <strong>
                        {entry.from
                          ? `${entry.from} → ${entry.to}`
                          : `Application added · ${entry.to}`}
                      </strong>
                      <time dateTime={entry.at}>
                        {formatTimestamp(entry.at)}
                      </time>
                    </li>
                  ))}
              </ol>
            ) : (
              <p>Stage history will appear after your next update.</p>
            )}
          </section>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          {deleting ? (
            <div className="delete-confirmation">
              <h3>Delete this application?</h3>
              <p>
                Delete {application.role} at {application.company}? This
                permanently removes the application and its stage history.
              </p>
              <div className="form-footer">
                <button
                  className="button secondary"
                  disabled={busy}
                  onClick={() => setDeleting(false)}
                >
                  Keep application
                </button>
                <button
                  className="button danger"
                  disabled={busy}
                  onClick={remove}
                >
                  {busy ? 'Deleting…' : 'Delete permanently'}
                </button>
              </div>
            </div>
          ) : (
            <div className="detail-actions">
              <button
                className="button danger-outline"
                onClick={() => setDeleting(true)}
              >
                Delete application
              </button>
              <button
                className="button primary"
                onClick={() => {
                  setError('');
                  setEditing(true);
                }}
              >
                Edit application
              </button>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={submit} className="application-form">
          <fieldset disabled={busy}>
            <label>
              Company
              <input
                name="company"
                autoFocus
                required
                maxLength={100}
                defaultValue={application?.company}
                placeholder="e.g. Linear"
              />
            </label>
            <label>
              Position
              <input
                name="role"
                required
                maxLength={150}
                defaultValue={application?.role}
                placeholder="e.g. Frontend Engineer"
              />
            </label>
            <div className="form-row">
              <label>
                Stage
                <select
                  name="stage"
                  defaultValue={application?.stage ?? 'Applied'}
                >
                  {stages.map((stage) => (
                    <option key={stage}>{stage}</option>
                  ))}
                </select>
              </label>
              <label>
                Applied on
                <input
                  type="date"
                  name="appliedAt"
                  required
                  defaultValue={application?.appliedAt ?? dateOffset(0)}
                  max={dateOffset(0)}
                />
              </label>
            </div>
            <div className="form-row">
              <label>
                Location
                <input
                  name="location"
                  maxLength={150}
                  defaultValue={application?.location}
                  placeholder="City or region"
                />
              </label>
              <label>
                Work arrangement
                <select
                  name="mode"
                  defaultValue={application?.mode ?? 'Remote'}
                >
                  {workModes.map((mode) => (
                    <option key={mode}>{mode}</option>
                  ))}
                </select>
              </label>
            </div>
            <details
              open={Boolean(application?.nextAction || application?.notes)}
            >
              <summary>Next step and notes</summary>
              <div className="optional-fields">
                <label>
                  Next step
                  <input
                    name="nextAction"
                    maxLength={200}
                    defaultValue={application?.nextAction}
                    placeholder="e.g. Follow up with the recruiter"
                  />
                </label>
                <label>
                  Action date
                  <input
                    type="date"
                    name="actionDate"
                    defaultValue={application?.actionDate}
                  />
                </label>
                <label>
                  Notes
                  <textarea
                    name="notes"
                    rows={4}
                    maxLength={4000}
                    defaultValue={application?.notes}
                    placeholder="People, preparation, things to remember…"
                  />
                </label>
              </div>
            </details>
          </fieldset>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <footer className="form-footer">
            <button
              type="button"
              className="button secondary"
              disabled={busy}
              onClick={() => (application ? setEditing(false) : close())}
            >
              Cancel
            </button>
            <button className="button primary" type="submit" disabled={busy}>
              {busy ? 'Saving…' : 'Save application'}
            </button>
          </footer>
        </form>
      )}
    </Modal>
  );
}
