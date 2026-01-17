# Story 2.1: Toll Payment System (Economy)

Status: review

---

## Story

**사용자(플레이어)로서**,
상대방 땅에 도착했을 때 자동으로 통행료를 지불하고 싶습니다.
**그래야** 자산의 순환이 일어나기 때문입니다.

## Acceptance Criteria

1. **Given** 플레이어 A가 플레이어 B의 땅에 도착하고
   **And** 플레이어 A에게 충분한 현금이 있을 때
   **When** 통행료 계산이 실행되면
   **Then** 플레이어 A의 현금이 통행료만큼 감소해야 한다.

2. **And** 플레이어 B의 현금이 통행료만큼 증가해야 한다.

---

## Tasks / Subtasks

- [x] **Task 1: payToll 리듀서 구현**

  - [x] 1.1. 타인 소유 땅 확인
  - [x] 1.2. baseToll 기반 통행료 계산
  - [x] 1.3. 건물 배수 적용 (별장x2, 빌딩x3, 호텔x4)
  - [x] 1.4. 지불자 현금 차감, 소유자 현금 증가

- [x] **Task 2: 테스트 작성**
  - [x] 2.1. `tests/core/tollPayment.test.ts` 생성
  - [x] 2.2. 6개 테스트 통과

---

## Dev Notes

### 통행료 계산 (스펙 준수)

`rentLevels: [대지, 별장1, 별장2, 빌딩, 호텔]` 배열에서 직접 조회

```typescript
// 건물 단계: 0=대지, 1=별장1, 2=별장2, 3=빌딩, 4=호텔
toll = tile.rentLevels[buildingLevel];
```

예시 (타이베이):
| 단계 | rentLevels | 통행료 |
| :--- | :--- | :--- |
| 대지 | [0] | 2,000원 |
| 별장1 | [1] | 10,000원 |
| 별장2 | [2] | 30,000원 |
| 빌딩 | [3] | 90,000원 |
| 호텔 | [4] | 250,000원 |

---

## Dev Agent Record

### Agent Model Used

Gemini 2.5 Pro (Antigravity)

### Completion Notes List

- ✅ `payToll` 리듀서 구현
- ✅ 건물 배수 로직 구현
- ✅ 6개 테스트 전체 통과 (총 84개)

### Changed File List

- `src/core/state/gameSlice.ts` [MODIFIED] - payToll 리듀서 추가
- `tests/core/tollPayment.test.ts` [NEW]
