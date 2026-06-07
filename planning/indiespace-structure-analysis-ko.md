# 인디스페이스 구조 분석

## 분석 목적

최종 프로젝트의 구조적 기준은 인디스페이스를 참고한다. 단, 실제 프로젝트는 CSE 340 요건을 모두 만족해야 하므로, 인디스페이스의 public content 구조를 그대로 복제하지 않고 backend 과제에 맞는 booking, role, admin, workflow 시스템으로 확장한다.

UI 방향은 씨네큐브를 별도 레퍼런스로 삼는다.

## 인디스페이스의 핵심 구조

### 1. Public-first 정보 구조

인디스페이스는 로그인 기반 앱이라기보다 관객에게 상영 정보와 극장 정보를 제공하는 public content site에 가깝다.

주요 entry point:

- 예매하기
- 단체관람 / 대관 안내
- 오시는 길 / 관람료 / 좌석도
- 후원 안내
- 인디즈 큐 구독
- 상영시간표
- 작품별 상영일정
- 정기상영 / 기획전

우리 프로젝트에 적용할 점:

- public navigation은 단순하게 유지한다.
- 사용자의 첫 행동은 "영화 보기" 또는 "상영 일정 보기"가 되어야 한다.
- login은 첫 화면의 중심이 아니라 booking 시점에 자연스럽게 필요해지는 구조가 좋다.

### 2. 상영시간표 중심 구조

인디스페이스는 주차별 상영시간표와 작품별 상영일정을 둘 다 제공한다. 이는 cinema project의 핵심 구조로 매우 적합하다.

우리 프로젝트에 적용할 점:

- `screenings`를 중심 테이블로 둔다.
- `films`와 `screenings`는 one-to-many 관계가 된다.
- public schedule page는 날짜별 view가 좋다.
- film detail page에는 해당 영화의 upcoming screenings를 보여준다.

### 3. 작품별 상영일정

인디스페이스는 특정 작품을 기준으로 상영일정과 예매 동선을 연결한다.

우리 프로젝트에 적용할 점:

- `films/:id` 상세 페이지에 upcoming screenings와 booking CTA를 둔다.
- 영화 metadata는 단순하지만 정확해야 한다.
- 예: title, director, country, year, runtime, rating, synopsis, poster image, genre

### 4. 정기상영과 기획전

인디스페이스는 일반 상영뿐 아니라 정기상영, 기획전, GV 같은 event성 프로그램도 운영한다.

우리 프로젝트에 적용할 점:

- v1에서는 `programs` 또는 `series`를 선택 기능으로 둘 수 있다.
- 복잡하면 `screenings`에 `program_label`, `has_gv` 같은 컬럼으로 단순화한다.
- 완성도를 높이고 싶다면 `film_series` 테이블을 추가한다.

### 5. 관람료, 좌석도, 위치, 관람 규칙

극장 이용 전 필요한 운영 정보를 별도 페이지로 제공한다.

우리 프로젝트에 적용할 점:

- public info page를 하나 만든다.
- 가격 정책, 관람 안내, cancellation rule, check-in 안내를 넣는다.
- booking status와 연결되는 운영 규칙을 명확히 만든다.

### 6. 후원과 멤버십 성격

인디스페이스는 독립영화 전용관으로서 후원, 나눔자리, 캠페인 콘텐츠가 있다.

우리 프로젝트에 적용할 점:

- 실제 결제나 후원 시스템은 구현하지 않는다.
- 대신 member account와 booking history를 중심으로 간단한 membership 느낌을 만든다.
- 선택 기능으로 favorite films 또는 member note를 고려할 수 있다.

## CSE 340 요건에 이미 잘 맞는 부분

### Dynamic content

인디스페이스 구조는 영화, 상영 일정, 기획전, 공지성 콘텐츠를 지속적으로 업데이트하는 방식이다. Admin이 관리할 core content가 자연스럽다.

적용:

- Admin can create, edit, delete films.
- Admin can create, edit, delete screenings.
- Admin can manage public info or contact messages.

### Related database tables

영화와 상영 일정의 관계가 명확하다.

기본 관계:

- one film has many screenings
- one user has many bookings
- one screening has many bookings
- one user has many reviews
- one film has many reviews

### Dynamic routing

영화 상세, 상영 상세, 예약 상세 route가 자연스럽다.

예:

- `/films`
- `/films/:filmId`
- `/screenings`
- `/screenings/:screeningId`
- `/bookings/:bookingId`

### Server-side rendering

영화 목록, 상영시간표, 영화 상세, dashboard 모두 EJS로 서버 렌더링하기 적합하다.

### Admin content management

영화와 상영 일정은 admin dashboard에서 관리하기 좋은 콘텐츠다.

## CSE 340 요건 기준 부족한 부분

인디스페이스 자체는 우리가 만들어야 하는 backend 과제 요건을 모두 갖춘 앱은 아니다. 특히 아래 요소는 우리가 추가로 설계해야 한다.

### 1. 사용자 인증과 role-based authorization

인디스페이스 public 구조만으로는 Owner, Staff, Member 역할이 분명하지 않다.

우리 프로젝트에서 필요한 확장:

- Owner/Admin: 전체 관리
- Staff: screening check-in, booking status 관리
- Member: booking, review, own history 관리

### 2. 내부 booking workflow

실제 예매는 외부 예매 시스템으로 연결될 수 있지만, CSE 340 프로젝트에서는 직접 booking workflow가 필요하다.

우리 프로젝트에서 필요한 확장:

- booking 생성
- booking status 변경
- staff check-in
- booking status history 저장

