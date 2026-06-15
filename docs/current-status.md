# Current Status

Last updated: June 15, 2026

## Current Stage

Step 4, Authentication and Authorization, is complete. Step 5, Public Cinema Experience, is in progress.

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
- Added the second Step 4 vertical slice: Member signup, accessible validation feedback, lower-case email normalization, bcrypt password hashing, duplicate-email conflict handling, and safe signup session regeneration
- Added the third Step 4 vertical slice: ownership-protected Member booking and review detail routes with strict ID parsing, not-found handling, and cross-account denial
- Completed the required independent Step 4 authentication review, disproved the reported CSRF-rotation concern with a new regression test, documented the anonymous auth-form session tradeoff, and hardened owned-resource loading against future route-order mistakes
- Added PostgreSQL-backed GitHub Actions CI, database integration tests, and ordered migration infrastructure
- Added the Step 5 public cinema direction review packet before public feature implementation
- Connected PostgreSQL film and screening data to the public `/films` and `/screenings` routes with stable normal, empty, and error states

## Verified Baseline

- Automated tests with local PostgreSQL: 34 passing and 1 environment-specific skip
- Automated tests without `DATABASE_URL`: 32 passing and 3 database integration skips
- Database integration tests: migration idempotency, database constraints, and PostgreSQL session-store lifecycle verified locally
- Clean PostgreSQL database pipeline: schema, seed, migration, verification queries, and full test suite verified locally
- PostgreSQL schema and seed: verified on PostgreSQL 17.10
- Database constraints: role, duplicate booking, delete policy, and no-op status transition checks verified
- Browser widths: 1280px desktop and 390px mobile checked without horizontal overflow
- Shared layout: public shell, navigation, empty state, 404, and server error rendering available
- Render deployment: `https://cse340-independent-cinema.onrender.com`
- Production health and PostgreSQL health routes return `200`
- Owner, Staff, and Member seed logins work in production with secure session cookies
- Production role guards and logout session invalidation verified
- Production signup creates a Member account, redirects to `/account`, and returns a duplicate-email conflict on repeat submission
- Production owned booking and review routes enforce Member access, cross-account `404`, invalid-id `404`, and Staff `403`
- Local PostgreSQL is now running, and `user_sessions` direct verification confirmed CSRF session creation, login session ID regeneration, and logout row deletion
- A pre-auth CSRF token is rejected after login session regeneration, and the post-login token differs from the anonymous login token
- Public `/films` renders four non-archived seed films and upcoming screening summaries
- Public `/screenings` renders three future scheduled seed screenings with remaining capacity
- Public list routes render stable empty and database-error states
- Public list routes verified at 1280px and 390px without horizontal overflow
- Git history has passed 15 total commits; the final substantial-commit review remains pending
- GitHub Actions CI applies schema, seed, migrations, verification queries, and the full test suite; the first remote run passed

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

Completed second vertical slice:

- Signup uses a public Member-only form and redirects authenticated users away from `/signup`
- Signup validation preserves non-secret form values, renders an error summary, marks invalid fields, and associates field-level errors with their inputs
- Email is normalized to lower-case before persistence and new passwords are hashed with bcrypt
- Duplicate email conflicts return a stable signup error instead of surfacing a server failure
- Signup regenerates the session ID before setting the new authenticated user
- Automated tests cover signup validation, duplicate-email conflict handling, normalized account creation, hashing input flow, and signup session redirect
- Browser checks confirmed desktop and mobile signup rendering plus validation, conflict, and post-signup account states through the rendered interface
- Render verification confirmed live `/signup`, successful Member creation, logout, and duplicate-email conflict handling

Completed third vertical slice:

- `/account/bookings/:bookingId` and `/account/reviews/:reviewId` now render Member-owned placeholder detail pages through server-side routes
- Resource IDs are parsed strictly, and invalid or missing IDs return a stable not-found response
- Ownership is enforced on the server before rendering a booking or review detail
- Different Member access is denied without exposing the resource through the route response
- Staff and Owner are still blocked from Member-owned account routes by role guards
- Automated tests cover unauthenticated redirects, owner-member access, different-member denial, invalid IDs, missing resources, and rendered detail pages
- Browser checks confirmed booking detail, review detail, and ownership-related 404 rendering plus mobile 390px no-overflow behavior on local verification routes
- Render verification confirmed live Member booking detail, review detail, cross-account `404`, invalid-id `404`, and Staff `403`

Independent review result:

- No critical findings were confirmed
- The reported CSRF-rotation gap did not reproduce because the pre-auth token is rejected after login session regeneration
- Anonymous `GET /login` and `GET /signup` creating a pre-auth session row is now documented as an accepted CSRF tradeoff for Step 4
- Owned-resource loading now fails safely if a future route wires it without an authenticated user

### Step 5: Public Cinema Experience

Completed first vertical slice:

- `/films` renders non-archived public films ordered by featured state, next screening, and title
- Film rows show metadata, synopsis, upcoming screening count, and next screening time
- `/screenings` renders future scheduled screenings for non-archived films
- Screening rows show date, time, program label, film metadata, capacity, and remaining availability
- Both routes provide stable empty states and pass database failures to the global server-error state
- Automated tests cover normal, empty, and database-error route behavior
- PostgreSQL queries and desktop and mobile browser layouts are verified

Next implementation slice:

- Add public film detail and screening detail routes with strict identifiers, not-found states, and direct navigation between film and schedule

Cross-stage delivery infrastructure now available:

- Ordered SQL migrations apply through `app/scripts/run-migrations.js`
- Migration filenames are recorded in `schema_migrations`
- PostgreSQL integration tests cover migration idempotency, database constraints, and session-store lifecycle
- GitHub Actions CI provisions PostgreSQL 17 and runs database and application verification on pushes and pull requests
- A Step 5 frontend direction review packet records the approved reference and review criteria before implementation

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
- Full production workflows beyond authentication and public list routes remain unimplemented and unverified.
- The Render URL is an early submission deployment. Its current public pages and role landing pages are structural placeholders, not the finished visual experience.
- Render free services can spin down after inactivity and delay the first request.
- Git history has passed 15 total commits, but the final review must still confirm that at least 15 are substantial and coherent.

## Working Checkpoints

- Record progress after each completed stage.
- Update requirements traceability when behavior is verified.
- Run automated tests after each backend change.
- Run database verification after schema or workflow-rule changes.
- Compare every major public screen against the public references.
- Compare every Staff and Owner workflow against the operational references.
- Test the full project through direct URLs before deployment and submission.
