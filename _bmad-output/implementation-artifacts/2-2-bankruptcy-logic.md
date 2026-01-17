# Story 2.2: Bankruptcy Logic (System)

Status: review

---

## Story

**사용자(시스템)로서**,
플레이어가 지불 능력이 없을 때 파산을 선언하고 싶습니다.
**그래야** 해당 플레이어의 게임을 종료시킬 수 있기 때문입니다.

## Acceptance Criteria

1. **Given** 플레이어가 요구 금액을 지불할 수 없고
   **And** 처분 가능한 자산이 없을 때
   **When** 지불이 실패하면
   **Then** 플레이어 상태가 "파산"으로 설정되어야 한다.

2. **And** 남은 자산은 채권자(또는 은행)에게 양도되어야 한다.

---

## Tasks / Subtasks

- [x] **Task 1: declareBankruptcy 리듀서**

  - [x] 1.1. isBankrupt = true 설정
  - [x] 1.2. 채권자에게 현금/타일 양도
  - [x] 1.3. 은행에 반납 (무주지 전환)

- [x] **Task 2: checkPaymentAbility 리듀서**

  - [x] 2.1. 현금 지불 가능 확인
  - [x] 2.2. 자산 가치 계산 (땅 50%, 건물 100%)
  - [x] 2.3. LIQUIDATION/GAME_OVER 전환

- [x] **Task 3: 게임 종료 조건**

  - [x] 3.1. 1명 남으면 winnerId 설정
  - [x] 3.2. turnPhase = GAME_OVER

- [x] **Task 4: 테스트**
  - [x] 4.1. 9개 테스트 통과

---

## Dev Notes

### 파산 흐름

```
지불 요청 → checkPaymentAbility
    ├─ 현금 충분 → TURN_START
    ├─ 자산 있음 → LIQUIDATION (Story 2.3)
    └─ 자산 없음 → GAME_OVER → declareBankruptcy
```

---

## Dev Agent Record

### Agent Model Used

Gemini 2.5 Pro (Antigravity)

### Completion Notes List

- ✅ `declareBankruptcy` 리듀서 추가
- ✅ `checkPaymentAbility` 리듀서 추가
- ✅ 채권자/은행 양도 로직 구현
- ✅ 9개 테스트 전체 통과 (총 93개)

### Changed File List

- `src/core/state/gameSlice.ts` [MODIFIED] - 2 reducers 추가
- `tests/core/bankruptcy.test.ts` [NEW]
