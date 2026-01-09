# REST API Contract

**Date**: 2026-01-09  
**Feature**: 001-core-game-engine

이 문서는 게임 생성, 조회 등을 위한 REST API 계약을 정의합니다.  
실시간 게임 로직은 WebSocket을 통해 처리됩니다.

---

## Base URL

```
/api/v1
```

---

## 1. Games

### 1.1 Create Game

새 게임 룸을 생성합니다.

**Request**

```http
POST /api/v1/games
Content-Type: application/json

{
  "hostName": "string",
  "hostColor": "RED" | "BLUE" | "YELLOW" | "WHITE"
}
```

**Response 201 Created**

```json
{
  "gameId": "string (UUID)",
  "inviteCode": "string (6자리 코드)",
  "hostToken": "string (재접속용)",
  "createdAt": "number (Unix timestamp)",
  "status": "WAITING"
}
```

**Errors**
| Status | Code | Description |
|--------|------|-------------|
| 400 | `INVALID_NAME` | 이름이 유효하지 않습니다 |
| 400 | `INVALID_COLOR` | 색상이 유효하지 않습니다 |

---

### 1.2 Get Game

게임 정보를 조회합니다.

**Request**

```http
GET /api/v1/games/{gameId}
```

**Response 200 OK**

```json
{
  "gameId": "string",
  "status": "WAITING" | "IN_PROGRESS" | "ENDED",
  "mode": "ORDINARY" | "OPTION" | null,
  "phase": "GamePhase" | null,
  "players": [
    {
      "id": "string",
      "name": "string",
      "color": "string",
      "isHost": "boolean",
      "isConnected": "boolean"
    }
  ],
  "createdAt": "number",
  "startedAt": "number" | null,
  "endedAt": "number" | null
}
```

**Errors**
| Status | Code | Description |
|--------|------|-------------|
| 404 | `GAME_NOT_FOUND` | 게임을 찾을 수 없습니다 |

---

### 1.3 Join Game by Invite Code

초대 코드로 게임에 참가합니다.

**Request**

```http
POST /api/v1/games/join
Content-Type: application/json

{
  "inviteCode": "string (6자리)",
  "playerName": "string",
  "playerColor": "RED" | "BLUE" | "YELLOW" | "WHITE"
}
```

**Response 200 OK**

```json
{
  "gameId": "string",
  "playerId": "string",
  "playerToken": "string (재접속용)",
  "players": [
    {
      "id": "string",
      "name": "string",
      "color": "string",
      "isHost": "boolean"
    }
  ]
}
```

**Errors**
| Status | Code | Description |
|--------|------|-------------|
| 400 | `INVALID_INVITE_CODE` | 초대 코드가 유효하지 않습니다 |
| 400 | `COLOR_TAKEN` | 해당 색상은 이미 사용 중입니다 |
| 400 | `GAME_FULL` | 게임이 가득 찼습니다 (4명) |
| 400 | `GAME_ALREADY_STARTED` | 게임이 이미 시작되었습니다 |
| 404 | `GAME_NOT_FOUND` | 게임을 찾을 수 없습니다 |

---

### 1.4 List Active Games (Admin/Debug)

활성 게임 목록을 조회합니다.

**Request**

```http
GET /api/v1/games?status=IN_PROGRESS&limit=10&offset=0
```

**Response 200 OK**

```json
{
  "games": [
    {
      "gameId": "string",
      "status": "string",
      "playerCount": "number",
      "createdAt": "number"
    }
  ],
  "total": "number",
  "limit": "number",
  "offset": "number"
}
```

---

## 2. Static Data

### 2.1 Get Board Data

보드 정보를 조회합니다.

**Request**

```http
GET /api/v1/static/board
```

**Response 200 OK**

```json
{
  "tiles": [
    {
      "index": "number (0-39)",
      "type": "TileType",
      "propertyId": "string" | null
    }
  ]
}
```

---

### 2.2 Get Properties Data

증서 정보를 조회합니다.

**Request**

```http
GET /api/v1/static/properties
```

**Response 200 OK**

```json
{
  "properties": [
    {
      "id": "string",
      "name": "string",
      "tileIndex": "number",
      "type": "CITY" | "TRANSPORT" | "SPECIAL",
      "canBuild": "boolean",
      "purchasePrice": "number",
      "buildCost": {
        "villa": "number",
        "building": "number",
        "hotel": "number"
      } | null,
      "toll": {
        "land": "number",
        "villa": "number" | null,
        "building": "number" | null,
        "hotel": "number" | null
      }
    }
  ]
}
```

---

### 2.3 Get Golden Key Cards Data

황금열쇠 카드 정보를 조회합니다.

**Request**

```http
GET /api/v1/static/golden-keys
```

**Response 200 OK**

```json
{
  "cards": [
    {
      "id": "string",
      "name": "string",
      "description": "string"
    }
  ]
}
```

**Note**: 카드 효과 상세는 클라이언트에 노출하지 않음 (서버에서만 처리)

---

## 3. Health Check

### 3.1 Health

서버 상태를 확인합니다.

**Request**

```http
GET /api/v1/health
```

**Response 200 OK**

```json
{
  "status": "ok",
  "uptime": "number (seconds)",
  "activeGames": "number",
  "connectedPlayers": "number"
}
```

---

## Common Error Response Format

모든 에러 응답은 다음 형식을 따릅니다:

```json
{
  "error": {
    "code": "string (에러 코드)",
    "message": "string (사람이 읽을 수 있는 메시지)",
    "details": {} | null
  }
}
```

---

## Authentication

게임 참가 후 발급되는 `playerToken`을 사용합니다.

```http
Authorization: Bearer {playerToken}
```

WebSocket 연결 시에도 동일한 토큰을 사용합니다:

```typescript
const socket = io(serverUrl, {
  auth: {
    token: playerToken,
  },
});
```
