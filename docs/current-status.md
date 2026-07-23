# Current Status

Last updated: July 23, 2026

## Current Stage

Step 4, Authentication and Authorization, is complete. Step 5, Public Cinema Experience, is implemented and ready for nonblocking Director frontend review. Step 6, Booking Workflow and Member Experience, is implemented and ready for nonblocking Director frontend review. Step 7, Reviews, Staff Operations, and Admin Dashboard, is complete and ready for nonblocking Director frontend review. Step 8, Frontend Refinement, is implemented enough for Phase A submission and has a final UI polish review packet. Step 9, Security, Testing, Deployment, and Submission, is in final submission review.

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
- Added the Step 5 completion approval packet with representative routes, verification evidence, health review, debt classification, and frontend review questions
- Added the first Step 6 vertical slice: transaction-safe Member booking creation from screening detail, duplicate-booking conflict handling, capacity protection, initial booking status history, and rendered Member booking detail redirect
- Added the second Step 6 vertical slice: Member booking history list on `/account`, Member-owned booking filtering, detail links, empty state, and responsive booking cards
- Added the third Step 6 vertical slice: Member-owned booking cancellation with CSRF protection, ownership checks, confirmed-upcoming eligibility, `cancelled_at`, and status-history append in one transaction
- Added the fourth Step 6 vertical slice: Member booking status timeline on booking detail, PostgreSQL-backed history ordering, missing-history fallback, and responsive timeline layout
- Added the first Step 7 vertical slice: Staff and Owner booking status controls with CSRF protection, valid transition enforcement, and status-history append in one transaction
- Added the second Step 7 vertical slice: Staff screening roster grouping with screening context, per-screening work summaries, preserved status actions, and mobile header reflow correction
- Added the third Step 7 vertical slice: Member review CRUD with completed-booking eligibility, duplicate-review conflict handling, ownership-protected edit and delete, validation feedback, and Member account review list
- Added the fourth Step 7 vertical slice: Staff and Owner review moderation plus contact message processing on `/staff`, with CSRF-protected visibility and message status actions
- Added the fifth Step 7 vertical slice: Owner user management with account list, role changes, activation controls, self-lockout protection, and stale-session rejection
- Added the first Step 8 frontend refinement slice: mobile-only cell labels for Staff and Owner operational rows so hidden mobile table headers do not remove row meaning
- Added the second Step 8 frontend refinement slice: Staff operations overview cards with section anchors and work counts for booking actions, review queue, and message queue
- Added the third Step 8 frontend refinement slice: Member account overview cards with booking, review, and ready-to-review counts plus same-page section anchors
- Added the fourth Step 8 frontend refinement slice: public home visitor pathway cards that link visitors from films to screenings to visit planning
- Added the final Step 8 UI polish slice: dark premium visual system tokens, Apple-like product surfaces, rounded cards and tables, refined controls and badges, mobile width cleanup, and one CSS variable fix
- Added the practical Step 8 screening decision UI slice: schedule summary metrics, time-range and end-time display, seat-held labels, and stronger screening selection actions on public schedule, film detail, and screening detail pages
- Added the final submission README pass with project description, ERD image, role accounts, setup, verification, and known limitations
- Added the Step 9 final submission approval packet with production evidence, release scorecard, remaining debt, and nonblocking Director review questions

## Verified Baseline

