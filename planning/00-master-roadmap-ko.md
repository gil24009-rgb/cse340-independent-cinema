# Independent Cinema Platform Master Roadmap

## 프로젝트 목표

인디스페이스의 정보 구조와 씨네큐브의 정돈된 UI를 참고해, 독립영화관의 상영 정보와 예약 운영을 관리하는 서버 사이드 렌더링 웹 애플리케이션을 만든다.

완성된 프로젝트는 다음 두 관점에서 평가한다.

- Backend: 데이터 관계, 권한, 예약 workflow, 보안, 안정적인 배포
- Frontend: 영화 탐색, 상영시간표, 예약 확인, 운영 dashboard의 명확성과 시각 완성도

## 진행 원칙

- 구조와 business rule을 먼저 확정하고 화면을 설계한다.
- 각 backend 기능은 연결될 frontend 화면과 상태를 함께 정의한다.
- 기능을 추가할 때 정상 상태뿐 아니라 empty, invalid, forbidden, error 상태도 설계한다.
- 매주 Git 기록에서 완료한 기능, 검증 결과, 다음 위험 요소를 확인할 수 있어야 한다.
- 실제 결제, 좌석 선택, 외부 예매 API는 범위에서 제외한다.

## 단계별 로드맵

### Step 1. Project Foundation

목표:

- 프로젝트 목적과 사용자 정의
- role과 권한 범위 정의
- 핵심 booking workflow 확정
- MVP와 제외 범위 확정
- 주요 화면과 backend 기능 연결

산출물:

- Project foundation document
- Requirements traceability matrix
- Initial sitemap
- Weekly progress log

Frontend 연결:

- 사용자별 핵심 화면과 navigation 구조가 결정된다.
- public, member, staff, admin UI의 역할 차이가 정의된다.

완료 조건:

- 모든 필수 과제 요건이 프로젝트 기능에 매핑되어 있다.
- 각 role이 할 수 있는 행동과 할 수 없는 행동이 명확하다.
- 핵심 workflow의 시작, 상태 변경, 종료 조건이 명확하다.

### Step 2. Domain Model and Database Design

목표:

- entity와 관계 정의
- PostgreSQL schema 설계
- foreign key, delete policy, status history 설계
- seed data 계획

예상 핵심 테이블:

- users
- films
- screenings
- bookings
- booking_status_history
- reviews
- contact_messages

Frontend 연결:

- Film card에 표시할 필드가 정해진다.
- Film detail metadata와 screening list 구조가 정해진다.
- Booking ticket와 status timeline에 필요한 데이터가 정해진다.
- Admin table의 column과 filter 기준이 정해진다.

완료 조건:

- ERD가 모든 핵심 workflow를 설명한다.
- 중복 데이터와 불명확한 관계가 없다.
- schema와 seed가 로컬 PostgreSQL에서 실행된다.

### Step 3. Application Architecture and Shared Backend

목표:

- MVC folder structure 확정
- database connection 설정
- EJS layout과 partial 구조 설정
- global error handler 구현
- validation과 middleware 전략 설정

Frontend 연결:

- global layout, navigation, flash/error message 위치가 결정된다.
- 공통 empty/error/forbidden page가 만들어진다.
- role별 navigation 노출 규칙이 적용된다.

완료 조건:

- 서버가 로컬에서 실행된다.
- DB 연결과 기본 query가 작동한다.
- 404와 server error가 중앙 처리된다.
- 공통 layout이 모든 페이지에 적용된다.

### Step 4. Authentication and Authorization

목표:

- session-based signup/login/logout
- bcrypt password hashing
- role middleware
- resource ownership check
- secure session configuration

Frontend 연결:

- Login, signup, account 화면
- 로그인 여부와 role에 따른 navigation
- unauthorized와 forbidden feedback

완료 조건:

- Owner, Staff, Member 계정이 작동한다.
- 보호된 route가 서버에서 권한을 검사한다.
- 다른 사용자의 booking과 review를 수정할 수 없다.

### Step 5. Public Cinema Experience

목표:

- Film list와 detail
- Screening schedule와 detail
- Public info와 contact form
- Admin의 film/screening CRUD

Frontend 연결:

- Home
- Film archive
- Film detail
- Date-based screening schedule
- Screening detail
- Info and contact

완료 조건:

- Admin 변경사항이 public page에 즉시 반영된다.
- 사용자가 영화에서 상영 일정까지 자연스럽게 이동한다.
- 날짜별 schedule이 정확하게 표시된다.

### Step 6. Booking Workflow and Member Experience

목표:

