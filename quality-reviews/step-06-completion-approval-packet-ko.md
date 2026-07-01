# Step 6 Completion Approval Packet

검토 목적: Step 6 Booking Workflow and Member Experience가 Phase A submission-ready 기준에서 다음 단계로 넘어갈 수 있는지 확인한다.

이 검토는 비차단이다. 사용자가 frontend 방향이나 세부 UI를 수정하고 싶어도, 범위, core workflow, data relationship, security boundary를 바꾸지 않는 한 Step 7 Staff operations는 계속 진행할 수 있다.

## Step Outcome

Step 6는 Public screening detail에서 Member booking을 만들고, Member가 `/account`와 booking detail에서 자신의 booking history, current status, cancellation state, and status timeline을 확인할 수 있게 만들었다.

로드맵 목표와의 연결:

- Member는 future scheduled screening에서 booking을 생성할 수 있다.
- Booking creation은 duplicate booking과 capacity overflow를 막는다.
- Booking creation and cancellation은 `booking_status_history`를 같은 transaction 안에서 기록한다.
- Member는 자신의 booking만 볼 수 있고 취소할 수 있다.
- Booking detail은 ticket-style detail, cancellation state, and status timeline을 제공한다.

## Representative Routes

Member review routes:

- `/screenings/:screeningId`
- `POST /screenings/:screeningId/bookings`
- `/account`
- `/account/bookings/:bookingId`
- `POST /account/bookings/:bookingId/cancel`

Representative states:

- Public visitor on screening detail sees sign-in action.
- Staff and Owner on screening detail see non-bookable state.
- Member with available future screening sees booking action.
- Member account with bookings shows booking history cards.
- New Member account shows empty booking history.
- Booking detail shows status, screening time, booked time, cancellation state, and timeline.
- Cancelled booking detail shows cancelled time, cancelled copy, and cancellation timeline row.

## Normal State Evidence

| Area | Evidence |
| --- | --- |
| Booking creation | Route and PostgreSQL tests confirm booking insert, redirect to detail, and initial history row. |
| Capacity protection | PostgreSQL integration test confirms sold-out screening rejection. |
| Duplicate prevention | Route and PostgreSQL tests confirm duplicate Member booking conflict. |
| Member booking history | `/account` route test and browser check confirm signed-in Member booking list and detail links. |
| Member cancellation | Route and PostgreSQL tests confirm confirmed-upcoming cancellation, `cancelled_at`, and history append. |
| Status timeline | Route, PostgreSQL, and browser checks confirm ordered history entries render on booking detail. |

## Failure State Evidence

| State | Evidence |
| --- | --- |
| Unauthenticated | Booking creation, booking detail, and cancellation routes redirect to login. |
| Forbidden role | Staff and Owner cannot use Member booking and cancellation routes. |
| Wrong owner | Another Member's booking returns not found instead of exposing private data. |
| Invalid or missing booking | Strict id parsing and missing records return stable not-found responses. |
| Invalid CSRF | Booking and cancellation mutations reject invalid CSRF tokens. |
| Conflict | Duplicate booking, sold-out screening, duplicate cancellation, and ineligible cancellation return stable conflict responses. |
| Empty state | Member dashboard renders an empty booking history state for Members without bookings. |
| Missing history | Booking detail renders a stable missing-history fallback. |

## Verification Evidence

Automated:

- `node --test test/authentication.test.js test/database.integration.test.js`: 24 passed
- `pnpm test` with PostgreSQL: 45 passed, 1 skipped
- `DATABASE_URL='' pnpm test`: 42 passed, 4 skipped

Database and route:

- PostgreSQL integration test confirms booking creation and initial history row.
- PostgreSQL integration test confirms duplicate booking and capacity protection.
- PostgreSQL integration test confirms Member cancellation updates status and appends history.
- PostgreSQL integration test confirms ordered history lookup after creation and cancellation.
- Local route tests cover role, ownership, CSRF, not-found, conflict, empty state, and rendered timeline content.

Browser, responsive, and accessibility:

- `/account` booking history was checked at 1280px and 390px without horizontal overflow.
- Booking creation path from screening detail to booking detail was checked at 1280px and 390px without horizontal overflow.
- Booking cancellation detail state was checked at 1280px and 390px without horizontal overflow.
- Booking status timeline was checked at 1280px and 390px without horizontal overflow.
- Changed Member screens preserve `main#main-content`, semantic lists, definition lists, headings, forms, buttons, and CSRF hidden input where applicable.

Production:

- Production Member login reaches `/account` and renders seed Member bookings.
- Production Member booking detail renders cancellation-state UI and CSRF token.
- Production timeline verification is pending until the latest Step 6 completion commit is deployed.
- Production mutation was not performed because the current live seed booking is not cancellation eligible.

## Decisions Made Inside Confirmed Scope

- Member cancellation remains limited to confirmed upcoming bookings. This protects completed operational records and avoids rewriting history.
- Timeline reads from `booking_status_history` instead of reconstructing events from booking fields. This keeps the UI tied to the durable workflow record.
- Missing history renders a fallback instead of inventing a derived event. The project should not claim history that the database did not record.
- Later Staff transitions will reuse the same timeline UI pattern. Step 7 can add operational transitions without changing the Member detail structure.

## Health Review

| Area | Result |
| --- | --- |
| Data | Booking creation and cancellation use transactions and PostgreSQL constraints. History rows record real transitions. |
| Security | Member routes require authentication, Member role, CSRF for mutations, and ownership loading before private data or mutations. |
| Workflow | Member can create, view, track, and cancel eligible bookings through server-rendered routes. |
| Product | Step 6 stays inside booking workflow scope. No payment, seat selection, external booking API, or notification feature was added. |
| UX | Normal, empty, cancelled, ineligible, forbidden, not-found, conflict, and missing-history states are represented. |
| Accessibility | Changed screens use semantic landmarks, headings, lists, forms, buttons, and responsive no-overflow checks. |
| Maintainability | Booking rules stay in the booking model, route ownership stays in middleware, and controller logic coordinates rendering. |
| Production | Read-only Member booking checks passed. Full production mutation gate remains later because current seed data is not eligible. |

## Debt Classification

Fix now:

- None identified for Step 6 Phase A handoff.

Schedule next:

- Step 7 should add Staff check-in and booking status transition controls that write to the same `booking_status_history` table.
- Step 7 should add operational booking views for Staff and Owner with filters and repeated-action ergonomics.
- Production future-screening seed data may need refresh before full production booking mutation verification.

Post-submission:

- Final ticket visual refinement and motion.
- User-tested Member booking copy and status labels.
- Portfolio-level visual polish after Staff and Owner workflows are complete.

## User Review Questions

These are frontend-direction questions, not implementation blockers:

1. Does the Member booking detail feel enough like a clear ticket and status record, or should the hierarchy become more ticket-like in Step 8?
2. Is the status timeline language clear enough for a non-technical Member?
3. On mobile, should the Member booking cards prioritize film title and status more aggressively before screening time?

## Next Slice

Proceed to Step 7 Reviews, Staff Operations, and Admin Dashboard.

Smallest next slice:

- Staff booking status transition and check-in controls.
- Reuse `booking_status_history` as the durable workflow record.
- Preserve the Member timeline as the read-only view of Staff and Member transitions.
