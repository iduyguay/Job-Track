# JobTrack

A focused workspace for managing job applications, interviews, and next steps. Built with React, TypeScript, and Vite, with a warm neutral interface and a muted terracotta accent.

## Delivery plan

The project is delivered in three milestones, with one push on each of three different days. Only milestone 1 is implemented in this commit.

| Milestone                      | Scope                                                                                                                              | Status      |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| 1 — Local workspace            | Responsive layout, application list, search, stage filters, sorting, details, application creation, local persistence, sample data | Implemented |
| 2 — Connected workflow         | Firebase Authentication, password reset, Firestore collections, ownership rules, edit/delete, board view, stage history            | Planned     |
| 3 — Follow-through and release | Today view, date-based priorities, meaningful tests, security rule verification, accessibility review, deployment                  | Planned     |

## Run locally

Requires Node.js 22.12+ or Node.js 24 and npm.

```sh
npm ci
npm run dev
```

```sh
npm run build
npm run format:check
npm run preview
```

## Milestone 1

The application starts with an empty workspace. Add an application or select **Try sample data** to load eight fictional applications. Sample dates are relative to the day the data is generated. Resetting sample data requires confirmation and replaces all local applications.

Search companies, positions, and locations; filter by stage; sort by application date or company name. Select a company to inspect its details. The creation form supports optional next steps and notes. Browser storage failures are reported and do not silently discard form entries.

## Data model

Each application stores `id`, `company`, `role`, `location`, `mode`, `stage`, `appliedAt`, `nextAction`, `actionDate`, and `notes`. Dates use local calendar dates in `YYYY-MM-DD` format. Milestone 2 will add ownership and activity history.

## Storage and authentication

Milestone 1 uses localStorage under `jobtrack.applications.v1`. Data remains in the current browser and is not synchronized or authenticated. No Firebase credentials are needed for this milestone. Do not enter sensitive information on shared devices.

Firebase Authentication, Firestore, environment configuration, and security rules are scheduled for milestone 2 and are not implemented yet.

## Accessibility and responsive design

The interface includes semantic landmarks, a skip link, labeled fields, visible keyboard focus, native modal dialogs, focus restoration, and a compact mobile list. Browser interaction verification is recorded separately from production build validation.

## Deployment

Planned for milestone 3. The build output is `dist/`; a static host can build it with `npm ci && npm run build`.

## Project references

- Design reference: not supplied.
- Technical specification: provided project brief, summarized by the delivery plan above.
- Live deployment: pending milestone 3.

## License

No license has been selected yet.
