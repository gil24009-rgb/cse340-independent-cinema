# Step 4: Authentication and Authorization

## 목표

서버가 로그인 상태, 현재 role, 계정 활성 상태, resource ownership을 매 요청에서 신뢰할 수 있게 검사하도록 만든다.

Navigation 노출은 presentation으로만 사용한다. 모든 보호 route는 직접 URL 접근에서도 서버 middleware가 권한을 검사한다.

## Vertical Slice

### Slice 1. Login, Session Identity, and Role Access

상태: Implemented and production behavior verified

구현 범위:

- `express-session`과 PostgreSQL production store
- development와 production cookie 설정
- login과 logout
- login 성공 후 session ID regeneration
- logout CSRF 검증과 server-side session destroy
- 매 요청에서 active user와 현재 role 재조회
- Member, Staff, Owner role guard
- `/account`, `/staff`, `/admin` 보호 화면
- login과 forbidden 화면

자동 검증:

- 비로그인 직접 접근 redirect
- Member, Staff, Owner route matrix
- inactive account의 기존 session 접근 차단
- unknown email과 wrong password의 동일한 실패 메시지
- invalid CSRF 차단
- logout 후 기존 session 접근 차단

프로덕션 검증:

- 실제 Owner, Staff, Member seed account 로그인
- `pgcrypto`로 생성된 seed password hash의 Node bcrypt 검증
- PostgreSQL-backed production session과 secure cookie 동작
- 비로그인, role denial, logout 이후 기존 session 무효화

남은 직접 검증:

- PostgreSQL session table에서 login row 생성과 logout row 삭제 직접 확인

### Slice 2. Signup and Password Creation

구현 범위:

- signup form과 field-level error
- email lower-case normalization
- bcrypt password hashing
- duplicate email conflict 처리
- Member role만 생성 가능
- signup 성공 후 안전한 session 시작

### Slice 3. Resource Ownership

구현 범위:

- resource ID strict parsing
- resource 조회와 not-found 처리
- Member ownership middleware
- Staff와 Owner의 문서화된 운영 권한 분리
- 다른 Member의 booking과 review 접근 차단 테스트

## Security Rules

- Session에는 `userId`만 저장한다.
- 모든 환경에서 `SESSION_SECRET`을 명시적으로 설정한다.
- role과 active 상태는 매 요청에서 database를 다시 조회한다.
- Login 실패는 account 존재 여부를 공개하지 않는다.
- 모든 state-changing form은 CSRF token을 검사한다.
- Login 성공과 privilege-level 변경 후 session ID를 재생성한다.
- Protected route는 authentication과 role 또는 ownership을 서버에서 검사한다.
- Production은 PostgreSQL session store, secure cookie, known proxy 설정을 사용한다.

## Step 4 완료 조건

- Signup, login, logout이 실제 PostgreSQL 계정으로 작동한다.
- Owner, Staff, Member의 직접 URL 접근 matrix가 통과한다.
- 다른 Member의 owned resource 접근이 차단된다.
- Inactive account와 stale role session이 차단된다.
- PostgreSQL session persistence와 logout 삭제가 검증된다.
- Required independent authentication review finding이 모두 분류되고 검증된다.