- Member booking 생성
- 현재 status와 history 저장
- Member booking history
- 취소 규칙과 validation

Frontend 연결:

- Booking confirmation
- Ticket-style booking card
- Booking detail
- Status timeline
- Empty and cancelled states

완료 조건:

- 사용자가 screening을 예약하고 상태를 확인할 수 있다.
- 모든 상태 변경이 history에 기록된다.
- 잘못된 예약과 권한 없는 변경이 차단된다.

### Step 7. Reviews, Staff Operations, and Admin Dashboard

목표:

- Member review CRUD
- Review moderation
- Staff check-in과 booking status update
- Contact message workflow
- User role management
- Operational overview

Frontend 연결:

- Review composer와 review list
- Staff screening roster
- Check-in controls
- Admin management tables
- Status filters와 operational summary

완료 조건:

- Staff와 Owner가 실제로 다른 권한을 가진다.
- Admin dashboard에서 핵심 운영 작업을 끝낼 수 있다.
- 사용자는 자신의 review만 수정하거나 삭제할 수 있다.

### Step 8. Frontend System and Visual Direction

목표:

- 씨네큐브를 참고한 정보 hierarchy와 UI refinement
- typography, color, spacing, components 정리
- responsive behavior
- accessibility와 interaction state 점검

Frontend 연결:

- Public editorial cinema experience
- Member ticket interface
- Dense operational dashboard
- 일관된 form, table, status, navigation system

완료 조건:

- mobile과 desktop에서 주요 workflow가 완성된다.
- loading, empty, error, validation, destructive action 상태가 일관된다.
- 장식보다 정보와 행동이 먼저 읽힌다.

### Step 9. Security, Testing, Deployment, and Submission

목표:

- form validation과 sanitization 점검
- parameterized query 점검
- role과 ownership regression test
- Render deployment
- production PostgreSQL 연결
- README와 ERD 작성

Frontend 연결:

- production 환경에서 모든 화면과 asset 검증
- 실제 test account로 role별 사용자 흐름 검증

완료 조건:

- Render URL이 private browser에서도 작동한다.
- role별 test account가 작동한다.
- README가 모든 제출 요건을 포함한다.
- 최소 15개의 substantial commit이 있다.

## 6주 권장 일정

현재 계획 시작일은 2026년 6월 6일이며, 실제 수업 마감일에 맞춰 조정한다.

| 주차 | 기간 | 주요 단계 | 주간 검증 결과 |
| --- | --- | --- | --- |
| Week 1 | Jun 6 - Jun 12 | Step 1-2 | 범위, role, workflow, ERD, schema draft |
| Week 2 | Jun 13 - Jun 19 | Step 3-4 | MVC foundation, DB connection, authentication |
| Week 3 | Jun 20 - Jun 26 | Step 5 | Public films, screenings, admin CRUD |
| Week 4 | Jun 27 - Jul 3 | Step 6 | Booking workflow, status history, member UI |
| Week 5 | Jul 4 - Jul 10 | Step 7-8 | Staff/admin operations, reviews, visual refinement |
| Week 6 | Jul 11 - Jul 17 | Step 9 | Security review, testing, deployment, documentation |

## Git 진행 관리 방식

### Branch 기준

- 최종 프로젝트 시작 시 전용 branch를 만든다.
- 권장 branch name: `codex/final-cinema-foundation`
- 큰 기능은 가능한 경우 별도 branch에서 작업한다.

### Commit 기준

각 commit은 하나의 검증 가능한 변화 단위를 담는다.

좋은 예:

```text
Define cinema project scope and role permissions
Add normalized film and screening schema
Implement session authentication and role guards
Build date-based screening schedule
Add booking status history workflow
Create staff check-in dashboard
```

피할 예:

```text
updates
fix stuff
final changes
small edits
```

### 주간 기록 기준

매주 `final-project/progress/`에 한 개의 기록을 남긴다.

각 기록에는 다음이 포함되어야 한다.

- 이번 주 목표
- 완료한 작업
- 관련 commit
- 검증한 내용
- 남은 문제와 결정
- 다음 주 목표

## 최종 품질 기준

- 다른 개발자가 DB와 route 구조를 이해할 수 있다.
- 모든 role과 권한 차이를 서버가 강제한다.
- 사용자가 booking 상태와 history를 볼 수 있다.
- Admin과 Staff가 운영 작업을 dashboard에서 수행할 수 있다.
- public site는 실제 독립영화관처럼 신뢰감 있게 보인다.
- 모든 주요 화면이 mobile과 desktop에서 작동한다.
- README와 live deployment만으로 프로젝트를 검토할 수 있다.
