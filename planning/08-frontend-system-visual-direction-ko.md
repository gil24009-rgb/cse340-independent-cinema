# Step 8 Frontend System and Visual Direction

## 목표

Step 8은 새 기능을 추가하는 단계가 아니라, 이미 연결된 public, Member, Staff, Owner 화면을 Phase A 제출 기준에서 더 읽기 쉽고 검토 가능한 상태로 정리하는 단계다.

우선순위:

1. 주요 workflow의 정보 구조와 행동이 mobile과 desktop에서 명확해야 한다.
2. Staff와 Owner 운영 화면은 반복 업무를 빠르게 스캔할 수 있어야 한다.
3. Public과 Member 화면은 cinema identity와 booking 상태를 과장 없이 분명하게 보여야 한다.
4. 장식적 polish보다 접근성, responsive behavior, 상태 표현, form clarity를 먼저 정리한다.

## 검토 범위

Public:

- `/`
- `/films`
- `/films/:filmSlug`
- `/screenings`
- `/screenings/:screeningId`
- `/visit`

Member:

- `/account`
- `/account/bookings/:bookingId`
- `/account/reviews/new`
- `/account/reviews/:reviewId`
- `/account/reviews/:reviewId/edit`

Staff and Owner:

- `/staff`
- `/admin`
- `/admin/films`
- `/admin/screenings`
- `/admin/users`

## Slice 1: Operational Mobile Cell Labels

상태: Implemented and locally verified.

문제:

- Staff와 Owner 운영 화면은 desktop에서 table header가 보이지만, mobile에서는 header가 숨겨지고 각 row가 card처럼 한 줄씩 쌓인다.
- 이 상태에서 cell의 의미가 row 안에 직접 표시되지 않아, 특히 `/staff`와 `/admin/users`처럼 정보가 많은 화면은 처음 보는 사용자가 값의 의미를 빠르게 파악하기 어렵다.

변경:

- Staff booking, review, message rows에 mobile-only cell labels를 추가했다.
- Owner film, screening, user rows에 mobile-only cell labels를 추가했다.
- Desktop에서는 기존 table header가 계속 정보 구조를 담당하고, mobile에서는 각 cell label이 표시된다.
- Route, permission, mutation, data shape은 변경하지 않았다.

검증:

- `node --test test/authentication.test.js`: 24 passed
- Browser check `/staff` at 390px: 24 labels visible, no real content overflow; overflow detector reported only visually hidden labels.
- Browser check `/staff` at 1280px: 24 labels hidden.
- Browser check `/admin/films` at 390px: 16 labels visible, no overflow.
- Browser check `/admin/films` at 1280px: labels hidden.
- Browser check `/admin/screenings` at 390px: 20 labels visible, no overflow.
- Browser check `/admin/screenings` at 1280px: labels hidden.
- Browser check `/admin/users` at 390px: 12 labels visible, no overflow.
- Browser check `/admin/users` at 1280px: labels hidden.

## Slice 2: Staff Operations Overview

상태: Implemented and locally verified.

문제:

- `/staff`는 booking operations, review moderation, message queue가 모두 한 화면에 이어진다.
- 기능적으로는 완성됐지만, 처음 화면을 열었을 때 오늘 처리할 업무의 총량과 다음 섹션 위치를 빠르게 파악하기 어렵다.

변경:

- Staff page heading 아래에 `Staff operations overview` navigation을 추가했다.
- Overview는 booking action count, review queue count, message queue count를 보여준다.
- 각 overview card는 같은 페이지의 해당 section heading으로 이동한다.
- Route, mutation, permission, data relationship은 변경하지 않았다.

검증:

- `node --test test/authentication.test.js`: overview navigation, counts, existing Staff moderation and message workflow assertions passed.
- Browser check `/staff` at 390px: overview rendered as one column, three cards linked to section headings, no real content overflow.
- Browser check `/staff` at 1280px: overview rendered as three columns, three cards linked to section headings, no real content overflow.

## Slice 3: Member Account Overview

상태: Implemented and locally verified.

문제:

