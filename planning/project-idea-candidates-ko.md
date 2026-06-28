# 최종 프로젝트 아이디어 후보 v2

## 방향

이번 후보는 구조적으로 과제 요건을 모두 만족하면서도 5-6주 안에 탄탄하게 만들 수 있는 작은 도메인을 기준으로 골랐다. 핵심은 기능을 많이 넣는 것이 아니라, 하나의 workflow를 정확하게 설계하고 role, database, dashboard, validation, deployment를 완성도 있게 보여주는 것이다.

디자인은 나중에 붙이는 장식이 아니라 도메인 선택 단계부터 고려한다. 너무 일반적인 SaaS, dashboard template, booking template처럼 보이는 아이디어는 제외한다.

## 후보 1. Independent Cinema Booking and Screening Club

작은 독립 영화관 또는 film club 사이트. 관리자는 영화와 상영 일정을 등록하고, staff는 예약과 check-in 상태를 관리하며, 사용자는 screening 예약, 리뷰 작성, booking history 확인을 한다.

### 왜 좋나

구조가 단순하다. 핵심 객체는 films, screenings, bookings, reviews 정도로 명확하고, workflow도 예약 중심이라 구현 난도가 적당하다. 디자인적으로는 영화 포스터, 어두운 극장감, editorial typography, ticket UI를 활용해 매우 세련되게 만들 수 있다.

### Role

- Owner/Admin: 영화, 상영 일정, 사용자, 예약 전체 관리
- Staff: booking status, check-in, contact message 관리
- Member/User: 상영 예약, 본인 예약 상태 확인, 리뷰 작성

### Workflow

- Requested
- Confirmed
- Checked In
- Completed
- Cancelled

### 주요 테이블

- users
- films
- screenings
- bookings
- booking_status_history
- reviews
- contact_messages

### 디자인 가능성

고급 영화제 사이트처럼 만들 수 있다. 큰 포스터 이미지, 절제된 컬러, 강한 타이포그래피, ticket-style booking card, status timeline을 사용하면 과제 사이트처럼 보이지 않고 실제 브랜드 사이트처럼 보일 수 있다.

## 후보 2. Ceramic Studio Class and Kiln Request System

도자기 공방 사이트. 사용자는 class를 예약하거나 kiln firing request를 제출하고, staff는 접수, firing 진행, pickup 준비 상태를 관리한다.

### 왜 좋나

예약과 작업 요청이 둘 다 자연스럽고, workflow가 선명하다. 테이블 수를 적당히 유지하면서도 관계형 DB 설계를 보여주기 좋다. 디자인적으로는 handmade studio, clay texture, neutral palette, object photography를 활용할 수 있다.

### Role

- Owner/Admin: class, product, service type, staff, user 관리
- Studio Staff: class booking 확인, kiln request status 업데이트
- Customer/User: class 예약, firing request 제출, 리뷰 작성

### Workflow

- Submitted
- Reviewed
- Scheduled
- In Firing
- Ready for Pickup
- Completed
- Cancelled

### 주요 테이블

- users
- classes
- class_bookings
- kiln_requests
- request_status_history
- reviews
- contact_messages

### 디자인 가능성

차분하고 고급스러운 craft brand 느낌을 만들기 좋다. 단순한 beige template로 가면 안 되고, 재료감, form detail, grid rhythm, 제품 사진 중심으로 가야 한다.

## 후보 3. Specialty Coffee Workshop Reservation System

소규모 coffee roastery의 workshop 예약 사이트. 관리자는 workshop과 roast profile 콘텐츠를 관리하고, staff는 예약 상태를 관리하며, 사용자는 workshop 예약과 리뷰를 남긴다.

### 왜 좋나

구현 범위가 가장 안전하다. booking workflow가 단순하고, content CRUD도 workshop, coffee origin, roast notes 정도로 명확하다. 디자인적으로도 specialty coffee 브랜드처럼 세련되게 만들 수 있다.

### Role

- Owner/Admin: workshop, coffee profile, staff, user 관리
- Barista/Staff: booking 승인, attendance, notes 관리
- Customer/User: workshop 예약, booking history 확인, 리뷰 작성

