# Step 5 Public Cinema Direction Review Packet

검토 목적: Step 5 구현 전에 public cinema experience의 정보 구조와 frontend 방향을 확인한다.

이 검토는 구현을 막지 않는다. 아래 방향과 충돌하는 변경이나 새로운 브랜드 결정을 해야 할 때만 사용자 결정을 요청한다.

## 현재 확정 방향

- Public 페이지는 영화 탐색과 상영 일정 확인을 가장 먼저 지원한다.
- Indiespace는 정보 구조 참고 대상으로 사용한다.
- Cinecube는 시각적 위계와 절제된 public UI 참고 대상으로 사용한다.
- 전체 frontend는 "애플이 극장을 만든다면" 같은 인상을 목표로 하되, 실제 기능은 Independent Cinema 프로젝트 범위 안에서만 구현한다.
- Home, Film Archive, Film Detail, Screening Schedule, Screening Detail, Visit and Contact를 연결한다.
- 실제 결제, 좌석 선택, 외부 영화 API, 추천 기능은 추가하지 않는다.

## Visual Direction Brief

- 전체 인상은 조용하고 정제된 premium cinema mood로 유지한다.
- 화면은 dark base, large headline typography, restrained navigation, precise spacing을 중심으로 구성한다.
- Public 화면은 editorial하고 film-centered여야 하며, marketplace나 multiplex 판매 화면처럼 보이면 안 된다.
- 한 화면에서 가장 강한 CTA는 하나만 우선한다.
- poster, title, screening time, availability, next action이 항상 핵심 읽기 흐름에 남아야 한다.
- mobile에서도 영화, 시간, 상태, 다음 행동이 한 흐름으로 이어져야 한다.
- Apple 같은 고급 제품 감성은 채택하지만 seat selection, trailer, watchlist, aggressive search commerce 같은 범위 밖 기능은 UI 중심으로 끌어오지 않는다.

## Step 5 구현 우선순위

1. PostgreSQL film과 screening 데이터를 public route에 연결한다.
2. Film에서 해당 screening으로 자연스럽게 이동하게 한다.
3. 날짜별 schedule과 screening availability를 명확하게 표시한다.
4. Contact form의 정상, invalid, success, error 상태를 완성한다.
5. Owner film과 screening 관리가 public 결과에 반영되게 한다.

## Frontend 검수 기준

| 화면 | 사용자가 먼저 이해해야 하는 내용 | 주요 검수 항목 |
| --- | --- | --- |
| Home | 현재 상영 중인 영화와 가까운 상영 일정 | 첫 viewport 위계, CTA 우선순위 |
| Film Archive | 어떤 영화를 볼 수 있는지 | poster 비율, metadata 밀도, mobile scan |
| Film Detail | 영화 정보와 예약 가능한 상영 | synopsis 가독성, schedule 연결 |
| Screening Schedule | 날짜별 상영 순서와 availability | 날짜 이동, 시간 비교, sold-out 또는 cancelled 상태 |
| Screening Detail | 선택한 상영과 다음 행동 | 영화 정보 중복 수준, booking CTA |
| Visit and Contact | 방문 정보와 문의 방법 | 정보 순서, form 명확성, validation feedback |

## 기본 구현 결정

- Public 화면은 editorial한 film 중심 구성을 사용한다.
- 상영 일정과 availability는 장식보다 먼저 읽히게 한다.
- Mobile에서도 영화, 시간, 상태, 다음 행동이 한 흐름으로 읽히게 한다.
- 최종 cinema brand name, 최종 poster source, 최종 visual identity는 사용자 결정 전까지 확정하지 않는다.

## Keep / Remove / Adapt

| 화면 | Keep | Remove | Adapt |
| --- | --- | --- | --- |
| Home | 큰 featured hero, dark cinema atmosphere, today or next screening highlights, lower utility sections | trailer CTA, search-heavy commerce UI, generic lifestyle promo | featured film과 nearest screening 중심으로 단순화하고 Visit, Hours, Member 정보를 project scope에 맞게 재배치 |
| Film Archive | poster plus metadata plus next screening row structure, featured emphasis, fast scan rhythm | marketplace-style ticket selling language, overbuilt sort controls | `Film detail`과 `Next screening` 중심 CTA로 정리하고 독립영화관에 맞게 metadata 밀도 조절 |
| Film Detail | poster, large title, supporting facts, screenings section in one flow | seat selection, trailer, watchlist | 현재 DB 필드 범위의 facts만 유지하고 screening detail or booking 진입 CTA로 바꾼다 |
| Screening Schedule | dense row comparison, time-first reading, visible availability | theater-format marketing overload | 날짜, 시간, availability, film 연결을 먼저 읽히게 하고 decorative labeling은 절제 |
| Screening Detail | selected screening facts, film back-link, clear action area | seat maps, trailer, commerce extras | 상영 확정 정보, availability, film metadata, booking entry point 위주로 단순화 |
| Visit and Contact | calm premium information blocks, architectural layout tone | brand-campaign filler, unrelated promos | visit info, hours, accessibility, contact form feedback를 핵심 흐름으로 정리 |

## Layout Spec

### Home

- 상단 navigation은 작고 절제되게 유지한다.
- 첫 viewport는 featured film hero와 primary CTA를 중심으로 구성한다.
- hero 아래에는 nearest screening 또는 today screening strip을 둔다.
- 그 아래에 now playing or program film cards를 둔다.
- 하단 utility section은 Visit, Hours, Member or Club information 정도로 제한한다.

### Film Archive

- page intro에는 large title, one-sentence description, optional film count를 둔다.
- 각 film row는 poster, title and metadata, synopsis preview, next screening summary, CTA 순서로 스캔되게 한다.
- title과 next screening이 같은 화면 안에서 바로 연결되어야 한다.
- mobile에서는 poster 비중을 줄이더라도 screening summary와 CTA가 title 아래에서 바로 보이게 유지한다.

### Film Detail

- 상단에는 `Back to Film Archive`를 둔다.
- desktop은 poster left, main film information center, supporting facts right 구조를 기본으로 한다.
- mobile은 title, key metadata, synopsis, screenings 순으로 재배치한다.
- CTA는 현재 단계에서 screening detail 또는 screening section 진입 중심으로 둔다.
- upcoming screenings section은 시간 비교가 가능한 row 구조를 우선한다.

## 사용자 검수 요청 시점

Home, Film Archive, Film Detail, Screening Schedule, Screening Detail이 실제 PostgreSQL data에 연결되었으므로 첫 public frontend 검수 요청 조건은 충족되었다. 검수는 다음 구현을 막지 않지만, 사용자는 첫 viewport 위계, CTA 우선순위, mobile scan, poster 또는 image 방향을 확인해야 한다.

## 현재 구현 근거

- Home, Film Archive, Film Detail, Screening Schedule, Screening Detail은 실제 PostgreSQL seed 데이터에 연결되었다.
- Home은 nearest screening, schedule links, program film cards를 표시한다.
- Film Archive는 metadata, synopsis, upcoming count, next screening을 표시한다.
- Screening Schedule은 날짜, 시간, program label, film metadata, capacity, remaining availability를 표시한다.
- Film Detail은 film metadata와 upcoming screenings를 연결한다.
- Screening Detail은 선택한 상영의 availability와 film metadata를 연결한다.
- Home, list, and detail 화면은 1280px와 390px에서 horizontal overflow 없이 확인되었다.
