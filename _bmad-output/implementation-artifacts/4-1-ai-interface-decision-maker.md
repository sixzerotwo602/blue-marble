# Story 4.1: AI Interface & Decision Maker (AI)

Status: review

---

## Story

**사용자(개발자)로서**,
게임 상태에 따라 결정을 내리는 AI 에이전트를 만들고 싶습니다.
**그래야** 컴퓨터와 대전하거나 시뮬레이션을 돌릴 수 있기 때문입니다.

## Acceptance Criteria

1. **Given** AI 플레이어의 턴일 때
   **When** 입력 요청이 들어오면
   **Then** AI는 상태(돈, 위치)를 분석해야 한다.

2. **And** 사람의 개입 없이 유효한 액션(Roll, Buy 등)을 반환해야 한다.

3. **And** 적어도 "Random"과 "Purchase-All(닥치고 구매)" 전략 모드를 지원해야 한다.

---

## Tasks / Subtasks

- [x] **Task 1: AI 모듈 생성**

  - [x] 1.1. `src/core/ai/aiAgent.ts` 생성
  - [x] 1.2. AIAction, AIStrategy, AIContext 타입 정의
  - [x] 1.3. AIAgent 인터페이스 정의

- [x] **Task 2: Random 전략**

  - [x] 2.1. createRandomAgent() 구현
  - [x] 2.2. 50% 확률로 구매/건설 결정

- [x] **Task 3: Purchase-All 전략**

  - [x] 3.1. createPurchaseAllAgent() 구현
  - [x] 3.2. 자금 있으면 무조건 구매
  - [x] 3.3. 호텔→빌딩→별장 순으로 건설

- [x] **Task 4: 테스트**
  - [x] 4.1. 7개 테스트 통과

---

## Dev Notes

### AI 전략 비교

| 전략         | 구매 확률 |   입찰 제한   |
| :----------- | :-------: | :-----------: |
| RANDOM       |    50%    |   50% 확률    |
| PURCHASE_ALL |   100%    | 자금 50% 이하 |

---

## Dev Agent Record

### Agent Model Used

Gemini 2.5 Pro (Antigravity)

### Completion Notes List

- ✅ `src/core/ai/aiAgent.ts` 생성
- ✅ Random 전략 구현
- ✅ Purchase-All 전략 구현
- ✅ 7개 테스트 전체 통과 (총 126개)

### Changed File List

- `src/core/ai/aiAgent.ts` [NEW]
- `src/core/ai/index.ts` [NEW]
- `tests/core/aiAgent.test.ts` [NEW]
