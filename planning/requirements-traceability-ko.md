# Requirements Traceability

이 문서는 CSE 340 최종 프로젝트 요건이 실제 기능, 데이터, 화면, 검증 방식에 어떻게 연결되는지 추적한다.

| 수업 요건 | 프로젝트 구현 | 주요 데이터 또는 backend | 연결되는 frontend | 검증 방식 | 상태 |
| --- | --- | --- | --- | --- | --- |
| Multiple related tables | 영화, 상영, 예약, 리뷰, 사용자 관계 | Foreign keys and normalized schema | Film detail, schedule, dashboards | ERD, schema review, PostgreSQL CI | Verified |
| CASCADE or SET NULL | 관계별 삭제 정책 정의 | FK delete policy | 삭제 confirmation and resulting states | Database tests | Verified |
| Session authentication | Member, Staff, Owner login and Member signup | express-session, bcrypt | Login, signup, role-aware nav | Role test accounts and auth route tests | Verified |
| Multiple roles | Owner, Staff, Member | role middleware | Separate dashboards and actions | Permission matrix tests | In Progress |
| Protected routes | Role and ownership checks | auth and authorization middleware | Forbidden and not-found ownership states | Direct URL access tests | Verified |
| Server-side rendering | Home, film, screening, account, auth page EJS rendering | Express controllers and EJS | Public home, film archive, screening schedule, detail pages, auth and account pages | Automated route tests and browser inspection | In Progress |
| Dynamic routes | Film, screening, booking, review detail | Resource lookup by id | Detail pages | Valid/invalid id tests and ownership route tests | Verified |
| Layouts and partials | Shared navigation and components | EJS partial structure | Consistent global UI | Template review | Verified |
| MVC organization | Models, controllers, routes, views | Folder structure | Predictable data presentation | Code review | Verified |
| Middleware | Auth, roles, validation, errors | Shared middleware | Form and error feedback | Failure-path tests | In Progress |
| Global error handler | Central error response | Error middleware | 404 and error pages | Forced error tests | Verified |
| Admin content management | Film and screening CRUD | Admin controllers and models | Admin management tables/forms | CRUD tests | Defined |
| User-generated content | Film reviews | reviews table and ownership | Review list and editor | Ownership tests | Defined |
| User edit/delete own content | Own review management | Owner check | Edit/delete actions | Cross-account tests | Defined |
| Multi-stage workflow | Booking status workflow | bookings and status history | Ticket status and timeline | Full workflow test | Defined |
| Status history | Every booking state change recorded | booking_status_history | Booking detail timeline | History query test | Planned |
| Admin dashboard | Operational management | Aggregated queries and CRUD | Admin dashboard | Role test | Defined |
| Manage users and roles | Owner changes roles | users role update | User management table | Owner-only tests | Defined |
| Respond to submissions | Contact message status | contact_messages | Staff message queue | Status workflow test | Defined |
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
