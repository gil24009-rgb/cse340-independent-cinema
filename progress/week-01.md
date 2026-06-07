# Week 01 Progress

기간: 2026-06-06 - 2026-06-12

## 목표

- 최종 프로젝트 방향 확정
- 프로젝트 전체 로드맵 작성
- role과 permission 범위 정의
- 핵심 booking workflow 확정
- CSE 340 요건 추적 구조 작성
- ERD 설계를 시작할 수 있는 상태 만들기

## 완료한 작업

- Independent Cinema Platform 방향 확정
- 인디스페이스 구조 분석
- 구조적 레퍼런스와 UI 레퍼런스 분리
- 9단계 master roadmap 작성
- Owner, Staff, Member role 정의
- Booking, review, contact message workflow 정의
- MVP와 제외 범위 정의
- Initial sitemap 작성
- Backend 기능과 frontend 화면 연결
- Requirements traceability matrix 작성

## 관련 문서

- `final-project/planning/00-master-roadmap-ko.md`
- `final-project/planning/01-project-foundation-ko.md`
- `final-project/planning/requirements-traceability-ko.md`
- `final-project/planning/indiespace-structure-analysis-ko.md`

## 관련 Commit

아직 commit하지 않음.

완료 시 실제 commit hash와 message를 기록한다.

## 검증 결과

- 모든 필수 CSE 340 핵심 개념이 traceability matrix에 매핑됨
- 각 role의 권한 차이가 정의됨
- 핵심 multi-stage workflow가 booking으로 고정됨
- booking history를 사용자가 확인할 수 있도록 frontend 연결이 정의됨
- 실제 결제, 좌석 선택, 외부 API를 제외해 5-6주 범위로 제한함

## 새로 결정한 사항

- 구조 레퍼런스: 인디스페이스
- UI 레퍼런스: 씨네큐브
- 핵심 workflow: Booking status
- 핵심 사용자 역할: Owner, Staff, Member
- 실제 결제와 좌석 선택은 구현하지 않음
- 한 개의 상영관을 운영하는 구조로 제한

## 남은 위험 또는 Blocker

- 실제 수업 마감일이 현재 문서에 반영되지 않음
- 최종 브랜드명 미정
- PostgreSQL schema와 delete policy 미정
- screening capacity 처리 방식 미정

## 다음 작업

- ERD 작성
- table별 field와 data type 정의
- foreign key delete policy 정의
- seed data와 test account 계획
- DB 구조가 frontend 화면에 제공할 field 검증
