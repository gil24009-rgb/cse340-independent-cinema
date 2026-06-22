# Current Status

Last updated: June 22, 2026

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
- Added public film detail and screening detail routes with strict identifiers, stable not-found states, and direct navigation between films and screenings
- Connected the public home route to PostgreSQL film and screening data with nearest-screening and program highlights
- Added the public Visit and Contact slice with visit information, CSRF-protected contact submission, validation feedback, success state, and PostgreSQL message storage
- Added the first Owner film management slice with Owner-only film visibility controls and public archive reflection
- Added Owner screening cancellation controls with active-booking conflict protection and public schedule reflection
- Added Owner film create and edit forms with server-side validation, duplicate-slug conflict handling, and public catalog reflection
- Added Owner screening create and edit forms with server-side validation, schedule conflict handling, active-booking capacity and cancellation protection, and public schedule reflection

## Verified Baseline

- Automated tests with local PostgreSQL: 41 passing and 1 environment-specific skip
- Automated tests without `DATABASE_URL`: 39 passing and 3 database integration skips
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
- Public `/screenings` renders future scheduled seed screenings with remaining capacity. The current local seed query returned two future screenings on June 16, 2026 because same-day screening rows age out after their start time.
- Public `/films/:filmSlug` renders film metadata and upcoming screenings for valid slugs and returns `404` for invalid or missing slugs
- Public `/screenings/:screeningId` renders screening availability for valid IDs and returns `404` for invalid or missing IDs
- Public `/` renders PostgreSQL-backed next-screening and program highlights with stable database-error handling
- Public `/visit` renders visit information and a CSRF-protected contact form with validation, success, and database-error states
- Public `/visit` contact submission inserts into `contact_messages` locally through the rendered route and redirects to `/visit?sent=1`
- Owner `/admin/films` renders the film catalog with CSRF-protected archive and restore actions
- Owner archive action hides a film from public `/films`, and restore makes it visible again through local PostgreSQL route verification
- Owner `/admin/films/new` and `/admin/films/:filmId/edit` render CSRF-protected create and edit forms with field-level validation feedback
- Owner film creation adds a non-archived film to public `/films`, and editing the film as archived removes it from public `/films` through local PostgreSQL route verification
- Duplicate film slugs return a conflict response instead of surfacing a database error
- Owner `/admin/screenings` renders the screening schedule with CSRF-protected cancel and restore actions for scheduled and cancelled screenings
- Owner `/admin/screenings/new` and `/admin/screenings/:screeningId/edit` render CSRF-protected create and edit forms with field-level validation feedback
- Owner screening creation adds a future scheduled screening to public `/screenings`, and editing the screening as cancelled removes it from public `/screenings` through local PostgreSQL route verification
- Duplicate screening start times return a conflict response instead of surfacing a database error
- Owner screening edit blocks reducing capacity below active bookings and blocks cancellation while active bookings remain
- Owner screening cancellation is blocked with a conflict response when active bookings exist
- Completed screenings show no management action in the Owner schedule because they are preserved operational history
- Owner screening cancellation hides the screening from public `/screenings`, and restore makes it visible again through local PostgreSQL route verification
- Public home, list, and detail routes verified at 1280px and 390px without horizontal overflow
- Owner film catalog verified at 1280px and 390px without horizontal overflow
- Owner film create form verified at 1280px and 390px without horizontal overflow, with label, hint, validation-summary, and field-error associations checked in browser
- Owner screening schedule verified at 1280px and 390px without horizontal overflow
- Owner screening create and edit forms verified at 1280px and 390px without horizontal overflow, with label, hint, validation-summary, and field-error associations checked in browser
- Production Owner login reaches `/admin/films`, and the live Owner catalog renders film rows and CSRF-protected archive forms
- Production Owner login reaches `/admin/films/new` and a live Owner film edit route, and both render the expected form headings, CSRF tokens, and submit actions
- Production Owner login reaches `/admin/screenings`, and the live Owner schedule renders CSRF-protected forms, active-booking disabled action, and completed-screening no-action states
- Production Owner login reaches `/admin/screenings/new` and a live Owner screening edit route, and both render the expected form headings, CSRF tokens, and submit actions
- Production `/visit` renders the updated contact form, CSRF token, and success state after deployment
- Production `/films` renders four public films and `/screenings` renders the remaining future scheduled screening with `200` responses
- Production `/` renders the PostgreSQL-backed program section and film detail links after the latest deploy
- Production detail routes return `200` for `/films/house-of-hummingbird` and the current live future screening route `/screenings/3`, while invalid public identifiers return `404`
- Git history has passed 15 total commits; the final substantial-commit review remains pending
- GitHub Actions CI applies schema, seed, migrations, verification queries, and the full test suite; the first remote run passed
- Latest GitHub Actions CI run passed for the Visit and Contact slice
- Latest GitHub Actions CI run passed for the Owner film visibility slice
- Latest GitHub Actions CI run passed for the Owner screening cancellation slice
- Latest GitHub Actions CI run passed for the Owner film create and edit slice
- Latest GitHub Actions CI run passed for the Owner screening create and edit slice

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
- Render production list routes are verified after deployment

Completed second vertical slice:

- `/films/:filmSlug` renders public film metadata and upcoming screenings with stable `404` handling for invalid or missing slugs
- `/screenings/:screeningId` renders screening detail and current availability with stable `404` handling for invalid or missing IDs
- Film archive, film detail, screening schedule, and screening detail now link directly between related public routes
- Automated tests cover valid detail rendering plus invalid and missing identifier handling
- Local browser checks confirmed detail-route navigation and mobile 390px no-overflow behavior

