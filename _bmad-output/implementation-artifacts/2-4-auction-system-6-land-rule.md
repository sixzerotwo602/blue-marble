# Story 2.4: Auction System (6 Land Rule) (Mechanic)

Status: review

---

## Story

**사용자(시스템)로서**,
빈 땅이 6개 이하로 남았을 때 강제 경매를 발동하고 싶습니다.
**그래야** 게임 진행 속도를 높일 수 있기 때문입니다.

## Acceptance Criteria

1. **Given** 빈 땅이 7개 남아있을 때
   **When** 플레이어가 7번째 마지막 땅을 구매하여 (6개가 남으면)
   **Then** 게임 상태가 "AuctionPhase"로 전환되어야 한다.

2. **And** 남은 6개의 땅이 차례대로 경매에 부쳐져야 한다.

---

## Tasks / Subtasks

- [x] **Task 1: checkAuctionTrigger 리듀서**

  - [x] 1.1. 빈 city 타일 개수 확인
  - [x] 1.2. 6개 이하면 AUCTION 전환
  - [x] 1.3. 0개면 DEVELOPMENT 전환

- [x] **Task 2: startAuction 리듀서**

  - [x] 2.1. currentAuction 초기화
  - [x] 2.2. 시작 입찰가 = landPrice

- [x] **Task 3: placeBid 리듀서**

  - [x] 3.1. 입찰가 검증
  - [x] 3.2. highestBidderId 업데이트

- [x] **Task 4: passAuction 리듀서**

  - [x] 4.1. passedPlayers 추가

- [x] **Task 5: completeAuction 리듀서**

  - [x] 5.1. 낙찰자에게 소유권 이전
  - [x] 5.2. 낙찰 금액 차감
  - [x] 5.3. currentAuction 초기화

- [x] **Task 6: 테스트**
  - [x] 6.1. 7개 테스트 통과

---

## Dev Notes

### 경매 흐름

```
checkAuctionTrigger → phase=AUCTION
    ↓
startAuction(tileId) → currentAuction 초기화
    ↓
placeBid / passAuction (반복)
    ↓
completeAuction → 낙찰자에게 소유권 이전
```

---

## Dev Agent Record

### Agent Model Used

Gemini 2.5 Pro (Antigravity)

### Completion Notes List

- ✅ `checkAuctionTrigger` 리듀서 추가
- ✅ `startAuction` 리듀서 추가
- ✅ `placeBid` 리듀서 추가
- ✅ `passAuction` 리듀서 추가
- ✅ `completeAuction` 리듀서 추가
- ✅ GameState에 currentAuction 필드 추가
- ✅ 7개 테스트 전체 통과 (총 106개)

### Changed File List

- `src/core/model/GameState.ts` [MODIFIED] - currentAuction 필드 추가
- `src/core/state/gameSlice.ts` [MODIFIED] - 5 reducers 추가
- `tests/core/auction.test.ts` [NEW]
