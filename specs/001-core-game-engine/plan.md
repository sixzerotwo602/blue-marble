# Implementation Plan: 부루마블 핵심 게임 엔진

**Branch**: `001-core-game-engine` | **Date**: 2026-01-09 (Updated) | **Spec**: [spec.md](./spec.md)
**Last Spec Revision**: 2026-01-09 15:06 - 초기 자금 룰북 기준 수정(293만원), 담보 기능 MVP Out-of-Scope 제외
**Input**: Feature specification from `/specs/001-core-game-engine/spec.md`

## Summary

씨앗사 부루마블 보드게임의 디지털 버전을 위한 핵심 게임 엔진을 구현합니다. Node.js 20.x + TypeScript 5.x (Strict Mode) 기반으로, WebSocket을 통한 온라인 실시간 멀티플레이어를 지원합니다. 40칸 보드, 29개 증서, 27종 황금열쇠 카드, Ordinary/Option 게임 모드, 전반전/후반전 전환, 파산 방어 로직(settleShortage)을 포함합니다.

## Technical Context

**Language/Version**: Node.js 20.x (LTS) + TypeScript 5.x (Strict Mode 필수)  
**Primary Dependencies**:

- Server: Express.js 또는 Fastify (REST API)
- WebSocket: Socket.io 또는 ws
- Validation: Zod (런타임 타입 검증)
- Frontend: React 18.x + Vite

**Storage**:

- 게임 세션: In-Memory (Redis 옵션)
- 보드 데이터: JSON 파일 (정적 데이터)

**Testing**:

- Unit: Vitest
- E2E: Playwright
- Contract: TypeScript 타입 시스템 + Zod

**Target Platform**:

- Server: Node.js 20.x (Docker 컨테이너)
- Client: 모던 웹 브라우저 (Chrome, Firefox, Safari, Edge)

**Project Type**: Web Application (backend + frontend)

**Performance Goals**:

- WebSocket 응답 < 100ms
- 동시 접속 10개 게임룸 (최대 40명)
- 클라이언트 렌더링 60fps

**Constraints**:

- 서버 메모리 < 512MB per 게임룸
- 턴 제한 시간 없음 (연결 끊김으로 대체)
- 재접속 타임아웃: 60초

**Scale/Scope**:

- 2~4인 플레이어
- 40칸 보드
- 29개 증서
- 27종 황금열쇠

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| 원칙                           | 상태     | 적용 방법                                                                          |
| ------------------------------ | -------- | ---------------------------------------------------------------------------------- |
| **I. 서버 중심 진실의 원천**   | ✅ PASS  | 모든 GameState는 서버에서만 관리. 클라이언트는 렌더링만 수행.                      |
| **II. QR 기반 엄격 검증**      | ⚠️ DEFER | 디지털 전용 버전이므로 QR 검증 생략. 주사위 결과를 서버 RNG로 처리 가능 옵션 제공. |
| **III. 양심 기반 신고 시스템** | ⚠️ DEFER | 온라인 버전에서는 서버 RNG 사용 권장. 사용자 직접 입력은 옵션으로.                 |
| **IV. 즉시 파산 처리**         | ✅ PASS  | `declareBankruptcy()` 함수에서 즉시 자산 이전. Unit Test 필수.                     |
| **V. 턴 종료 명시적 선언**     | ✅ PASS  | `endTurn()` 버튼으로 명시적 선언 필요. Undo 불가.                                  |
| **VI. 연결 복원성**            | ✅ PASS  | 60초 재접속 대기 + AI 대체 정책 적용.                                              |
| **VII. KISS**                  | ✅ PASS  | 모듈화된 함수 구조로 단순성 유지.                                                  |
| **VIII. YAGNI**                | ✅ PASS  | 핵심 게임 로직에만 집중. 확장 기능은 향후 이터레이션.                              |
| **IX. DRY**                    | ✅ PASS  | 공통 유틸리티 함수 및 상수 정의.                                                   |
| **X. SOLID**                   | ✅ PASS  | 서비스 레이어 분리, 인터페이스 기반 설계.                                          |

### 위반 정당화

