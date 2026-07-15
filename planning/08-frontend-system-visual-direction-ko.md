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

## 다음 Slice 후보

- Member account hierarchy: booking history, review cards, and review prompts may need stronger section rhythm before final submission.
- Public route polish: confirm home, film, screening, and visit pages still match the restrained cinema direction after operational work.
- Staff dashboard visual polish: action groups and note inputs may need finer spacing after the overview structure is stable.

## 완료 조건

- 주요 화면의 desktop과 390px mobile layout이 깨지지 않는다.
- Hidden table headers on mobile are replaced with visible row-level meaning where needed.
- Form controls retain labels, visible focus, and useful touch target size.
- Empty, invalid, forbidden, not-found, conflict, and error states remain visually consistent.
- Step 8 changes do not alter confirmed backend scope, role boundaries, or booking workflow rules.
