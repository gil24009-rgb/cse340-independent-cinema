# Requirements Traceability

이 문서는 CSE 340 최종 프로젝트 요건이 실제 기능, 데이터, 화면, 검증 방식에 어떻게 연결되는지 추적한다.

| 수업 요건 | 프로젝트 구현 | 주요 데이터 또는 backend | 연결되는 frontend | 검증 방식 | 상태 |
| --- | --- | --- | --- | --- | --- |
| Multiple related tables | 영화, 상영, 예약, 리뷰, 사용자 관계 | Foreign keys and normalized schema | Film detail, schedule, dashboards | ERD, schema review, PostgreSQL CI | Verified |
| CASCADE or SET NULL | 관계별 삭제 정책 정의 | FK delete policy | 삭제 confirmation and resulting states | Database tests | Verified |
| Session authentication | Member, Staff, Owner login and Member signup | express-session, bcrypt | Login, signup, role-aware nav | Role test accounts and auth route tests | Verified |
| Multiple roles | Owner, Staff, Member | role middleware | Separate dashboards and actions | Permission matrix tests | In Progress |
| Protected routes | Role and ownership checks | auth and authorization middleware | Forbidden and not-found ownership states | Direct URL access tests | Verified |
| Server-side rendering | Home, film, screening, visit, contact, Member booking history and timeline, account, auth page EJS rendering | Express controllers and EJS | Public home, film archive, screening schedule, detail pages, visit contact form, Member booking list and detail timeline, auth and account pages | Automated route tests and browser inspection | In Progress |
| Dynamic routes | Film, screening, booking, review detail | Resource lookup by id | Detail pages | Valid/invalid id tests and ownership route tests | Verified |
| Layouts and partials | Shared navigation and components | EJS partial structure | Consistent global UI | Template review | Verified |
| MVC organization | Models, controllers, routes, views | Folder structure | Predictable data presentation | Code review | Verified |
| Middleware | Auth, roles, validation, errors | Shared middleware | Form and error feedback | Failure-path tests | In Progress |
| Global error handler | Central error response | Error middleware | 404 and error pages | Forced error tests | Verified |
| Admin content management | Owner film create, edit, visibility controls, and Owner screening create, edit, cancel, and restore controls | Owner controllers and models | Owner film catalog, Owner film forms, Owner screening schedule, and Owner screening forms | Owner route, validation, conflict, public reflection tests, and production read-only route checks | Verified |
| User-generated content | Film reviews | reviews table and ownership | Review list and editor | Ownership tests | Defined |
| User edit/delete own content | Own review management | Owner check | Edit/delete actions | Cross-account tests | Defined |
| Multi-stage workflow | Member booking creation, Member booking history, Member-owned cancellation, and Member-facing status timeline are implemented; Staff status transitions remain next | bookings and status history | Screening detail booking action, Member booking detail, Member booking history, cancellation state, and status timeline | Route, PostgreSQL transaction, browser, and conflict tests | In Progress |
| Status history | Initial booking creation and Member cancellation history are recorded in the same transaction and displayed on Member booking detail | booking_status_history | Booking detail timeline | PostgreSQL history query test, route rendering test, browser check | Verified |
| Admin dashboard | Operational management | Aggregated queries and CRUD | Admin dashboard | Role test | Defined |
| Manage users and roles | Owner changes roles | users role update | User management table | Owner-only tests | Defined |
| Respond to submissions | Public contact message intake | contact_messages | Visit contact form and later Staff message queue | Route insert test and later status workflow test | In Progress |
| Moderate content | Hide reviews | review visibility state | Moderation controls | Staff/Owner tests | Defined |
| Parameterized queries | All SQL inputs parameterized | PostgreSQL query layer | No direct UI difference | Query review | In Progress |
| Input validation | All forms validated server-side | Validation middleware | Inline errors and summaries | Invalid form tests | In Progress |
| Sanitization | Review and message inputs sanitized | Input processing | Safe content output | Injection tests | Planned |
| Secure sessions | Production session settings | Session configuration and PostgreSQL store | Stable login state | Production review, direct session-table checks, integration test | Verified |
| Render deployment | Live server and DB | Environment variables | Production application | Private browser test | In Progress |
| README | Required project documentation | README and ERD image | Repository review | Requirement checklist | Planned |
| 15 substantial commits | Meaningful progress history | Git history | Repository review | `git log` review | In Progress |

## 상태 정의

- `Defined`: 기능과 범위가 문서에서 확정됨
- `Planned`: 구현 단계와 검증 방식이 정해짐
- `In Progress`: 현재 구현 또는 기록 중
- `Verified`: 구현과 검증이 완료됨
