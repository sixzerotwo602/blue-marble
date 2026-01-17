# Story 3.3: Complex Golden Keys (Event)

Status: review

---

## Story

**사용자(플레이어)로서**,
복잡한 황금열쇠 효과(예: 카드 보관, 할인 등)를 사용하고 싶습니다.
**그래야** 전략적으로 황금열쇠를 활용할 수 있기 때문입니다.

## Acceptance Criteria

1. **Given** "무인도 탈출권" 같은 우대권을 뽑았을 때
   **When** 뽑기(Draw) 이벤트가 발생하면
   **Then** 카드가 즉시 실행되지 않고 플레이어 인벤토리에 추가되어야 한다.

2. **And** 나중에 무인도에 갇혔을 때 "카드 사용"을 선택할 수 있어야 한다.

---

## Tasks / Subtasks

- [x] **Task 1: heldCards 필드 추가**

  - [x] 1.1. Player 인터페이스에 heldCards 추가
  - [x] 1.2. createPlayer에 초기값 설정

- [x] **Task 2: giveCard 리듀서**

  - [x] 2.1. 카드를 heldCards에 추가

- [x] **Task 3: useCard 리듀서**

  - [x] 3.1. 카드 보유 확인
  - [x] 3.2. 카드 제거
  - [x] 3.3. ISLAND_ESCAPE 효과 적용 (jailTurnsRemaining = 0)

- [x] **Task 4: 테스트**
  - [x] 4.1. 4개 테스트 통과

---

## Dev Notes

### 지원 카드 타입

| 카드          | 효과                           |
| :------------ | :----------------------------- |
| ISLAND_ESCAPE | 무인도 즉시 탈출               |
| TOLL_DISCOUNT | 통행료 할인 (payToll에서 처리) |

---

## Dev Agent Record

### Agent Model Used

Gemini 2.5 Pro (Antigravity)

### Completion Notes List

- ✅ `heldCards` 필드 Player에 추가
- ✅ `giveCard` 리듀서 추가
- ✅ `useCard` 리듀서 추가
- ✅ 4개 테스트 전체 통과 (총 119개)

### Changed File List

- `src/core/model/Player.ts` [MODIFIED] - heldCards 필드 추가
- `src/core/state/gameSlice.ts` [MODIFIED] - giveCard, useCard 리듀서 추가
- `tests/core/goldenKeys.test.ts` [NEW]
