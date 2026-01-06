# Research & Technical Decisions (Phase 0)

## 1. State Management Strategy

**Decision**: Hybrid Approach (In-Memory + PostgreSQL)
**Rationale**:

- **In-Memory (NestJS Heap)**: Provides sub-millisecond access for real-time game loop (dice, move, turn). Essential for `SC-006` (Speedup).
- **PostgreSQL 18**: Stores persistent records (GameSession, GameEvent) for analysis and replayability.
- **Alternatives**: Redis (added complexity for MVP), Pure DB (too slow for real-time).

## 2. Space Travel UX

**Decision**: Generic QR Scan (Option B)
**Rationale**:

- **Flow**: User lands on Space Travel -> Pay fee -> Turn Ends -> Next Turn -> User scans _any_ QR code on the board -> Server verifies valid tile -> Moves user.
- **Benefit**: Removes need for a complex "Destination Selector" UI. Leverages physical board interaction.
- **Constraint**: Must ensure `FR-005` (QR Validation) accepts "any valid tile" specifically for this state.

## 3. Vehicle Rent & Logic

**Decision**: Static Rent & Forced Move Only
**Rationale**:

- **Rent**: Vehicles (Concorde, QE, Columbia) have fixed purchase/rent prices.
- **Movement**:
  - **Normal Landing**: No move allowed. Only rent payment or purchase.
  - **Golden Key**: "Move to Taipei/Beijing" invokes forced move -> Pay rent to Vehicle owner.
  - **Space Travel (Corner)**: Pay 200k to Columbia owner (if exists) -> Move to Space Station.
- **Clarification**: Distinguished clearly between "Columbia Deed" (Tile 33) and "Space Travel" (Tile 30).

## 4. Real-time Communication

**Decision**: Socket.IO
**Rationale**:

- Native support for namespaces/rooms.
- Fallback for unstable mobile networks (`FR-014`).
- Better ecosystem for NestJS integration than raw WebSocket.
