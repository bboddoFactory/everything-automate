---
title: Everything Automate Implementation Milestones
description: everything-automate 루프 커널을 v0 계약부터 어댑터 확장까지 순차적으로 구현하기 위한 단계별 마일스톤을 정의한다.
doc_type: workflow
scope:
  - implementation milestones
  - v0 kernel
  - execution flow
  - bootstrap
  - codex
  - execution
covers:
  - docs/specs/everything-automate-loop-kernel-draft.md
  - docs/specs/everything-automate-operating-principles.md
  - docs/specs/everything-automate-planning-workflow.md
---

# Everything Automate 구현 마일스톤

이 문서는 `everything-automate`의 구현 경로를 한 단계씩 나누어 정의한다.
핵심 원칙은 간단하다.

- 한 번에 한 단계만 진행한다.
- 다음 단계는 이전 단계의 계약과 검증이 끝나야 시작한다.
- 초기는 반드시 `v0` 루프 커널 계약부터 고정하고, 그 다음에 실행 흐름과 주변 런타임 기능을 넓힌다.

## 진행 원칙

### 순서 규칙

```text
v0 kernel contracts
  -> execution flow
  -> minimal bootstrap/intake
  -> Codex workflow surfaces
  -> Codex execute hardening
  -> optional Codex runtime refinement
  -> later expansion
```

### 단계 완료 기준

- 각 단계는 동작하는 산출물을 하나 이상 남겨야 한다.
- 각 단계는 완료 조건이 명확해야 한다.
- 각 단계는 다음 단계로 넘어가기 전에 검증 가능해야 한다.

## 마일스톤

## 현재 상태

현재 구현 기준으로 보면:

```text
M0 완료
M1 완료
M2 완료
M3 완료
M4 대부분 완료
M5 현재 진행 단계
M6+ 보류
```

현재 active scope는 Codex 기준이다.

- `brainstorming -> planning -> execute` surface는 이미 잡혔다.
- global Codex setup installer v0도 이미 구현됐다.
- 다음 실제 작업은 `execute` 안의 verify / decide / retry / state 연동을 하드닝하는 것이다.

현재 이 저장소에서 **하지 않는 것**:

- Claude adaptation 본격 구현
- internal service adapter 본격 구현

이 둘은 나중 단계나 다른 작업 흐름으로 미룬다.

### M0. 범위 고정과 기준선 정리

목적: 구현 전에 문서와 범위를 고정한다.

- `everything-automate-loop-kernel-draft.md`를 기준 설계로 삼는다.
- 이 문서와 운영 원칙 문서를 현재 기준으로 만든다.
- 로컬 authoring layer와 distributable template layer를 분리한다.
- 로컬 운영 원칙은 루트 `AGENTS.md`가 담당하고, 배포 대상 런타임 자산은 앞으로 `templates/`를 source of truth로 삼는다는 규칙을 고정한다.
- `v0`에서 다루지 않을 범위를 분명히 적는다.

완료 조건:

- 구현 범위가 `v0`와 이후 확장으로 나뉜다.
- 새 기능을 추가하기 전에 지켜야 할 문서 기준이 정리된다.
- 어떤 파일이 로컬 전용이고 어떤 파일이 배포 대상인지 소유권 규칙이 정리된다.

### M1. v0 루프 커널 계약 고정

목적: 실행 흐름보다 먼저, 상태와 계약을 정의한다.

이 단계에서 고정할 것:

- `loop-state`의 최소 필드
- `plan-artifact`의 최소 구조
- `verification`의 최소 evidence 구조
- `decision-engine`의 상태 전이 규칙
- `cancel`의 종료 의미

완료 조건:

- task 단위 상태가 하나의 계약으로 표현된다.
- 계획, 검증, 결정이 같은 상태 모델을 공유한다.
- 아직 어댑터나 고급 런타임이 없어도 계약을 읽을 수 있다.

### M2. 실행 흐름 연결

목적: 계약을 실제 순서로 움직이게 만든다.

이 단계에서 연결할 것:

- `plan -> execute -> verify -> decide` inner loop
- `bootstrap -> intake -> ... -> wrap` outer flow
- 상태 전이와 검증 결과 반영

완료 조건:

- 실행 흐름이 상태 전이로 설명된다.
- 검증 결과에 따라 `continue`, `fix`, `complete`, `cancel`, `fail` 판단이 가능하다.
- 흐름이 문서가 아니라 실제 런타임 행위로 연결된다.

### M3. 최소 bootstrap / intake

목적: 작업을 시작하기 전에 최소한의 런타임 진입점을 만든다.

이 단계에서 다룰 것:

- 런타임 규칙 주입
- 작업 분류: 직접 실행, 확인 필요, 계획 필요
- task id와 실행 의도 기록
- 템플릿 레이어에서 provider별 진입 파일이 어떤 공통 계약을 읽는지 결정

완료 조건:

- 새 작업이 들어오면 처리 경로가 분류된다.
- 런타임이 어떤 계약을 사용할지 최소한으로 결정할 수 있다.
- 로컬 개발용 규칙과 배포용 진입 파일이 서로 역할을 침범하지 않는다.

### M4. Codex workflow surfaces와 handoff

목적: Codex 사용자가 세션 안에서 밟는 canonical workflow를 먼저 고정한다.

이 단계에서 구현할 것:

- `$brainstorming`, `$planning`, `$execute` 같은 primary surface 정의
- planning에서 execution으로 넘어가는 handoff contract
- plan artifact에서 execution intent를 읽는 방식
- 인세션 workflow와 shared kernel의 연결 규칙

완료 조건:

- Codex의 1차 사용자 경험이 인세션 workflow로 설명된다.
- approved plan이 execution handoff로 자연스럽게 이어진다.
- `brainstorming`, `planning`, `execute`의 역할 경계가 분명하다.
- 바깥 runtime은 메인 UX가 아니라 내부 구현 레이어로 위치가 정리된다.

### M5. Codex execute hardening

목적: `M4`에서 정한 `execute` surface가 실제로 verify / decide / retry / state 연동까지 버티는지 검증하고 부족한 계약을 보완한다.

이 단계에서 다룰 것:

- `execute`가 planning handoff를 충분히 읽는지 검증
- readiness check가 실제로 충분한지 검증
- `execute -> verify -> decide -> fix -> repeat` 루프가 실제 skill contract로 충분한지 검증
- retry / escalation / scope drift / blocker handling 하드닝
- `complete`, `cancelled`, `failed`, `suspended/interrupted`가 안 섞이도록 terminal semantics 하드닝
- AC progress / partial-progress / terminal summary contract 검증
- `runtime/ea_state.py`와의 연결 필요성 및 gap 확인
- global installer로 깐 Codex skill이 실제 사용 가능한지 확인

완료 조건:

- `execute`가 planning handoff를 기준으로 자연스럽게 시작할 수 있다.
- `verify`와 `decide`가 `execute` 내부 루프 안에서 충분히 설명되고 검증된다.
- progress / retry / blocker / terminal semantics가 모호하지 않다.
- 필요한 state/runtime support gap이 식별되고, 다음 단계의 입력으로 정리된다.

### M6. optional Codex runtime refinement

목적: `M5`에서 드러난 gap이 있으면 Codex runtime/state/refinement를 추가로 다듬는다.

이 단계에서 다룰 것:

- `runtime/ea_state.py` 연동 강화
- status / cancel / resume 표면 보강
- installer / manifest / doctor refinement
- handoff artifact 소비 경로 보강

완료 조건:

- Codex runtime support가 `execute` UX를 해치지 않으면서도 recovery를 충분히 보조한다.
- runtime helper가 실제로 필요한 만큼만 존재한다.

### M7. out-of-scope adapters

목적: 다른 provider adaptation은 현재 저장소의 active 구현 범위 밖으로 둔다.

이 단계에서 추가할 것:

- Claude adaptation
- OpenCode adapter
- internal runtime adapter
- provider별 bootstrap 차이
- tool mapping overlay

완료 조건:

- 이 단계는 현재 active scope가 아니다.
- 필요 시 별도 작업 흐름이나 후속 저장소/브랜치에서 진행한다.

### M8. later expansion

목적: 안정화된 커널 위에 확장 기능을 순차적으로 올린다.

이 단계에서 검토할 것:

- `subagents` 실행 모드
- `team` 런타임
- browser/reviewer evidence
- run history와 경량 메모리

완료 조건:

- 확장 기능이 커널 계약을 침범하지 않는다.
- 각 확장은 독립적으로 켜고 끌 수 있다.
- 새 기능이 들어와도 `v0`의 의미가 흐려지지 않는다.

## 단계 의존성

```text
M1 계약 고정
  -> M2 실행 흐름
  -> M3 최소 bootstrap/intake
  -> M4 Codex workflow surfaces와 handoff
  -> M5 Codex execute hardening
  -> M6 optional Codex runtime refinement
  -> M7 out-of-scope adapters
  -> M8 later expansion
```

이 순서를 바꾸지 않는다.
특히 `adapter`, `team`, `subagents` 같은 기능은 `v0` 계약이 안정되기 전에는 앞당기지 않는다.

## 단계별 산출물

- `M1`
  상태 계약 문서, plan/evidence 스키마, 결정 규칙
- `M2`
  상태 전이표, inner loop 흐름, outer flow 연결
- `M3`
  최소 진입점, 작업 분류 규칙, 실행 의도 기록, 템플릿 진입 규칙
- `M4`
  Codex workflow surfaces, handoff contract, execution intent 규칙
- `M5`
  execute hardening checklist, verify/decide/retry/state gap 검증
- `M6`
  optional Codex runtime refinement, installer/doctor/state 보강
- `M7`
  out-of-scope provider adapters
- `M8`
  확장 기능 선택지와 활성화 조건

## 구현 판단

이 프로젝트는 처음부터 큰 런타임을 만들기보다, 먼저 커널을 작게 고정하는 쪽이 맞다.

따라서 실제 구현 우선순위는 다음과 같다.

1. 상태 계약을 고정한다.
2. 실행 흐름을 연결한다.
3. 최소 진입점을 만든다.
4. Codex workflow surfaces를 먼저 굳힌다.
5. `execute`를 실제로 하드닝한다.
6. 필요할 때만 Codex runtime/support를 추가 보강한다.
7. 다른 provider adaptation은 현재 범위 밖으로 둔다.
8. 마지막에 확장을 넓힌다.
