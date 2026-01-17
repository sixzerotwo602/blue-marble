# Story 3.1: Phase System Implementation (Engine)

Status: review

---

## Story

**사용자(시스템)로서**,
게임 페이즈(초반/경매/개발)를 관리하고 싶습니다.
**그래야** 게임 진행도에 따라 규칙을 동적으로 변경할 수 있기 때문입니다.

## Acceptance Criteria

1. **Given** 빈 땅의 개수가 6개로 떨어졌을 때
   **When** 구매 이벤트가 발생하면
   **Then** 게임 페이즈가 "Early"에서 "Auction"으로 전환되어야 한다.

2. **And** 모든 땅이 판매된 후에는 "Development"로 전환되어야 한다.

---

## Tasks / Subtasks

- [x] **Task 1: Phase Transitions**

  - [x] 1.1. EARLY → AUCTION (6개 이하)
  - [x] 1.2. AUCTION → DEVELOPMENT (0개)

- [x] **Task 2: 테스트**
  - [x] 2.1. 4개 테스트 통과

---

## Dev Notes

### Phase Flow

```
EARLY (빈 땅 > 6)
    ↓ checkAuctionTrigger()
AUCTION (빈 땅 ≤ 6)
    ↓ checkAuctionTrigger()
DEVELOPMENT (빈 땅 = 0)
```

> Note: `checkAuctionTrigger`는 Story 2.4에서 이미 구현됨

---

## Dev Agent Record

### Agent Model Used

Gemini 2.5 Pro (Antigravity)

### Completion Notes List

- ✅ Phase transition logic verified
- ✅ 4개 테스트 전체 통과 (총 110개)

### Changed File List

- `tests/core/phaseSystem.test.ts` [NEW]