- Targeted Step 8 route rendering test: 24 passing
- Automated tests with local PostgreSQL: 52 passing and 1 environment-specific skip
- Automated tests without `DATABASE_URL`: 46 passing and 7 database integration skips
- Latest local `pnpm db:migrate` recheck passed on July 23 after the final UI polish slice
- Database integration tests: migration idempotency, database constraints, PostgreSQL session-table schema, and session-store lifecycle verified locally
- Clean PostgreSQL database pipeline: schema, seed, migration, verification queries, and full test suite verified locally
- PostgreSQL schema and seed: verified on PostgreSQL 17.10
- Database constraints: role, duplicate booking, delete policy, and no-op status transition checks verified
- Browser widths: 1280px desktop and 390px mobile checked without horizontal overflow
- Shared layout: public shell, navigation, empty state, 404, and server error rendering available
- Render deployment: `https://cse340-independent-cinema.onrender.com`
- Production health and PostgreSQL health routes return `200` after the July 20 Render database recovery
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
- Member booking creation from `/screenings/:screeningId` writes the booking and initial `booking_status_history` row in one PostgreSQL transaction
- Member booking creation redirects to `/account/bookings/:bookingId` after success
- Duplicate Member booking attempts and sold-out screenings return stable conflict responses
- Member `/account` renders only the signed-in Member's booking history with current status, screening time, booked time, and booking detail links
- Member `/account` renders an empty booking-history state for Members without bookings
- Member-owned cancellation changes a confirmed upcoming booking to `cancelled`, sets `cancelled_at`, and appends a `booking_status_history` row in the same PostgreSQL transaction
- Member cancellation rejects unauthenticated, Staff, Owner, wrong-owner, invalid-id, missing-booking, invalid-CSRF, duplicate, and ineligible-status cases with stable responses
- Member booking detail renders ordered `booking_status_history` entries with from-status, to-status, changed time, actor, and note
- Member booking detail renders a stable missing-history fallback when no history rows exist
- Member `/account` renders owned review cards and reviewable completed-booking prompts
- Member `/account/reviews/new` creates reviews only for films with a completed booking by the same Member
- Member review creation rejects missing film, invalid rating, blank body, invalid CSRF, ineligible films, and duplicate reviews with stable responses
- Member `/account/reviews/:reviewId/edit` updates only the signed-in Member's own review
- Member review deletion removes only the signed-in Member's own review and returns deleted review detail routes to `404`
- Staff `/staff` renders operational booking rows with status controls for confirmed and checked-in bookings
- Staff `/staff` groups operational booking rows by screening with program label, film title, screening time, booking count, action count, and screening status before individual booking actions
- Staff `/staff` renders Member review moderation and contact message queues alongside the booking roster
- Staff and Owner can hide and restore reviews without changing review ownership
- Staff and Owner can move contact messages between new, in progress, and closed states with optional staff notes and assignment updates
- Staff booking status updates reject unauthenticated, Member, invalid-CSRF, missing-booking, and invalid-transition cases with stable responses
- Staff review moderation rejects unauthenticated, Member, invalid-CSRF, missing-review, and invalid-visibility cases with stable responses
- Staff contact message processing rejects unauthenticated, Member, invalid-CSRF, missing-message, and invalid-status cases with stable responses
- Staff booking status updates change current booking status and append a `booking_status_history` row in one PostgreSQL transaction
- Owner `/admin` links to film, screening, and user management routes
- Owner `/admin/users` renders user accounts with role, activation state, booking count, review count, contact message count, and CSRF-protected access forms
- Owner user access updates reject unauthenticated, Member, Staff, invalid-CSRF, invalid-role, invalid-state, missing-user, and self-change cases with stable responses
- Owner role and activation changes are reflected by the current-user reload path, so stale Staff privileges are rejected and inactive Member sessions return to login
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
- Member booking flow verified at 1280px and 390px without horizontal overflow from screening detail to booking detail
- Member booking history list verified at 1280px and 390px without horizontal overflow, with main landmark, booking detail links, and 45px mobile action controls
- Member booking detail states verified at 1280px and 390px without horizontal overflow, including cancel form, CSRF token, cancelled status, cancelled-state copy, and status timeline
- Staff operational booking dashboard verified at 1280px and 390px without horizontal overflow, including CSRF-protected check-in controls and post-action state
- Staff roster grouping verified through route tests, local PostgreSQL integration tests, authenticated local SSR inspection, and headless Chrome 1280px and 390px screenshots with no detected horizontal overflow elements
- Member review CRUD verified through route tests, PostgreSQL integration tests, authenticated local SSR checks, and headless Chrome screenshots for `/account`, `/account/reviews/new`, `/account/reviews/1/edit`, and `/account/reviews/1`
- Staff moderation and contact processing verified through route tests, PostgreSQL integration tests, authenticated local browser checks for `/staff` at 1280px and 390px, and database verification queries
- Local browser `/staff` checks confirmed Operational bookings, Member reviews, Message queue, CSRF forms, review action forms, and message action forms at 1280px and 390px. Overflow detection only reported intentionally visually hidden labels.
- Owner user management verified through route tests, PostgreSQL integration tests, authenticated local browser checks for `/admin` and `/admin/users` at 1280px and 390px, and database verification queries
- Local browser `/admin/users` checks confirmed account headings, CSRF forms, role and activation selects, self-change copy, and no detected content overflow at 1280px and 390px
- Step 8 operational mobile label check confirmed `/staff`, `/admin/films`, `/admin/screenings`, and `/admin/users` show row-level cell labels at 390px and hide them at 1280px
- Step 8 operational browser checks reported no real content overflow for `/admin/films`, `/admin/screenings`, and `/admin/users`; `/staff` overflow detection reported only intentionally visually hidden labels
- Step 8 Staff overview browser check confirmed `/staff` shows three overview cards, same-page anchors, 390px one-column layout, 1280px three-column layout, and no real content overflow
- Step 8 Member account overview browser check confirmed `/account` shows three overview cards, same-page anchors, 390px one-column layout, 1280px three-column layout, and no real content overflow
- Step 8 public pathway browser check confirmed `/` shows three visitor pathway cards linking to `/films`, `/screenings`, and `/visit`, with 390px one-column layout, 1280px three-column layout, and no content overflow
- Step 8 final UI polish browser check confirmed `/`, `/account`, `/staff`, and `/admin/users` render at 390px and 1280px with no detected horizontal overflow after the visual system update
- Step 8 practical screening decision UI browser check confirmed `/screenings`, `/films/house-of-hummingbird`, and `/screenings/1` render the new summary, time-range, seat-count, and selection UI at 390px and 1280px with no detected horizontal overflow
- Step 8 final UI polish review packet is recorded at `quality-reviews/step-08-final-ui-polish-review-ko.md`
- Step 8 practical screening decision UI review packet is recorded at `quality-reviews/step-08-practical-screening-decision-ui-review-ko.md`
- July 23 database verification confirmed expected table counts, role counts, booking status history, screening capacity, and migration records after the final UI polish slice
- Root README now includes the final project description, ERD image, role descriptions, test account emails, shared test password guidance, setup, verification commands, live URL, and known limitations
- Git history review confirmed 65 non-merge commits, which is above the 15 substantial commit requirement
- Production smoke verification on July 20 confirmed `/health`, `/health/database`, `/`, `/films`, `/screenings`, and `/visit` return `200` after replacing the expired Render database with `cse340-independent-cinema-db-2`
- Production role-route verification on July 20 confirmed Member login redirects to `/account`, Member `/account`, `/account/bookings/1`, and `/account/reviews/1` return `200`, Staff `/staff` returns `200`, Staff `/admin` returns `403`, and Owner `/admin`, `/admin/films`, `/admin/screenings`, `/admin/users`, and `/staff` return `200`
- Step 9 final submission approval packet is recorded at `quality-reviews/step-09-final-submission-approval-packet-ko.md`
- Headless Chrome computed layout metrics reported no horizontal overflow elements for the changed review screens. Chrome headless reported a 500px inner width during metric capture, so final 390px browser-plugin verification remains worth repeating when the in-app browser connection is stable.
- Production Owner login reaches `/admin/films`, and the live Owner catalog renders film rows and CSRF-protected archive forms
- Production Owner login reaches `/admin/films/new` and a live Owner film edit route, and both render the expected form headings, CSRF tokens, and submit actions
- Production Owner login reaches `/admin/screenings`, and the live Owner schedule renders CSRF-protected forms, active-booking disabled action, and completed-screening no-action states
- Production Owner login reaches `/admin/screenings/new` and a live Owner screening edit route, and both render the expected form headings, CSRF tokens, and submit actions
- Production `/visit` renders the updated contact form, CSRF token, and success state after deployment
- Production `/films` renders four public films and `/screenings` renders the remaining future scheduled screening with `200` responses
- Production `/` renders the PostgreSQL-backed program section and film detail links after the latest deploy
- Production detail routes return `200` for `/films/house-of-hummingbird` and the current live future screening route `/screenings/3`, while invalid public identifiers return `404`
- Production Member login reaches `/account`, and the live Member account renders booking history with the two seed Member bookings after deployment
- Production Member booking detail renders the new cancellation-state UI and CSRF token; the current live seed booking is not eligible for cancellation, so no production mutation was performed
- Production Member booking detail renders the Step 6 status timeline after deployment
- Production read-only check for the new Member booking action is pending because the current production seed schedule no longer exposes a future screening detail route
- Git history has passed 15 total commits; the final substantial-commit review remains pending
- GitHub Actions CI applies schema, seed, migrations, verification queries, and the full test suite; the first remote run passed
- Latest GitHub Actions CI run passed for the Visit and Contact slice
- Latest GitHub Actions CI run passed for the Owner film visibility slice
- Latest GitHub Actions CI run passed for the Owner screening cancellation slice
- Latest GitHub Actions CI run passed for the Owner film create and edit slice
- Latest GitHub Actions CI run passed for the Step 7 Owner user management and session-table schema fix
- Latest GitHub Actions CI run passed for the Owner screening create and edit slice
- Latest GitHub Actions CI run passed for the Step 8 operational mobile row label slice
- Latest GitHub Actions CI run passed for the Step 8 Staff operations overview slice
- Latest GitHub Actions CI run passed for the Step 8 Member account overview slice

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