### Workflow

- Requested
- Confirmed
- Attended
- Completed
- Cancelled

### 주요 테이블

- users
- workshops
- coffee_profiles
- bookings
- booking_status_history
- reviews
- contact_messages

### 디자인 가능성

premium product catalog와 booking system을 섞을 수 있다. 메뉴판처럼 보이게 만들지 말고, roast card, tasting note, workshop schedule, reservation panel을 정교하게 설계하면 완성도가 높아진다.

## 후보 4. Art Print Studio Order and Commission Tracker

소규모 art print studio 사이트. Admin은 print collection과 commission type을 관리하고, staff는 주문과 commission 진행 상태를 업데이트하며, 사용자는 print 주문 또는 custom commission 요청을 확인한다.

### 왜 좋나

e-commerce처럼 보이지만 결제까지 구현하지 않아도 된다. 주문과 commission workflow만으로도 과제 요건을 충족할 수 있다. visual asset을 가장 자연스럽게 보여줄 수 있는 후보다.

### Role

- Owner/Admin: print, collection, commission type, user 관리
- Studio Staff: order status, commission notes, order completion 관리
- Customer/User: 주문 요청, commission 요청, 리뷰 작성

### Workflow

- Requested
- Quoted
- Approved
- In Production
- Ready
- Delivered
- Closed

### 주요 테이블

- users
- collections
- prints
- orders
- commissions
- status_history
- reviews
- contact_messages

### 디자인 가능성

gallery commerce 느낌으로 매우 세련되게 만들 수 있다. 작품 grid, print detail, order status timeline, restrained layout이 잘 맞는다. 단, 이미지 asset 품질이 낮으면 전체 인상이 약해진다.

## 후보 5. Boutique Plant Shop Care Request and Pickup System

식물 가게 사이트. Admin은 plant catalog와 care service를 관리하고, staff는 repotting, diagnosis, pickup request 상태를 관리하며, 사용자는 식물 관리 요청과 리뷰를 남긴다.

### 왜 좋나

차량 수리 사이트보다 부드럽고 시각적으로 매력적이지만 구조는 거의 동일하게 단순하다. request status, staff notes, user review, catalog CRUD가 자연스럽다.

### Role

- Owner/Admin: plant catalog, care service, user, staff 관리
- Plant Specialist/Staff: care request 검토, 상태 업데이트, notes 작성
- Customer/User: care request 제출, 상태 확인, 리뷰 작성

### Workflow

- Submitted
- Diagnosed
- In Care
- Ready for Pickup
- Completed
- Cancelled

### 주요 테이블

- users
- plants
- care_services
- care_requests
- request_status_history
- reviews
- contact_messages

### 디자인 가능성

식물 이미지를 쓰기 쉽고, ecommerce와 service dashboard를 섞은 세련된 UI가 가능하다. green-heavy generic 디자인으로 빠질 위험이 있으므로 색상은 식물 초록에만 의존하지 않는 방향이 좋다.

## 추천 순위

1. Independent Cinema Booking and Screening Club
2. Specialty Coffee Workshop Reservation System
3. Ceramic Studio Class and Kiln Request System
4. Art Print Studio Order and Commission Tracker
5. Boutique Plant Shop Care Request and Pickup System

## 가장 추천하는 선택

Independent Cinema Booking and Screening Club을 가장 추천한다.

이유는 구현 구조가 가장 깨끗하기 때문이다. `films`, `screenings`, `bookings`, `reviews`, `users`만으로도 과제 핵심 요건을 거의 모두 자연스럽게 만족한다. workflow도 booking status 하나로 단순하게 잡을 수 있고, admin dashboard도 영화와 상영 일정을 관리하는 구조라 억지스럽지 않다.

디자인적으로도 강하다. 일반적인 학교 과제 웹앱처럼 보이지 않고, 독립 영화관이나 film festival 사이트처럼 만들 수 있다. 포스터, 상영 시간표, ticket card, seatless reservation, review wall, status timeline을 활용하면 시각적으로 매우 세련되면서도 backend 범위가 과하게 커지지 않는다.
