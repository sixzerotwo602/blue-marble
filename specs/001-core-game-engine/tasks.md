# Tasks: 부루마블 핵심 게임 엔진

**Branch**: `001-core-game-engine` | **Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)
**Status**: Generated via Speckit on 2026-01-09 | **UI Reference**: [BlueMarbleUI.tsx](./references/BlueMarbleUI.tsx)

## Phase 1: 설정 및 인프라 (Setup & Infrastructure)

**목표**: 프로젝트 구조 초기화, 빌드 도구 설정, CI/CD 및 기본 테스트 구성.

- [ ] T001 `server` 및 `client` 워크스페이스를 포함한 Node.js TypeScript 프로젝트 초기화 @server @client
- [ ] T002 ESLint, Prettier 및 TypeScript 설정 (Strict Mode) @shared
- [ ] T003 단위 테스트용 Vitest 및 E2E 테스트용 Playwright 설정 @tests
- [ ] T004 `plan.md`에 따른 프로젝트 디렉토리 구조 생성 (models, services, routes, components) @server @client
- [ ] T005 [P] 기본 헬스 체크 엔드포인트가 포함된 Express/Fastify 서버 설정 @server
- [ ] T006 [P] 간단한 "Hello World" 페이지가 포함된 Vite + React 프론트엔드 설정 @client
- [ ] T007 프론트엔드-백엔드 타입 공유를 위한 shared types 워크스페이스 구성 @shared
- [ ] T008 `board.json` 및 `golden-keys.json` 로드를 위한 JSON 데이터 로더 구현 @server
- [ ] T009 [P] Socket.io 서버 및 클라이언트 연결 보일러플레이트 설정 @server @client

## Phase 2: 기반 데이터 레이어 (Foundational Data Layer)

**목표**: 핵심 데이터 모델 및 타입 정의 구현.

- [ ] T010 `PlayerState` 인터페이스 및 팩토리 함수 구현 @server/models
- [ ] T011 `PropertySpec` 및 `PropertyState` 인터페이스 구현 (개별 건물 개수 지원) @server/models
- [ ] T012 `GameState` 인터페이스 및 팩토리 함수 구현 @server/models
- [ ] T013 `GoldenKeyCard` 및 `TileSpec` 인터페이스 구현 @server/models
- [ ] T014 누적 통행료 데이터(원본)를 개별 단위 통행료(PropertySpec)로 변환하는 유틸리티 생성 @server/utils
- [ ] T015 프론트엔드 상태 관리를 위한 `GameStore` (Zustand) 구현 @client/stores

## Phase 3: 사용자 스토리 1 - 게임 초기화 (P1)

**목표**: 플레이어가 게임을 설정하고 올바른 초기 자금으로 시작할 수 있음.
**독립 테스트**: 시작 버튼 클릭 후 플레이어들이 0번 위치와 올바른 현금(4인 기준 293만원)을 보유하는지 확인.

- [ ] T016 [US1] `createGame(mode, timeLimit)` API 엔드포인트 구현 @server/api
- [ ] T017 [US1] `joinGame(gameId)` API 엔드포인트 및 소켓 이벤트 구현 @server/api
- [ ] T018 [US1] 플레이어 수 및 시간 제한 선택을 위한 로비 UI 구현 @client/pages
- [ ] T019 [US1] 플레이어 입장 이벤트를 브로드캐스트하는 WebSocket 로직 구현 @server/websocket
- [ ] T020 [US1] `startGame` 로직 구현: 순서 셔플, 초기 자금(3~4인: 293만, 2인: 586만), 위치 0으로 설정 @server/engine
- [ ] T021 [US1] 게임 보드 UI 렌더링 구현 (40칸 11x11 그리드) - **BlueMarbleUI.tsx 참조** @client/components
- [ ] T022 [US1] 보드 위 플레이어 말(Token) 렌더링 구현 - **BlueMarbleUI.tsx 참조** @client/components
- [ ] T023 [US1] E2E 테스트: 4인 게임 생성, 초기 상태 및 자금 확인 @tests/e2e

## Phase 4: 사용자 스토리 2 - 기본 턴 및 이동 (P1)

**목표**: 플레이어가 주사위를 굴리고 보드 위를 이동할 수 있음.
**독립 테스트**: 주사위 굴림 시 위치 업데이트; 더블 시 추가 턴 부여.

