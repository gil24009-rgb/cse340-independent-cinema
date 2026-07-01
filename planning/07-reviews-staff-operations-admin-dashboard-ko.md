# Step 7: Reviews, Staff Operations, and Admin Dashboard

## 목표

Staff와 Owner가 실제 운영 작업을 처리하고, Member review와 contact message workflow까지 연결한다.

Step 7에서 가장 중요한 기준은 Staff와 Owner가 Member와 다른 권한을 실제 화면과 server-side mutation으로 가진다는 점이다. Staff operation은 빠르게 반복되는 작업이므로 public page보다 더 compact하고 scan 가능한 구조가 필요하다.

## Vertical Slice

### Slice 1. Staff Booking Status Transition

상태: Implemented and locally verified

구현 범위:

- `/staff` operational booking dashboard
- Staff and Owner access
- Member access denial
- booking status action buttons for `confirmed` and `checked_in` bookings
- `POST /staff/bookings/:bookingId/status`
- CSRF protection
- valid status transition allowlist
- current booking status update and `booking_status_history` append in one transaction

허용 transition:

- `confirmed` to `checked_in`
- `confirmed` to `no_show`
- `checked_in` to `completed`
- `checked_in` to `no_show`

검증:

- Staff dashboard renders operational booking rows and CSRF-protected forms.
- Member cannot access Staff status mutation.
- Staff can move `confirmed` to `checked_in`.
- Owner can perform inherited Staff status operation.
- invalid CSRF, missing booking, and invalid transition are rejected.
- PostgreSQL integration test confirms status update and history append.
- Local browser confirms desktop and 390px mobile no-overflow behavior.

### Slice 2. Staff Screening Roster

상태: Next

구현 범위:

- Staff can scan bookings grouped by screening.
- Today and upcoming screening context appears before individual booking actions.
- Empty state for no operational bookings.

검증 예정:

- Staff and Owner can access the roster.
- Member cannot access the roster.
- Roster remains usable at 390px without horizontal overflow.

### Slice 3. Member Review CRUD

상태: Planned

구현 범위:

- Member can create a review only after a completed booking for the same film.
- Member can edit or delete only their own reviews.
- Review validation and ownership failure states.

### Slice 4. Staff Review Moderation and Contact Messages

상태: Planned

구현 범위:

- Staff and Owner can hide or restore reviews without taking ownership.
- Staff and Owner can process contact messages.
- Owner can later manage users and roles.

## Step 7 완료 조건

- Staff and Owner can complete core operational booking work.
- Member review CRUD enforces completed-booking and ownership rules.
- Staff moderation and contact processing have server-rendered normal and failure states.
- Owner-only user or role management is separated from Staff permissions.
- Changed operational screens pass route, PostgreSQL, browser, responsive, accessibility, and documentation checks.
