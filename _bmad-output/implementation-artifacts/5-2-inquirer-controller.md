# Story 5.2: Inquirer Controller (UX)

Status: review

---

## Story

**사용자(플레이어)로서**,
키보드 방향키나 프롬프트를 사용하여 게임을 제어하고 싶습니다.
**그래야** JSON 명령어를 수동으로 입력하지 않아도 되기 때문입니다.

## Acceptance Criteria

1. **Given** 인간 플레이어의 턴일 때
   **When** 액션이 필요하면
   **Then** 시스템은 `inquirer` 같은 라이브러리를 사용해 옵션(주사위/구매/종료)을 제시해야 한다.

2. **And** 선택된 옵션은 올바른 Redux 액션을 디스패치해야 한다.

---

## Tasks / Subtasks

- [x] **Task 1: Input Controller 모듈 생성**

  - [x] 1.1. `src/core/tui/inputController.ts` 생성
  - [x] 1.2. MenuOption 인터페이스 정의
  - [x] 1.3. getTurnStartOptions() 구현

- [x] **Task 2: 메뉴 옵션 생성**

  - [x] 2.1. getLandedOptions() 구현
  - [x] 2.2. getAuctionOptions() 구현
  - [x] 2.3. getMenuOptions() 구현

- [x] **Task 3: 액션 매핑**

  - [x] 3.1. mapOptionToAction() 구현
  - [x] 3.2. renderMenu() 구현

- [x] **Task 4: 테스트**
  - [x] 4.1. 7개 테스트 통과

---

## Dev Notes

### 지원 액션

| 옵션            | Redux 액션         |
| :-------------- | :----------------- |
| BUY_LAND        | game/buyLand       |
| BUILD_VILLA     | game/buildBuilding |
| END_TURN        | game/endTurn       |
| USE_ESCAPE_CARD | game/useCard       |

---

## Dev Agent Record

### Agent Model Used

Gemini 2.5 Pro (Antigravity)

### Completion Notes List

- ✅ `src/core/tui/inputController.ts` 생성
- ✅ 메뉴 옵션 생성 함수 구현
- ✅ 옵션→액션 매핑 구현
- ✅ 7개 테스트 전체 통과 (총 144개)

### Changed File List

- `src/core/tui/inputController.ts` [NEW]
- `src/core/tui/index.ts` [MODIFIED]
- `tests/core/inputController.test.ts` [NEW]
