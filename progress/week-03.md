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
- Step 5 상태 문서, traceability, 운영 메모리 갱신

## 관련 문서

- `README.md`
- `docs/current-status.md`
- `planning/05-public-cinema-experience-ko.md`
- `planning/requirements-traceability-ko.md`
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

## 남은 위험 또는 Blocker

- Production Owner screening create/edit form read-only verification is still pending for this slice.
- Step 5 completion review packet must be refreshed before treating the step as fully accepted.

## 다음 작업

- Production Owner screening form read-only verification
- GitHub Actions CI 확인
- Step 5 stable-slice health review와 Director approval packet 갱신
