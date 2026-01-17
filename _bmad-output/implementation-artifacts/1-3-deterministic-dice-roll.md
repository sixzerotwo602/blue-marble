# Story 1.3: Deterministic Dice Roll (Logic)

Status: review

---

## Story

**사용자(플레이어/테스터)로서**,
시드(Seed)를 사용하여 주사위 두 개 굴리고 싶습니다.
**그래야** 디버깅을 위해 정확한 게임 시나리오를 재현할 수 있기 때문입니다.

## Acceptance Criteria

1. **Given** "TEST_SEED_1"이라는 시드가 주어졌을 때
   **When** 주사위를 여러 번 굴리면
   **Then** 매번 동일한 숫자 시퀀스가 나와야 한다.

2. **And** 두 주사위 값이 같으면 "Double" 플래그가 true여야 한다.

---

## Tasks / Subtasks

- [x] **Task 1: DiceRoller 클래스 생성**

  - [x] 1.1. `src/core/logic/diceRoller.ts` 파일 생성
  - [x] 1.2. Mulberry32 PRNG 구현
  - [x] 1.3. cyrb128 시드 해시 함수 구현
  - [x] 1.4. DiceRoller 클래스 구현

- [x] **Task 2: 테스트 작성**
  - [x] 2.1. `tests/core/diceRoller.test.ts` 생성
  - [x] 2.2. 동일 시드 동일 시퀀스 테스트
  - [x] 2.3. 더블 플래그 테스트
  - [x] 2.4. 값 범위 테스트 (1-6)

---

## Dev Notes

### DiceRoller API

```typescript
const roller = new DiceRoller("SEED");
const result = roller.roll();
// { dice1: 3, dice2: 5, sum: 8, isDouble: false }
```

### PRNG Algorithm

- **cyrb128**: 문자열 시드를 128비트 해시로 변환
- **Mulberry32**: 빠르고 품질 좋은 32비트 PRNG

---

## Dev Agent Record

### Agent Model Used

Gemini 2.5 Pro (Antigravity)

### Completion Notes List

- ✅ 시드 기반 결정론적 주사위 구현
- ✅ DiceRoller 클래스, rollDiceWithSeed, rollDiceRandom 함수
- ✅ 더블 플래그 자동 계산
- ✅ 11개 테스트 전체 통과

### Changed File List

- `src/core/logic/diceRoller.ts` [NEW]
- `src/core/logic/index.ts` [NEW]
- `tests/core/diceRoller.test.ts` [NEW]
