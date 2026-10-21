import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDownUp,
  ArrowUpRight,
  BriefcaseBusiness,
  ChevronRight,
  Plus,
  Search,
  RotateCcw,
} from 'lucide-react';
import type { Application } from './types';
import { stages } from './types';
import {
  createDemo,
  formatDate,
  loadApplications,
  storageKey,
} from './lib/applications';
import ApplicationDialog from './components/ApplicationDialog';
export default function App() {
  const [initial] = useState(loadApplications);
  const [applications, setApplications] = useState(initial.items);
  const [error, setError] = useState(initial.error);
  const [query, setQuery] = useState('');
  const [stage, setStage] = useState('All stages');
  const [sort, setSort] = useState('newest');
  const [dialog, setDialog] = useState<Application | 'new' | null>(null);
  const [resetting, setResetting] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const filtered = useMemo(
    () =>
      applications
        .filter(
          (item) =>
            (stage === 'All stages' || item.stage === stage) &&
            `${item.company} ${item.role} ${item.location}`
              .toLowerCase()
              .includes(query.trim().toLowerCase()),
        )
        .sort((a, b) =>
          sort === 'company'
            ? a.company.localeCompare(b.company)
            : sort === 'oldest'
              ? a.appliedAt.localeCompare(b.appliedAt)
              : b.appliedAt.localeCompare(a.appliedAt),
        ),
    [applications, query, stage, sort],
  );
  function persist(items: Application[]): boolean {
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
      setApplications(items);
      setError('');
      return true;
    } catch {
      setError(
        'Browser storage is unavailable or full. Your changes could not be saved.',
      );
      return false;
    }
  }
  function resetDemo() {
    if (persist(createDemo())) {
      setQuery('');
      setStage('All stages');
      setAnnouncement('Sample applications loaded.');
    }
    setResetting(false);
  }
  const active = applications.filter(
    (item) => !['Rejected', 'Withdrawn'].includes(item.stage),
  ).length;
  const interviews = applications.filter((item) =>
    ['HR interview', 'Technical interview'].includes(item.stage),
  ).length;
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to applications
      </a>
      <aside className="sidebar">
        <a className="brand" href="./" aria-label="JobTrack home">
          <span className="brand-mark">j.</span>jobtrack
          <span className="brand-dot">.</span>
        </a>
        <p className="workspace-label">YOUR WORKSPACE</p>
        <nav aria-label="Main navigation">
          <a className="nav-active" href="#main" aria-current="page">
            <BriefcaseBusiness size={18} />
            Applications<span>{applications.length}</span>
          </a>
        </nav>
        <div className="sidebar-bottom">
          <div className="avatar">Y</div>
          <div>
            <strong>Your next chapter</strong>
            <small>One step at a time.</small>
          </div>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <span>
            Workspace <ChevronRight size={14} /> <strong>Applications</strong>
          </span>
          <span className="local-badge">
            <span />
            Local demo
          </span>
        </header>
        <main id="main">
          <div className="page-heading">
            <div>
              <p className="eyebrow">A LITTLE STRUCTURE. A CLEARER HEAD.</p>
              <h1>Your next chapter starts here.</h1>
              <p className="intro">
                Keep your opportunities in order, and your next step in sight.
              </p>
            </div>
            <button className="button primary" onClick={() => setDialog('new')}>
              <Plus size={17} />
              Add application
            </button>
          </div>
          <section className="overview" aria-label="Application overview">
            <div>
              <span>Total applications</span>
              <strong>
                {applications.length}
                <small>opportunities explored</small>
              </strong>
            </div>
            <div>
              <span>In progress</span>
              <strong>
                {active}
                <small>doors still open</small>
              </strong>
            </div>
            <div>
              <span>Interviews</span>
              <strong>
                {interviews}
                <small>conversations underway</small>
              </strong>
            </div>
            <div>
              <span>Offers</span>
              <strong>
                {applications.filter((item) => item.stage === 'Offer').length}
                <small>something to celebrate</small>
              </strong>
            </div>
          </section>
          <section
            className="applications-section"
            aria-labelledby="applications-title"
          >
            <div className="section-heading">
              <div>
                <h2 id="applications-title">
                  Your applications <span>{applications.length}</span>
                </h2>
                <p>Every opportunity, with a place to land.</p>
              </div>
              <button
                className="text-button"
                onClick={() =>
                  applications.length ? setResetting(true) : resetDemo()
                }
              >
                <RotateCcw size={14} />
                {applications.length ? 'Reset sample data' : 'Try sample data'}
              </button>
            </div>
            <div className="toolbar">
              <label className="search-field">
                <Search size={17} />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  aria-label="Search applications"
                  placeholder="Search company, position, or location"
                />
              </label>
              <div className="filters">
                <label className="sr-only" htmlFor="stage">
                  Filter by stage
                </label>
                <select
                  id="stage"
                  value={stage}
                  onChange={(event) => setStage(event.target.value)}
                >
                  <option>All stages</option>
                  {stages.map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
                <ArrowDownUp size={15} aria-hidden="true" />
                <label className="sr-only" htmlFor="sort">
                  Sort applications
                </label>
                <select
                  id="sort"
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="company">Company A–Z</option>
                </select>
              </div>
            </div>
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
            {filtered.length ? (
              <>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th scope="col">COMPANY / POSITION</th>
                        <th scope="col">STAGE</th>
                        <th scope="col">APPLIED</th>
                        <th scope="col">NEXT STEP</th>
                        <th scope="col">
                          <span className="sr-only">Details</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <div className="company-cell">
                              <span
                                className="company-monogram"
                                aria-hidden="true"
                              >
                                {item.company.slice(0, 1).toUpperCase()}
                              </span>
                              <div>
                                <button
                                  className="company-link"
                                  onClick={() => setDialog(item)}
                                >
                                  {item.company}
                                  <span className="sr-only">
                                    , {item.role}, view details
                                  </span>
                                </button>
                                <span className="role-name">{item.role}</span>
                                <small>
                                  {item.location || 'Location not specified'} ·{' '}
                                  {item.mode}
                                </small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="status" data-stage={item.stage}>
                              {item.stage}
                            </span>
                          </td>
                          <td className="date-cell">
                            {formatDate(item.appliedAt)}
                          </td>
                          <td>
                            <span className="next-action">
                              {item.nextAction || 'No next step yet'}
                            </span>
                            {item.actionDate && (
                              <small className="action-date">
                                {formatDate(item.actionDate)}
                              </small>
                            )}
                          </td>
                          <td>
                            <button
                              className="icon-button"
                              onClick={() => setDialog(item)}
                              aria-label={`View ${item.company} application`}
                            >
                              <ArrowUpRight size={17} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="results-count" role="status">
                  Showing {filtered.length} of {applications.length}{' '}
                  applications
                </p>
              </>
            ) : (
              <div className="empty-state">
                <BriefcaseBusiness size={28} />
                <h3>
                  {applications.length
                    ? 'No matching opportunities'
                    : 'Make room for your next opportunity.'}
                </h3>
                <p>
                  {applications.length
                    ? 'Try a different search or clear your filters.'
                    : 'Add your first application, or explore with sample data.'}
                </p>
                {applications.length ? (
                  <button
                    className="button secondary"
                    onClick={() => {
                      setQuery('');
                      setStage('All stages');
                    }}
                  >
                    Clear filters
                  </button>
                ) : (
                  <button
                    className="button primary"
                    onClick={() => setDialog('new')}
                  >
                    Add your first application
                  </button>
                )}
              </div>
            )}
          </section>
          <footer className="workspace-footer">
            <p>Your search, at your pace.</p>
            <p>Demo data is saved in this browser only.</p>
          </footer>
          <div className="sr-only" aria-live="polite">
            {announcement}
          </div>
        </main>
      </div>
      {dialog && (
        <ApplicationDialog
          application={dialog === 'new' ? null : dialog}
          onClose={() => setDialog(null)}
          onSave={(item) => {
            const saved = persist([item, ...applications]);
            if (saved) setAnnouncement(`${item.company} application added.`);
            return saved;
          }}
        />
      )}
      {resetting && (
        <ResetDialog
          onCancel={() => setResetting(false)}
          onConfirm={resetDemo}
        />
      )}
    </div>
  );
}
function ResetDialog({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const previous = document.activeElement;
    ref.current?.showModal();
    return () => {
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="reset-dialog"
      onCancel={onCancel}
      aria-labelledby="reset-title"
    >
      <h2 id="reset-title">Replace local applications?</h2>
      <p>
        This removes your current local applications and loads eight sample
        entries. This cannot be undone.
      </p>
      <div className="form-footer">
        <button autoFocus className="button secondary" onClick={onCancel}>
          Keep my applications
        </button>
        <button className="button primary" onClick={onConfirm}>
          Replace with sample data
        </button>
      </div>
    </dialog>
  );
}
