# Step 1: Project Foundation

## 프로젝트 작업명

프로젝트의 working title은 `Independent Cinema Platform`으로 둔다. 최종 브랜드명은 visual direction 단계에서 결정한다.

## 한 문장 정의

독립영화관 관객이 상영작과 일정을 확인하고 예약을 관리하며, 영화관 직원이 상영 운영과 관객 check-in을 관리할 수 있는 서버 사이드 렌더링 웹 애플리케이션.

## 해결하려는 문제

관객은 영화 정보, 상영시간표, 예약 상태를 여러 위치에서 따로 확인하지 않고 한 흐름에서 관리할 수 있어야 한다. 영화관 운영자는 영화와 상영일정을 관리하고, 당일 예약자 확인과 check-in 처리를 빠르게 수행할 수 있어야 한다.

## 핵심 사용자

### Member

독립영화를 탐색하고 상영 일정을 예약하는 관객.

주요 목표:

- 현재 상영작과 일정을 빠르게 찾는다.
- 원하는 screening을 예약한다.
- 자신의 예약 상태와 history를 확인한다.
- 관람한 영화에 review를 작성한다.

### Staff

당일 상영과 관객 응대를 담당하는 영화관 직원.

주요 목표:

- 오늘의 상영 일정을 확인한다.
- screening별 예약자 목록을 확인한다.
- 관객을 check-in 처리한다.
- booking 상태와 contact message를 관리한다.
- 필요한 경우 부적절한 review를 숨긴다.

### Owner

영화관의 콘텐츠, 일정, 사용자와 운영 전체를 관리하는 관리자.

주요 목표:

- film과 screening을 추가, 수정, 삭제한다.
- user role을 관리한다.
- booking과 review 운영 상태를 확인한다.
- contact message와 운영 현황을 관리한다.

## Role Permission Summary

| 행동 | Public | Member | Staff | Owner |
| --- | --- | --- | --- | --- |
| Film과 screening 조회 | Yes | Yes | Yes | Yes |
| Contact message 제출 | Yes | Yes | Yes | Yes |
| Booking 생성 | No | Yes | Yes | Yes |
| 자신의 booking 조회 | No | Yes | Yes | Yes |
| 자신의 booking 취소 | No | Yes | Yes | Yes |
| Review 작성 및 자신의 review 수정/삭제 | No | Yes | Yes | Yes |
| Screening roster 조회 | No | No | Yes | Yes |
| Booking status 변경 및 check-in | No | No | Yes | Yes |
| Review moderation | No | No | Yes | Yes |
| Film과 screening CRUD | No | No | No | Yes |
| User role 관리 | No | No | No | Yes |

## 핵심 Workflow

### Booking Workflow

```text
Member selects screening
→ Member submits booking
→ Booking becomes Confirmed
→ Staff checks member in
→ Booking becomes Checked In
→ Staff completes screening operation
→ Booking becomes Completed
```

대체 종료 상태:

```text
Confirmed → Cancelled
Confirmed → No Show
```

규칙:

- booking 생성에는 로그인이 필요하다.
- 사용자는 자신의 booking만 조회하고 취소할 수 있다.
- Staff와 Owner만 check-in, completed, no-show 상태를 설정할 수 있다.
- 모든 상태 변경은 `booking_status_history`에 기록한다.
- 시작 시간이 지난 screening에는 새 booking을 만들 수 없다.
- 하나의 사용자는 같은 screening을 중복 예약할 수 없다.

### Review Workflow

```text
Member completes a screening
→ Member writes a film review
→ Member may edit or delete own review
→ Staff or Owner may hide inappropriate review
```

규칙:

- Member는 completed booking이 있는 film에만 review를 작성할 수 있다.
- 한 사용자는 한 film에 하나의 review만 작성할 수 있다.
- review는 빈 내용이 될 수 없다.

### Contact Message Workflow

```text
Visitor submits message
→ Message becomes New
→ Staff reviews message
→ Message becomes In Progress
→ Staff closes message
```

이 workflow는 보조 workflow다. 과제의 핵심 multi-stage workflow는 booking으로 유지한다.

## MVP Scope

반드시 구현:

- Session-based authentication
- Owner, Staff, Member roles
- Film CRUD
- Screening CRUD
- Public film list and detail
- Date-based screening schedule
- Booking creation, cancellation, current status, history
- Staff screening roster and check-in
- Member review CRUD
- Review moderation
- Contact message submission and management
- Admin user role management
- Central error handling
- Server-side validation and parameterized queries
- Render deployment and PostgreSQL production database

## 제외 범위

- 실제 결제
- 좌석 선택
- 복수 영화관 또는 복수 상영관 운영
- 외부 영화 API
- 외부 예매 API
- 추천 알고리즘
- 실시간 notification
- poster file upload
- 소셜 로그인

## Initial Sitemap

```text
Public
├── Home
├── Films
│   └── Film Detail
├── Screenings
│   └── Screening Detail
├── Info
├── Contact
├── Login
└── Sign Up

Member
└── Account
    ├── Overview
    ├── My Bookings
    │   └── Booking Detail
    └── My Reviews

Staff
└── Staff Dashboard
    ├── Today's Screenings
    │   └── Screening Roster
    ├── Booking Management
    ├── Review Moderation
    └── Contact Messages

Owner
└── Admin Dashboard
    ├── Films
    ├── Screenings
    ├── Users
    ├── Bookings
    ├── Reviews
    └── Contact Messages
```

## Backend to Frontend Connection

| Backend capability | Frontend output |
| --- | --- |
| Film query and CRUD | Film archive, film detail, admin film table and form |
| Screening query and CRUD | Date schedule, film upcoming screenings, admin schedule form |
| Session and role middleware | Role-aware navigation, protected dashboard, forbidden page |
| Booking workflow | Booking CTA, confirmation, ticket card, status timeline |
| Booking status history | Member booking history and staff activity context |
| Review ownership and moderation | Review composer, edit/delete actions, moderation table |
| Contact message status | Contact form confirmation and staff message queue |
| Validation and error handling | Inline form errors, error summary, stable error pages |

## Initial Frontend Direction

### Public experience

- 씨네큐브처럼 정보가 정돈되고 상영시간표 접근이 빠른 구조
- 인디스페이스처럼 영화와 프로그램이 중심이 되는 navigation
- 큰 장식보다 poster, title, screening time, metadata가 먼저 읽히는 layout

### Member experience

- booking을 ticket 형태로 표현
- upcoming과 past booking을 명확히 분리
- booking detail에서 status timeline 제공

### Staff and Owner experience

- 반복 업무에 맞는 compact table과 status controls
- 오늘의 상영, 처리할 booking, 새 message가 먼저 보이는 dashboard
- public site의 editorial styling보다 scanability와 action efficiency 우선

## Step 1 완료 기준

- 프로젝트 목적, 사용자, role, 권한이 정의됨
- booking workflow와 핵심 business rule이 정의됨
- MVP와 제외 범위가 정의됨
- sitemap이 정의됨
- backend 기능이 frontend 화면에 연결됨
- 전체 CSE 340 요건이 추적표에 매핑됨

## Step 1 결과

상태: Complete

다음 단계:

- ERD와 database schema 설계
- delete policy와 status history 관계 결정
- 화면에 필요한 field 목록 확정