Completed third vertical slice:

- `/` renders the nearest upcoming screening and direct schedule links from PostgreSQL data
- `/` renders program film cards that link to public film detail routes
- Empty schedule and empty program states remain available for public home content
- Database failures from home data loading pass to the global server-error state
- Automated tests cover home normal and database-error behavior
- Local browser checks confirmed desktop and 390px mobile no-overflow behavior

Completed fourth vertical slice:

- `/visit` now presents arrival, ticket, and accessibility information in the confirmed restrained public visual direction
- `/visit` includes a public contact form for visit planning, accessibility questions, and group screening requests
- Contact submission is protected by CSRF, trims input, lower-cases email, validates required fields and email format, and preserves valid form values on error
- Valid contact messages are stored in `contact_messages` with `new` status and an optional authenticated `user_id`
- Success feedback is shown through `/visit?sent=1` after a `303` redirect
- Automated tests cover normal rendering, invalid feedback, message creation, and database-error handling
- Local PostgreSQL route verification confirmed insert and cleanup through the rendered contact route
- Local browser checks confirmed desktop and 390px mobile no-overflow behavior, labels, CSRF token, success state, and one primary action

Started fifth vertical slice:

- `/admin/films` lists Owner-only film catalog rows with public state, upcoming screening count, next screening time, and archive or restore actions
- `/admin/films/new` creates Owner-managed film records using the same public catalog data contract as the seed films
- `/admin/films/:filmId/edit` updates Owner-managed film records without changing existing screening or booking history
- Film create and edit forms validate required fields, slug format, release year, runtime, duplicate slugs, and missing film IDs
- Film archive and restore actions require Owner role and CSRF validation
- Invalid film identifiers return a stable not-found state
- Archived films remain in the Owner catalog but are excluded from public film and screening queries
- Automated tests cover unauthenticated redirect, Member and Staff denial, Owner access, invalid identifiers, validation, duplicate slugs, create, edit, archive, and restore behavior
- Local PostgreSQL route verification confirmed `Little Forest` disappears from public `/films` after archive and returns after restore
- Local PostgreSQL route verification confirmed a newly created film appears in public `/films`, then disappears after the edit form archives it
- Local browser checks confirmed desktop and 390px mobile no-overflow behavior for the Owner film catalog and create form
- `/admin/screenings` lists Owner-only screening rows with status, booking count, and cancel or restore actions where the status can be managed
- Screening cancel and restore actions require Owner role and CSRF validation
- Cancelling a screening with active bookings returns a conflict response and leaves the screening scheduled
- Completed screenings remain visible to the Owner as preserved operational history but expose no status action
- Cancelled screenings are excluded from public schedule queries, and restore makes them visible again when they are future scheduled screenings
- Automated tests cover unauthenticated redirect, Member and Staff denial, Owner access, invalid identifiers, active-booking conflict, completed-screening denial, cancel, and restore behavior
- Local PostgreSQL route verification confirmed a screening disappears from public `/screenings` after cancel and returns after restore
- Local browser checks confirmed desktop and 390px mobile no-overflow behavior for the Owner screening schedule
- `/admin/screenings/new` creates Owner-managed screening records for active films
- `/admin/screenings/:screeningId/edit` updates scheduled or cancelled Owner-managed screening records without changing booking history
- Screening create and edit forms validate film, start time, capacity, ticket price, status, and program label
- Duplicate start times return a conflict state, active bookings block cancellation, and active bookings also block capacity reductions below the current active count
- Newly created scheduled screenings appear on public `/screenings`, and edited cancelled screenings are excluded from public `/screenings`
- Automated tests cover unauthenticated redirect, Member and Staff denial, Owner access, invalid input, duplicate start conflict, active-booking conflicts, create, edit, and completed-screening denial
- Local PostgreSQL route verification confirmed a newly created scheduled screening appears in public `/screenings`, then disappears after the edit form cancels it
- Local browser checks confirmed desktop and 390px mobile no-overflow behavior for the Owner screening create and edit forms, including validation summary and field-error associations

Next implementation slice:

- Complete the Step 5 stable-slice health review, update the Director approval packet, and then begin Step 6 booking workflow only after confirming PostgreSQL migrations and integration tests remain operational

Cross-stage delivery infrastructure now available:

- Ordered SQL migrations apply through `app/scripts/run-migrations.js`
- Migration filenames are recorded in `schema_migrations`
- PostgreSQL integration tests cover migration idempotency, database constraints, and session-store lifecycle
- GitHub Actions CI provisions PostgreSQL 17 and runs database and application verification on pushes and pull requests
- A Step 5 frontend direction review packet records the approved reference and review criteria before implementation

## Following Stages

| Step | Focus | Main Outcome |
| --- | --- | --- |
| 5 | Public cinema experience | Film, screening, information, contact, and Owner content-management workflows |
| 6 | Booking and Member experience | End-to-end booking creation, status, cancellation, and history |
| 7 | Reviews and operations | Review CRUD, check-in, moderation, messages, and Owner management |
| 8 | Frontend refinement | Responsive design system and reference-level interface review |
| 9 | Security and deployment | Regression testing, Render deployment, and submission documentation |

## Current Risks and Open Decisions

- Final cinema brand name is not selected.
- Final poster and film image sources are not selected.
- Course deadline should be added once confirmed.
- Full production workflows beyond authentication and public read routes remain unimplemented and unverified.
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
