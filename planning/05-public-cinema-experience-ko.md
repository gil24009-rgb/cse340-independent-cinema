# Step 5: Public Cinema Experience

## 목표

PostgreSQL의 공개 film과 screening 데이터를 사용자가 탐색하고, 영화에서 상영 일정과 다음 행동으로 자연스럽게 이동하게 만든다.

Public query는 archived film, cancelled screening, completed screening, past screening을 예정 상영 목록에서 제외한다.

## Vertical Slice

### Slice 1. Public Film Archive and Screening Schedule

상태: Implemented and locally verified

구현 범위:

- `/films` public film archive
- `/screenings` future scheduled screening list
- upcoming screening count와 next screening summary
- remaining capacity 표시
- stable normal, empty, database-error states

검증:

- PostgreSQL seed data에서 공개 film 4개와 예정 screening 3개 조회
- route normal, empty, database-error automated tests
- local PostgreSQL full test suite
- 1280px desktop와 390px mobile no-overflow browser checks

### Slice 2. Film and Screening Detail

상태: Implemented and locally verified

구현 범위:

- `/films/:slug`
- `/screenings/:screeningId`
- strict identifier와 stable not-found
- film detail에서 upcoming screenings 연결
- screening detail에서 film metadata와 booking 진입 상태 연결

검증:

- valid, invalid, missing identifier automated tests
- local PostgreSQL full test suite
- film archive에서 film detail, film detail에서 screening detail route navigation 확인
- 1280px desktop와 390px mobile no-overflow browser checks

### Slice 3. Public Home Highlights

상태: Implemented and locally verified

구현 범위:

- `/` home route를 PostgreSQL data에 연결
- featured film과 nearest screening summary 표시
- archive와 screening schedule로 이어지는 CTA 정리
- stable empty and database-error fallback

검증:

- public home normal and database-error automated tests
- local PostgreSQL full test suite
- 실제 PostgreSQL seed data에서 nearest screening과 program film card 렌더링 확인
- 1280px desktop와 390px mobile no-overflow browser checks

### Slice 4. Visit and Contact

상태: Implemented and locally verified

구현 범위:

- 실제 visit information hierarchy
- public contact form
- validation, success, conflict or failure feedback

검증:

- public visit normal, invalid, success, database-error automated tests
- local PostgreSQL route insert and cleanup through `contact_messages`
- local PostgreSQL full test suite
- 1280px desktop와 390px mobile no-overflow browser checks
- label, CSRF token, success state, single primary action 확인

### Slice 5. Owner Film and Screening Management

상태: In Progress

구현 범위:

- Owner-only film and screening CRUD
- archive and cancel policy
- public result 반영

구현 완료된 하위 범위:

- `/admin/films` Owner-only film catalog
- film archive and restore action
- archived film의 public `/films` 제외 반영
- unauthenticated, Member, Staff, Owner direct access tests
- `/admin/screenings` Owner-only screening schedule
- scheduled screening cancel and restore action
- active booking이 있는 screening cancellation conflict 처리
- completed screening은 preserved operational history로 표시하고 action 미노출
- cancelled screening의 public `/screenings` 제외와 restore 반영
- desktop 1280px와 mobile 390px no-overflow browser checks

다음 하위 범위:

- film create or edit form의 최소 검증 범위
- screening create or edit form의 최소 검증 범위
- Owner 변경사항의 public page 반영 검증 확장

## Step 5 완료 조건

- Owner 변경사항이 public page에 반영된다.
- 사용자가 film archive, film detail, screening schedule, screening detail을 연결해서 탐색할 수 있다.
- 날짜와 availability가 정확하게 표시된다.
- Contact workflow가 public form에서 Staff workflow로 연결된다.
- Normal, empty, invalid, forbidden, not-found, conflict, and error states가 적용되는 범위에서 검증된다.
- 실제 데이터가 연결된 주요 public 화면을 사용자에게 frontend 검수 패킷으로 제공한다.
