# Story 5.1: Dashboard View (UX)

Status: review

---

## Story

**사용자(플레이어)로서**,
구조화된 텍스트 레이아웃으로 보드와 플레이어 상태를 보고 싶습니다.
**그래야** 게임 진행 상황을 명확히 이해할 수 있기 때문입니다.

## Acceptance Criteria

1. **Given** 게임 상태가 업데이트될 때
   **When** 화면이 렌더링되면
   **Then** 콘솔을 지워야 한다(Clear).

2. **And** 40칸 보드를 그려야 한다(ASCII/박스 드로잉).

3. **And** 플레이어 돈, 자산, 위치를 사이드 패널에 표시해야 한다.

---

## Tasks / Subtasks

- [x] **Task 1: TUI 모듈 생성**

  - [x] 1.1. `src/core/tui/dashboard.ts` 생성
  - [x] 1.2. Box drawing 문자 정의
  - [x] 1.3. clearConsole() 함수 구현

- [x] **Task 2: 보드 렌더링**

  - [x] 2.1. renderBoard() 함수 구현
  - [x] 2.2. 상단/중간/하단 행 렌더링
  - [x] 2.3. 플레이어 마커 표시

- [x] **Task 3: 플레이어 패널**

  - [x] 3.1. renderPlayerPanel() 함수 구현
  - [x] 3.2. 현재 플레이어 마커 (▶)
  - [x] 3.3. 돈, 자산, 위치 표시

- [x] **Task 4: 테스트**
  - [x] 4.1. 6개 테스트 통과

---

## Dev Notes

### 표시 정보

| 항목          | 형식      |
| :------------ | :-------- |
| 플레이어 마커 | ①②③④      |
| 현재 플레이어 | ▶         |
| 돈            | 만원 단위 |
| 무인도        | ⛓️        |

---

## Dev Agent Record

### Agent Model Used

Gemini 2.5 Pro (Antigravity)

### Completion Notes List

- ✅ `src/core/tui/dashboard.ts` 생성
- ✅ 40칸 보드 ASCII 렌더링
- ✅ 사이드 패널 렌더링
- ✅ 6개 테스트 전체 통과 (총 137개)

### Changed File List

- `src/core/tui/dashboard.ts` [NEW]
- `src/core/tui/index.ts` [NEW]
- `tests/core/dashboard.test.ts` [NEW]
