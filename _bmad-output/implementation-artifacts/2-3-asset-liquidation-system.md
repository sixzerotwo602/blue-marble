# Story 2.3: Asset Liquidation System (Economy)

Status: review

---

## Story

**사용자(플레이어)로서**,
현금이 부족할 때 내 건물이나 땅을 매각하고 싶습니다.
**그래야** 빚을 갚고 파산을 면할 수 있기 때문입니다.

## Acceptance Criteria

1. **Given** 현금이 부족하지만 부동산을 소유하고 있을 때
   **When** 매각(Liquidation) 모드가 발동되면
   **Then** 건물(100% 환불) 또는 땅(50% 환불)을 선택하여 매각할 수 있어야 한다.

2. **And** 매각 즉시 플레이어의 현금이 업데이트되어야 한다.

---

## Tasks / Subtasks

- [x] **Task 1: sellBuilding 리듀서**

  - [x] 1.1. 별장/빌딩/호텔 매각
  - [x] 1.2. 건물 가격 100% 환불

- [x] **Task 2: sellLand 리듀서**

  - [x] 2.1. 땅 50% 환불
  - [x] 2.2. 건물 100% 환불 (포함)
  - [x] 2.3. 타일 무주지 전환

- [x] **Task 3: 테스트**
  - [x] 3.1. 6개 테스트 통과

---

## Dev Notes

### 환불 공식

```
건물 매각: buildingPrice × 건물계수 (100%)
땅 매각:   landPrice × 0.5 + 건물환불 (100%)

건물계수: villa=1, building=3, hotel=5
```

---

## Dev Agent Record

### Agent Model Used

Gemini 2.5 Pro (Antigravity)

### Completion Notes List

- ✅ `sellBuilding` 리듀서 추가
- ✅ `sellLand` 리듀서 추가
- ✅ 6개 테스트 전체 통과 (총 99개)

### Changed File List

- `src/core/state/gameSlice.ts` [MODIFIED] - 2 reducers 추가
- `tests/core/liquidation.test.ts` [NEW]
