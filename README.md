# 🎲 부루마블 (Blue Marble) CLI

> 한국형 모노폴리 보드게임 CLI 버전

## 📦 설치 및 실행

```bash
# 의존성 설치
npm install

# 빌드
npm run build

# 게임 실행
npm start
```

## 🎮 게임 방법

### 기본 진행

1. 플레이어 수 입력 (2~4명)
2. 플레이어 이름 입력
3. 턴마다 주사위 굴리기 (Enter 또는 'r')
4. 맵 보기 ('m' 또는 'map')

### 게임 규칙

- **초기 자금**: ₩2,000,000
- **월급**: 출발점 통과 시 ₩200,000
- **후반전**: 출발점 1회 통과 후 건설 가능
- **더블**: 추가 턴 (최대 3연속)
- **파산**: 통행료 지불 불가 시 게임 종료

## 🗺️ 맵 보기

턴 시작 시 `m` 입력으로 전체 보드 확인:

```
========================================
🗺️  전체 보드 맵
========================================
🏁 00 출발            ◆Alice,Bob
① 01 타이베이       [Alic] V1
① 02 황금열쇠
...
범례: V=별장, B=빌딩, H=호텔, ◆=플레이어 위치
========================================
```

## 🧪 테스트

```bash
# 단위 테스트 실행
npm test

# Watch 모드
npm run test:watch

# 시뮬레이션만 실행
npm test -- src/services/simulation.test.ts
```

### 테스트 구성

| 파일                      | 테스트 수 | 내용                    |
| ------------------------- | --------- | ----------------------- |
| `diceService.test.ts`     | 4         | 주사위 범위, 더블 판정  |
| `gameService.test.ts`     | 17        | 초기화, 이동, 턴 관리   |
| `propertyService.test.ts` | 9         | 땅 구매 로직            |
| `buildingService.test.ts` | 10        | 건설 조건, 비용         |
| `tollCalculator.test.ts`  | 8         | 통행료 계산, 독점       |
| `simulation.test.ts`      | 2         | 100게임 자동 시뮬레이션 |

## 📁 프로젝트 구조

```
src/
├── cli/             # CLI 인터페이스
│   ├── display.ts   # 화면 출력
│   ├── gameLoop.ts  # 게임 루프
│   └── prompts.ts   # 사용자 입력
├── data/            # 정적 데이터
│   ├── boardData.ts # 40칸 보드 데이터
│   └── constants.ts # 게임 상수
├── services/        # 비즈니스 로직
│   ├── diceService.ts
│   ├── gameService.ts
│   ├── propertyService.ts
│   ├── buildingService.ts
│   ├── tollCalculator.ts
│   └── bankruptcyService.ts
├── types/           # 타입 정의
│   └── index.ts
└── index.ts         # 진입점
```

## 🎯 주요 기능

- ✅ 40칸 보드 (출발 → 시계방향)
- ✅ 2~4인 멀티플레이어
- ✅ 주사위 2개, 더블 시 추가턴 (3회 제한)
- ✅ 땅 구매 및 통행료
- ✅ 별장/빌딩/호텔 건설 (후반전)
- ✅ 독점 시 통행료 2배
- ✅ 자산 매각 및 파산 처리
- ✅ 전체 맵 보기

## 📜 라이선스

MIT
