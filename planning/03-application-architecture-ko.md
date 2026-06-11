# Step 3: Application Architecture and Shared Backend

## 목표

기존 CSE 340 coursework와 최종 프로젝트를 분리하고, 이후 인증, 영화, 상영일정, 예약, 운영 dashboard가 같은 규칙으로 확장될 수 있는 공통 애플리케이션 기반을 만든다.

## 핵심 구조 결정

### 독립 실행 앱

최종 프로젝트 앱은 아래 경로에서 독립적으로 실행한다.

```text
app/
```

이유:

- repository root의 기존 coursework를 덮어쓰지 않는다.
- final project 의존성과 실행 script를 명확하게 분리한다.
- Render에서 `app`을 root directory로 지정할 수 있다.
- 최종 프로젝트 구조를 다른 개발자가 빠르게 이해할 수 있다.

### MVC 책임

```text
src/config/
```

- 환경변수와 PostgreSQL pool
- 애플리케이션 전체에서 공유하는 infrastructure 설정

```text
src/controllers/
```

- request 처리
- model 또는 service 결과를 view data로 준비
- response rendering 또는 JSON health response

```text
src/routes/
```

- URL과 controller 연결
- 이후 auth, role, validation middleware 연결 위치

```text
src/middleware/
```

- 모든 view에 공통 context 제공
- role-aware navigation
- form validation
- not found와 global error handling

```text
views/
```

- EJS server-side rendering
- shared document, header, footer partial
- stable empty state와 error state

## PostgreSQL 연결 구조

`src/config/database.js`는 lazy pool을 사용한다.

특징:

- `DATABASE_URL`이 필요한 시점에만 pool 생성
- production 환경에서 SSL 설정
- 모든 query는 parameter array를 받을 수 있는 shared query function 사용
- server 종료 시 pool을 닫는 graceful shutdown
- database 연결 상태를 확인하는 health route 제공

Frontend 연결:

- 이후 film, screening, booking, dashboard query가 같은 pool을 사용한다.
- DB 장애는 global error handler를 통해 안정적인 error page로 연결된다.

## Shared View Context

모든 EJS view에 다음 값을 제공한다.

- `currentPath`
- `currentUser`
- `environment`
- `navigation`
- `year`

Role-aware navigation:

- Public: Sign In
- Member: My Bookings
- Staff: Staff
- Owner: Admin

현재 Step 3에서는 `currentUser`가 비어 있다. Step 4에서 session authentication이 `req.currentUser`를 설정하면 navigation이 자동으로 role에 맞게 바뀐다.

## Validation Strategy

공통 validation middleware는 field별 validator 결과를 `req.validationErrors`에 모은다.

현재 제공 validator:

- required trimmed text
- maximum length
- email format

향후 form 처리 방식:

```text
route
→ validation middleware
→ controller checks req.validationErrors
→ invalid: same form with field errors
→ valid: model/service transaction
→ redirect or render success state
```

모든 form은 client validation과 별개로 server validation을 수행한다.

## Error Strategy

### Not Found

알 수 없는 route는 404 error를 생성해 중앙 error handler로 전달한다.

### Global Error

global error handler는:

- response가 이미 시작됐는지 확인
- status에 맞는 stable page rendering
- production에서는 내부 error message를 숨김
- development에서는 원인 파악용 message 표시

### Database Error

DB 설정 누락이나 연결 실패도 controller에서 직접 화면을 만들지 않고 global error handler로 전달한다.

## Frontend Foundation

### Public shell

- 실제 독립영화관 사이트처럼 보이는 첫 화면
- Films와 Screenings가 중심인 navigation
- Visit와 Sign In 진입점
- desktop과 mobile에서 유지되는 hierarchy

### Empty states

아직 구현되지 않은 Films, Screenings, Login route는 404 대신 안정적인 empty state를 보여준다. 다음 단계에서 실제 기능으로 교체한다.

### Visual direction

현재 UI는 최종 visual design이 아니라 구조 검증용 foundation이다.

기준:

- 장식 card 중심 layout을 피함
- typography와 line-based hierarchy 사용
- public cinema experience와 운영 dashboard를 이후 분리할 수 있는 구조
- mobile에서 horizontal overflow 없음

## 구현된 Route

| Route | 목적 | 상태 |
| --- | --- | --- |
| `/` | Public cinema shell | Ready |
| `/films` | Film archive empty state | Ready for Step 5 replacement |
| `/screenings` | Screening schedule empty state | Ready for Step 5 replacement |
| `/visit` | Public visit information foundation | Ready |
| `/login` | Authentication empty state | Ready for Step 4 replacement |
| `/health` | Application health | Ready |
| `/health/database` | PostgreSQL connection health | Ready |

## 검증 결과

### Automated

- Node test runner tests: 10 passed
- Home rendering
- Planned primary route empty states
- Application health response
- Stable 404 rendering
- Database configuration error to global handler
- Role-aware navigation destination
- Validation error collection
- Missing request body validation
- Account navigation route-boundary matching
- Error template rendering fallback

### Database Integration

- PostgreSQL 17.10 temporary database에 schema와 seed 적용
- 실제 `DATABASE_URL`을 사용해 `/health/database` 응답 확인
- no-op booking status history가 database constraint로 거부됨

### Browser

- Desktop 1280px에서 public shell 확인
- Mobile 390px에서 public shell 확인
- Desktop과 mobile 모두 horizontal overflow 없음
- Films navigation이 stable empty state로 연결됨

## Step 3 완료 기준

- 최종 프로젝트 앱이 기존 coursework와 분리됨
- PostgreSQL shared connection이 작동함
- MVC 확장 위치가 명확함
- global view context와 role-aware navigation 기반이 있음
- validation과 global error middleware가 있음
- EJS public shell과 stable states가 있음
- automated, database, browser 검증이 완료됨

## Step 3 결과

상태: Complete

다음 단계:

- express-session과 PostgreSQL session store
- signup, login, logout
- bcrypt password verification
- Owner, Staff, Member route guards
- resource ownership middleware
- Login, signup, account, forbidden UI
