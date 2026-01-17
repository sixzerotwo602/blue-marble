# Story 1.6: Turn Management (Flow)

Status: review

---

## Story

**사용자(시스템)로서**,
다음 플레이어에게 턴을 넘기고 싶습니다.
**그래야** 게임 루프가 진행되기 때문입니다.

## Acceptance Criteria

1. **Given** 플레이어 1이 행동을 마쳤을 때
   **When** EndTurn 액션이 디스패치되면
   **Then** 현재 플레이어 인덱스가 플레이어 2로 업데이트되어야 한다.

2. **And** 만약 플레이어 1이 더블을 쳤다면, 여전히 플레이어 1의 턴이어야 한다(추가 턴).

---

## Tasks / Subtasks

- [x] **Task 1: endTurn 리듀서 검증**

  - [x] 1.1. 기본 플레이어 전환 로직 확인 (Story 1.1에서 이미 구현)
  - [x] 1.2. 더블 시 추가 턴 로직 확인
  - [x] 1.3. 턴 순환 로직 확인 (마지막→첫번째)

- [x] **Task 2: 테스트 작성**
  - [x] 2.1. `tests/core/turnManagement.test.ts` 생성
  - [x] 2.2. 플레이어 전환 테스트
  - [x] 2.3. 더블 시 추가 턴 테스트
  - [x] 2.4. 상태 초기화 테스트

---

## Dev Notes

### endTurn 동작

1. 더블이 아니면 다음 플레이어로 전환
2. 더블이면 같은 플레이어 유지 (추가 턴)
3. lastDiceResult 초기화
4. turnPhase를 TURN_START로 복귀

---

## Dev Agent Record

### Agent Model Used

Gemini 2.5 Pro (Antigravity)

### Completion Notes List

- ✅ `endTurn` 리듀서 이미 Story 1.1에서 구현됨
- ✅ 더블 시 추가 턴 로직 동작 확인
- ✅ 9개 턴 관리 테스트 전체 통과

### Changed File List

- `tests/core/turnManagement.test.ts` [NEW]
