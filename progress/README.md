# Final Project Progress Log

이 폴더는 최종 프로젝트의 주간 진행 상황을 Git history와 함께 확인하기 위한 기록이다.

## 기록 규칙

매주 한 개의 문서를 만든다.

파일명:

```text
week-01.md
week-02.md
week-03.md
week-04.md
week-05.md
week-06.md
week-07.md
week-08.md
```

각 주간 기록에는 아래 항목을 포함한다.

- 목표
- 완료한 작업
- 관련 commit
- 검증 결과
- 새로 결정한 사항
- 남은 위험 또는 blocker
- 다음 주 목표

## Git 확인 명령

주간 commit 확인:

```bash
git log --since="YYYY-MM-DD" --until="YYYY-MM-DD" --oneline
```

변경 파일 요약:

```bash
git diff --stat <start-commit>..<end-commit>
```

전체 진행 기록:

```bash
git log --oneline --decorate --graph
```

## 주간 완료 기준

문서 작성만으로 완료 처리하지 않는다. 각 주차는 다음을 포함해야 한다.

- 검증 가능한 구현 또는 설계 결과
- 관련 commit 기록
- 실행하거나 검토한 검증 결과
- 다음 단계가 시작 가능한 상태
