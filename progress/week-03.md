# Week 03 Progress

기간: 2026-06-20 - 2026-06-26

## 목표

- Step 5 Owner management slice 완료
- Owner film과 screening 변경사항이 public pages에 반영되는지 검증
- Step 6 booking workflow 착수 전 database, migration, CI baseline 유지

## 완료한 작업

- Owner screening create form 추가
- Owner screening edit form 추가
- screening form validation, duplicate start conflict, active booking capacity conflict, active booking cancellation conflict 처리 추가
- completed screening edit 차단 추가
- Owner screening create 후 public `/screenings` 반영 확인
- Owner screening edit로 cancelled 처리 후 public `/screenings` 제외 확인
- Owner screening form browser verification 추가
- Step 5 completion approval packet 추가
- Step 5 상태 문서, traceability, 운영 메모리 갱신
- Step 6 첫 slice로 transaction-safe Member booking creation 구현
- Screening detail에서 Member-only booking action 추가
- Booking creation에서 screening row lock, capacity check, duplicate conflict handling, initial status history transaction 추가
- Booking 성공 후 `/account/bookings/:bookingId` redirect 연결

## 관련 문서

- `README.md`
- `docs/current-status.md`
- `planning/05-public-cinema-experience-ko.md`
- `planning/06-booking-workflow-member-experience-ko.md`
- `planning/requirements-traceability-ko.md`
- `quality-reviews/step-05-completion-approval-packet-ko.md`
- `.local/collaboration/OPERATING_MEMORY.md`

## 관련 Commit

- Current slice: Add owner screening create and edit forms

## 검증 결과

- `node --test test/authentication.test.js`에서 Owner screening create/edit 포함 18 passed
- PostgreSQL 사용 시 `pnpm test`에서 41 passed, 1 environment-specific skip
- `DATABASE_URL` 없이 `pnpm test`에서 39 passed, 3 database integration skips
- Local route에서 Owner create 후 검증 screening이 public `/screenings`에 표시되고, edit로 cancelled 처리 후 public `/screenings`에서 제외되는 것 확인
- Browser에서 `/admin/screenings/new`와 `/admin/screenings/2/edit` 1280px와 390px no overflow 확인
- Browser에서 Owner screening form labels, CSRF token, validation summary, aria-invalid, field error associations 확인
- Step 5 completion approval packet에서 representative routes, failure states, verification evidence, health review, debt classification 정리
- Step 6 진입 전 `pnpm db:migrate` 재실행 통과
- Step 6 진입 전 PostgreSQL 사용 `pnpm test`에서 41 passed, 1 environment-specific skip 재확인
- `node --test test/publicRoutes.test.js test/database.integration.test.js`에서 10 passed
- PostgreSQL 사용 시 `pnpm test`에서 43 passed, 1 environment-specific skip
- `DATABASE_URL` 없이 `pnpm test`에서 40 passed, 4 database integration skips
- Local route에서 실제 Member login, booking POST, booking detail redirect, history row 생성, cleanup 확인
- Browser에서 Member booking flow 1280px와 390px no overflow 확인
- Production read-only booking CTA 확인은 현재 production seed schedule에 future screening detail route가 없어 pending으로 기록

## 남은 위험 또는 Blocker

- Member booking history list and cancellation path remain unimplemented.
- Production future-screening verification needs a seed or schedule refresh before final deployment review.

## 다음 작업

- Step 6 Member booking history list, empty state, and cancellation path 구현