- `/account`는 booking history, review list, ready-to-review prompt가 모두 연결되어 있지만, 화면 첫 진입 시 현재 계정에서 무엇을 확인해야 하는지 한눈에 요약되지 않았다.
- Member는 운영자처럼 반복 업무를 처리하지는 않지만, 자신의 booking 상태와 review 가능 여부를 빠르게 파악해야 한다.

변경:

- Member page heading 아래에 `Member account overview` navigation을 추가했다.
- Overview는 booking history count, review list count, ready-to-review film count를 보여준다.
- 각 overview card는 같은 페이지의 booking 또는 review section heading으로 이동한다.
- Route, mutation, permission, data relationship은 변경하지 않았다.

검증:

- `node --test test/authentication.test.js`: Member account overview label, booking count, review count, ready-to-review count, and existing ownership assertions passed.
- Browser check `/account` at 390px: overview rendered as one column, three cards linked to section headings, no content overflow.
- Browser check `/account` at 1280px: overview rendered as three columns, three cards linked to section headings, no content overflow.

## Slice 4: Public Home Visitor Pathway

상태: Implemented and locally verified.

문제:

- Home은 hero action, weekly schedule, program section을 갖고 있지만, first-time public visitor가 `films -> screenings -> visit` 순서를 빠르게 읽을 수 있는 별도 안내 구조가 약했다.
- Step 8의 public refinement는 새 기능보다 film discovery, schedule clarity, visit planning의 연결을 먼저 명확하게 해야 한다.

변경:

- Home hero 아래에 `Visitor path` section을 추가했다.
- `Films`, `Screenings`, `Visit` 세 card가 각각 `/films`, `/screenings`, `/visit`으로 연결된다.
- Desktop에서는 세 card가 한 줄로 표시되고, mobile에서는 한 열로 접힌다.
- Route, data query, booking workflow, permission은 변경하지 않았다.

검증:

- `node --test test/publicRoutes.test.js`: public pathway label, heading, and route links passed with existing public route assertions.
- Browser check `/` at 390px: pathway rendered as one column, three cards linked to public routes, no content overflow.
- Browser check `/` at 1280px: pathway rendered as three columns, three cards linked to public routes, no content overflow.

## Slice 5: Final Visual System Polish

상태: Implemented and locally verified.

문제:

- 전체 화면 구조와 workflow는 제출 가능했지만, 기존 color token과 표면 처리는 "Apple built a cinema website" 방향보다 따뜻한 종이톤 독립영화관에 가까웠다.
- 일부 카드와 운영 table은 기능적으로는 명확했지만, 최종 제출 화면으로 봤을 때 product surface로 보이는 완성도가 더 필요했다.
- `.owner-row-note`가 존재하지 않는 CSS variable을 참조하고 있어 운영 화면 보조 텍스트 색상이 의도와 다르게 렌더링될 수 있었다.

변경:

- Global color tokens를 dark premium surface 중심으로 재정의했다.
- Body, headings, wordmark, buttons, text links, form controls, status badges, cards, tables, and error states를 더 정돈된 product UI tone으로 맞췄다.
- Public pathway, Member overview, Staff overview, booking cards, review cards, operational tables, and auth forms에 rounded elevated surfaces를 적용했다.
- `.public-pathway` mobile width rule을 추가해 public home section이 다른 content width와 같은 responsive boundary를 사용하도록 했다.
- `.owner-row-note`의 잘못된 CSS variable을 `--muted`로 수정했다.
- Route, permission, mutation, database rule, booking workflow는 변경하지 않았다.

검증:

- `pnpm test`: 52 passed, 1 skipped
- Browser check `/` at 390px and 1280px: no horizontal overflow.
- Browser check `/account` at 390px and 1280px: three overview cards, booking list, and review list rendered with no horizontal overflow.
- Browser check `/staff` at 390px and 1280px: three overview cards, five operational table groups, and action buttons rendered with no horizontal overflow.
- Browser check `/admin/users` at 390px and 1280px: user access table, selects, and action buttons rendered with no horizontal overflow.

## Slice 6: Practical Screening Decision UI

상태: Implemented and locally verified.

문제:

