# Week 06 Progress

기간: 2026-07-11 - 2026-07-17

## 목표

- Staff review moderation을 Member review CRUD와 분리된 운영 workflow로 연결
- Public contact intake를 Staff message processing queue까지 연결
- Owner user management와 role activation controls 구현
- Step 7 Reviews, Staff Operations, and Admin Dashboard를 Phase A local handoff 기준으로 완료

## 완료한 작업

- `/staff`에 Member review moderation queue 추가
- Staff와 Owner가 review를 hide 또는 restore할 수 있는 CSRF-protected mutation 추가
- Review moderation action이 acting Staff 또는 Owner와 moderation note를 기록하도록 구현
- `/staff`에 contact message queue 추가
- Staff와 Owner가 contact message를 `new`, `in_progress`, `closed` 상태로 처리할 수 있도록 구현
- Contact message action이 assignee와 optional staff note를 갱신하도록 구현
- Staff operational dashboard CSS를 review/message queue와 mobile one-column layout까지 확장
- Step 7 문서에서 Staff moderation/contact processing 완료와 Owner user management next slice를 분리
- `/admin` Owner landing에 Films, Screenings, Users 관리 링크 추가
- `/admin/users` Owner user management table 추가
- Owner가 다른 계정의 role과 activation state를 변경할 수 있는 CSRF-protected mutation 추가
- Owner self-change conflict를 추가해 자기 자신의 role downgrade 또는 deactivation으로 잠기는 상황 차단
- Role downgrade와 deactivation 후 기존 session이 다음 request에서 권한을 유지하지 못하는지 route test로 검증
- `user_sessions` table을 project schema와 migration으로 명시해 CI 병렬 테스트가 session-store table creation race에 의존하지 않도록 수정
- Step 7 completion approval packet 작성

## 관련 문서

- `README.md`
- `docs/current-status.md`
- `planning/07-reviews-staff-operations-admin-dashboard-ko.md`
- `planning/requirements-traceability-ko.md`
- `quality-reviews/step-07-completion-approval-packet-ko.md`
- `.local/collaboration/OPERATING_MEMORY.md`

## 관련 Commit

- Current slice: Add staff moderation and message processing
- Current slice: Add owner user management

## 검증 결과

- `node --test test/authentication.test.js test/database.integration.test.js`에서 31 passed
- PostgreSQL 사용 시 `pnpm test`에서 52 passed, 1 environment-specific skip
- `DATABASE_URL` 없이 `pnpm test`에서 46 passed, 7 database integration skips
- `pnpm db:migrate` 재실행 성공
- `psql "$DATABASE_URL" -f ../database/verify.sql`에서 expected seed counts, status history, screening capacity, and `0002_user_sessions_table.sql` migration record 확인
- GitHub Actions CI passed after the Owner user management and session-table schema fix
- Authenticated browser check에서 `/staff` 1280px와 390px 모두 Operational bookings, Member reviews, Message queue heading 확인
- Browser check에서 review action form 1개, message action form 4개, CSRF form 8개 확인
- Browser overflow check에서 실제 콘텐츠 overflow는 없고, intentionally visually hidden labels만 false positive로 감지됨
- Authenticated browser check에서 `/admin` landing의 Manage Films, Manage Screenings, Manage Users 링크 확인
- Authenticated browser check에서 `/admin/users` 1280px와 390px 모두 user headings, CSRF forms, role selects, activation selects, self-change copy 확인
- Browser overflow check에서 `/admin/users` 실제 콘텐츠 overflow 0개 확인

## 새로 결정한 사항

- Staff moderation은 review ownership과 분리한다. Review owner는 계속 Member이고, Staff/Owner는 visibility와 moderation note만 관리한다.
- Contact message는 별도 history table 없이 current status, assignment, staff note를 현재 운영 상태로 기록한다.
- Owner user management는 Staff moderation/contact workflow와 섞지 않고 다음 slice로 분리한다.
- Owner는 자기 자신의 role이나 activation state를 직접 바꿀 수 없다. accidental lockout을 막기 위한 Phase A 안전장치다.
- Role 또는 activation 변경 후 별도 session purge 없이도 current-user reload가 다음 request에서 stale privileges를 제거한다.
- Session table은 런타임 자동 생성에 맡기지 않고 schema와 migration이 소유한다. CI처럼 테스트 프로세스가 병렬로 앱을 만들 때도 같은 DB 구조를 사용하기 위한 결정이다.

## 남은 위험 또는 Blocker

- Production Staff booking controls, roster grouping, Member review CRUD, review moderation, and contact processing verification remains pending until deployment.
- Production Owner user management verification remains pending until deployment.
- Production future-screening booking CTA verification remains limited by aged-out seed screening dates.

## 다음 목표

- Step 8 frontend refinement triage across public, Member, Staff, and Owner screens
- Prioritize information hierarchy, responsive operational tables, and final visual consistency without changing confirmed scope
