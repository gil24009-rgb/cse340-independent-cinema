# Week 05 Progress

기간: 2026-07-04 - 2026-07-10

## 목표

- Step 7 Staff operations를 상영 단위로 더 빠르게 스캔할 수 있게 정리
- Staff status mutation의 권한, CSRF, transition, history 기록 규칙 유지
- Review CRUD로 넘어가기 전에 운영 화면의 기본 정보 구조 정리

## 완료한 작업

- `/staff` operational booking list를 screening group 중심 roster로 재구성
- 각 screening group에 program label, film title, screening time, booking count, staff action count, screening status 표시
- 개별 booking row는 기존 CSRF-protected status action contract 유지
- Staff mobile header reflow를 보정해 account actions가 작은 폭에서 오른쪽으로 밀리지 않게 수정
- Staff route test에서 roster grouping context와 status action 회귀 확인 추가

## 관련 문서

- `docs/current-status.md`
- `planning/07-reviews-staff-operations-admin-dashboard-ko.md`
- `planning/requirements-traceability-ko.md`
- `.local/collaboration/OPERATING_MEMORY.md`

## 관련 Commit

- Current slice: Add staff screening roster grouping

## 검증 결과

- `node --test test/authentication.test.js test/database.integration.test.js`에서 25 passed
- PostgreSQL 사용 시 `pnpm test`에서 46 passed, 1 environment-specific skip
- `DATABASE_URL` 없이 `pnpm test`에서 43 passed, 4 database integration skips
- Authenticated local SSR inspection에서 roster label, screening group, program context, action summary, CSRF forms, status buttons, table semantics 확인
- Headless Chrome 1280px screenshot에서 grouped roster와 Staff actions 확인
- Headless Chrome 390px screenshot에서 grouped roster와 mobile header reflow 확인
- Headless Chrome computed layout metrics에서 `scrollWidth`와 `clientWidth`가 같고 overflowing element 0개 확인

## 새로 결정한 사항

- Staff booking operations는 flat list보다 screening-first roster를 기본 구조로 둔다.
- Status mutation contract는 그대로 유지하고, 화면에서 상영 context만 앞세운다.

## 남은 위험 또는 Blocker

- Production Staff booking controls and roster grouping verification remains pending until this slice deploys.
- Production future-screening booking CTA verification remains limited by aged-out seed screening dates.
- Member review CRUD, Staff review moderation, contact processing, and Owner user management remain Step 7 work.

## 다음 주 목표

- Member review CRUD 구현
- Completed booking eligibility와 ownership failure states 검증
- 이후 Staff review moderation과 contact message workflow로 진행
