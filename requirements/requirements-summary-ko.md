# CSE 340 Final Project Requirements 요약

## 최종 목표

CSE 340 최종 프로젝트는 Node.js, Express.js, PostgreSQL을 사용해 완성도 있는 서버 사이드 렌더링 웹 애플리케이션을 만드는 과제입니다. 단순히 기능을 나열하는 것이 아니라, 백엔드 개발 개념을 실제 작동하는 서비스 안에서 이해하고 구현했는지를 평가합니다.

## 필수 기술 스택

- Node.js
- Express.js
- EJS 또는 Liquid.js
- ESM 문법
- PostgreSQL
- Render 배포
- Render에 연결된 PostgreSQL 데이터베이스

주의할 점:

- CommonJS의 `require`는 사용할 수 없습니다.
- 모든 모듈은 `import`와 `export` 기반으로 작성해야 합니다.
- JWT가 아니라 `express-session` 기반 세션 인증을 사용해야 합니다.

## 반드시 보여줘야 하는 핵심 개념

### 1. 데이터베이스 설계와 관계

- 여러 개의 관련 테이블 사용
- 적절한 foreign key 설정
- 정규화된 데이터 구조
- 컬럼별 적절한 데이터 타입 사용
- 테이블 간 관계에 대한 설계 의도
- foreign key에 `CASCADE` 또는 `SET NULL`을 적절히 사용

### 2. 사용자 인증과 권한 관리

- `express-session` 기반 로그인 시스템
- bcrypt 또는 비슷한 방식의 비밀번호 해싱
- 최소 3가지 역할 구분
- Admin 또는 Owner: 시스템과 콘텐츠 전체 관리
- Secondary Role: 직원, moderator, vendor 등 제한된 관리 권한
- Standard User: 기본 사용자 권한
- 로그인과 권한을 확인하는 보호된 route
- 안전한 session 설정

### 3. 서버 사이드 렌더링과 라우팅

- 모든 페이지를 EJS 또는 Liquid.js로 서버에서 렌더링
- `/product/:id`, `/vehicle/:id` 같은 동적 라우팅
- layout과 partial을 사용해 반복 코드 줄이기
- 의미 있는 URL 구조
- 선택 사항이지만 권장: 정렬, 필터링, pagination을 위한 query parameter

### 4. MVC 구조와 코드 정리

- Model, View, Controller 또는 Routes 간 책임 분리
- 인증, validation, error handling용 middleware
- 중앙화된 global error handler
- 필요한 곳에만 `try/catch` 사용
- 전체 코드에서 ESM import/export 문법 사용

### 5. 동적 콘텐츠 관리

- Admin 역할이 핵심 사이트 콘텐츠를 추가, 수정, 삭제할 수 있어야 함
- 콘텐츠는 데이터베이스에 저장되어야 함
- 사용자 역할에 따라 콘텐츠와 상호작용할 수 있어야 함
- Admin 변경사항이 사이트에 즉시 반영되어야 함

### 6. 사용자 상호작용 시스템

- 사용자가 자신의 계정과 연결된 콘텐츠를 제출할 수 있어야 함
- 예: 리뷰, 댓글, 평점, 요청, 메시지
- 사용자 생성 콘텐츠는 올바른 관계로 데이터베이스에 저장
- 사용자는 자신의 제출물을 보고, 수정하고, 삭제할 수 있어야 함
- 빈 입력이나 부적절한 입력을 막는 validation 필요

### 7. 여러 단계가 있는 workflow 시스템

사이트 안에 상태가 여러 단계로 이동하는 프로세스가 있어야 합니다.

가능한 예시:

- 서비스 또는 수리 요청: submitted, in progress, completed
- 지원 티켓: open, assigned, resolved
- 승인 workflow: submitted, under review, approved/rejected
- 주문 또는 예약: requested, confirmed, completed
- 쇼핑카트와 checkout: cart, checkout, order placed, fulfilled
- 문의 폼 응답: received, replied, closed
- 예약 시스템: requested, confirmed, checked in, completed

필수 조건:

- 사용자가 무언가를 제출할 수 있어야 함
- 사용자가 현재 상태를 볼 수 있어야 함
- 사용자가 상태 변경 기록을 볼 수 있어야 함

### 8. Admin Dashboard

권한이 있는 사용자가 관리 인터페이스에서 다음을 할 수 있어야 합니다.

- 사용자와 역할 보기 및 관리
- 핵심 사이트 콘텐츠 추가, 수정, 삭제
- 사용자 제출물 보기 및 응답
- 필요한 경우 사용자 생성 콘텐츠 moderation
- 관련 운영 데이터 확인

선택 사항:

- 일반 사용자용 dashboard
- 본인 제출물, 계정 정보, 주문 또는 요청 기록 확인

