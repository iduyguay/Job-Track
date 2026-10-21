import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { X } from 'lucide-react';
import { stages, workModes } from '../types';
import type { Application } from '../types';
import { dateOffset, formatDate } from '../lib/applications';
interface Props {
  application: Application | null;
  onClose: () => void;
  onSave: (application: Application) => boolean;
}
export default function ApplicationDialog({
  application,
  onClose,
  onSave,
}: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    const previous = document.activeElement;
    ref.current?.showModal();
    return () => {
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, []);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const company = String(data.get('company')).trim();
    const role = String(data.get('role')).trim();
    if (!company || !role) {
      setError('Enter a company and a position.');
      return;
    }
    const item: Application = {
      id: crypto.randomUUID(),
      company,
      role,
      location: String(data.get('location')).trim(),
      mode: String(data.get('mode')) as Application['mode'],
      stage: String(data.get('stage')) as Application['stage'],
      appliedAt: String(data.get('appliedAt')),
      nextAction: String(data.get('nextAction')).trim(),
      actionDate: String(data.get('actionDate')),
      notes: String(data.get('notes')).trim(),
    };
    if (onSave(item)) onClose();
    else
      setError(
        'Your application could not be saved. Your entries are still here. Please try again.',
      );
  }
  return (
    <dialog
      ref={ref}
      className="application-dialog"
      aria-labelledby="application-title"
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          const bounds = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < bounds.left ||
            event.clientX > bounds.right ||
            event.clientY < bounds.top ||
            event.clientY > bounds.bottom
          )
            onClose();
        }
      }}
    >
      <header className="dialog-header">
        <div>
          <p className="eyebrow">YOUR JOB SEARCH</p>
          <h2 id="application-title">
            {application ? application.company : 'A new opportunity'}
          </h2>
        </div>
        <button
          className="icon-button"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>
      </header>
      {application ? (
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
        </div>
      ) : (
        <form onSubmit={submit} className="application-form">
          <label>
            Company
            <input
              name="company"
              required
              maxLength={100}
              autoFocus
              placeholder="e.g. Linear"
            />
          </label>
          <label>
            Position
            <input
              name="role"
              required
              maxLength={150}
              placeholder="e.g. Frontend Engineer"
            />
          </label>
          <div className="form-row">
            <label>
              Stage
              <select name="stage">
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
                defaultValue={dateOffset(0)}
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
                placeholder="City or region"
              />
            </label>
            <label>
              Work arrangement
              <select name="mode">
                {workModes.map((mode) => (
                  <option key={mode}>{mode}</option>
                ))}
              </select>
            </label>
          </div>
          <details>
            <summary>Next step and notes</summary>
            <div className="optional-fields">
              <label>
                Next step
                <input
                  name="nextAction"
                  maxLength={200}
                  placeholder="e.g. Follow up with the recruiter"
                />
              </label>
              <label>
                Action date
                <input type="date" name="actionDate" />
              </label>
              <label>
                Notes
                <textarea
                  name="notes"
                  rows={4}
                  maxLength={4000}
                  placeholder="People, preparation, things to remember…"
                />
              </label>
            </div>
          </details>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <footer className="form-footer">
            <button
              type="button"
              className="button secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button className="button primary" type="submit">
              Save application
            </button>
          </footer>
        </form>
      )}
    </dialog>
  );
}
