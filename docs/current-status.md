# Current Status

Last updated: June 11, 2026

## Current Stage

Step 3, Application Architecture and Shared Backend, is complete. Step 4, Authentication and Authorization, is in progress.

## Completed Work

- Defined the Independent Cinema Platform direction and five-to-six-week scope
- Mapped the final project requirements to features and verification methods
- Defined Public, Member, Staff, and Owner capabilities
- Defined the booking status workflow and related review and contact workflows
- Designed and verified the seven-table PostgreSQL schema
- Added seed data and database verification queries
- Created the standalone Express 5 and EJS application foundation
- Added shared environment configuration and a lazy PostgreSQL pool
- Added centralized error handling, validation helpers, and view context
- Added the public shell, role-aware navigation foundation, stable empty states, and error pages
- Verified the app with automated tests, PostgreSQL integration, and desktop and mobile browser checks
- Preserved the meaningful project history from the original course repository
- Added the first Step 4 vertical slice: PostgreSQL-backed production session configuration, login, logout, current-user loading, role guards, CSRF protection, and protected role landing pages

## Verified Baseline

- Automated tests: 18 passing
- PostgreSQL schema and seed: verified on PostgreSQL 17.10
- Database constraints: role, duplicate booking, delete policy, and no-op status transition checks verified
- Browser widths: 1280px desktop and 390px mobile checked without horizontal overflow
- Shared layout: public shell, navigation, empty state, 404, and server error rendering available
- Render deployment: `https://cse340-independent-cinema.onrender.com`
- Production health and PostgreSQL health routes return `200`
- Owner, Staff, and Member seed logins work in production with secure session cookies
- Production role guards and logout session invalidation verified

## Current Implementation Stage

### Step 4: Authentication and Authorization

Completed first vertical slice:

- Session configuration uses a non-default cookie name, explicit cookie settings, session ID regeneration after login, and a PostgreSQL store when `DATABASE_URL` is configured
- Startup rejects a missing `SESSION_SECRET`, and production startup also rejects a missing `DATABASE_URL`
- Login uses a generic credential failure message and rejects inactive accounts
- Every authenticated request reloads the active user and current role from PostgreSQL
- Member, Staff, and Owner direct route access is enforced by server-side role guards
- Logout requires CSRF validation, destroys the server-side session, and clears the cookie
- Login, role landing, and forbidden interfaces are available
- Automated tests cover unauthenticated access, role combinations, inactive sessions, generic login failure, CSRF rejection, and logout invalidation

Remaining Step 4 slices:

- Add signup with server-side validation, duplicate-email conflict handling, and bcrypt password hashing
- Add reusable resource ownership middleware and cross-account route tests
- Run the required independent authentication and authorization review

## Following Stages

| Step | Focus | Main Outcome |
| --- | --- | --- |
| 5 | Public cinema experience | Film, screening, information, and contact workflows |
| 6 | Booking and Member experience | End-to-end booking creation, status, cancellation, and history |
| 7 | Reviews and operations | Review CRUD, check-in, moderation, messages, and Owner management |
| 8 | Frontend refinement | Responsive design system and reference-level interface review |
| 9 | Security and deployment | Regression testing, Render deployment, and submission documentation |

## Current Risks and Open Decisions

- Final cinema brand name is not selected.
- Final poster and film image sources are not selected.
- Course deadline should be added once confirmed.
- Full production workflows beyond authentication remain unimplemented and unverified.
- Render free services can spin down after inactivity and delay the first request.
- This repository separation and documentation update is the ninth meaningful commit. At least six more substantial implementation commits are required.

## Working Checkpoints

- Record progress after each completed stage.
- Update requirements traceability when behavior is verified.
- Run automated tests after each backend change.
- Run database verification after schema or workflow-rule changes.
- Compare every major public screen against the public references.
- Compare every Staff and Owner workflow against the operational references.
- Test the full project through direct URLs before deployment and submission.
