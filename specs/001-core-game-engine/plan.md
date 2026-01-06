# Implementation Plan: 부루마블 핵심 게임 엔진

**Branch**: `001-core-game-engine` | **Date**: 2026-01-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-core-game-engine/spec.md`

## Summary

실물 부루마블 보드게임을 스마트폰 앱으로 보조하는 핵심 게임 엔진 구현. QR 스캔 기반 위치 검증, 자동 통행료 계산, 실시간 상태 동기화를 제공하여 "Bankless, Math-free, Sync" 경험을 구현한다.

## Technical Context

**Language/Version**: TypeScript 5.3 (Server), TypeScript 5.3 (Client)
**Primary Dependencies**: NestJS 10, React Native (Expo SDK 50), Socket.IO, Prisma 5
**Storage**: PostgreSQL 16 (영구 저장) + In-Memory (실시간 세션)
**Testing**: Jest (Server Unit/Integration), React Native Testing Library (Client)
**Target Platform**: iOS 15+ / Android 10+, Linux Server (Node.js 20 LTS)
**Project Type**: Mobile + API (React Native Client + NestJS Server)
**Performance Goals**: QR 스캔 응답 < 500ms, 상태 브로드캐스트 < 200ms
**Constraints**: 최대 4명 동시 플레이, 오프라인 미지원, 네트워크 필수
**Scale/Scope**: MVP - 동시 게임 방 100개 이하
**Observability**: OpenTelemetry 전체 분산 추적 (모든 이벤트 trace)
**Network Resilience**: 3회 재시도 (3초 간격) 후 수동 재연결 유도, 전원 끊김 시 30분 유지

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| 원칙                       | 상태    | 근거                                               |
| -------------------------- | ------- | -------------------------------------------------- |
| I. 서버 중심 진실의 원천   | ✅ PASS | 모든 게임 상태는 서버 In-Memory에서 관리           |
| II. QR 기반 엄격 검증      | ✅ PASS | scan-qr 이벤트 + Rate Limiting + 이동 거리 검증    |
| III. 양심 기반 신고 시스템 | ✅ PASS | 주사위 결과는 사용자 입력으로 처리                 |
| IV. 즉시 파산 처리         | ✅ PASS | declare-bankruptcy 이벤트 및 자산 이전 로직 정의됨 |
| V. 턴 종료 명시적 선언     | ✅ PASS | end-turn 이벤트로 명시적 종료                      |
| VI. 연결 복원성            | ✅ PASS | 3회 재시도(3초), 30분 유지 후 timeout 처리         |
| VII. KISS                  | ✅ PASS | In-Memory 상태 관리로 단순화                       |
| VIII. YAGNI                | ✅ PASS | 경매, 거래, 리플레이 등 Out-of-Scope 명시          |
| IX. DRY                    | ✅ PASS | 상수 및 Enum 중앙 정의 (enums.ts, board-data.ts)   |
| X. SOLID                   | ✅ PASS | 서비스/이벤트 분리 설계                            |

## Edge Cases (Clarification 1 & 2차 반영)

| Edge Case        | 처리 방식                                  |
| ---------------- | ------------------------------------------ |
| 동시 액션 요청   | 턴 소유자만 액션 허용 (NOT_YOUR_TURN)      |
| 황금열쇠 연쇄    | 연쇄 실행 (이동 후 새 카드 뽑음)           |
| 호스트 이탈      | 다음 순서 플레이어에게 자동 이전           |
| 담보 땅 통행료   | 정상 징수 (공식 규칙과 다름)               |
| 전원 연결 끊김   | 30분 유지 후 로그 작성/데이터 보관         |
| 사회복지기금 0원 | 아무것도 지급 안 함 (메시지만 표시)        |
| 더블 + 강제이동  | 더블 재굴림 권한 유지 (다시 주사위)        |
| 건설 잔고부족    | 버튼 비활성화 (선택 불가)                  |
| 통행료 파산      | 즉시 파산 (보유 자산 전부 채권자에게 이전) |
| 최소 인원        | 2명 이상이면 호스트가 시작 가능            |

## Project Structure

### Documentation (this feature)

```text
specs/001-core-game-engine/
├── plan.md              # 이 파일 (구현 계획)
├── research.md          # 기술 결정 사항
├── data-model.md        # 데이터 모델 정의
├── quickstart.md        # 빠른 시작 가이드
├── spec.md              # 기능 명세
├── tasks.md             # 구현 작업 목록
├── checklists/          # QA 체크리스트
└── contracts/           # API/데이터 계약
    ├── board-data.ts    # 40칸 보드판 데이터
    ├── enums.ts         # Enum 타입 정의
    ├── golden-key-cards.ts # 황금열쇠 27종
    ├── types.ts         # 공통 타입
    ├── websocket-events.ts # WebSocket 이벤트
    └── db-schema.ts     # PostgreSQL 스키마
```

### Source Code (repository root)

```text
api/
├── src/
│   ├── models/          # 데이터 모델 (In-Memory)
│   ├── services/        # 비즈니스 로직
│   ├── gateways/        # WebSocket 게이트웨이
│   ├── controllers/     # REST API
│   └── prisma/          # DB 스키마 및 마이그레이션
└── tests/
    ├── unit/            # 단위 테스트
    └── integration/     # 통합 테스트

mobile/
├── src/
│   ├── components/      # UI 컴포넌트
│   ├── screens/         # 화면 (방 생성, 게임 등)
│   ├── stores/          # Zustand 상태 관리
│   └── services/        # API/Socket 통신
└── tests/
```

**Structure Decision**: Mobile + API 구조 선택. React Native 클라이언트와 NestJS 서버를 분리하여 실시간 게임 상태 동기화 구현.

## Complexity Tracking

> 모든 Constitution Check 통과로 위반 사항 없음.

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --------- | ---------- | ------------------------------------ |
| N/A       | -          | -                                    |

## Key Clarifications Summary

### Observability & UX (2026-01-06)

- 전체 분산 추적: OpenTelemetry + 모든 이벤트 trace
- 로딩 UI: 버튼 비활성화 + 인라인 스피너
- QR 보안: 서버측 위치 검증 + Rate Limiting
- 재연결: 3회 재시도 (3초 간격)

### Edge Cases 1차 (2026-01-06)

- 턴 소유자만 액션 허용
- 황금열쇠 연쇄 실행
- 호스트 이탈 시 자동 권한 이전
- 담보 땅도 통행료 정상 징수 (하우스 룰)
- 전원 끊김 시 30분 유지 후 로그 작성/종료

### Edge Cases 2차 (2026-01-06)

- 사회복지기금 0원 수령 불가
- 더블+강제이동 시 재굴림 권한 유지
- 건설 잔고부족 시 버튼 비활성화 (UI)
- 통행료 파산 시 즉시 처리
- 2명 이상 게임 시작 가능
