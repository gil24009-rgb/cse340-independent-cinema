# Step 8 Practical Screening Decision UI Review

검토 목적: public visitor가 영화관 사이트에서 실제로 비교하는 정보를 더 빠르게 읽고 상영을 선택할 수 있는지 확인한다.

이 검토는 visual-only pass가 아니다. Schedule UI의 정보 구조를 개선했지만, route, role, permission, mutation, database relationship, booking workflow는 변경하지 않았다.

## Reference Rationale

실제 cinema schedule UI는 방문자가 긴 설명을 읽기 전에 film, date, start time, finish expectation, seat availability, price, and next action을 비교하게 만든다. Cinecube의 timetable은 movie detail, date and time grouping, seat count, and booking-related action을 반복적으로 노출한다. Indie cinema listing sites also keep film identity and showtime access close together because visitors often arrive with either a film-first or time-first task.

이 프로젝트는 seat map, payment, multiple auditorium, external booking API를 제외한 범위다. 그래서 참고한 구조 중 현재 제품에 필요한 부분만 적용했다.

## Changed Screens

- `/screenings`
- `/films/house-of-hummingbird`
- `/screenings/1`

## Improvements

- `/screenings` now starts with a summary panel for next showtime, film count, screening count, and total remaining seats.
- Screening rows now show start time, end time, full time range, price, availability, held-seat count, and a stronger `Choose Screening` action.
- Film detail upcoming-screening rows now use the same decision facts as the schedule list.
- Screening detail now includes a four-part decision strip: Date, Time, Seats, and Price.
- The stronger button treatment makes the booking entry easier to find without adding payment, seat selection, or new workflow scope.

## Verification Evidence

Automated:

- `node --test test/publicRoutes.test.js`: 6 passed
- `pnpm test`: 52 passed, 1 skipped
- `DATABASE_URL='' pnpm test`: 46 passed, 7 skipped
- Local PostgreSQL seed, migration, and verification query passed after confirming the database URL pointed to the local database.

Browser checks:

- `/screenings` at 390px: schedule summary rendered, three `Choose Screening` actions rendered, end-time labels rendered, no horizontal overflow.
- `/screenings` at 1280px: schedule summary rendered, three `Choose Screening` actions rendered, end-time labels rendered, no horizontal overflow.
- `/films/house-of-hummingbird` at 390px: upcoming screening decision row rendered, one `Choose Screening` action rendered, no horizontal overflow.
- `/films/house-of-hummingbird` at 1280px: upcoming screening decision row rendered, one `Choose Screening` action rendered, no horizontal overflow.
- `/screenings/1` at 390px: four decision-strip items rendered, no horizontal overflow.
- `/screenings/1` at 1280px: four decision-strip items rendered, no horizontal overflow.

## Health Review

| Area | Result |
| --- | --- |
| Data | Display values are derived from existing screening, film, booking count, and capacity data. No schema change. |
| Security | No protected route, session, CSRF, role, or ownership behavior changed. |
| Workflow | Public visitor can compare and enter the existing screening detail and Member booking path more directly. |
| Product | The change supports film-first and time-first visitors without expanding scope. |
| UX | Decision facts are visible in list and detail contexts, including mobile width. |
| Accessibility | Summary and decision sections use headings, lists, and labels instead of color-only meaning. |
| Maintainability | Presenter formatting stays in the public site controller; views consume prepared labels. |
| Production | Local verification passed. Production smoke should run after this commit deploys. |

## Nonblocking Debt

- Production future-screening booking mutation remains limited by live seed dates and should stay read-only unless production data is intentionally refreshed.
- A Phase B portfolio pass could add stronger film imagery or calendar navigation after real user feedback.
