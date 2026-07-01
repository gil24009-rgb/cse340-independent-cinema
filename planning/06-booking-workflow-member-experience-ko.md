# Step 6: Booking Workflow and Member Experience

## 목표

Member가 public screening detail에서 예약을 만들고, 자신의 booking detail과 booking history를 확인하며, 허용된 조건에서 예약을 취소할 수 있게 만든다.

Booking workflow는 이 프로젝트의 핵심 평가 지점이다. UI 버튼보다 중요한 것은 transaction, capacity protection, duplicate prevention, ownership, and status history가 함께 맞는 것이다.

## Vertical Slice

### Slice 1. Transaction-Safe Member Booking Creation

상태: Implemented and locally verified

구현 범위:

- `/screenings/:screeningId` Member-only booking action
- `POST /screenings/:screeningId/bookings`
- unauthenticated, Member, Staff, Owner 상태별 booking affordance
- screening row lock 기반 capacity check
- duplicate booking conflict handling
- booking insert와 initial booking status history insert를 하나의 transaction으로 처리
- 성공 후 `/account/bookings/:bookingId` redirect

검증:

- public route tests에서 unauthenticated redirect, Member success, Staff non-bookable state, duplicate conflict 확인
- PostgreSQL integration test에서 booking과 initial history row 생성 확인
- PostgreSQL integration test에서 duplicate booking과 sold-out capacity conflict 확인
- local route verification에서 실제 Member login, booking POST, booking detail redirect, history row, cleanup 확인
- browser check에서 1280px와 390px no-overflow 확인

### Slice 2. Member Booking History

상태: Implemented and locally verified

구현 범위:

- `/account`에서 Member booking list 표시
- upcoming, past, cancelled booking의 scan 가능한 상태 구분
- empty state
- booking detail로 이동

검증:

- Member만 자신의 booking list를 볼 수 있다.
- 다른 Member 또는 Staff booking은 노출되지 않는다.
- empty와 normal state가 route test와 browser check로 확인됐다.
- 1280px와 390px에서 no-overflow 상태를 확인했다.

### Slice 3. Member Booking Cancellation

상태: Implemented and locally verified

구현 범위:

- Member-owned eligible booking cancellation
- current booking status와 history row를 하나의 transaction으로 변경
- cancelled_at policy 적용
- duplicate cancellation과 ineligible status conflict 처리

검증:

- owner Member만 취소할 수 있다.
- Staff와 Owner는 Member cancellation route를 사용할 수 없다.
- confirmed booking만 취소 가능하다.
- current status와 history row가 같은 transaction에서 바뀐다.
- CSRF, wrong owner, invalid id, missing booking, duplicate cancellation, completed booking conflict가 route test로 확인됐다.
- PostgreSQL integration test에서 cancellation update와 history append가 확인됐다.
- 1280px와 390px에서 cancelled detail state의 no-overflow 상태를 확인했다.

### Slice 4. Booking Status Timeline and Step Review Packet

상태: Implemented and locally verified

구현 범위:

- booking detail에서 `booking_status_history` timeline 표시
- initial creation, cancellation, later Staff status transition 기록을 같은 UI 패턴으로 읽을 수 있게 구성
- empty or missing history fallback
- Step 6 booking workflow review packet 준비

검증:

- Member는 자신의 booking history timeline만 볼 수 있다.
- history row가 시간순으로 표시된다.
- cancellation 후 timeline에 confirmed to cancelled transition이 표시된다.
- missing history row fallback이 깨진 화면 대신 안정적인 안내를 표시한다.
- route test에서 booking detail timeline과 cancellation 후 timeline content가 확인됐다.
- PostgreSQL integration test에서 creation과 cancellation history lookup이 확인됐다.
- local browser에서 1280px와 390px no-overflow 상태를 확인했다.
- Step 6 review packet이 representative routes, normal and failure states, verification evidence, and nonblocking debt를 정리한다.

## Step 6 Review Packet

상태: Recorded

검수 파일:

- `quality-reviews/step-06-completion-approval-packet-ko.md`

검수 성격:

- 비차단 frontend and direction review
- 범위, role, workflow, data relationship, architecture를 바꾸는 요청이 없으면 Step 7 Staff operations로 계속 진행한다.

## Step 6 완료 조건

- Member가 screening을 예약하고 자신의 booking detail과 booking history에서 확인할 수 있다.
- Booking creation은 duplicate booking과 capacity 초과를 막는다.
- Booking cancellation은 ownership, eligibility, transaction, history를 지킨다.
- Booking status history는 실제 상태 변경만 기록한다.
- Normal, empty, invalid, unauthenticated, forbidden, not-found, conflict, and error states가 적용되는 범위에서 검증된다.
- Booking confirmation, ticket detail, status timeline, cancellation states를 사용자에게 frontend 검수 패킷으로 제공한다.