Completed fifth vertical slice:

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

- Continue Step 8 with Member account hierarchy refinement or public route polish, depending on which screen has the highest submission-readiness risk after review

Cross-stage delivery infrastructure now available:

- Ordered SQL migrations apply through `app/scripts/run-migrations.js`
- Migration filenames are recorded in `schema_migrations`
- The base schema now owns the `user_sessions` table so CI and clean database setup do not depend on concurrent session-store table creation
- PostgreSQL integration tests cover migration idempotency, database constraints, and session-store lifecycle against the project schema
- GitHub Actions CI provisions PostgreSQL 17 and runs database and application verification on pushes and pull requests
- A Step 5 frontend direction review packet records the approved reference and review criteria before implementation

### Step 6: Booking Workflow and Member Experience

Started first vertical slice:

- `/screenings/:screeningId` now shows a Member-only booking action when a future scheduled screening has remaining capacity
- Unauthenticated users see a sign-in action instead of a booking form
- Staff and Owner users see a non-bookable state because only Members can create bookings
- `POST /screenings/:screeningId/bookings` requires Member role and CSRF validation
- Booking creation locks the screening row, checks active booking count, rejects sold-out screenings, inserts the booking, and inserts the initial status history row in one transaction
- Duplicate Member booking attempts return a stable conflict response instead of surfacing a database error
- Successful booking redirects to the ownership-protected Member booking detail route
- Automated tests cover rendered booking states, unauthenticated redirect, Member success, duplicate conflict, PostgreSQL history creation, database duplicate protection, and capacity protection
- Local route verification confirmed Member booking creation, redirect, booking detail rendering, initial history row, and cleanup
- Local browser checks confirmed desktop and 390px mobile no-overflow behavior for the Member booking path

