# Week 02 Progress

기간: 2026-06-13 - 2026-06-19

## 목표

- Step 4 signup slice 완료
- Member account creation validation과 session safety 보강
- Step 4 다음 ownership slice를 위한 auth baseline 정리

## 완료한 작업

- Member-only `/signup` route와 form 추가
- signup error summary와 field-level validation feedback 추가
- first name, last name, email, password, confirm password server-side validation 추가
- email lower-case normalization 추가
- bcrypt password hashing 경로 추가
- duplicate email conflict handling 추가
- signup 성공 후 session regeneration과 authenticated redirect 추가
- login 화면에서 signup 진입 링크 추가
- signup 관련 automated tests와 browser verification 추가
- owned booking과 review detail route 추가
- strict resource ID parsing, not-found handling, ownership middleware 추가
- cross-account direct URL denial tests 추가
- owned detail route local browser verification 추가
- Step 4 상태 문서, traceability, 운영 메모리 갱신
- PostgreSQL 17 GitHub Actions CI 구성
- ordered database migration runner와 baseline migration 추가
- migration, database constraint, PostgreSQL session store integration test 추가
- Step 5 public frontend direction review packet 추가
- Step 4 independent authentication review findings 분류와 hardening 반영
- PostgreSQL-backed public film archive와 screening schedule 구현
- public list normal, empty, database-error states와 responsive layout 추가
- Step 5 public film detail과 screening detail slice 구현
- public detail route valid, invalid, missing state tests와 browser verification 추가
- PostgreSQL-backed public home highlights 구현
- public home nearest screening, schedule links, program film cards, empty states, database-error handling 추가

## 관련 문서

- `README.md`
- `docs/current-status.md`
- `planning/04-authentication-authorization-ko.md`
- `planning/requirements-traceability-ko.md`
- `planning/05-public-cinema-experience-ko.md`
- `quality-reviews/step-05-direction-review-packet-ko.md`
- `database/README.md`
- `.local/collaboration/OPERATING_MEMORY.md`

## 관련 Commit

- Current slice: Add Member signup flow and validation
- Current slice: Add project delivery infrastructure
- Current slice: Classify Step 4 review findings

## 검증 결과

- `pnpm test`에서 automated tests 23개 통과
- `git diff --check` 통과
- Browser에서 signup validation summary와 field-level error 확인
- Browser에서 duplicate email conflict 화면 확인
- Browser에서 signup 성공 후 `/account` redirect와 authenticated `/signup` redirect 확인
- Browser에서 mobile 390px signup layout과 no horizontal overflow 확인
- Render live `/signup`에서 실제 Member signup, logout, duplicate email conflict 확인
- `pnpm test`에서 ownership slice 포함 automated tests 28개 통과
- Browser에서 owned booking detail, review detail, 404 state 확인
- Browser에서 owned detail page mobile 390px no overflow 확인
- Render live에서 owned booking detail `200`, review detail `200`, cross-account `404`, invalid-id `404`, Staff `403` 확인
- 로컬 PostgreSQL `user_sessions`에서 CSRF session row 생성, login session ID regeneration, logout row deletion 직접 확인
- PostgreSQL 사용 시 `pnpm test`에서 30 passed, 1 environment-specific skip
- `DATABASE_URL` 없이 `pnpm test`에서 28 passed, 3 database integration skips
- migration을 연속 두 번 실행해 idempotency 확인
- 임시 빈 PostgreSQL database에서 CI와 같은 schema, seed, migration, verify, full test 순서 통과
- 첫 GitHub Actions PostgreSQL CI run에서 database pipeline, full tests, tracked-file checks 통과
- PostgreSQL 사용 시 `pnpm test`에서 32 passed, 1 environment-specific skip
- `DATABASE_URL` 없이 `pnpm test`에서 30 passed, 3 database integration skips
- anonymous login CSRF token이 login 이후 session에서 재사용되지 않음을 test로 확인
- independent authentication review 결과에서 critical finding 없음 확인
- PostgreSQL 사용 시 `pnpm test`에서 34 passed, 1 environment-specific skip
- `DATABASE_URL` 없이 `pnpm test`에서 32 passed, 3 database integration skips
- 실제 PostgreSQL seed에서 public film 4개와 future scheduled screening 3개 조회 확인
- `/films`와 `/screenings` 1280px 및 390px no-overflow browser verification
- Render production `/films` film rows 4개와 현재 future `/screenings` row 1개 `200` 확인
- PostgreSQL 사용 시 `pnpm test`에서 35 passed, 1 environment-specific skip
- `DATABASE_URL` 없이 `pnpm test`에서 33 passed, 3 database integration skips
- Browser에서 film archive에서 film detail 이동과 film detail에서 screening detail 이동 확인
- Browser에서 public detail routes 1280px와 390px no overflow 확인
- Render live에서 `/films/house-of-hummingbird` `200`, current future screening detail `/screenings/3` `200`, `/films/BadSlug` `404`, `/screenings/not-a-number` `404` 확인
- PostgreSQL 사용 시 `pnpm test`에서 35 passed, 1 environment-specific skip
- `DATABASE_URL` 없이 `pnpm test`에서 33 passed, 3 database integration skips
- 실제 PostgreSQL seed에서 current future screening 2개 조회 확인
- Browser에서 public home 1280px와 390px no overflow 확인
- Browser에서 home nearest screening link와 program film detail links 확인

## 남은 위험 또는 Blocker

## 다음 작업

- Step 5 public Visit and Contact slice 구현
