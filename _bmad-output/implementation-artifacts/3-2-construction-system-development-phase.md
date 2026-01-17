# Story 3.2: Construction System (Development Phase) (Economy)

Status: review

---

## Story

**사용자(플레이어)로서**,
개발 단계(Development Phase) 동안 내 땅에 건물(별장/빌딩/호텔)을 짓고 싶습니다.
**그래야** 통행료 수입을 극대화할 수 있기 때문입니다.

## Acceptance Criteria

1. **Given** 게임이 "Development" 페이즈이고 본인 소유의 도시 칸에 도착했을 때
   **When** 건물 타입을 선택하여 건설 액션을 디스패치하면
   **Then** 플레이어 현금이 건설 비용만큼 감소해야 한다.

2. **And** 타일의 건물 상태가 업데이트되어야 한다 (별장 최대 2채, 빌딩 최대 1채, 호텔 최대 1채).

3. **And** 통행료 계산 공식에 새 건물이 반영되어야 한다.

---

## Tasks / Subtasks

- [x] **Task 1: buildBuilding 리듀서**

  - [x] 1.1. DEVELOPMENT 페이즈 체크
  - [x] 1.2. 건물 제한 확인 (villa:2, building:1, hotel:1)
  - [x] 1.3. 비용 계산 및 차감
  - [x] 1.4. 타일 건물 상태 업데이트

- [x] **Task 2: 테스트**
  - [x] 2.1. 5개 테스트 통과

---

## Dev Notes

### 건물 비용

| 건물 |         가격 배수 |
| :--- | ----------------: |
| 별장 | buildingPrice × 1 |
| 빌딩 | buildingPrice × 3 |
| 호텔 | buildingPrice × 5 |

### 건물 제한

| 건물 | 최대 개수 |
| :--- | --------: |
| 별장 |         2 |
| 빌딩 |         1 |
| 호텔 |         1 |

---

## Dev Agent Record

### Agent Model Used

Gemini 2.5 Pro (Antigravity)

### Completion Notes List

- ✅ `buildBuilding` 리듀서 추가
- ✅ 5개 테스트 전체 통과 (총 115개)

### Changed File List

- `src/core/state/gameSlice.ts` [MODIFIED] - buildBuilding 리듀서 추가
- `tests/core/construction.test.ts` [NEW]