Completed second vertical slice:

- `/account` now renders a real Member booking history list instead of a placeholder landing message
- The list is filtered by the signed-in Member's `user_id`, so Staff bookings and other Member bookings are not exposed
- Each booking shows timing group, current status, screening time, booked time, and a direct detail link
- Members without bookings see an empty state with a direct link back to `/screenings`
- Automated tests cover signed-in Member-only listing, cross-user exclusion, empty state rendering after signup, and existing role guard behavior
- Local PostgreSQL route verification confirmed seed Member login reaches `/account` with the two Member seed bookings and detail links
- Local browser checks confirmed desktop and 390px mobile no-overflow behavior for the Member booking history list
- Render production verification confirmed Member login reaches `/account` and renders the two seed Member bookings after deployment

Completed third vertical slice:

- `/account/bookings/:bookingId` now shows a cancellation form only when the signed-in Member owns a confirmed upcoming booking
- `POST /account/bookings/:bookingId/cancel` requires Member role, CSRF validation, and owned-booking loading before mutation
- Cancellation updates `bookings.status` to `cancelled`, sets `cancelled_at`, and appends a `booking_status_history` row from `confirmed` to `cancelled` in one transaction
- Duplicate cancellation, completed bookings, past bookings, Staff, Owner, wrong owner, invalid id, missing booking, and invalid CSRF cases return stable failure responses
- Automated tests cover route permissions, CSRF, ownership, successful cancellation, duplicate cancellation, ineligible status, and PostgreSQL history append
- Local browser checks confirmed desktop and 390px mobile no-overflow behavior for the cancellation result state
- Local PostgreSQL route verification confirmed cancellation state and history row, then removed the temporary verification booking
- Render production read-only verification confirmed the new cancellation-state detail UI and CSRF token without mutating production data

