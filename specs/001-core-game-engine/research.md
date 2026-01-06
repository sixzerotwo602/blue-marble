# Research & Technical Decisions: 001-core-game-engine

**Date**: 2026-01-06 (Updated)
**Topic**: Core Game Engine Architecture

## 1. State Management: Hybrid Approach

### Decision

**In-Memory (Node.js Heap)** + **PostgreSQL 16** 하이브리드 방식을 채택합니다.

- **In-Memory**: 실시간 게임 세션 상태 (GameRoom, Player, BoardTile)
- **PostgreSQL**: 게임 플레이 데이터 축적 (GameSession, GameEvent, TurnSnapshot)

### Rationale

- **Performance**: 실시간 게임 로직은 밀리초 단위 반응성 필요 → In-Memory
- **Analytics**: 게임 플레이 경향 분석을 위한 데이터 축적 필요 → PostgreSQL
- **Decision Time Tracking**: 의사결정 소요 시간(decisionDurationMs) 기록으로 UX 분석 가능
- **Turn Snapshots**: 매 턴 상태 스냅샷으로 시계열 분석 지원

### Alternatives Considered

- **Redis**: 스케일아웃 시 필요하지만 MVP에서는 과도함. 향후 DAO 패턴으로 추상화 가능.
- **PostgreSQL Only**: 실시간 게임의 빈번한 상태 변경에 너무 느림.

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

## 4. Data Analytics: Event-Based Logging

### Decision

**JSONB 기반 이벤트 로깅** + **턴 스냅샷** 방식을 채택합니다.

### Rationale

- **Flexibility**: JSONB로 이벤트 데이터를 저장하면 스키마 변경 없이 새 필드 추가 가능
- **Context Capture**: 각 이벤트에 의사결정 당시 맥락(보유 자산, 현금 등) 포함
- **Time Series**: TurnSnapshot 테이블로 특정 시점 상태를 재생 없이 바로 조회 가능
- **Decision Time**: decisionDurationMs 필드로 의사결정 소요 시간 분석 가능

### Key Design Decisions

1. **PropertySkipReason 세분화**: insufficient_funds / strategic_skip / timeout
2. **23종 GameEventType**: 모든 게임 액션을 상세히 분류
3. **EventData 인터페이스**: 이벤트별 맥락 정보 표준화

## 5. Player Identification: Visitor ID + Future Account

### Decision

**visitorId (익명)** + **accountId (null → 향후 연결)** 구조를 채택합니다.

### Rationale

- **MVP Simplicity**: 계정 시스템 없이 기기 기반 익명 ID로 시작
- **Future-Proof**: 향후 계정 도입 시 기존 데이터와 연결 가능
- **Privacy**: 익명 식별자로 개인정보 수집 최소화

### Implementation

- 앱 최초 설치 시 UUID 생성하여 로컬 저장
- 같은 기기에서 여러 게임 시 동일 visitorId로 기록
- 향후 로그인 시 해당 visitorId의 모든 과거 기록에 accountId 업데이트

## 6. Network Resilience: Reconnection Strategy

### Decision

**3회 재시도 (3초 간격)** 후 수동 재연결 유도 방식을 채택합니다.

### Rationale

- **적정 대기 시간**: 3초 간격은 일시적 네트워크 장애를 커버하면서 사용자 대기 시간을 최소화
- **유한 재시도**: 무한 루프 방지 및 배터리/리소스 보호
- **사용자 제어**: 3회 실패 후 사용자가 명시적으로 재연결 시도 결정

### Edge Cases

- **전원 연결 끊김**: 모든 플레이어 연결 끊김 시 30분간 게임 상태 유지, 이후 미접속 시 게임 로그 작성 후 데이터 보관 (endReason: timeout)
- **개별 플레이어 끊김**: 3분 타임아웃 후 자동 파산 처리 (은행 귀속)

## 7. Concurrent Action Handling: Turn-Based Lock

### Decision

**턴 소유자만 액션 허용** 방식을 채택합니다.

### Rationale

- **단순성**: 복잡한 락 메커니즘 없이 턴 기반으로 동시성 제어
- **일관성**: 서버 SSOT 원칙 강화, 상태 충돌 방지
- **예측 가능성**: 사용자가 자신의 턴에만 액션 가능함을 명확히 인지

### Implementation

- 모든 액션 이벤트 핸들러에서 currentTurnPlayerId 검증
- 턴 불일치 시 NOT_YOUR_TURN 에러 반환
- 예외: 통행료 수금 알림은 모든 플레이어에게 전달

## 8. House Rules: Custom Modifications

### Decision

**일부 공식 규칙과 다른 하우스 룰**을 적용합니다.

### Custom Rules

| 항목           | 공식 규칙 | 적용 규칙      | 이유                         |
| -------------- | --------- | -------------- | ---------------------------- |
| 담보 땅 통행료 | 면제      | 정상 징수      | 사용자 결정 (게임 속도 향상) |
| 황금열쇠 연쇄  | -         | 연쇄 실행      | 원본 규칙 준수 + 재미 요소   |
| 호스트 이탈    | -         | 자동 권한 이전 | 게임 지속성 보장             |

## 9. QR Security: Server-Side Validation

### Decision

**서버측 위치 검증 + Rate Limiting** 방식을 채택합니다.

### Rationale

- **이동 거리 검증**: 주사위 결과와 스캔된 위치의 거리 일치 여부 확인
- **연속 스캔 제한**: 동일 플레이어의 빈번한 QR 스캔 시도 차단
- **복잡도 적정**: QR 암호화 서명 대비 구현 복잡도 낮음

### Implementation

- expectedPosition = (currentPosition + diceResult) % 40
- scannedPosition === expectedPosition 검증
- 스캔 실패 시 INVALID_QR 에러 및 재스캔 요청

## 10. Game Flow & UX Rules (Edge Cases)

### Decision

**2차 Edge Case Clarifications**를 기반으로 상세 게임 규칙을 확정합니다.

### Rules Table

| 카테고리         | 규칙                            | 구현 방식                                                  |
| ---------------- | ------------------------------- | ---------------------------------------------------------- |
| **사회복지기금** | 적립금 0원 시 수령 없음         | 도착 시 checkFund > 0 ? pay : showMessage                  |
| **강제 이동**    | 더블 후 강제이동 시 재굴림 유지 | doubleCount 유지, isForcedMove=true 후에도 rollDice 허용   |
| **건설 UX**      | 잔고 부족 건물 선택 불가        | 클라이언트에서 `price > balance` 확인하여 `disabled` 처리  |
| **파산 처리**    | 잔고 부족 시 즉시 파산          | `insufficient_funds` 시 매각/담보 단계 없이 즉시 자산 이전 |
| **최소 인원**    | 2명 이상 게임 시작 가능         | `players.length >= 2`일 때 Start 버튼 활성화               |

### Rationale

- **UX 편의성**: 건설 불가 옵션 비활성화로 불필요한 에러 방지
- **게임 속도**: 파산 절차 간소화 및 최소 인원 완화로 빠른 진행 유도
- **논리적 일관성**: 적립금이 없으면 받을 것도 없다는 직관적 규칙 적용