- [ ] T024 [US2] 서버 사이드 RNG를 사용한 `rollDice()` 헬퍼 구현 @server/utils
- [ ] T025 [US2] `handleRollDice` 소켓 이벤트 및 단순 이동 로직(위치 업데이트) 구현 @server/engine
- [ ] T026 [US2] `movePlayer` 로직 구현: "출발 칸 통과" 시 월급(+20만원) 처리 @server/engine
- [ ] T027 [US2] 애니메이션 기능을 갖춘 주사위 롤러 UI 컴포넌트 구현 @client/components
- [ ] T028 [US2] 프론트엔드 말 이동 애니메이션 구현 @client/components
- [ ] T029 [US2] "더블" 로직 구현: `die1 === die2`인 경우 추가 턴 부여 @server/engine
- [ ] T030 [US2] E2E 테스트: 주사위 굴리기, 이동 확인, 출발 통과 시 월급 확인 @tests/e2e

## Phase 5: 사용자 스토리 3 - 증서 구매 (P1)

**목표**: 플레이어가 도시에 도착하면 구매할 수 있음.
**독립 테스트**: 구매 시 현금 차감 및 소유권 업데이트.

- [ ] T031 [US3] `LandOnTile` 로직 구현: 미소유 도시(CITY) 감지 @server/engine
- [ ] T032 [US3] `purchaseProperty` 소켓 이벤트 구현: 자금 검증, 가격 차감, 소유자 설정 @server/engine
- [ ] T033 [US3] 구매 모달 UI 구현 (구매/패스) @client/components
- [ ] T034 [US3] 소유자 색상을 증서에 표시하도록 보드 UI 업데이트 @client/components
- [ ] T035 [US3] E2E 테스트: 미소유 도시에 도착하여 구매, 현금 및 색상 업데이트 확인 @tests/e2e

## Phase 6: 사용자 스토리 5 - 통행료 지불 (P1)

**목표**: 플레이어가 **합산** 건물 가치 로직에 따라 통행료를 지불함.
**독립 테스트**: 타인 소유지에 도착 시 정확한 통행료(대지 + 건물총합) 차감.

- [ ] T036 [US5] `calculateToll(property)` 로직 구현: `대지 + (별장 * 개수) + (빌딩 * 개수) + (호텔 * 개수)` 합산 @server/services
- [ ] T037 [US5] `payToll` 로직 구현: 방문자에게서 소유자로 현금 이체 @server/services
- [ ] T038 [US5] 자동 또는 수동 지불 트리거를 위한 `handleTollPayment` 소켓 이벤트 구현 @server/engine
- [ ] T039 [US5] 통행료 지불을 표시하도록 게임 로그 UI 업데이트 @client/components
- [ ] T040 [US5] [P] `FreePass` 카드 사용 로직 구현 (통행료 면제) @server/engine
- [ ] T041 [US5] E2E 테스트: P1이 P2의 땅에 도착, 기본 대지 통행료만큼 현금 이체 확인 @tests/e2e

## Phase 7: 사용자 스토리 6 - 파산 방지 (P1)

**목표**: 파산 전 매각/인계/대출을 통해 자금 부족 해결.
**독립 테스트**: 부족 시 정산 모드 발동; 실패 시 해당 플레이어 게임 오버.

- [ ] T042 [US6] `requiredPay` 체크 구현: 현금 < 금액이면 `SETTLE_SHORTAGE` 상태 트리거 @server/services
- [ ] T043 [US6] `sellBuilding` 로직 구현: 개별 건물(별장/빌딩/호텔)을 은행에 매각 @server/services
- [ ] T044 [US6] `transferProperty` 로직 구현: 부채 상환을 위해 채권자에게 증서 양도 @server/services
- [ ] T045 [US6] `takeLoan` 로직 구현: 현금 +100만, 대출 플래그 설정, 동의 필요 (AI/MVP는 자동 동의) @server/services
- [ ] T046 [US6] `declareBankruptcy` 로직 구현: 모든 자산 반환/양도 후 플레이어 제거 @server/services
- [ ] T047 [US6] 자금 정산 UI 구현 (매각/대출 옵션) @client/components
- [ ] T048 [US6] E2E 테스트: 자금 부족 상황 강제, 매각/대출 옵션 표시 확인, 부족 시 파산 확인 @tests/e2e

