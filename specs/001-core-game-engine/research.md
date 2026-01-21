# Research: 블루마블 코어 게임 엔진

**Feature**: 001-core-game-engine  
**Date**: 2026-01-21  
**Status**: Complete

## 개요

블루마블 디지털 보드게임 엔진 구현을 위한 기술 조사 및 설계 결정 문서.

---

## 1. 주사위 시스템 구현

### Decision
2개의 6면 주사위를 JavaScript `Math.random()` 기반으로 구현.

### Rationale
- 순수 함수로 구현하여 테스트 용이
- 시드(seed) 주입 가능하도록 설계하여 재현 가능한 테스트 지원

### Alternatives Considered
| 대안 | 기각 사유 |
|------|-----------|
| crypto.randomInt | 과도한 보안 수준, 게임에 불필요 |
| 외부 난수 라이브러리 | 의존성 최소화 원칙 위반 |

---

## 2. 전반전/후반전 페이즈 전환 로직

### Decision
은행 보유 증서 수를 기준으로 페이즈 전환. `GameState.bankDeedCount <= 6` 시 경매 페이즈 트리거.

### Rationale
- `rulemd/board-data.ts`의 `TOTAL_DEEDS = 29` 활용
- 단순 숫자 비교로 페이즈 전환 조건 판단

### State Machine
```
┌─────────────┐      은행 증서 ≤ 6        ┌─────────────┐
│  FIRST_HALF │ ──────────────────────── │   AUCTION   │
│  (전반전)   │                          │   (경매)    │
└─────────────┘                          └──────┬──────┘
                                                │
                                                │ 경매 완료
                                                ▼
                                         ┌─────────────┐
                                         │ SECOND_HALF │
                                         │  (후반전)   │
                                         └─────────────┘
```

---

## 3. 라운드 로빈 경매 구현

### Decision
플레이어 순환 입찰 방식. 폴드한 플레이어는 해당 증서 경매에서 영구 이탈.

### Algorithm
```
for each 증서 in 남은_증서 (액면가 오름차순):
    현재가 = 시작가
    활성_입찰자 = 모든_플레이어
    while len(활성_입찰자) > 1:
        for 플레이어 in 활성_입찰자:
            선택 = 입찰 or 폴드
            if 폴드:
                활성_입찰자.remove(플레이어)
            else:
                현재가 += 호가 (10,000원)
    낙찰(활성_입찰자[0], 증서, 현재가)
```

### Rationale
- 전원 폴드 시 유찰 처리 (소유주 없음 상태로 후반전 진입)
- 최소 호가 10,000원은 `rulemd/` 상수로 정의

---

## 4. 건물 건설 시스템

### Decision
건설 순서 제약 없음. 자금만 있으면 별장/빌딩/호텔 조합 자유.

### Rationale
- Spec에 명시: "건설 순서 제약이 없으며 자금만 있으면 원하는 조합으로 즉시 건설 가능"
- 슬롯 제한만 적용: 별장 2개, 빌딩 1개, 호텔 1개

### Building Slot Model
```typescript
interface BuildingSlots {
  villas: 0 | 1 | 2;  // 별장 (최대 2)
  building: boolean;   // 빌딩 (최대 1)
  hotel: boolean;      // 호텔 (최대 1)
}
```

---

## 5. 통행료 계산 로직

### Decision
`rulemd/board-data.ts`의 `rentLevels` 배열 활용.

### Rent Level Index
| 인덱스 | 상태 | 예시 (타이베이) |
|--------|------|-----------------|
| 0 | 대지 (빈 땅) | 2,000원 |
| 1 | 별장 1개 | 10,000원 |
| 2 | 별장 2개 | 30,000원 |
| 3 | 빌딩 | 90,000원 |
| 4 | 호텔 | 250,000원 |

### Calculation Logic
```typescript
function calculateRent(tile: BoardTileData, slots: BuildingSlots): number {
  if (slots.hotel) return tile.rentLevels[4];
  if (slots.building) return tile.rentLevels[3];
  if (slots.villas === 2) return tile.rentLevels[2];
  if (slots.villas === 1) return tile.rentLevels[1];
  return tile.rentLevels[0];
}
```

**Note**: 건물 조합에 따른 통행료는 가장 높은 건물 기준. 별장+빌딩 조합 시 빌딩 통행료 적용.

