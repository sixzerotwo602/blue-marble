# Story 1.7: Special Tile Mechanics (Rules)

Status: review

---

## Story

**사용자(플레이어)로서**,
특수 칸(무인도, 우주여행, 사회복지기금, 황금열쇠)에 도착했을 때 특별한 규칙이 적용되길 원합니다.
**그래야** 기본 규칙에 따라 보드가 올바르게 동작하기 때문입니다.

## Acceptance Criteria

1. **Given** 특정 특수 칸에 도착했을 때
   **When** 도착 이벤트가 처리되면
   **Then** "무인도"는 플레이어 상태를 잠금(3턴) 처리해야 한다.

2. **And** "우주여행"은 '다음 턴 원하는 곳 이동' 상태를 설정해야 한다.

3. **And** "사회복지기금"은 기부 또는 수령 액션을 트리거해야 한다.

4. **And** "황금열쇠"는 덱에서 카드를 한 장 뽑아야 한다. (카드 로직은 추후 구현)

---

## Tasks / Subtasks

- [x] **Task 1: 특수 타일 로직 모듈 생성**

  - [x] 1.1. `src/core/logic/specialTiles.ts` 생성
  - [x] 1.2. 타일 타입 감지 함수 (isIslandTile, isSpaceTravelTile 등)

- [x] **Task 2: 무인도 리듀서**

  - [x] 2.1. `sendToIsland` 리듀서 추가
  - [x] 2.2. `tryEscapeIsland` 리듀서 추가

- [x] **Task 3: 우주여행 리듀서**

  - [x] 3.1. `setSpaceTravelReady` 리듀서 추가
  - [x] 3.2. `spaceTravelTo` 리듀서 추가
  - [x] 3.3. Player에 `canChooseDestination` 필드 추가

- [x] **Task 4: 사회복지기금 리듀서**

  - [x] 4.1. `handleSocialFund` 리듀서 추가

- [x] **Task 5: 테스트 작성**
  - [x] 5.1. `tests/core/specialTiles.test.ts` 생성
  - [x] 5.2. 12개 테스트 통과

---

## Dev Notes

### 특수 타일 위치

| 타일         | 인덱스                       |
| :----------- | :--------------------------- |
| 시작         | 0                            |
| 무인도       | 10                           |
| 사회복지기금 | 20                           |
| 우주여행     | 30                           |
| 황금열쇠     | 2, 7, 12, 17, 22, 27, 32, 37 |

---

## Dev Agent Record

### Agent Model Used

Gemini 2.5 Pro (Antigravity)

### Completion Notes List

- ✅ `specialTiles.ts` 로직 모듈 생성
- ✅ 5개 특수 타일 리듀서 추가
- ✅ Player 인터페이스에 `canChooseDestination` 필드 추가
- ✅ 12개 테스트 전체 통과 (총 78개)

### Changed File List

- `src/core/logic/specialTiles.ts` [NEW]
- `src/core/logic/index.ts` [MODIFIED]
- `src/core/model/Player.ts` [MODIFIED] - canChooseDestination 추가
- `src/core/state/gameSlice.ts` [MODIFIED] - 5 reducers 추가
- `tests/core/specialTiles.test.ts` [NEW]
