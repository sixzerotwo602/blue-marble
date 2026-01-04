# Research & Technical Decisions: 001-core-game-engine

**Date**: 2026-01-04
**Topic**: Core Game Engine Architecture

## 1. State Management: In-Memory vs Redis vs RDBMS

### Decision

**In-Memory (Node.js Heap)** 방식을 채택합니다.

### Rationale

- **Performance**: 게임 로직은 밀리초 단위의 반응성이 필요합니다. 메모리 접근이 가장 빠릅니다.
- **Complexity**: MVP 단계에서 별도의 Redis나 DB 인프라를 구축/관리하는 오버헤드를 줄입니다.
- **Data Lifecycle**: 부루마블 게임 데이터는 세션이 종료되면 보존할 필요가 없습니다 (일회성).
- **Simplicity**: NestJS의 Singleton Service 내에서 객체로 관리하는 것이 가장 직관적입니다.

### Alternatives Considered

- **Redis**: 스케일아웃 시 필수적이지만, 현재 MVP(단일 서버)에서는 과도한 엔지니어링입니다. 향후 도입 가능하도록 DAO 패턴으로 추상화할 수 있습니다.
- **PostgreSQL**: 트랜잭션 안전성은 높지만, 턴제 게임의 빈번한 상태 변경에는 너무 느리고 무겁습니다.

## 2. Real-time Communication: Socket.IO

### Decision

**Socket.IO** (NestJS WebSocket Gateway)를 사용합니다.

### Rationale

- **Reliability**: 순수 WebSocket 대비 재연결(Reconnection) 처리가 강력합니다. 모바일 환경의 불안정한 네트워크에 적합합니다.
- **Room Support**: `join/leave` 룸 관리 기능이 내장되어 있어 게임 방 구현이 매우 쉽습니다.
- **Binary Support**: 필요 시 데이터 경량화를 위한 바이너리 전송도 지원합니다.

## 3. Client State Sync: Optimistic vs Pessimistic

### Decision

**Pessimistic UI Update (Server Authority)** 방식을 채택합니다.

### Rationale

- **Trust**: 주사위 결과, 파산 여부 등은 철저히 서버가 검증해야 합니다. 클라이언트가 먼저 UI를 업데이트했다가 롤백되면 사용자 경험이 더 나빠질 수 있습니다.
- **Sync**: "주사위 굴림 -> 서버 계산 -> 결과 브로드캐스트 -> 클라이언트 렌더링" 흐름이 0.5초 이내라면 충분히 빠릅니다.
