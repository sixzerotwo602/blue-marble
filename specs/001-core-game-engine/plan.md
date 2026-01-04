# Implementation Plan: 001-core-game-engine

**Branch**: `001-core-game-engine` | **Date**: 2026-01-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/001-core-game-engine/spec.md`

## Summary

부루마블의 핵심 게임 로직(보드, 주사위, 거래, 턴 관리)을 담당하는 서버 엔진과 클라이언트 연동 규격을 구현합니다. Bankless, Math-free, Sync라는 핵심 가치를 달성하기 위해 In-Memory 상태 관리와 Socket.IO 기반의 실시간 통신 아키텍처를 채택합니다.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 20+  
**Primary Dependencies**: NestJS 10 (Backend), Socket.IO (Real-time), Zustand (Client State), React Native/Expo SDK 50 (Client)  
**Storage**: In-Memory (Game State), Redis (Optional for scaling, MVP: Node Heap)  
**Testing**: Jest (Unit/Integration), Supertest (E2E)  
**Target Platform**: Node.js Server (Linux/Windows), iOS/Android Client  
**Project Type**: Monorepo-style or Separate (Server focused for this feature)  
**Performance Goals**: < 500ms latency for game actions, handling 100+ concurrent rooms  
**Constraints**: No persistent DB for game state (Session-based), Network reconnection handling required  
**Scale/Scope**: 4 players per room, MAX_PLAYERS constant, 40 board tiles

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- [x] **Server as SSOT**: 모든 게임 로직과 상태는 서버에서 관리하며 검증한다.
- [x] **Bankless**: 현금 없는 디지털 거래 시스템을 구현한다.
- [x] **Math-free**: 자동 계산 로직을 통해 사용자의 계산 부담을 제거한다.
- [x] **QR Validation**: QR 코드를 통한 위치 검증 메커니즘을 포함한다.
- [x] **Simplicity (KISS/YAGNI)**: 복잡한 예외 룰(올림픽, 3더블 무인도 등)은 MVP에서 제외하거나 단순화했다.
- [x] **No Persistent Data**: 게임 종료 시 데이터가 소멸되도록 설계했다.

## Project Structure

### Documentation (this feature)

```text
specs/001-core-game-engine/
├── plan.md              # 이 파일
├── research.md          # 기술/설계 의사결정 (Phase 0)
├── data-model.md        # 데이터 모델 명세 (Phase 1)
├── quickstart.md        # 시작 가이드 (Phase 1)
├── contracts/           # API/Event 규격 (Phase 1)
│   ├── board-data.ts
│   ├── enums.ts
│   ├── golden-key-cards.ts
│   └── websocket-events.ts
└── tasks.md             # 구현 작업 목록 (Phase 2)
```

### Source Code (Target Structure)

```text
server/
├── src/
│   ├── game/
│   │   ├── game.gateway.ts      # WebSocket Gateway
│   │   ├── game.service.ts      # Core Game Logic
│   │   ├── game.store.ts        # In-Memory State Store
│   │   └── models/               # Domain Models
│   ├── common/
│   │   ├── filters/             # WS Exception Filters
│   │   └── guards/              # Auth/Room Guards
│   └── app.module.ts
└── test/

client/ (Reference only, mainly Server focus)
├── src/
│   ├── stores/                  # Zustand Game Store
│   └── services/                # Socket Service
```

**Structure Decision**: 서버 로직 구현에 집중하며, `server/src/game` 모듈 내에 핵심 엔진을 캡슐화합니다.

## Complexity Tracking

| Violation       | Why Needed                        | Simpler Alternative Rejected Because          |
| --------------- | --------------------------------- | --------------------------------------------- |
| In-Memory Store | 실시간성 및 단기 세션 데이터 관리 | DB 사용 시 I/O 레이턴시 발생 및 영속성 불필요 |
| Socket.IO       | 양방향 실시간 통신 필수           | HTTP Polling은 실시간성 부족 및 트래픽 과부하 |
