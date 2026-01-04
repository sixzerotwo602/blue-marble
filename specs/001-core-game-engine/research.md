# Research: 부루마블 핵심 게임 엔진

**Feature**: 001-core-game-engine  
**Date**: 2026-01-04  
**Status**: Complete

## Overview

이 문서는 부루마블 핵심 게임 엔진 구현을 위한 기술 리서치 결과를 정리한다. 모든 NEEDS CLARIFICATION 항목이 해결되었으며, 주요 기술 결정 사항을 문서화한다.

---

## 1. WebSocket 아키텍처 패턴

### Decision

**Socket.IO with NestJS Gateway 패턴** 사용

### Rationale

- NestJS의 `@WebSocketGateway` 데코레이터가 Socket.IO와 네이티브 통합 지원
- 자동 재연결, 룸 기반 브로드캐스트, 네임스페이스 지원
- React Native Expo에서 `socket.io-client` 완벽 호환

### Alternatives Considered

| Alternative        | Rejected Because                          |
| ------------------ | ----------------------------------------- |
| 순수 WebSocket API | 재연결 로직, 룸 관리 직접 구현 필요       |
| ws 라이브러리      | NestJS 통합 부족, 브로드캐스트 수동 구현  |
| Pusher/Ably        | 외부 서비스 의존성, MVP에 불필요한 복잡성 |

### Implementation Notes

```typescript
// server/src/game/game.gateway.ts
@WebSocketGateway({
  cors: { origin: "*" },
  transports: ["websocket"],
})
export class GameGateway {
  @WebSocketServer() server: Server;

  @SubscribeMessage("scan-qr")
  handleScanQr(client: Socket, payload: ScanQrPayload) {
    // 서버에서 검증 후 브로드캐스트
  }
}
```

---

## 2. In-Memory 상태 관리 전략

### Decision

**Map<string, GameRoom> 기반 메모리 저장소** 사용

### Rationale

- MVP 단계에서 외부 DB 의존성 제거로 개발 속도 향상
- 4명 동시 접속, 단일 세션이므로 메모리 부담 최소
- 상태 직렬화 없이 직접 객체 조작으로 성능 최적화

### Alternatives Considered

| Alternative | Rejected Because                              |
| ----------- | --------------------------------------------- |
| Redis       | 외부 의존성 추가, 로컬 개발 환경 복잡화       |
| SQLite      | 파일 기반 I/O 오버헤드, MVP에 과도한 설계     |
| PostgreSQL  | 완전한 RDBMS 불필요, 스키마 마이그레이션 부담 |

### Implementation Notes

```typescript
// server/src/game/game.service.ts
@Injectable()
export class GameService {
  private readonly rooms = new Map<string, GameRoom>();

  createRoom(hostName: string): GameRoom {
    const roomCode = this.generateRoomCode();
    const room: GameRoom = { ... };
    this.rooms.set(room.id, room);
    return room;
  }
}
```

### Trade-offs

- ⚠️ 서버 재시작 시 모든 게임 데이터 소멸
- ⚠️ 수평 확장 불가 (단일 서버 인스턴스만 지원)
- ✅ 이 제약은 MVP 단계에서 허용 가능 (Out-of-Scope에 명시됨)

---

## 3. 클라이언트 상태 동기화 패턴

### Decision

**Zustand + 전체 상태 교체 패턴** 사용

### Rationale

- `state-updated` 이벤트 수신 시 전체 GameRoom 객체로 스토어 교체
- 부분 업데이트 대비 구현 단순화 (KISS 원칙)
- Zustand의 immer 미들웨어로 불변성 자동 관리

### Alternatives Considered

| Alternative           | Rejected Because                         |
| --------------------- | ---------------------------------------- |
| 부분 업데이트 (Patch) | 클라이언트 로직 복잡화, 동기화 버그 위험 |
| Redux                 | 보일러플레이트 과다, 학습 곡선           |
| MobX                  | React Native 호환성 이슈 가능성          |

### Implementation Notes

```typescript
// client/stores/gameStore.ts
import { create } from "zustand";

interface GameState {
  room: GameRoom | null;
  updateRoom: (room: GameRoom) => void;
}

export const useGameStore = create<GameState>((set) => ({
  room: null,
  updateRoom: (room) => set({ room }),
}));

// socketService에서 호출
socket.on("state-updated", ({ gameState }) => {
  useGameStore.getState().updateRoom(gameState);
});
```

---

## 4. QR 스캔 검증 플로우

### Decision

**서버 측 검증 + 에러 응답 패턴** 사용

### Rationale

- Constitution II. QR 기반 엄격 검증 원칙 준수
- 클라이언트는 QR 값만 전송, 모든 검증은 서버에서 수행
- 잘못된 QR 시 명확한 에러 코드 반환

### Flow

```
1. Client: scan-qr { roomId, playerId, tileIndex }
2. Server: 현재 플레이어 위치 + 주사위 결과 기반 예상 도착지 계산
3. Server: tileIndex === expectedTileIndex 검증
4. Success: 위치 업데이트 → state-updated 브로드캐스트
5. Failure: error { code: 'INVALID_QR', message: '잘못된 위치입니다' }
```

### Implementation Notes

```typescript
handleScanQr(client: Socket, payload: ScanQrPayload) {
  const room = this.gameService.getRoom(payload.roomId);
  const player = room.players.find(p => p.id === payload.playerId);
  const expectedPosition = (player.position + room.lastDiceResult) % 32;

  if (payload.tileIndex !== expectedPosition) {
    client.emit('error', {
      code: 'INVALID_QR',
      message: '잘못된 위치입니다'
    });
    return;
  }
  // 위치 업데이트 및 브로드캐스트
}
```