### 3. 사용자 제출 콘텐츠

인디스페이스의 public 구조에는 사용자가 로그인해서 리뷰를 작성하고 수정/삭제하는 앱 기능이 중심에 있지 않다.

우리 프로젝트에서 필요한 확장:

- Member review 작성
- 본인 review 수정/삭제
- Staff 또는 Admin review moderation

### 4. Admin dashboard

인디스페이스는 public site 관점에서 보이는 구조이고, 과제에서 요구하는 management interface는 별도로 필요하다.

우리 프로젝트에서 필요한 확장:

- Film CRUD
- Screening CRUD
- Booking management
- Review moderation
- Contact message management
- User role management

### 5. Multi-stage workflow history

상영시간표 자체는 static schedule에 가깝다. 과제 요건에는 사용자가 제출한 항목의 현재 상태와 history가 필요하다.

우리 프로젝트에서 필요한 확장:

- `booking_status_history`
- status 변경자 기록
- status 변경 시간 기록
- user dashboard에서 timeline 표시

### 6. Security and validation

실제 사이트의 내부 구현은 알 수 없으므로, 우리 프로젝트에서는 명시적으로 구현해야 한다.

필요한 것:

- session authentication
- bcrypt password hashing
- role middleware
- owner check
- parameterized SQL queries
- form validation
- sanitized inputs
- global error handler

## 우리 프로젝트 구조 제안

### Public pages

- `/`
  - featured film
  - this week's screenings
  - current series or event
- `/films`
  - film list
  - optional filter by genre or rating
- `/films/:filmId`
  - film detail
  - upcoming screenings
  - reviews
- `/screenings`
  - date-based schedule
- `/screenings/:screeningId`
  - screening detail
  - booking CTA
- `/info`
  - location, ticket policy, check-in rule
- `/contact`
  - contact form

### Member pages

- `/account`
  - member overview
- `/account/bookings`
  - upcoming and past bookings
- `/account/bookings/:bookingId`
  - booking detail and status history
- `/account/reviews`
  - own reviews

### Staff pages

- `/staff`
  - today screenings
  - pending bookings
  - contact messages
- `/staff/screenings/:screeningId/check-in`
  - attendee list
  - booking status update
- `/staff/bookings/:bookingId`
  - booking detail
  - status update
  - staff note

### Admin pages

- `/admin`
  - operational overview
- `/admin/films`
  - film CRUD
- `/admin/screenings`
  - screening CRUD
- `/admin/users`
  - user role management
- `/admin/reviews`
  - review moderation
- `/admin/messages`
  - contact message management

## Suggested database tables

### Required core

- `users`
- `films`
- `screenings`
- `bookings`
- `booking_status_history`
- `reviews`
- `contact_messages`

### Optional if scope allows

- `film_genres`
- `genres`
- `series`
- `screening_notes`

## Suggested workflow

Booking status:

- Requested
- Confirmed
- Checked In
- Completed
- Cancelled
- No Show

Status rules:

- Member creates booking as `Requested` or `Confirmed`.
- Staff can mark booking as `Checked In`, `Completed`, `No Show`, or `Cancelled`.
- Admin can override status if needed.
- Every status change creates a row in `booking_status_history`.

## 완성도를 높일 수 있는 확장 포인트

### 1. 날짜 중심 schedule UX

단순 film list보다 날짜별 상영시간표가 cinema 사이트답다.

구현:

- `/screenings?date=YYYY-MM-DD`
- today, tomorrow, this week tabs
- sold out or available status

### 2. Ticket-style member dashboard

Member dashboard에서 예약을 ticket card처럼 보여주고, 상세 페이지에서 status timeline을 보여준다.

구현:

- booking card
- screening time
- check-in status
- status history timeline

### 3. Staff check-in mode

Staff dashboard에서 오늘 상영별 관객 리스트를 보고 check-in 처리한다.

구현:

- screening select
- booking table
- status badge
- check-in action

### 4. Film editorial detail

영화 상세 페이지는 정보만 나열하지 말고 editorial page처럼 만든다.

구현:

- poster
- metadata
- synopsis
- director note
- upcoming screenings
- member reviews

### 5. Review moderation

리뷰는 사용자가 작성하고, admin 또는 staff가 숨김 처리할 수 있게 한다.

구현:

- `reviews.is_visible`
- delete보다 hide 중심
- inappropriate review 관리

### 6. Operational dashboard

Admin dashboard는 visual chart보다 운영 판단에 필요한 정보 중심으로 구성한다.

구현:

- today screenings count
- pending bookings
- recent reviews
- unread contact messages
- upcoming sold-out screenings

## 범위 관리 원칙

넣지 않는 것이 좋은 것:

- 실제 결제
- 좌석 선택
- 외부 예매 API
- 영화 평점 추천 알고리즘
- 복잡한 멤버십 결제
- 파일 업로드 기반 poster management

대신 집중할 것:

- 정확한 DB 관계
- 역할별 권한
- booking workflow
- status history
- admin and staff dashboard
- polished server-rendered UI

## 결론

인디스페이스는 최종 프로젝트의 public structure 레퍼런스로 적합하다. 특히 상영시간표, 작품별 상영일정, 기획전, 관람 안내 구조가 cinema app의 기본 골격으로 좋다.

하지만 과제 요건을 충족하려면 로그인, role, booking workflow, user review, admin dashboard, status history를 반드시 추가해야 한다. 이 확장을 통해 단순 영화관 소개 사이트가 아니라 backend 구조가 탄탄한 cinema operations platform으로 만들 수 있다.
