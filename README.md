# JobTrack

A focused workspace for managing job applications, interviews, and next steps. Built with React, TypeScript, Vite, and Firebase, with a pale lavender workspace, an aubergine sidebar, and acid-lime accents.

## Delivery plan

The project is delivered in three milestones, with one push on each of three different days. Milestone 1 was delivered on October 21, 2026. Milestone 2 and the updated palette were delivered on October 22, 2026. Milestone 3 is delivered on October 23, 2026.

| Milestone                      | Scope                                                                                                                                     | Status                                               |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| 1 — Local workspace            | Responsive layout, application list, search, filters, sorting, creation, details, local persistence, sample data                          | Pushed                                               |
| 2 — Connected workflow         | Registration, sign-in, sign-out, password reset, private Firestore records, ownership rules, editing, deletion, board view, stage history | Delivered; production Firebase configuration pending |
| 3 — Follow-through and release | Today view, date priorities, expanded tests, accessibility review, GitHub Pages deployment                                                | Delivered; local-demo release                        |

## Run locally

Requires Node.js 22.12+ or Node.js 24 and npm. Emulator integration tests additionally require Java 21+.

```sh
npm ci
npm run dev
```

```sh
npm run build
npm run preview
npm run format:check
npm test
```

Without Firebase settings, the app opens in local mode. Cloud sign-in explains that setup is pending rather than simulating authentication.

## Local workspace

Add an application or choose **Try sample data** to load eight fictional applications. Sample dates are relative to the day the data is generated. Resetting sample data requires confirmation and replaces all local applications.

Search companies, positions, and locations; filter by stage; sort by date or company. Switch between list and board views. Open an application to edit its fields, inspect its stage history, or delete it with a company- and position-specific confirmation. Board selectors change stages without requiring drag-and-drop.

Local records are saved under `jobtrack.applications.v1`. Legacy milestone 1 records are read without losing their data. Browser storage errors are reported and form entries remain available for retry.

## Today and priority rules

The **Today** workspace shows open applications with a next step and a valid action date. It groups overdue actions, actions due today, and actions scheduled within the next seven calendar days, including day seven. Rejected and withdrawn applications are excluded; offers remain eligible for follow-up.

Entries are ordered by action date, then company and identifier. Each entry explains its inclusion. **Done** clears the next step and action date while preserving the application stage and its history. **Review or reschedule** opens the application details for editing. Completing an action moves keyboard focus back to the Today heading.

Dates follow the browser's local calendar. The current day refreshes at midnight and when the tab regains focus or visibility. Calendar-day comparisons use date ordinals, avoiding daylight-saving hour offsets. New sample data includes an overdue follow-up, an action due today, and upcoming actions. Existing stored sample data is preserved until you explicitly reset it.

## Firebase setup

1. Create a Firebase project and register a web application.
2. Enable **Email/Password** under Authentication providers.
3. Create a Cloud Firestore database.
4. Copy `.env.example` to `.env.local` and populate all four Firebase web configuration values. Keep `VITE_USE_FIREBASE_EMULATORS=false`.
5. Add your deployment domain to Firebase Authentication authorized domains.
6. Deploy the included security rules before using a live database:

```sh
npx firebase-tools login
npx firebase-tools deploy --only firestore:rules --project YOUR_PROJECT_ID
```

7. Restart Vite or rebuild after changing environment variables.

The `VITE_` values are browser-visible Firebase configuration, not server credentials. Never put a service-account key or private secret in these variables. Security relies on Authentication and the deployed Firestore rules.

Production Firebase resources and credentials are not included or provisioned by this repository.

## Cloud workspace and data model

Documents live at `users/{uid}/applications/{applicationId}`. Each stores `id`, `ownerId`, `company`, `role`, `location`, `mode`, `stage`, `appliedAt`, `nextAction`, `actionDate`, `notes`, `version`, and `history`.

Calendar dates use `YYYY-MM-DD`; stage history records ISO timestamps. Creation and stage changes append history entries; ordinary field edits do not create a stage transition. The latest 100 stage events are retained per application.

Firestore rules restrict reads and writes to the matching authenticated user, validate document fields, and require sequential versions. Transactional saves and deletes reject stale versions instead of overwriting newer data from another tab. Cloud writes require a working connection.

Signing in opens a separate cloud workspace and does not import local demo data. Signing out returns to the local workspace. Switching accounts remounts the workspace so another account's records are not reused in component state. There is no sample-data reset in cloud mode.

## Emulator testing

Run all unit, account lifecycle, cloud transaction, and security-rule tests against disposable local emulators:

```sh
npm run test:emulators
```

The demo project ID is `demo-jobtrack`; this command does not use a production project. The first run downloads the emulator runtime. `npm test` alone runs unit tests and skips emulator suites when the corresponding emulator environment variables are absent.

To try cloud features in the browser without a real Firebase project:

1. Create `.env.local` containing `VITE_USE_FIREBASE_EMULATORS=true`.
2. Run `npm run emulators` in one terminal.
3. Run `npm run dev` in another terminal.
4. Register a disposable account through the app. Password reset links are printed in the emulator terminal.

Emulator accounts and cloud documents are temporary and disappear when the emulators stop. Remove the emulator flag before creating a production build.

Tests cover registration, incorrect passwords, sign-out, sign-in, reset email creation, application transactions, stage history, stale edits/deletes, cross-user and anonymous access denial, invalid writes, and local-record validation.

## Accessibility and responsive design

The interface includes semantic landmarks, a skip link, labeled fields, visible keyboard focus, native modal dialogs, focus restoration, pending states, and a compact mobile list. Board columns scroll horizontally and stage changes are available through labeled native selectors.

## Deployment

Public demo: [JobTrack](https://iduyguay.github.io/Job-Track/).

The GitHub Actions workflow validates formatting, runs all 13 tests against Authentication and Firestore emulators, builds the application, and deploys `dist/` to GitHub Pages for pushes to `main`. Pull requests run validation without deploying. The workflow can also be started manually. A failed validation prevents deployment.

The Pages build uses `VITE_BASE_PATH=/Job-Track/`. Local builds default to `/`. Hosting outside GitHub Pages can use `npm ci && npm run build` and publish `dist/`.

This release runs in local-demo mode because a production Firebase project has not been provisioned. To enable accounts later, add the four `VITE_FIREBASE_*` values from `.env.example` to the repository's Actions variables, deploy `firestore.rules` to the matching project, enable email/password authentication, and authorize `iduyguay.github.io` in Firebase Authentication. Then rerun the deployment workflow. The workflow explicitly disables emulator connections in release builds.

Deploying the frontend does not deploy Firestore rules. The included Firebase security rules have been verified locally using the emulator; no live Firebase resources have been created.

## Release verification

- Production TypeScript and Vite build and Prettier checks.
- 13 passing unit and emulator integration tests, including date boundaries, history, private access, account flows, and transaction conflicts.
- Automated axe-core WCAG A/AA checks on list, board, and Today views; no detected violations after correcting muted text contrast.
- Browser checks for action completion, local persistence, and navigation; visual review at desktop and 390px mobile widths.
- Automated checks complement manual review and do not certify full accessibility compliance.

## References

- Design reference: not supplied.
- Technical specification: provided project brief, summarized by the delivery plan above.
- Live demo: https://iduyguay.github.io/Job-Track/.
- [Firebase password authentication](https://firebase.google.com/docs/auth/web/password-auth)
- [Firestore transactions](https://firebase.google.com/docs/firestore/manage-data/transactions)
- [Firestore security conditions](https://firebase.google.com/docs/firestore/security/rules-conditions)

## License

No license has been selected yet.