---

## 5. 파산 처리 로직

### Decision

**즉시 자산 이전 + 트랜잭션 기록 패턴** 사용

### Rationale

- Constitution IV. 즉시 파산 처리 원칙 준수
- 모든 자산(현금, 땅, 건물)을 단일 트랜잭션으로 이전
- 채권자 존재 시 채권자에게, 없으면 은행(소유주 없음)으로 귀속

### Implementation Notes

```typescript
declareBankruptcy(roomId: string, playerId: string, creditorId?: string) {
  const room = this.getRoom(roomId);
  const player = room.players.find(p => p.id === playerId);

  if (creditorId) {
    // 플레이어 간 파산: 채권자에게 승계
    const creditor = room.players.find(p => p.id === creditorId);
    creditor.money += player.money;
    player.ownedTileIds.forEach(tileId => {
      const tile = room.tiles.find(t => t.id === tileId);
      tile.ownerId = creditorId;
    });
  } else {
    // 은행 파산: 소유주 없음 상태로 초기화
    player.ownedTileIds.forEach(tileId => {
      const tile = room.tiles.find(t => t.id === tileId);
      tile.ownerId = null;
      tile.buildingLevel = 0;
      tile.isMortgaged = false;
    });
  }

  player.money = 0;
  player.ownedTileIds = [];
  player.isBankrupt = true;

  // 트랜잭션 기록
  room.transactions.push({
    id: uuid(),
    timestamp: new Date(),
    fromPlayerId: playerId,
    toPlayerId: creditorId || null,
    amount: player.money,
    reason: 'bankruptcy'
  });
}
```

---

## 6. 통행료 계산 공식

### Decision

**건물 수준별 임대료 테이블 + 독점 배수** 사용

### Rationale

- 각 부동산 칸에 rentLevels 배열로 건물 수준별 임대료 정의
- 독점 시 (같은 색상 그룹 전체 소유) 기본 임대료 2배 적용
- 담보 상태 땅은 통행료 면제

### Implementation Notes

```typescript
calculateRent(room: GameRoom, tileIndex: number): number {
  const tile = room.tiles[tileIndex];

  if (!tile.ownerId || tile.isMortgaged) return 0;

  const baseRent = tile.rentLevels[tile.buildingLevel];

  // 독점 체크
  const sameColorTiles = room.tiles.filter(
    t => t.colorGroup === tile.colorGroup
  );
  const isMonopoly = sameColorTiles.every(
    t => t.ownerId === tile.ownerId
  );

  return isMonopoly && tile.buildingLevel === 0
    ? baseRent * 2
    : baseRent;
}
```

---

## 7. 담보 설정/해제 계산

### Decision

**구매가 50% + 건물가 50% + 해제 시 10% 이자** 사용

### Rationale

- Clarification 세션에서 확정된 규칙
- 건물이 있는 경우 건물 가격도 담보가에 포함
- 해제 시 담보 금액의 10%를 이자로 추가 지불

### Implementation Notes

```typescript
setMortgage(room: GameRoom, playerId: string, tileIndex: number) {
  const tile = room.tiles[tileIndex];
  const buildingValue = this.getBuildingValue(tile);
  const mortgageValue = (tile.price + buildingValue) * 0.5;

  tile.isMortgaged = true;
  tile.mortgageValue = mortgageValue;

  const player = room.players.find(p => p.id === playerId);
  player.money += mortgageValue;
}

releaseMortgage(room: GameRoom, playerId: string, tileIndex: number) {
  const tile = room.tiles[tileIndex];
  const releaseAmount = Math.floor(tile.mortgageValue * 1.1); // 10% 이자

  const player = room.players.find(p => p.id === playerId);
  if (player.money < releaseAmount) {
    throw new InsufficientFundsError();
  }

  player.money -= releaseAmount;
  tile.isMortgaged = false;
  tile.mortgageValue = undefined;
}
```

---

## 8. Expo QR 스캐너 구현

### Decision

**expo-camera + expo-barcode-scanner** 사용

### Rationale

- Expo SDK 50에서 완벽 지원
- 권한 요청 자동 처리
- iOS/Android 모두 네이티브 성능

### Implementation Notes

```typescript
// client/components/QRScanner.tsx
import { CameraView, useCameraPermissions } from "expo-camera";

export function QRScanner({ onScan }: { onScan: (data: string) => void }) {
  const [permission, requestPermission] = useCameraPermissions();

  return (
    <CameraView
      style={{ flex: 1 }}
      barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
      onBarcodeScanned={({ data }) => onScan(data)}
    />
  );
}
```

---

## Summary

| Topic         | Decision                   | Key Rationale              |
| ------------- | -------------------------- | -------------------------- |
| WebSocket     | Socket.IO + NestJS Gateway | 네이티브 통합, 룸 지원     |
| Storage       | In-Memory Map              | MVP 단순화, DB 의존성 제거 |
| Client State  | Zustand + 전체 교체        | KISS 원칙, 동기화 안정성   |
| QR Validation | 서버 측 검증               | Constitution II 준수       |
| Bankruptcy    | 즉시 이전                  | Constitution IV 준수       |
| Rent          | 테이블 + 독점 배수         | Math-free 원칙             |
| Mortgage      | 50% + 10% 이자             | Clarification 확정         |
| QR Scanner    | expo-camera                | Expo SDK 네이티브          |

**All NEEDS CLARIFICATION resolved. Ready for Phase 1: Design & Contracts.**
