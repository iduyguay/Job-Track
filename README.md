# JobTrack

A focused workspace for managing job applications, interviews, and next steps. Built with React, TypeScript, Vite, and Firebase, with a pale lavender workspace, an aubergine sidebar, and acid-lime accents.

## Delivery plan

The project is delivered in three milestones, with one push on each of three different days. Milestone 1 was delivered on October 21, 2026. Milestone 2 and the updated palette are delivered on October 22, 2026. Milestone 3 remains planned.

| Milestone                      | Scope                                                                                                                                     | Status                                               |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| 1 — Local workspace            | Responsive layout, application list, search, filters, sorting, creation, details, local persistence, sample data                          | Pushed                                               |
| 2 — Connected workflow         | Registration, sign-in, sign-out, password reset, private Firestore records, ownership rules, editing, deletion, board view, stage history | Delivered; production Firebase configuration pending |
| 3 — Follow-through and release | Today view, date priorities, expanded tests, accessibility review, deployment                                                             | Planned                                              |

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

Planned for milestone 3. The static build directory is `dist/`. Configure Firebase environment values in the hosting build environment before running `npm ci && npm run build`. Deploying the frontend does not deploy Firestore rules.

## References

- Design reference: not supplied.
- Technical specification: provided project brief, summarized by the delivery plan above.
- Live deployment: pending milestone 3.
- [Firebase password authentication](https://firebase.google.com/docs/auth/web/password-auth)
- [Firestore transactions](https://firebase.google.com/docs/firestore/manage-data/transactions)
- [Firestore security conditions](https://firebase.google.com/docs/firestore/security/rules-conditions)

## License

No license has been selected yet.
