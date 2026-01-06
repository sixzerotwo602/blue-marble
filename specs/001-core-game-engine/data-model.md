# Data Model (Phase 1)

## 1. Domain Entities

### GameRoom

- **id**: string (UUID)
- **roomCode**: string (6 chars, unique)
- **status**: 'waiting' | 'playing' | 'paused' | 'finished'
- **hostPlayerId**: string
- **players**: Player[]
- **currentTurnIndex**: number
- **turnOrder**: string[] (playerIds)
- **createdAt**: string (ISO8601)

### Player

- **id**: string (UUID)
- **name**: string
- **color**: 'red' | 'blue' | 'yellow' | 'green'
- **position**: number (0-39)
- **money**: number
- **ownedTileIds**: number[]
- **isConnected**: boolean
- **isBankrupt**: boolean
- **islandTurnsLeft**: number (0-3)

### BoardTile

- **index**: number (0-39)
- **name**: string
- **type**: 'start' | 'property' | 'vehicle' | 'goldenKey' | 'island' | 'travel' | 'fundReceive' | 'fundDonate'
- **colorGroup?**: string (for properties)
- **price?**: number
- **rentLevels?**: number[] (Land, Villa, Building, Hotel)
- **ownerId?**: string
- **buildingLevel**: 0 | 1 | 2 | 3 (0=Land, 1=Villa, 2=Building, 3=Hotel)
- **isMortgaged**: boolean

### Transaction

- **id**: string (UUID)
- **timestamp**: string
- **fromPlayerId?**: string
- **toPlayerId?**: string
- **amount**: number
- **reason**: 'purchase' | 'build' | 'rent' | 'vehicle_fee' | 'space_travel_fee' | 'fund_donate' | 'fund_receive' | 'golden_key' | 'salary' | 'start_bonus' | 'mortgage' | 'unmortgage'

## 2. Persistent Models (PostgreSQL)

### GameSession

- **id**: UUID (PK)
- **roomCode**: varchar
- **startedAt**: timestamp
- **endedAt**: timestamp
- **winnerId**: UUID
- **totalTurns**: integer

### GameEvent

- **id**: UUID (PK)
- **sessionId**: UUID (FK)
- **type**: varchar (e.g., 'DICE_ROLLED', 'MOVED', 'RENT_PAID')
- **payload**: jsonb
- **decisionTimeMs**: integer
- **createdAt**: timestamp

### TurnSnapshot

- **id**: UUID (PK)
- **sessionId**: UUID (FK)
- **turnNumber**: integer
- **playerSnapshots**: jsonb (Map<PlayerId, {money, assets, position}>)
- **createdAt**: timestamp