## Phase 8: 사용자 스토리 11 & 4 - 페이즈 전환 및 건물 건설 (P2)

**목표**: 게임 후반전 진입; 플레이어가 특정 건물을 건설할 수 있음.
**독립 테스트**: 미판매 증서 5개 이하 시 후반전 트리거. 건물 UI에서 별장/빌딩/호텔 개별 건설 가능.

- [ ] T049 [US11] 페이즈 체크 구현: `unsoldProperties <= 5`이면 `AUCTION` 트리거 (MVP는 `SECOND_HALF`로 스킵) @server/engine
- [ ] T050 [US11] 현재 게임 페이즈를 표시하도록 UI 업데이트 @client/components
- [ ] T051 [US4] `canBuild` 체크 구현: `SECOND_HALF`에서만 가능, 개수 < 제한 (별장:2, 빌딩:1, 호텔:1) @server/services
- [ ] T052 [US4] `constructBuilding` 소켓 이벤트 구현: 특정 비용 차감, 특정 카운터 증가 @server/engine
- [ ] T053 [US4] 건물 건설 UI 구현: 별장/빌딩/호텔을 위한 개별 버튼 @client/components
- [ ] T054 [US4] 건물 개수를 시각화하도록 맵 UI 업데이트 (점/아이콘) @client/components
- [ ] T055 [US4] E2E 테스트: 후반전 트리거, 별장 1개 및 호텔 1개 건설, 통행료 증가 확인 @tests/e2e

## Phase 9: 사용자 스토리 12 - 게임 종료 및 승리 (P1)

**목표**: 생존 또는 자산 가치로 승자 결정.
**독립 테스트**: 생존자 1명 남거나 시간 종료 시 게임 종료.

- [ ] T056 [US12] `checkWinCondition` 구현: 생존자 1명 남음 @server/engine
- [ ] T057 [US12] `checkTimeLimit` 구현: 시간 종료 시 총 자산(현금 + 증서가 + 건물비) 계산 @server/engine
- [ ] T058 [US12] 순위 및 자산 세부 정보를 포함한 게임 오버 화면 구현 @client/pages
- [ ] T059 [US12] E2E 테스트: 3명 파산 시뮬레이션, 남은 플레이어 즉시 승리 확인 @tests/e2e

## Phase 10: 특수 칸 (P2) - 황금열쇠, 무인도, 우주여행

**목표**: 특수 보드 효과 구현.

- [ ] T060 [US7] `drawGoldenKey` 로직 및 카드 실행 엔진 구현 @server/services
- [ ] T061 [US7] 구체적 카드 효과 구현: 이동, 지불/수령, 기부 @server/cards
- [ ] T062 [US8] "무인도" 로직 구현: 3턴 감금, 더블 시 탈출 @server/engine
- [ ] T063 [US8] `useEscapeCard` 로직 구현 @server/engine
- [ ] T064 [US9] "우주여행" 로직 구현: 정류장 이동, 대기 상태, 다음 턴 텔레포트 @server/engine
- [ ] T065 [US7/8/9] E2E 테스트: 황금열쇠 뽑기, 무인도 감금/탈출, 우주여행 텔레포트 확인 @tests/e2e

## Phase 11: 폴리싱 및 최적화

**목표**: UI 개선, DB 로깅 및 소소한 기능.

- [ ] T066 [US10] 사회복지기금 로직 구현 (기부/수령) @server/engine
- [ ] T067 연결 끊김 유저를 위한 AI 자동 플레이 구현 (기본 굴리기/구매 로직) @server/ai
- [ ] T068 [Polish] WebSocket 페이로드 크기 최적화 (필요 시 전체 상태 대신 변경분 전송) @server/socket
- [ ] T069 [Polish] 주사위, 구매, 지불 이벤트를 위한 효과음 추가 @client/assets
- [ ] T070 [FR-029] GameEvent 테이블 스키마 및 로깅 서비스 구현 @server/db
- [ ] T071 [FR-030] TurnSnapshot 저장 로직 구현 (매 턴 시작 시 상태 스냅샷) @server/db
- [ ] T072 [FR-031/032] 게임 결과 및 의사결정 시간 저장 구현 @server/db
- [ ] T073 [Polish] 최종 전체 게임 회귀 테스트 (Full Game Regression Test) @tests/e2e
