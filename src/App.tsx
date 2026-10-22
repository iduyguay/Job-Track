import { useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from './lib/firebase';
import { describeError } from './lib/errors';
import { useApplications } from './hooks/useApplications';
import ApplicationBoard from './components/ApplicationBoard';
import TodayView from './components/TodayView';
import { buildPriorities } from './lib/priorities';
import { useCalendarDay } from './hooks/useCalendarDay';
import AuthDialog from './components/AuthDialog';
import Modal from './components/Modal';
import {
  ArrowDownUp,
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  ChevronRight,
  Plus,
  Search,
  RotateCcw,
} from 'lucide-react';
import type { Application } from './types';
import { stages } from './types';
import { formatDate } from './lib/applications';
import ApplicationDialog from './components/ApplicationDialog';
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(Boolean(auth));
  const [sessionError, setSessionError] = useState('');
  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(
      auth,
      (account) => {
        setUser(account);
        setInitializing(false);
      },
      (failure) => {
        setSessionError(describeError(failure));
        setInitializing(false);
      },
    );
  }, []);
  if (initializing)
    return (
      <main className="session-loading" role="status">
        Opening your workspace…
      </main>
    );
  return (
    <>
      <Workspace key={user?.uid ?? 'local'} user={user} />
      {sessionError && (
        <p className="session-error error" role="alert">
          {sessionError}
        </p>
      )}
    </>
  );
}
function Workspace({ user }: { user: User | null }) {
  const {
    applications,
    error,
    loading,
    busy,
    save,
    remove,
    resetDemo: replaceDemo,
  } = useApplications(user);
  const [authOpen, setAuthOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [accountError, setAccountError] = useState('');
  const [page, setPage] = useState<'applications' | 'today'>('applications');
  const today = useCalendarDay();
  const priorities = useMemo(
    () => buildPriorities(applications, today),
    [applications, today],
  );
  const [view, setView] = useState<'list' | 'board'>('list');
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
  async function resetDemo() {
    try {
      await replaceDemo();
      setQuery('');
      setStage('All stages');
      setAnnouncement('Sample applications loaded.');
      setResetting(false);
    } catch {
      setResetting(false);
    }
  }
  async function changeStage(
    item: Application,
    nextStage: Application['stage'],
  ) {
    if (item.stage === nextStage) return;
    try {
      await save({ ...item, stage: nextStage }, item);
      setAnnouncement(`${item.company} moved to ${nextStage}.`);
    } catch {
      setAnnouncement('Stage could not be updated. Please try again.');
    }
  }
  async function completeAction(item: Application) {
    try {
      await save({ ...item, nextAction: '', actionDate: '' }, item);
      setAnnouncement(`Next step completed for ${item.company}.`);
      document.getElementById('today-title')?.focus();
    } catch {
      setAnnouncement(
        'The next step could not be completed. Please try again.',
      );
    }
  }
  async function leaveAccount() {
    if (!auth || busy || signingOut) return;
    setSigningOut(true);
    setAccountError('');
    try {
      await signOut(auth);
    } catch (failure) {
      setAccountError(describeError(failure));
    } finally {
      setSigningOut(false);
    }
  }
  const active = applications.filter(
    (item) => !['Offer', 'Rejected', 'Withdrawn'].includes(item.stage),
  ).length;
  const interviews = applications.filter((item) =>
    ['HR interview', 'Technical interview'].includes(item.stage),
  ).length;
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <aside className="sidebar">
        <a className="brand" href="./" aria-label="JobTrack home">
          <span className="brand-mark">j.</span>jobtrack
          <span className="brand-dot">.</span>
        </a>
        <p className="workspace-label">YOUR WORKSPACE</p>
        <nav aria-label="Main navigation">
          <button
            className={
              page === 'applications' ? 'nav-item nav-active' : 'nav-item'
            }
            aria-current={page === 'applications' ? 'page' : undefined}
            onClick={() => setPage('applications')}
          >
            <BriefcaseBusiness size={18} aria-hidden="true" />
            Applications<span>{applications.length}</span>
          </button>
          <button
            className={page === 'today' ? 'nav-item nav-active' : 'nav-item'}
            aria-current={page === 'today' ? 'page' : undefined}
            onClick={() => setPage('today')}
          >
            <CalendarDays size={18} aria-hidden="true" />
            Today<span>{priorities.length}</span>
          </button>
        </nav>
        <div className="sidebar-bottom">
          <div className="avatar">Y</div>
          <div>
            <strong className="account-email">
              {user?.email ?? 'Your next chapter'}
            </strong>
            <small>
              {user ? 'Private cloud workspace' : 'One step at a time.'}
            </small>
          </div>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <span>
            Workspace <ChevronRight size={14} />{' '}
            <strong>{page === 'today' ? 'Today' : 'Applications'}</strong>
          </span>
          <div className="account-controls">
            <span className="local-badge">
              <span />
              {user ? 'Cloud workspace' : 'Local demo'}
            </span>
            {user ? (
              <button
                className="text-button"
                disabled={busy || signingOut}
                onClick={() => void leaveAccount()}
              >
                {signingOut ? 'Signing out…' : 'Sign out'}
              </button>
            ) : (
              <button
                className="button secondary"
                onClick={() => setAuthOpen(true)}
              >
                Sign in
              </button>
            )}
          </div>
        </header>
        <main id="main" tabIndex={-1}>
          <div className="page-heading">
            <div>
              <p className="eyebrow">
                {page === 'today'
                  ? new Intl.DateTimeFormat('en', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })
                      .format(new Date(`${today}T12:00:00`))
                      .toUpperCase()
                  : 'A LITTLE STRUCTURE. A CLEARER HEAD.'}
              </p>
              <h1>
                {page === 'today'
                  ? 'Make the next move.'
                  : 'Your next chapter starts here.'}
              </h1>
              <p className="intro">
                {page === 'today'
                  ? 'A clear plan for the opportunities that matter.'
                  : 'Keep your opportunities in order, and your next step in sight.'}
              </p>
            </div>
            <button
              className="button primary"
              disabled={loading || busy}
              onClick={() => setDialog('new')}
            >
              <Plus size={17} />
              Add application
            </button>
          </div>
          {page === 'applications' && (
            <>
              <section className="overview" aria-label="Application overview">
                <div>
                  <span>Total applications</span>
                  <strong>
                    {applications.length}
                    <small>
                      {applications.length === 1
                        ? 'opportunity explored'
                        : 'opportunities explored'}
                    </small>
                  </strong>
                </div>
                <div>
                  <span>In progress</span>
                  <strong>
                    {active}
                    <small>
                      {active === 1 ? 'door still open' : 'doors still open'}
                    </small>
                  </strong>
                </div>
                <div>
                  <span>Interviews</span>
                  <strong>
                    {interviews}
                    <small>
                      {interviews === 1
                        ? 'conversation underway'
                        : 'conversations underway'}
                    </small>
                  </strong>
                </div>
                <div>
                  <span>Offers</span>
                  <strong>
                    {
                      applications.filter((item) => item.stage === 'Offer')
                        .length
                    }
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
                  {!user && (
                    <button
                      className="text-button"
                      disabled={busy}
                      onClick={() =>
                        applications.length ? setResetting(true) : resetDemo()
                      }
                    >
                      <RotateCcw size={14} />
                      {applications.length
                        ? 'Reset sample data'
                        : 'Try sample data'}
                    </button>
                  )}
                </div>
                <div
                  className="view-switch"
                  role="group"
                  aria-label="Application view"
                >
                  <button
                    aria-pressed={view === 'list'}
                    onClick={() => setView('list')}
                  >
                    List
                  </button>
                  <button
                    aria-pressed={view === 'board'}
                    onClick={() => setView('board')}
                  >
                    Board
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
                {accountError && (
                  <p className="error" role="alert">
                    {accountError}
                  </p>
                )}
                {error && (
                  <p className="error" role="alert">
                    {error}
                  </p>
                )}
                {loading ? (
                  <div className="empty-state" role="status">
                    Loading your applications…
                  </div>
                ) : filtered.length ? (
                  <>
                    {view === 'board' ? (
                      <ApplicationBoard
                        applications={filtered}
                        busy={busy}
                        onOpen={setDialog}
                        onStageChange={changeStage}
                      />
                    ) : (
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
                                      <span className="role-name">
                                        {item.role}
                                      </span>
                                      <small>
                                        {item.location ||
                                          'Location not specified'}{' '}
                                        · {item.mode}
                                      </small>
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <span
                                    className="status"
                                    data-stage={item.stage}
                                  >
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
                    )}
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
                        : user
                          ? 'Add your first application to your private workspace.'
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
                        disabled={loading || busy}
                        onClick={() => setDialog('new')}
                      >
                        Add your first application
                      </button>
                    )}
                  </div>
                )}
              </section>
            </>
          )}
          {page === 'today' && (
            <>
              {(error || accountError) && (
                <p className="error" role="alert">
                  {error || accountError}
                </p>
              )}
              <TodayView
                items={priorities}
                loading={loading}
                busy={busy}
                onOpen={setDialog}
                onComplete={completeAction}
                onBrowse={() => setPage('applications')}
              />
            </>
          )}
          <footer className="workspace-footer">
            <p>Your search, at your pace.</p>
            <p>
              {user
                ? 'Your applications are private to your account.'
                : 'Demo data is saved in this browser only.'}
            </p>
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
          onSave={async (item, previous) => {
            await save(item, previous);
            setQuery('');
            setStage('All stages');
            setAnnouncement(
              `${item.company} application ${previous ? 'updated' : 'added'}.`,
            );
          }}
          onDelete={async (item) => {
            await remove(item);
            setAnnouncement(`${item.company} application deleted.`);
          }}
        />
      )}
      {authOpen && <AuthDialog onClose={() => setAuthOpen(false)} />}
      {resetting && (
        <ResetDialog
          onCancel={() => setResetting(false)}
          onConfirm={() => void resetDemo()}
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
  return (
    <Modal className="reset-dialog" titleId="reset-title" onClose={onCancel}>
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
    </Modal>
  );
}