Completed fourth vertical slice:

- `/account/bookings/:bookingId` now renders the booking status history timeline from `booking_status_history`
- Timeline entries show the previous status, next status, change time, actor, and note
- Initial booking creation and Member cancellation history use the same UI pattern, so later Staff transitions can appear without a new Member detail structure
- Missing history rows render a stable fallback instead of an empty or broken section
- Automated tests cover rendered timeline content for owned booking detail and cancellation history
- PostgreSQL integration tests cover ordered history lookup after booking creation and cancellation
- Local browser checks confirmed desktop and 390px mobile no-overflow behavior for the status timeline
- Step 6 completion approval packet is recorded in `quality-reviews/step-06-completion-approval-packet-ko.md`

### Step 7: Reviews, Staff Operations, and Admin Dashboard

Completed first vertical slice:

- `/staff` now renders operational booking rows instead of a placeholder landing page
- Staff and Owner can see booking film, screening time, Member identity, current status, and eligible operational actions
- `POST /staff/bookings/:bookingId/status` requires Staff or Owner role and CSRF validation
- Staff status transitions are allowlisted: `confirmed` to `checked_in`, `confirmed` to `no_show`, `checked_in` to `completed`, and `checked_in` to `no_show`
- Invalid transitions, terminal states, missing bookings, invalid IDs, invalid CSRF, and Member access are rejected
- Current booking status and `booking_status_history` append happen in one PostgreSQL transaction
- Automated tests cover Staff and Owner access, Member denial, CSRF, valid transition, invalid transition, missing booking, and history append
- PostgreSQL integration tests cover Staff transition history from `confirmed` to `checked_in` to `completed`
- Local browser checks confirmed desktop and 390px mobile no-overflow behavior for the Staff booking status controls

Completed second vertical slice:

- `/staff` now groups operational bookings by screening before individual booking actions
- Each screening group shows program label, film title, screening time, booking count, staff action count, and screening status
- Existing Staff and Owner status actions keep the same CSRF-protected mutation route and transition rules
- Automated tests cover roster context and the existing Staff status transition failure paths
- Local SSR and headless Chrome checks confirmed the grouped roster and mobile header reflow without detected horizontal overflow elements

Completed third vertical slice:

- `/account` now renders Member-owned review cards beside booking history
- `/account/reviews/new` lists completed-booking films and disables already reviewed films
- `POST /account/reviews` requires Member role, CSRF validation, completed-booking eligibility, rating validation, nonblank body, and one review per Member per film
- `/account/reviews/:reviewId/edit` and `POST /account/reviews/:reviewId` allow only the review owner to edit rating and body
- `POST /account/reviews/:reviewId/delete` deletes only the review owner's review and leaves later direct access as not found
- Automated route tests cover invalid CSRF, invalid input, ineligible film, duplicate review, create, detail, edit, wrong-owner update, update, delete, and deleted-detail `404`
- PostgreSQL integration tests cover completed-booking eligibility, duplicate review conflict, update ownership, and delete behavior
- Authenticated local SSR and headless Chrome screenshots covered `/account`, `/account/reviews/new`, `/account/reviews/1/edit`, and `/account/reviews/1`

Completed fourth vertical slice:

- `/staff` now renders review moderation and contact message queues below the operational booking roster
- Staff and Owner can hide or restore reviews without changing review ownership
- Review moderation records the acting staff or owner account and a moderation note
- Staff and Owner can move contact messages through `new`, `in_progress`, and `closed`
- Contact message processing assigns in-progress or closed messages to the acting Staff or Owner account and preserves optional staff notes
- Automated route tests cover Staff and Owner access, Member denial, invalid CSRF, invalid visibility, invalid status, missing records, and successful mutations
- PostgreSQL integration tests cover review visibility updates and contact message status, assignment, and note updates
- Authenticated local browser checks covered `/staff` at 1280px and 390px with the booking, review, and message sections present and no real content overflow

Completed fifth vertical slice:

- `/admin` now links to Owner film, screening, and user management routes
- `/admin/users` lists user accounts with role, activation state, and related activity counts
- `POST /admin/users/:userId/access` allows only Owners to change another user's role and activation state
- Owner self-change attempts return conflict to avoid accidental lockout
- Role and activation changes rely on the existing current-user reload path, so stale Staff access and inactive Member sessions are rejected on the next request
- Automated route tests cover unauthenticated redirect, Member and Staff denial, Owner access, invalid CSRF, invalid role, missing user, self-change conflict, Staff demotion, Member deactivation, and stale-session behavior
- PostgreSQL integration tests cover role updates, activation updates, active-user reload after role change, and inactive-user reload returning null
- Authenticated local browser checks covered `/admin` and `/admin/users` at 1280px and 390px with no content overflow

## Following Stages

| Step | Focus | Main Outcome |
| --- | --- | --- |
| 5 | Public cinema experience | Implemented and ready for nonblocking Director frontend review |
| 6 | Booking and Member experience | Implemented and ready for nonblocking Director frontend review |
| 7 | Reviews and operations | Complete and ready for nonblocking Director frontend review |
| 8 | Frontend refinement | Implemented enough for Phase A submission: operational mobile labels, Staff overview, Member account overview, and public home pathway verified |
| 9 | Security and deployment | Final submission review in progress: README, ERD, Git history, production database health, public production routes, core role-route smoke checks, and final approval packet are verified |

## Current Risks and Open Decisions

- Final cinema brand name is not selected.
- Final poster and film image sources are not selected.
- Course deadline should be added once confirmed.
- The expired Render database was replaced with a new free PostgreSQL instance on July 20, and database-backed production routes now return `200`.
- The new free Render PostgreSQL instance is expected to expire on August 17, 2026 unless it is upgraded or replaced again.
- Render free services can spin down after inactivity and delay the first request.
- Production seed screening dates can age out, which can block read-only verification of future-screening workflows until the next production seed or schedule refresh.
- Production mutation checks for Staff booking controls, review moderation, contact processing, and Owner user management remain limited to local automated and PostgreSQL verification unless production data is refreshed and mutation risk is approved.

## Working Checkpoints

- Record progress after each completed stage.
- Update requirements traceability when behavior is verified.
- Run automated tests after each backend change.
- Run database verification after schema or workflow-rule changes.
- Compare every major public screen against the public references.
- Compare every Staff and Owner workflow against the operational references.
- Test the full project through direct URLs before deployment and submission.