- 최종 visual polish 이후 화면은 더 정돈되었지만, public schedule은 실제 영화관 사이트처럼 빠른 선택에 필요한 decision facts를 충분히 압축해서 보여주지 못했다.
- Cinecube 같은 cinema schedule UI는 film title, date, time, screen, seat count, movie detail link를 반복적으로 노출해 사용자가 상영을 비교하게 만든다.
- 우리 프로젝트 범위에는 screen selection이나 payment가 없으므로, 실제로 필요한 선택 정보는 start time, end time, availability, held seats, price, direct screening action이다.

변경:

- `/screenings` 상단에 schedule summary panel을 추가해 next showtime, film count, screening count, total remaining seats를 한눈에 보이게 했다.
- Public screening rows에 end time, time range, price, held-seat count, stronger `Choose Screening` action을 추가했다.
- Film detail의 upcoming screenings row도 같은 decision facts를 사용해 film discovery에서 booking entry로 이어지는 흐름을 맞췄다.
- Screening detail header와 detail body에 date, time range, seats, price decision strip을 추가했다.
- Backend는 display-only presenter 값을 계산한다. Route, permission, mutation, database schema, booking rule은 변경하지 않았다.

검증:

- `node --test test/publicRoutes.test.js`: 6 passed.
- `pnpm test`: 52 passed, 1 skipped.
- `DATABASE_URL='' pnpm test`: 46 passed, 7 skipped.
- Local PostgreSQL seed, migration, and verification query passed after confirming the database URL pointed to the local database.
- Browser check `/screenings` at 390px and 1280px: schedule summary, three `Choose Screening` actions, end-time labels, and no horizontal overflow.
- Browser check `/films/house-of-hummingbird` at 390px and 1280px: upcoming screening decision row, end-time label, `Choose Screening` action, and no horizontal overflow.
- Browser check `/screenings/1` at 390px and 1280px: four decision-strip items and no horizontal overflow.

## Slice 7: Essential UI Simplification

상태: Implemented and locally verified.

문제:

- Slice 6에서 public schedule의 decision facts를 강화했지만, summary panel과 duplicated decision strip은 실제 선택 흐름보다 review-friendly 설명에 가까웠다.
- 실제 cinema schedule UI는 상영 목록 안에서 film, runtime, rating, showtime, seat availability, and booking action을 반복해서 보여준다. 별도 dashboard-style summary는 public visitor에게 직접 필요한 정보가 아니다.
- Public detail page에 route path를 노출하는 것은 구현 설명에는 유용하지만 visitor task에는 의미가 없다.

제거:

- `/screenings`의 schedule summary panel과 관련 CSS를 제거했다.
- Screening detail의 duplicated decision strip과 관련 CSS를 제거했다.
- Public list/detail에서 held-seat count를 제거하고, visitor-facing availability만 남겼다.
- Film detail과 screening detail의 internal route/path rows를 제거했다.
- Backend presenter에서 더 이상 쓰지 않는 summary builder와 held-seat label을 제거했다.

남긴 정보:

- Film title
- Date
- Start time and end time
- Runtime and age rating
- Guest talk badge
- Price
- Visitor-facing availability
- Booking or screening selection action

검증:

- `node --test test/publicRoutes.test.js`: 6 passed.
- Browser check `/screenings` at 390px and 1280px: essential showtime rows rendered, removed summary panel absent, no horizontal overflow.
- Browser check `/films/house-of-hummingbird` at 390px and 1280px: film facts and upcoming screening action rendered, internal route row absent, no horizontal overflow.
- Browser check `/screenings/1` at 390px and 1280px: header facts, availability, capacity, and booking action rendered, duplicated decision strip and route/path rows absent, no horizontal overflow.

## 다음 Slice 후보

- Direct final submission using README, live Render URL, and test account guidance.
- Optional production smoke check after this simplification commit deploys.

## 완료 조건

- 주요 화면의 desktop과 390px mobile layout이 깨지지 않는다.
- Hidden table headers on mobile are replaced with visible row-level meaning where needed.
- Form controls retain labels, visible focus, and useful touch target size.
- Empty, invalid, forbidden, not-found, conflict, and error states remain visually consistent.
- Step 8 changes do not alter confirmed backend scope, role boundaries, or booking workflow rules.
