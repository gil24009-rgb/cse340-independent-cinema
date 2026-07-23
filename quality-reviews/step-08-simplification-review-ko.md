# Step 8 Simplification Review

검토 목적: 최종 제출 전 public film and screening UI에서 기능 설명, 내부 구현 노출, 중복된 visual panel을 줄이고 visitor task에 필요한 정보만 남겼는지 확인한다.

## Simplification Principle

Cinema visitors usually need a short path:

1. Find the film.
2. Compare the showtime.
3. Check whether seats are available.
4. Enter the booking flow.

Real cinema schedule pages support that path by keeping film title, rating, runtime, showtime, availability, and ticket action close together. They do not need a dashboard-style summary when the visible list already answers the visitor's question.

## Removed

- `/screenings` schedule summary panel
- Unused schedule summary presenter data
- Held-seat labels on public list and detail screens
- Duplicated decision strip on screening detail
- Internal route/path rows on public detail pages
- CSS for the removed panel and strip

## Kept

- Film title and metadata
- Date, start time, and end time
- Runtime and age rating
- Guest talk badge
- Price
- Visitor-facing availability
- Screening selection and booking actions
- Empty, not-found, conflict, and error states

## Why This Is Better For Submission

The previous version made the public schedule look more designed, but some parts explained the interface instead of helping the visitor act. The simplified version is easier to defend in a final review because each visible element has a clear job.

The backend also became slightly cleaner because display-only summary data that no route needed was removed.

## Verification Evidence

Automated:

- `node --test test/publicRoutes.test.js`: 6 passed

Browser checks:

- `/screenings` at 390px and 1280px: showtime rows, availability, end-time labels, and `Choose Screening` actions rendered; schedule summary panel absent; no horizontal overflow.
- `/films/house-of-hummingbird` at 390px and 1280px: film detail and upcoming screening action rendered; internal route row absent; no horizontal overflow.
- `/screenings/1` at 390px and 1280px: header facts, availability, capacity, film link, back link, and sign-in booking action rendered; duplicated decision strip and route/path rows absent; no horizontal overflow.

## Health Review

| Area | Result |
| --- | --- |
| Data | No database schema or query requirement changed. |
| Security | No protected route, session, CSRF, role, or ownership behavior changed. |
| Workflow | Public visitor still reaches screening detail and the existing Member booking flow. |
| Product | Scope stayed inside film discovery, schedule clarity, and booking entry. |
| UX | Public pages now expose fewer nonessential elements and keep actions closer to showtime facts. |
| Accessibility | Removed sections reduce focusable and readable surface area without removing required labels or actions. |
| Maintainability | Removed unused presenter data and CSS selectors. |
| Production | Production smoke should run after this commit deploys. |

## Nonblocking Debt

- The public UI still uses seed film data and no original poster assets. That remains Phase B, not a submission blocker.
- Production future-screening booking mutation remains limited by live seed dates and should stay read-only unless production data is intentionally refreshed.
