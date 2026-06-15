# Step 5 Public Cinema Direction Review Packet

검토 목적: Step 5 구현 전에 public cinema experience의 정보 구조와 frontend 방향을 확인한다.

이 검토는 구현을 막지 않는다. 아래 방향과 충돌하는 변경이나 새로운 브랜드 결정을 해야 할 때만 사용자 결정을 요청한다.

## 현재 확정 방향

- Public 페이지는 영화 탐색과 상영 일정 확인을 가장 먼저 지원한다.
- Indiespace는 정보 구조 참고 대상으로 사용한다.
- Cinecube는 시각적 위계와 절제된 public UI 참고 대상으로 사용한다.
- Home, Film Archive, Film Detail, Screening Schedule, Screening Detail, Visit and Contact를 연결한다.
- 실제 결제, 좌석 선택, 외부 영화 API, 추천 기능은 추가하지 않는다.

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

## 사용자 검수 요청 시점

Step 5 첫 번째 실제 데이터 화면이 연결되면 Home, Film Archive, Film Detail, Screening Schedule의 화면 결과를 묶어 사용자에게 frontend 검수를 요청한다. 검수 전에도 확정된 범위 안의 backend와 화면 연결 작업은 계속 진행한다.

## 현재 구현 근거

- Film Archive와 Screening Schedule은 실제 PostgreSQL seed 데이터에 연결되었다.
- Film Archive는 metadata, synopsis, upcoming count, next screening을 표시한다.
- Screening Schedule은 날짜, 시간, program label, film metadata, capacity, remaining availability를 표시한다.
- 두 목록 화면은 1280px와 390px에서 horizontal overflow 없이 확인되었다.
- Home과 Film Detail이 아직 실제 데이터에 연결되지 않았으므로 사용자 frontend 검수 요청은 다음 detail slice 이후 진행한다.
