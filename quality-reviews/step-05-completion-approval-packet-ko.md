# Step 5 Completion Approval Packet

검토 목적: Step 5 Public Cinema Experience가 Phase A submission-ready 기준에서 다음 단계로 넘어갈 수 있는지 확인한다.

이 검토는 비차단이다. 사용자가 frontend 방향이나 세부 UI를 수정하고 싶어도, 범위, core workflow, data relationship, security boundary를 바꾸지 않는 한 Step 6 booking workflow는 계속 진행할 수 있다.

## Step Outcome

Step 5는 PostgreSQL film과 screening data를 public discovery 화면에 연결하고, Owner가 film과 screening 변경사항을 server-rendered interface에서 관리할 수 있게 만들었다.

로드맵 목표와의 연결:

- Public user는 Home, Film Archive, Film Detail, Screening Schedule, Screening Detail, Visit 화면을 통해 영화와 상영 정보를 탐색할 수 있다.
- Owner 변경사항은 public `/films`와 `/screenings`에 반영된다.
- Contact form은 public intake로 동작하며, Staff message processing은 Step 7 범위로 남는다.
- Public 화면은 Step 5 direction packet의 restrained premium cinema direction을 유지한다.

## Representative Routes

Public review routes:

- `/`
- `/films`
- `/films/house-of-hummingbird`
- `/screenings`
- live future `/screenings/:screeningId`
- `/visit`
- `/visit?sent=1`

Owner review routes:

- `/admin/films`
- `/admin/films/new`
- live `/admin/films/:filmId/edit`
- `/admin/screenings`
- `/admin/screenings/new`
- live `/admin/screenings/:screeningId/edit`

## Normal State Evidence

| Area | Evidence |
| --- | --- |
| Public film discovery | `/films` renders non-archived films, metadata, synopsis, upcoming count, and next screening summary. |
| Public screening discovery | `/screenings` renders future scheduled screenings only, with time, film metadata, capacity, and remaining availability. |
| Public detail flow | Film detail links to upcoming screenings, and screening detail links back to film metadata. |
| Home | Home renders PostgreSQL-backed nearest screening and program film cards. |
| Visit and Contact | `/visit` renders visit information and contact form, and `/visit?sent=1` renders success feedback after valid submission. |
| Owner film management | Owner can create, edit, archive, and restore films from rendered forms and actions. |
| Owner screening management | Owner can create, edit, cancel, and restore eligible screenings from rendered forms and actions. |

## Failure State Evidence

| State | Evidence |
| --- | --- |
| Empty public lists | Automated route tests cover empty public film and screening states. |
| Database failure | Public route tests force database failures into the global error state. |
| Invalid contact form | Contact route tests and browser checks verify error summary and field-level validation. |
| Invalid film form | Owner film form tests verify required fields, slug format, release year, runtime, and duplicate slug conflict. |
| Invalid screening form | Owner screening form tests verify required fields, invalid input, duplicate start time, active-booking capacity conflict, and active-booking cancellation conflict. |
| Not found | Public detail and Owner edit routes return stable not-found responses for invalid or missing identifiers. |
| Forbidden | Member and Staff direct access to Owner film and screening routes is denied by server-side role checks. |
| Completed screening preservation | Completed screenings remain visible in Owner schedule but expose no management action. |

## Verification Evidence

Automated:

- `node --test test/authentication.test.js`: 18 passed
- `pnpm test` with PostgreSQL: 41 passed, 1 skipped
- `DATABASE_URL='' pnpm test`: 39 passed, 3 skipped

Database and route:

- PostgreSQL migration idempotency, database constraints, and session-store lifecycle are covered by integration tests.
- Local route verification confirmed film archive and restore reflection on public `/films`.
- Local route verification confirmed film create and archived edit reflection on public `/films`.
- Local route verification confirmed screening cancel and restore reflection on public `/screenings`.
- Local route verification confirmed screening create and cancelled edit reflection on public `/screenings`.
- Local route verification confirmed contact submission inserts into `contact_messages` and redirects to success state.

Browser, responsive, and accessibility:

- Public home, list, detail, and visit screens were checked at 1280px and 390px without horizontal overflow.
- Owner film catalog, film create form, screening schedule, screening create form, and screening edit form were checked at 1280px and 390px without horizontal overflow.
- Form checks confirmed labels, CSRF token, validation summary, `aria-invalid`, and field error associations where applicable.

Production:

- Production health and PostgreSQL health routes return `200`.
- Production public Home, Film Archive, Screening Schedule, Film Detail, Screening Detail, Visit, and Visit success states were checked after deployment.
- Production Owner film catalog, film create, live film edit, screening schedule, screening create, and live screening edit routes render expected headings, CSRF tokens, and submit actions.
- Latest GitHub Actions CI run passed for commit `21f856e`.

## Decisions Made Inside Confirmed Scope

- Screening create and edit are Owner-only because schedule changes affect public availability and booking rules.
- Completed screenings are not editable through the form because they are operational history.
- Owner screening form allows only `scheduled` and `cancelled` status. Booking-completed state remains a workflow result, not a manual content-management value.
- Active bookings block screening cancellation and capacity reduction below active count. This protects existing Member commitments.
- Archived films are available in Owner catalog history but excluded from public queries and screening form options.

## Health Review

| Area | Result |
| --- | --- |
| Data | Public queries exclude archived, cancelled, completed, and past records where applicable. Owner mutations preserve history rather than deleting operational records. |
| Security | Owner routes require authentication, Owner role, and CSRF on state-changing actions. Member and Staff direct access is denied. |
| Workflow | Public discovery, contact intake, and Owner content management have normal and failure paths. Booking creation remains Step 6. |
| Product | Step 5 stays within film, screening, visit, contact, and Owner content-management scope. No payment, seat selection, external API, or recommendation feature was added. |
| UX | Main public and Owner screens include empty, invalid, forbidden, not-found, conflict, and success states where applicable. |
| Accessibility | Changed forms have labels, summaries, field associations, focusable controls, and mobile reflow checks. |
| Maintainability | Queries remain close to film and screening models. Controllers coordinate request flow and rendering. |
| Production | Read-only production checks passed for current Step 5 routes. Full production workflow gate remains Step 9. |

## Debt Classification

Fix now:

- None identified for Step 5 Phase A handoff.

Schedule next:

- Step 6 must add booking transaction and concurrency verification before booking creation is called complete.
- Step 6 should connect screening detail to the Member booking entry once booking creation exists.
- Staff message processing remains for Step 7 because Step 5 only covers public contact intake.

Post-submission:

- Final cinema brand name and visual identity refinement.
- Final poster or image source direction.
- User research, motion, and portfolio-level polish.

## User Review Questions

These are frontend-direction questions, not implementation blockers:

1. Does the public flow from Home to Film Detail to Screening Detail feel clear enough for first-time visitors?
2. On mobile, are film metadata and screening availability easy to scan, or should the hierarchy become more compact in Step 8?
3. Does the Owner table and form density feel practical for repeated management work?

## Next Slice

Proceed to Step 6 Booking Workflow and Member Experience.

Before implementation starts, confirm that:

- `pnpm db:migrate` still applies cleanly.
- PostgreSQL integration tests still pass.
- The booking slice includes transaction safety, duplicate-booking protection, capacity protection, Member ownership, invalid states, and visible Member booking UI.