| 원칙           | 위반 사유                             | 대안                                  |
| -------------- | ------------------------------------- | ------------------------------------- |
| QR 기반 검증   | 디지털 전용 버전으로 물리적 보드 없음 | 서버 RNG로 주사위 결과 생성 옵션 제공 |
| 양심 기반 신고 | 온라인 게임에서 신뢰 문제 발생 가능   | 서버 RNG 기본, 사용자 입력 옵션       |

## Project Structure

### Documentation (this feature)

```text
specs/001-core-game-engine/
├── plan.md              # 이 파일 (/speckit.plan 출력)
├── research.md          # Phase 0 출력
├── data-model.md        # Phase 1 출력
├── quickstart.md        # Phase 1 출력
├── contracts/           # Phase 1 출력 (API 스키마)
├── checklists/          # 품질 체크리스트
└── tasks.md             # Phase 2 출력 (/speckit.tasks)
```

### Source Code (repository root)

```text
# Web Application Structure (backend + frontend)

server/
├── src/
│   ├── models/              # 도메인 모델 (PlayerState, GameState, etc.)
│   │   ├── player.ts
│   │   ├── property.ts
│   │   ├── game-state.ts
│   │   └── golden-key.ts
│   ├── services/            # 비즈니스 로직
│   │   ├── game-engine.ts   # 핵심 게임 로직
│   │   ├── turn-service.ts  # 턴 처리
│   │   ├── payment-service.ts # 지불/파산 로직
│   │   └── auction-service.ts # 경매 로직
│   ├── websocket/           # WebSocket 핸들러
│   │   ├── game-room.ts
│   │   └── events.ts
│   ├── api/                 # REST API (게임 생성, 조회)
│   │   └── routes.ts
│   ├── data/                # 정적 데이터 (보드, 증서, 카드)
│   │   ├── board.json
│   │   ├── properties.json
│   │   └── golden-keys.json
│   └── utils/               # 유틸리티
│       ├── dice.ts
│       └── constants.ts
├── tests/
│   ├── unit/
│   │   ├── game-engine.test.ts
│   │   ├── payment-service.test.ts
│   │   └── bankruptcy.test.ts  # 필수: Constitution IV
│   └── integration/
│       └── websocket.test.ts
├── package.json
└── tsconfig.json

client/
├── src/
│   ├── components/          # UI 컴포넌트
│   │   ├── Board/
│   │   ├── PlayerPanel/
│   │   ├── DiceRoller/
│   │   ├── PropertyCard/
│   │   └── GoldenKeyModal/
│   ├── pages/               # 페이지
│   │   ├── Lobby.tsx
│   │   ├── GameRoom.tsx
│   │   └── GameOver.tsx
│   ├── services/            # API/WebSocket 클라이언트
│   │   ├── socket-client.ts
│   │   └── api-client.ts
│   ├── stores/              # 상태 관리
│   │   └── game-store.ts
│   └── hooks/               # 커스텀 훅
│       └── useGameSocket.ts
├── tests/
│   └── e2e/
│       └── game-flow.spec.ts
├── package.json
├── vite.config.ts
└── tsconfig.json

shared/
├── types/                   # 공유 타입 정의
│   ├── game.ts
│   ├── player.ts
│   ├── property.ts
│   └── events.ts
└── constants/               # 공유 상수
    └── game-constants.ts
```

**Structure Decision**: Web Application (backend + frontend + shared types)

- `server/`: Node.js + TypeScript 백엔드 (Express/Fastify + Socket.io)
- `client/`: React 18 + Vite 프론트엔드
- `shared/`: TypeScript 타입 및 상수 공유 (모노레포 구조)

## Complexity Tracking

> **Constitution Check 위반 정당화**

| Violation     | Why Needed                            | Simpler Alternative Rejected Because    |
| ------------- | ------------------------------------- | --------------------------------------- |
| QR 검증 생략  | 디지털 전용 버전으로 물리적 보드 없음 | 물리적 QR 스캔은 온라인 게임에서 불가능 |
| 서버 RNG 사용 | 온라인 게임 공정성 보장               | 사용자 입력은 치팅 가능성 있음          |

## Phase Outputs

- **Phase 0**: `research.md` - 기술 결정 및 대안 분석
- **Phase 1**: `data-model.md`, `contracts/`, `quickstart.md` - 설계 문서
- **Phase 2**: `tasks.md` - 구현 태스크 (/speckit.tasks 명령으로 생성)