### 9. 보안과 validation

- parameterized query로 SQL injection 방지
- 모든 form 입력 validation
- 사용자 입력 sanitization
- 안전한 session 설정
- 시스템 내부 정보가 노출되지 않는 error message

### 10. 배포

- Render에 정상 작동하는 배포본
- production PostgreSQL 데이터베이스 연결
- 환경변수 설정
- production에서 development-only 코드 제거

## README.md 필수 내용

repository root의 `README.md`에 다음 내용을 포함해야 합니다.

- 프로젝트 설명: 사이트가 무엇을 하고 누구를 위한 것인지
- 데이터베이스 schema: pgAdmin에서 export한 ERD 이미지
- 사용자 역할: 각 role과 가능한 행동 설명
- 테스트 계정 정보: 각 role마다 하나의 username 또는 email
- 테스트 계정 비밀번호는 README에 직접 쓰지 않되, 모든 계정에 `P@$$w0rd!` 사용
- Known limitations: 완료하지 못한 기능 또는 알고 있는 bug

## GitHub repository 요구사항

- 최소 15개의 substantial commit
- 단순 한 줄 수정 commit은 충분하지 않음
- 정리된 folder structure
- 일관된 formatting과 읽기 쉬운 코드

## 프로젝트 선택지

### Option A: 직접 프로젝트 설계

자신만의 아이디어로 모든 핵심 요건을 만족하는 웹 앱을 만들 수 있습니다.

잘 맞는 예시:

- Rental 또는 booking platform
- Community site
- Service business site
- Marketplace
- Educational platform
- E-commerce site with shopping cart
- Event management system
- Task 또는 project management tool

아이디어를 정하기 전에 반드시 확인할 점:

- 여러 role과 권한 차이가 자연스럽게 생기는가
- Admin이 관리할 콘텐츠가 있는가
- 사용자의 제출과 상호작용이 있는가
- 여러 단계의 workflow가 들어가는가

### Option B: 중고차 딜러십 웹사이트

요구사항이 더 명확한 선택지입니다.

Public pages:

- Featured vehicles가 있는 home page
- Trucks, Vans, Cars, SUVs category별 차량 탐색
- 이미지, specs, 가격이 있는 차량 상세 페이지
- 데이터베이스에 저장되는 contact form

Logged-in user features:

- 차량 리뷰 작성
- 자신의 리뷰 수정 및 삭제
- 본인 차량 service request 제출
- service request 상태와 history 보기

Employee dashboard:

- 차량 정보 수정
- 부적절한 리뷰 moderation 또는 삭제
- service request 보기 및 관리
- service request 상태 업데이트
- service request notes 추가
- contact form submissions 보기

Owner dashboard:

- Employee가 할 수 있는 모든 작업
- vehicle categories 추가, 수정, 삭제
- inventory 차량 추가, 수정, 삭제
- employee account 관리
- 전체 system activity와 user data 보기

필수 database tables:

- users
- vehicles
- categories
- reviews
- service_requests
- contact_messages
- vehicle_images

## 성공 기준

- 실제 사용자가 의도된 목적대로 사이트를 사용할 수 있음
- 데이터베이스 구조가 다른 개발자에게도 이해됨
- 코드를 다른 사람에게 넘겨도 구조를 따라갈 수 있음
- 사이트가 안정적으로 작동함
- role별 경험과 권한이 실제로 다름
- Render 배포가 안정적이고 production 기준에 맞음

## 실패 가능성이 높은 문제

- 인증 시스템이 불완전하거나 작동하지 않음
- plain text password 저장
- SQL injection 위험
- 입력 validation 없음
- 관계 없는 단일 테이블 중심의 나쁜 데이터베이스 설계
- 잘못된 데이터 타입 사용
- 배포가 깨져 있거나 데이터베이스에 연결되지 않음
- 핵심 개념 누락

## 최종 제출물

마감 전 제출해야 할 것:

- GitHub repository URL
- Render live deployment URL

배포본 필수 조건:

- 외부에서 접근 가능해야 함
- 정상 작동해야 함
- PostgreSQL 데이터베이스가 연결되어 있어야 함
- 각 role별 테스트 계정이 있어야 함
- 테스트 계정 정보는 README에 포함되어야 함

## 5-6주 준비 관점에서 우선순위

1. 프로젝트 아이디어 확정
2. role 구조와 권한 범위 확정
3. database ERD 설계
4. 핵심 workflow 설계
5. authentication과 session 구현
6. core content CRUD 구현
7. user submission 기능 구현
8. admin dashboard 구현
9. validation, error handling, security 점검
10. Render 배포와 production database 연결
11. README, ERD 이미지, test account 정리
12. commit history와 최종 제출 링크 확인
