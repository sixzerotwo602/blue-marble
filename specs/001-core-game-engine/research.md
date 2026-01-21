# Research: 블루마블 디지털 보드게임

**Feature**: 블루마블 TypeScript CLI 게임  
**Date**: 2026-01-21  
**Status**: Complete

---

## 1. 기존 데이터 파일 분석

### 1.1 보드 데이터 (rulemd/board-data.ts)

**Decision**: 기존 파일을 src/core/data/로 이전하여 재사용

**분석 결과**:
- ✅ 40칸 보드 완전 정의됨
- ✅ 29종 씨앗증서 가격, 건물비용, 통행료 테이블 포함
- ✅ 특수 타일 인덱스 상수 정의 (START=0, ISLAND=10, FUND_RECEIVE=20, TRAVEL=30, FUND_DONATE=38)
- ✅ 황금열쇠 위치: [2, 5, 12, 16, 22, 32] (인덱스 2가 아닌 다른 위치)
- ✅ 탈것 위치: [15, 28, 33] (콩코드, 퀸엘리자베스, 컬럼비아)
- ✅ 건설 불가 부동산: [6, 25, 39] (제주도, 부산, 서울)
- ✅ 상수: SALARY=200,000, FUND_DONATE_AMOUNT=150,000, TRAVEL_FEE=200,000

**Rationale**: 이미 완전히 정의된 데이터를 재작성하는 것은 YAGNI 원칙 위반

### 1.2 황금열쇠 카드 (rulemd/golden-key-cards.ts)

**Decision**: 기존 파일을 src/core/data/로 이전하여 재사용

**분석 결과**:
- ✅ 27종 카드 완전 정의됨
- ✅ 카드 분포:
  - 지정 이동: 10종 (37%)
  - 상금: 5종 (18.5%)
  - 유지비: 3종 (11.1%)
  - 지출: 3종 (11.1%)
  - 후퇴: 2종 (2칸/3칸)
  - 반액대매출: 1종 (2장)
  - 탈출권/면제: 2종
- ✅ 보관 가능 카드: 무인도 탈출권, 우대권
- ✅ 2장 존재 카드: 반액대매출, 우대권, 뒤로2칸, 뒤로3칸

**Rationale**: 복잡한 카드 효과 정의가 완료되어 있어 재사용이 효율적

---

## 2. 기술 스택 결정

### 2.1 언어 및 런타임

**Decision**: TypeScript 5.x + Node.js 20+

**Rationale**:
- 타입 안전성으로 게임 로직 버그 감소
- 기존 데이터 파일이 TypeScript로 작성됨
- Node.js는 CLI 애플리케이션에 적합
- 향후 웹 확장 시 동일 코드베이스 재사용 가능

**Alternatives Considered**:
- Python: 타입 시스템 약함, 기존 데이터 재작성 필요
- Rust: 학습 곡선 높음, MVP에 과도함

### 2.2 CLI 라이브러리

**Decision**: Inquirer.js (대화형 입력) + Commander.js (명령어 파싱)

**Rationale**:
- Inquirer.js: 선택형/입력형 프롬프트 지원, 게임 선택지에 적합
- Commander.js: 명령어 기반 인터페이스, 디버그 메뉴에 적합
- 두 라이브러리 모두 TypeScript 지원 우수

**Alternatives Considered**:
- readline (Node.js 내장): 기능 제한적
- blessed: 복잡함, MVP에 과도함

### 2.3 테스트 프레임워크

**Decision**: Vitest

**Rationale**:
- ESM 네이티브 지원
- TypeScript 설정 간소화
- Jest 호환 API
- 빠른 실행 속도

**Alternatives Considered**:
- Jest: ESM 설정 복잡
- Mocha: 추가 assertion 라이브러리 필요

---

## 3. 아키텍처 패턴

### 3.1 게임 엔진 구조

**Decision**: 시스템 기반 아키텍처 (System-based Architecture)

**Rationale**:
- 각 시스템이 단일 책임 (SRP)
- 시스템 간 느슨한 결합
- 테스트 용이성
- 확장성 (새 시스템 추가 용이)

**시스템 목록**:
| 시스템 | 책임 |
|--------|------|
| GameEngine | 전체 게임 흐름 조정 |
| PhaseSystem | 전반전/후반전 전환 |
| TurnSystem | 턴 순서 관리 |
| DiceSystem | 주사위 굴림, 더블 감지 |
| MovementSystem | 위치 이동, 월급 지급 |
| EconomySystem | 구매/매각/통행료 |
| AuctionSystem | 경매 진행 |
| BuildingSystem | 건물 건설 |
| LoanSystem | 대출/상환 |
| BankruptcySystem | 파산 처리 |
| SpecialTileSystem | 특수 타일 효과 |
| GoldenKeySystem | 황금열쇠 덱 관리 및 효과 |

