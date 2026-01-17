# Story 1.5: Vacant Land Purchase (Economy)

Status: review

---

## Story

**사용자(플레이어)로서**,
주인이 없는 땅에 도착했을 때 그 땅을 구매하고 싶습니다.
**그래야** 자산을 소유할 수 있기 때문입니다.

## Acceptance Criteria

1. **Given** 주인이 없는 도시 칸에 도착했을 때
   **When** Buy 액션이 디스패치되면
   **Then** 플레이어의 현금이 땅 가격만큼 감소해야 한다.

2. **And** 해당 타일의 소유자가 플레이어 ID로 업데이트되어야 한다.

3. **And** 플레이어 자금이 부족하면 실패해야 한다.

---

## Tasks / Subtasks

- [x] **Task 1: buyLand 리듀서 추가**

  - [x] 1.1. 빈 땅 구매 로직 구현
  - [x] 1.2. 자금 검증 로직
  - [x] 1.3. 소유권 이전 로직
  - [x] 1.4. 도시 타일 타입 검증

- [x] **Task 2: 테스트 작성**
  - [x] 2.1. `tests/core/buyLand.test.ts` 생성
  - [x] 2.2. 현금 차감 테스트
  - [x] 2.3. 소유권 업데이트 테스트
  - [x] 2.4. 자금 부족 시 실패 테스트

---

## Dev Notes

### buyLand 액션

```typescript
dispatch(buyLand({ playerId: "p1", tileId: 1 }));
// → 자금 차감, 소유권 이전
```

### 검증 조건

- 타일이 도시(`city`) 타입이어야 함
- 타일에 기존 소유자가 없어야 함
- 플레이어 자금이 landPrice 이상이어야 함

---

## Dev Agent Record

### Agent Model Used

Gemini 2.5 Pro (Antigravity)

### Completion Notes List

- ✅ `buyLand` 리듀서 추가 (gameSlice.ts)
- ✅ 자금 검증, 도시 타입 검증, 소유권 이전 로직
- ✅ 9개 테스트 전체 통과

### Changed File List

- `src/core/state/gameSlice.ts` [MODIFIED] - buyLand 추가
- `tests/core/buyLand.test.ts` [NEW]
