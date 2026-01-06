# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

**Language/Version**: Node.js 20+, TypeScript 5.0+
**Primary Dependencies**: NestJS 10 (Server), Expo SDK 50 (Client), Socket.IO (Real-time), Zustand (State)
**Storage**: PostgreSQL 18 (Persistence), In-Memory (Game State)
**Testing**: Jest (Unit/Integration), Supertest (E2E)
**Target Platform**: iOS/Android (Expo Go), Docker Container (Server)
**Project Type**: Monorepo (TurboRepo or equivalent recommended for shared types)
**Performance Goals**: WebSocket latency < 500ms, State broadcast < 200ms
**Constraints**: Bankless logic, Offline support (limited), 30% speedup vs analog
**Scale/Scope**: Max 4 players/room, 100+ concurrent rooms

## Constitution Check

_GATE: Passed. All core principles aligned._

- **Server as SSOT**: Plan uses NestJS server as central authority.
- **QR-Based Strict Validation**: Uses server-side validation for all moves (FR-005, FR-025).
- **Honor System**: Dice input and Island escape rely on user input (FR-004, FR-033).
- **Immediate Bankruptcy**: Automates asset transfer upon bankruptcy (FR-011, FR-012).
- **Explicit Turn**: Turn end requires manual action (FR-013).
- **Connection Resilience**: Implements pause/resume logic (FR-014, FR-015).

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |
