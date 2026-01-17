# Story 1.4: Token Movement System (Logic)

Status: review

---

## Story

**사용자(플레이어)로서**,
주사위 합계만큼 내 말을 전진시키고 싶습니다.
**그래야** 보드 위를 이동할 수 있기 때문입니다.

## Acceptance Criteria

1. **Given** 플레이어가 인덱스 0(시작)에 있고 주사위가 5가 나왔을 때
   **When** Move 액션이 디스패치되면
   **Then** 플레이어 위치가 5로 업데이트되어야 한다.

2. **And** 위치가 39를 초과하면 0부터 다시 순환(modulo 40)해야 하며, 출발지를 통과하면 월급을 지급받아야 한다.

---

## Tasks / Subtasks

- [x] **Task 1: 이동 로직 구현**

  - [x] 1.1. `src/core/logic/movement.ts` 파일 생성
  - [x] 1.2. `calculateMove()` 함수 구현 (modulo 40)
  - [x] 1.3. 출발지 통과 감지 및 월급 계산

- [x] **Task 2: gameSlice에 movePlayer 리듀서 추가**

  - [x] 2.1. `movePlayer` 리듀서 추가
  - [x] 2.2. 위치 업데이트 및 월급 지급 로직
  - [x] 2.3. FSM 상태 업데이트 (MOVING)

- [x] **Task 3: 테스트 작성**
  - [x] 3.1. `tests/core/movement.test.ts` 생성
  - [x] 3.2. 기본 이동 테스트
  - [x] 3.3. 순환 이동 (modulo 40) 테스트
  - [x] 3.4. 월급 지급 테스트

---

## Dev Notes

### 월급 금액

- `SALARY_AMOUNT = 200,000원`

### movePlayer 액션

```typescript
dispatch(movePlayer({ playerId: "p1", steps: 5 }));
// 플레이어 위치 업데이트 + 출발지 통과 시 월급 지급
```

---

## Dev Agent Record

### Agent Model Used

Gemini 2.5 Pro (Antigravity)

### Completion Notes List

- ✅ `calculateMove()` 함수 구현 (modulo 40, passedStart 감지)
- ✅ `movePlayer` 리듀서 추가 (자동 월급 지급)
- ✅ 11개 테스트 전체 통과

### Changed File List

- `src/core/logic/movement.ts` [NEW]
- `src/core/logic/index.ts` [MODIFIED]
- `src/core/state/gameSlice.ts` [MODIFIED] - movePlayer 추가
- `tests/core/movement.test.ts` [NEW]