### 3.2 이벤트 시스템

**Decision**: 간단한 옵저버 패턴 (Observer Pattern with EventBus)

**Rationale**:
- 시스템 간 통신에 사용
- CLI 렌더링과 게임 로직 분리
- AI가 게임 이벤트를 관찰 가능
- 향후 웹 UI 연동에 유리

**Alternatives Considered**:
- 직접 호출: 강한 결합, 테스트 어려움
- RxJS: MVP에 과도함

### 3.3 상태 관리

**Decision**: GameState 중앙 집중 관리

**Rationale**:
- Constitution 원칙 I (서버 중심 진실의 원천) 준수
- 단일 진실의 원천 (Single Source of Truth)
- 상태 저장/불러오기 용이
- 디버그 및 시뮬레이션에 유리

---

## 4. 구현 주의사항 (blue_mable.md 기반)

### 4.1 건물 건설 로직

**Decision**: 순차 업그레이드 금지, 즉시 건설 구현

**분석**:
- 'Tier' 표현이 있지만 순서 제약 아님
- 자금만 충분하면 빈 땅에 즉시 호텔 건설 가능
- 한 턴에 별장2+빌딩+호텔 동시 건설 가능

**구현 방식**:
```typescript
// BuildingSystem
canBuild(deed: Deed, buildingType: BuildingType): boolean {
  // 슬롯 제한만 확인 (별장 2, 빌딩 1, 호텔 1)
  // 순서 제약 없음
}
```

### 4.2 우주여행 월급 지급

**Decision**: 하드코딩 지양, 동적 인덱스 비교 구현

**분석**:
- `목적지 인덱스 < 30`은 하드코딩
- 확장성을 위해 `목적지 < 현재 타일 인덱스` 비교

**구현 방식**:
```typescript
// MovementSystem or SpecialTileSystem
if (targetIndex < currentTileIndex) {
  player.money += SALARY;
}
```

### 4.3 대출 상환 기한

**Decision**: 3회전(laps) 기준

**분석**:
- "회전"은 보드 1바퀴 완주를 의미
- 턴 수가 아닌 lapsCompleted 기준
- 대출 시점의 laps + 3에서 상환 필요

---

## 5. AI 전략 설계

### 5.1 전략 인터페이스

**Decision**: IAIStrategy 인터페이스로 전략 패턴 적용

**결정 포인트**:
| 메서드 | 반환 | 설명 |
|--------|------|------|
| decidePurchase | boolean | 구매 여부 |
| decideBuild | BuildingType[] | 건설할 건물 목록 |
| decideAuctionBid | number \| 'fold' | 입찰가 또는 폴드 |
| decideWarpDestination | number | 워프 목적지 |
| decideAssetToSell | Asset \| null | 매각할 자산 |
| decideLoan | number \| null | 대출 금액 |
| decideUseHeldCard | boolean | 보관 카드 사용 여부 |

### 5.2 난이도별 전략

| 레벨 | 구매 | 경매 | 건설 | 워프 |
|------|------|------|------|------|
| Random | 50% 확률 | 랜덤 | 랜덤 | 랜덤 |
| Basic | 자금 40% 이하 | 정가 120%까지 | 여유자금 시 | 빈 고가 땅 |
| Smart | ROI 분석 | 상대 분석 | 컬러그룹 우선 | 최적 가치 계산 |

---

## 6. 성능 고려사항

### 6.1 시뮬레이션 성능

**목표**: 1000게임 5분 이내 (게임당 300ms 이하)

**최적화 방안**:
- 불필요한 객체 생성 최소화
- 이벤트 발행은 CLI/로깅 모드에서만
- 시뮬레이션 모드에서 렌더링 스킵

### 6.2 메모리 관리

**목표**: 500MB 이하

**방안**:
- 게임 상태만 메모리에 유지
- 히스토리는 필요 시에만 저장
- 배치 실행 시 각 게임 완료 후 상태 리셋

---

## 7. 결론

모든 기술적 불확실성이 해소되었습니다. 다음 단계:

1. **Phase 1**: data-model.md 생성 (엔티티 상세 정의)
2. **Phase 1**: contracts/ 생성 (시스템 인터페이스)
3. **Phase 1**: quickstart.md 생성 (개발 시작 가이드)