---

## 6. 황금열쇠 카드 덱 관리

### Decision
셔플된 덱에서 순차적으로 뽑기. 소진 시 사용된 카드를 다시 셔플.

### Implementation
```typescript
class GoldenKeyDeck {
  private deck: GoldenKeyCardData[];
  private discardPile: GoldenKeyCardData[];

  draw(): GoldenKeyCardData {
    if (this.deck.length === 0) {
      this.deck = shuffle(this.discardPile);
      this.discardPile = [];
    }
    const card = this.deck.pop()!;
    if (!card.canHold) {
      this.discardPile.push(card);
    }
    return card;
  }
}
```

### Card Quantity Handling
- `quantity: 2` 속성이 있는 카드는 덱 초기화 시 2장 추가
- 총 카드 수: 27종 + 복수 카드 4종 = 31장

---

## 7. 파산 처리 로직

### Decision
채권자 유형에 따라 자산 이전 방식 분기.

### Flow
```
┌─────────────────────────────────────────────────┐
│                  파산 발생                       │
└─────────────────────┬───────────────────────────┘
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
   [플레이어 채권]           [은행 채권]
          │                       │
          ▼                       ▼
  모든 자산 → 채권자       모든 자산 → 은행
  (건물 포함 소유권 이전)   (소유주 없음 상태)
          │                       │
          └───────────┬───────────┘
                      ▼
               게임에서 제거
```

### Rationale
- Constitution IV 준수: "파산 발생 시 자산 이전은 중단 없이 즉시 처리"
- 은행 파산 시 건물은 철거되고 빈 땅 상태로 초기화

---

## 8. AI 전략 설계

### Decision
Strategy 패턴으로 3가지 AI 난이도 구현.

### Strategy Comparison
| 전략 | 구매 로직 | 건설 로직 | 경매 로직 |
|------|-----------|-----------|-----------|
| Random | 50% 확률 구매 | 임의 건설 | 임의 입찰/폴드 |
| Basic | 자금 50% 이하일 때만 패스 | 가성비 높은 건물 우선 | 액면가 150%까지 입찰 |
| Smart | 색상 그룹 완성 우선 | ROI 계산 기반 선택 | 전략적 폴드 |

### Interface
```typescript
interface AIStrategy {
  decidePurchase(state: GameState, player: Player, deed: Deed): boolean;
  decideBuild(state: GameState, player: Player, options: BuildOption[]): BuildOption | null;
  decideBid(state: GameState, player: Player, currentBid: number, deed: Deed): number | 'fold';
}
```

---

## 9. 게임 상태 저장/불러오기

### Decision
JSON 파일로 전체 GameState 직렬화.

### File Structure
```json
{
  "version": "1.0.0",
  "savedAt": "2026-01-21T14:30:00Z",
  "gameState": {
    "phase": "SECOND_HALF",
    "currentPlayerIndex": 2,
    "turnNumber": 45,
    "players": [...],
    "board": {...},
    "welfareFund": 500000,
    "goldenKeyDeck": {...}
  }
}
```

### Rationale
- 버전 필드로 마이그레이션 호환성 확보
- 저장 시점 기록으로 복원 시 확인 가능

---

## 10. CLI 렌더링 전략

### Decision
ANSI 색상 코드를 활용한 터미널 출력.

### Layout
```
┌────────────────────────────────────────────────┐
│  [턴 37] 플레이어 2 (김철수) - 서울 (39번)      │
│  현금: 1,250,000원 | 자산: 3,500,000원         │
├────────────────────────────────────────────────┤
│  1. 주사위 굴리기                              │
│  2. 보유 자산 보기                             │
│  3. 게임 저장                                  │
│  0. 턴 종료                                    │
└────────────────────────────────────────────────┘
```

### Rationale
- Windows CMD에서도 ANSI 지원 (Windows 10+)
- 복잡한 UI 라이브러리 없이 구현 가능

---

## 결론

모든 기술적 불확실성이 해소되었으며, Phase 1 설계로 진행 가능.

**핵심 설계 결정**:
1. 순수 TypeScript + Node.js, 외부 의존성 없음
2. `rulemd/` 데이터 파일 재사용으로 데이터 중복 방지
3. Strategy 패턴으로 AI 확장성 확보
4. JSON 기반 상태 저장으로 테스트 재현성 보장
