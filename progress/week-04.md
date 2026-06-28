# Week 04 Progress

기간: 2026-06-27 - 2026-07-03

## 목표

- Step 6 booking workflow와 Member experience 완성
- Member booking history, cancellation, status history 연결 검증
- Step 7 Staff operation 진입 전 booking workflow의 데이터 무결성과 권한 경계 유지

## 완료한 작업

- `/account` Member booking history list 추가
- Member booking list를 signed-in Member `user_id`로 필터링
- booking card에 timing group, status, screening time, booked time, detail link 표시
- Member booking empty state 추가
- `/account` placeholder landing을 실제 Member booking dashboard로 교체
- Member booking history responsive card style 추가
- Member account route test에서 own-booking listing, cross-user exclusion, empty state 확인

## 관련 문서

- `README.md`
- `docs/current-status.md`
- `planning/06-booking-workflow-member-experience-ko.md`
- `planning/requirements-traceability-ko.md`
- `.local/collaboration/OPERATING_MEMORY.md`

## 관련 Commit

- Current slice: Add member booking history dashboard

## 검증 결과

- `node --test test/authentication.test.js test/database.integration.test.js`에서 23 passed
- PostgreSQL 사용 시 `pnpm test`에서 44 passed, 1 environment-specific skip
- `DATABASE_URL` 없이 `pnpm test`에서 41 passed, 4 database integration skips
- Local route에서 실제 Member login 후 `/account` 200, seed Member booking 2건, detail link 확인
- Browser에서 `/account` 1280px no overflow, Member booking 2건, detail link, main landmark 확인
- Browser에서 `/account` 390px no overflow, booking card와 action button width 확인

## 남은 위험 또는 Blocker

- Member cancellation path remains unimplemented.
- Production future-screening booking CTA verification remains pending until production seed schedule exposes a future screening detail route or final production data is refreshed.

## 다음 작업

- Step 6 Member-owned booking cancellation 구현
- Cancellation에서 current booking status와 `booking_status_history` row를 같은 transaction으로 변경
- Duplicate cancellation, wrong-owner, Staff, Owner, ineligible status, not-found, conflict 상태 검증
