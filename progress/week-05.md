# Week 05 Progress

기간: 2026-07-04 - 2026-07-10

## 목표

- Step 7 Staff operations를 상영 단위로 더 빠르게 스캔할 수 있게 정리
- Staff status mutation의 권한, CSRF, transition, history 기록 규칙 유지
- Member review CRUD의 completed-booking eligibility와 ownership failure states 구현

## 완료한 작업

- `/staff` operational booking list를 screening group 중심 roster로 재구성
- 각 screening group에 program label, film title, screening time, booking count, staff action count, screening status 표시
- 개별 booking row는 기존 CSRF-protected status action contract 유지
- Staff mobile header reflow를 보정해 account actions가 작은 폭에서 오른쪽으로 밀리지 않게 수정
- Staff route test에서 roster grouping context와 status action 회귀 확인 추가
- `/account`에 Member-owned review cards와 reviewable completed-booking prompt 추가
- `/account/reviews/new` review create form 추가
- `/account/reviews/:reviewId/edit` review edit form 추가
- Member review create/update/delete route와 CSRF, validation, ownership, duplicate conflict 처리 추가
- PostgreSQL review model test에서 completed-booking eligibility, duplicate, update ownership, delete 검증 추가

## 관련 문서

- `docs/current-status.md`
- `planning/07-reviews-staff-operations-admin-dashboard-ko.md`
- `planning/requirements-traceability-ko.md`
- `.local/collaboration/OPERATING_MEMORY.md`

## 관련 Commit

- Add staff screening roster grouping
- Current slice: Add member review CRUD

## 검증 결과

- `node --test test/authentication.test.js test/database.integration.test.js`에서 27 passed
- PostgreSQL 사용 시 `pnpm test`에서 48 passed, 1 environment-specific skip
- `DATABASE_URL` 없이 `pnpm test`에서 44 passed, 5 database integration skips
- Authenticated local SSR inspection에서 roster label, screening group, program context, action summary, CSRF forms, status buttons, table semantics 확인
- Headless Chrome 1280px screenshot에서 grouped roster와 Staff actions 확인
- Headless Chrome 390px screenshot에서 grouped roster와 mobile header reflow 확인
- Headless Chrome computed layout metrics에서 `scrollWidth`와 `clientWidth`가 같고 overflowing element 0개 확인
- Member review route test에서 invalid CSRF, invalid input, ineligible film, duplicate review, create, detail, edit, wrong-owner update, update, delete, deleted-detail `404` 확인
- PostgreSQL integration test에서 completed-booking eligibility, duplicate review conflict, update ownership, delete behavior 확인
- Authenticated local SSR에서 `/account`, `/account/reviews/new`, `/account/reviews/1/edit`, `/account/reviews/1` 200과 CSRF token 확인
- Headless Chrome screenshot에서 changed Member review screens 확인
- Headless Chrome computed layout metrics에서 changed review screens의 overflowing element 0개 확인. Chrome headless가 metric capture에서 500px inner width를 보고해 390px in-app browser verification은 추후 재확인 가치가 있음

## 새로 결정한 사항

- Staff booking operations는 flat list보다 screening-first roster를 기본 구조로 둔다.
- Status mutation contract는 그대로 유지하고, 화면에서 상영 context만 앞세운다.
- Member review creation은 completed booking을 application model에서 검증하고, one-review-per-film은 PostgreSQL unique constraint로도 보호한다.
- Staff moderation은 Member CRUD와 분리해 다음 slice에서 처리한다.

## 남은 위험 또는 Blocker

- Production Staff booking controls and roster grouping verification remains pending until this slice deploys.
- Production future-screening booking CTA verification remains limited by aged-out seed screening dates.
- Production Member review CRUD verification remains pending until this slice deploys.
- Staff review moderation, contact processing, and Owner user management remain Step 7 work.

## 다음 주 목표

- Staff review moderation과 contact message workflow 구현
- 이후 Owner user management로 진행
