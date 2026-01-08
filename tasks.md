# Tasks: 부루마블 스마트 어시스턴트

**입력**: `/specs/001-bluemarble-assistant/`의 설계 문서
**선행 조건**: plan.md, spec.md, research.md, data-model.md, contracts/game-rpcs.md

**테스트**: ✅ 포함됨 - TDD는 헌법적 요구사항임 (제3조)

**구성**: 각 스토리를 독립적으로 구현하고 테스트할 수 있도록 유저 스토리별로 그룹화됨.

## 형식: `[ID] [P] [스토리] 설명`

- **[P]**: 병렬 실행 가능 (다른 파일, 의존성 없음)
- **[스토리]**: 이 태스크가 속한 유저 스토리 (US1-US8)
- **설명**: 설명에 정확한 파일 경로 포함

## 경로 규칙

- **Next.js 앱 라우터**: `app/` (페이지), `components/` (UI)
- **데이터베이스**: `supabase/migrations/` (스키마), `supabase/tests/` (pgTAP)
- **테스트**: `tests/integration/` (Vitest), `tests/e2e/` (Playwright)
- **라이브러리**: `lib/` (유틸리티, 스토어, 훅)

---

## Phase 1: 설정 (공유 인프라)

**목적**: 프로젝트 초기화 및 기본 구조

- [ ] T001 레포지토리 루트에 TypeScript와 Tailwind CSS로 Next.js 15 프로젝트 초기화
- [ ] T002 핵심 의존성 설치: @supabase/supabase-js, zustand, @radix-ui/react-\*, framer-motion
- [ ] T003 [P] 개발 의존성 설치: vitest, playwright, @playwright/test
- [ ] T004 [P] tailwind.config.ts에 모바일 우선 중단점(breakpoints) 및 안전 영역(safe-area) 유틸리티로 Tailwind CSS 구성
- [ ] T005 [P] vitest.config.ts에 통합 테스트를 위한 Vitest 구성 설정
- [ ] T006 [P] playwright.config.ts에 모바일 기기 에뮬레이션을 포함한 Playwright 구성 설정
- [ ] T007 `supabase init`으로 Supabase 프로젝트 초기화 (config.toml 생성)
- [ ] T008 supabase/config.toml에서 Supabase 로컬 개발 환경 구성
- [ ] T009 [P] app/manifest.ts에 PWA 매니페스트 구성 생성
- [ ] T010 [P] 오프라인 지원을 위해 public/sw.js에 서비스 워커 파일 생성

---

## Phase 2: 기반 (차단성 선행 조건)

**목적**: 모든 유저 스토리 구현 전에 완료되어야 하는 핵심 인프라

**⚠️ 중요**: 이 단계가 완료될 때까지 유저 스토리 작업을 시작할 수 없음

### 데이터베이스 스키마 (마이그레이션)

- [ ] T011 10개 핵심 테이블을 포함한 마이그레이션 20260104000001_init_schema.sql 생성: rooms, players, room_participants, properties, player_properties, golden_key_cards, golden_key_deck, player_inventory, game_state_log
- [ ] T012 data-model.md의 성능 인덱스를 포함한 마이그레이션 20260104000002_indexes.sql 생성
- [ ] T013 모든 테이블에 대한 Row Level Security (RLS) 정책을 포함한 마이그레이션 20260104000003_rls_policies.sql 생성
- [ ] T014 rooms, room_participants, player_properties 테이블에 Realtime을 활성화하는 마이그레이션 20260104000004_realtime_config.sql 생성

### 데이터베이스 시드 데이터

- [ ] T015 [P] supabase/seed.sql에 `properties` 테이블을 위한 시드 데이터 생성 (40개 보드 칸)
- [ ] T016 [P] supabase/seed.sql에 `golden_key_cards` 테이블을 위한 시드 데이터 생성 (30장)
- [ ] T017 [P] supabase/seed.sql에 E2E 테스트를 위한 4명의 모의(mock) 플레이어가 있는 테스트 방 생성

### Supabase 클라이언트 설정

- [ ] T018 [P] lib/supabase/client.ts에 Supabase 브라우저 클라이언트 초기화 생성
- [ ] T019 [P] lib/supabase/server.ts에 Supabase 서버 컴포넌트 클라이언트 생성
- [ ] T020 [P] lib/supabase/middleware.ts에 익명 인증 미들웨어 생성

### 핵심 UI 인프라

- [ ] T021 [P] app/layout.tsx에 Supabase provider를 포함한 루트 레이아웃 생성
- [ ] T022 [P] components/ui/button.tsx에 Radix UI Button 기본 요소 설정
- [ ] T023 [P] components/ui/sheet.tsx에 Radix UI Sheet (하단 서랍) 기본 요소 설정
- [ ] T024 [P] components/ui/dialog.tsx에 Radix UI Dialog 기본 요소 설정
- [ ] T025 [P] components/layout/safe-area.tsx에 안전 영역(safe area) 래퍼 컴포넌트 생성
- [ ] T026 [P] components/layout/mobile-nav.tsx에 모바일 내비게이션 바 컴포넌트 생성

### 상수 및 타입 정의

- [ ] T027 [P] lib/utils/constants.ts에 게임 상수 파일 생성 (보드 위치, 시작 자금)
- [ ] T028 [P] lib/types/realtime-events.ts에 Realtime 이벤트를 위한 TypeScript 타입 생성
- [ ] T029 [P] lib/types/rpc-contracts.ts에 RPC 요청/응답 계약을 위한 TypeScript 타입 생성

### Zustand 스토어

- [ ] T030 [P] lib/stores/game-store.ts에 게임 상태 스토어 생성 (플레이어, 보드, 턴)
- [ ] T031 [P] lib/stores/ui-store.ts에 UI 상태 스토어 생성 (모달, 토스트, 로딩)

**체크포인트**: 기반 준비 완료 - 이제 유저 스토리 구현을 병렬로 시작할 수 있음

---

## Phase 3: 유저 스토리 1 - 디지털 주사위 및 자동 이동 (우선순위: P1) 🎯 MVP

**목표**: 플레이어가 방을 생성/참여하고, 서버에서 생성된 주사위를 굴리며, 실시간으로 위치 업데이트를 볼 수 있음

**독립 테스트**: 방 생성, 4명 참여, 게임 시작, 주사위 굴리기 및 서버의 랜덤 2d6 결과와 올바른 위치 계산 반환 확인. 모든 클라이언트가 200ms 내에 업데이트 확인.

### pgTAP 계약 테스트 (구현 전 작성 필수, 실패 확인)

- [ ] T032 [P] [US1] supabase/tests/room_rpcs_test.sql에 create_room RPC 계약 테스트 작성
- [ ] T033 [P] [US1] supabase/tests/room_rpcs_test.sql에 join_room RPC 계약 테스트 작성
- [ ] T034 [P] [US1] supabase/tests/room_rpcs_test.sql에 start_game RPC 계약 테스트 작성
- [ ] T035 [P] [US1] supabase/tests/dice_rpcs_test.sql에 roll_dice RPC 계약 테스트 작성
- [ ] T036 [P] [US1] supabase/tests/dice_rpcs_test.sql에 end_turn RPC 계약 테스트 작성
- [ ] T037 [P] [US1] supabase/tests/dice_rpcs_test.sql에 연속 더블 로직(3회 → 무인도) 계약 테스트 작성
- [ ] T038 [P] [US1] supabase/tests/dice_rpcs_test.sql에 시작점 통과 시 월급 지급 계약 테스트 작성

### 데이터베이스 RPC 구현

- [ ] T039 [US1] supabase/migrations/20260104000005_room_rpcs.sql에 create_room RPC 구현
- [ ] T040 [US1] supabase/migrations/20260104000005_room_rpcs.sql에 색상 배정 로직을 포함하여 join_room RPC 구현
- [ ] T041 [US1] supabase/migrations/20260104000005_room_rpcs.sql에 턴 순서 무작위화 로직을 포함하여 start_game RPC 구현
- [ ] T042 [US1] supabase/migrations/20260104000006_dice_rpcs.sql에 2d6 생성, 위치 계산, 월급 로직을 포함하여 roll_dice RPC 구현
- [ ] T043 [US1] supabase/migrations/20260104000006_dice_rpcs.sql에 턴 인덱스 진행을 포함하여 end_turn RPC 구현
- [ ] T044 [US1] supabase/migrations/20260104000007_realtime_triggers.sql에 player_joined, game_started, dice_rolled, turn_ended에 대한 Realtime 브로드캐스트 트리거 추가

### 프론트엔드 - 방 생성 및 로비

- [ ] T045 [P] [US1] app/page.tsx에 방 생성/참여 UI가 있는 랜딩 페이지 생성
- [ ] T046 [P] [US1] components/game/player-avatar.tsx에 플레이어 아바타 컴포넌트(색상 코드) 생성
- [ ] T047 [US1] app/lobby/[code]/page.tsx에 플레이어 목록과 준비 상태가 있는 로비 페이지 생성
- [ ] T048 [US1] app/api/game-actions.ts에 join_room Server Action 래퍼 구현
- [ ] T049 [US1] app/api/game-actions.ts에 create_room Server Action 래퍼 구현

### 프론트엔드 - 게임 보드 및 주사위 굴리기

- [ ] T050 [P] [US1] components/game/dice-roller.tsx에 애니메이션 주사위 롤러 컴포넌트 생성
- [ ] T051 [US1] app/room/[code]/page.tsx에 게임 보드 페이지 (메인 게임 UI) 생성
- [ ] T052 [US1] app/room/[code]/board.tsx에 플레이어 위치가 표시되는 인터랙티브 보드 컴포넌트 생성
- [ ] T053 [US1] app/room/[code]/player-panel.tsx에 액션 버튼이 있는 플레이어 패널 컴포넌트 생성
- [ ] T054 [US1] app/room/[code]/game-log.tsx에 게임 로그 사이드바 컴포넌트 (이벤트 기록) 생성

### Realtime 훅

- [ ] T055 [P] [US1] lib/hooks/use-realtime.ts에 방 브로드캐스트 구독을 위한 useRealtime 훅 생성
- [ ] T056 [P] [US1] lib/hooks/use-game-actions.ts에 낙관적 업데이트(optimistic updates)를 포함한 RPC 호출용 useGameActions 훅 생성
- [ ] T057 [P] [US1] lib/hooks/use-reconnect.ts에 네트워크 복원력을 위한 useReconnect 훅 생성

### 통합 테스트 (Vitest)

- [ ] T058 [P] [US1] tests/integration/game-flow.test.ts에 통합 테스트 작성: 전체 게임 흐름 (생성 → 참여 → 시작 → 굴리기)
- [ ] T059 [P] [US1] tests/integration/realtime-sync.test.ts에 통합 테스트 작성: 주사위 굴리기 시 Realtime 동기화 <200ms
- [ ] T060 [P] [US1] tests/integration/turn-flow.test.ts에 통합 테스트 작성: 4인 플레이어 턴 순환

### E2E 테스트 (Playwright)

- [ ] T061 [P] [US1] tests/e2e/multiplayer-sync.spec.ts에 E2E 테스트 작성: 4명의 동시 플레이어가 동일한 주사위 결과를 보는지 확인
- [ ] T062 [P] [US1] tests/e2e/mobile-ux.spec.ts에 E2E 테스트 작성: 모바일 뷰포트에서의 터치 상호작용 (주사위 탭)
- [ ] T063 [P] [US1] tests/e2e/dice-edge-cases.spec.ts에 E2E 테스트 작성: 연속 더블 시 무인도로 이동

**체크포인트**: 이 시점에서 유저 스토리 1은 완전히 기능해야 하며 독립적으로 테스트 가능해야 함 (MVP 준비됨)

---

## Phase 4: 유저 스토리 2 - 자산 및 임대료 관리 자동화 (우선순위: P1)

**목표**: 플레이어가 자산을 구매하고, 임대료를 자동으로 지불하며, 잔액 업데이트를 실시간으로 볼 수 있음

**독립 테스트**: 플레이어 A가 자산을 소유한 상태로 게임 설정. 플레이어 B가 해당 자산에 도착하게 함. 수동 입력 없이 두 기기 모두에서 임대료 자동 계산 및 잔액 업데이트 확인.

### pgTAP 계약 테스트

- [ ] T064 [P] [US2] supabase/tests/property_rpcs_test.sql에 buy_property RPC 계약 테스트 작성
- [ ] T065 [P] [US2] supabase/tests/property_rpcs_test.sql에 잔액 차감을 포함한 pay_rent RPC 계약 테스트 작성
- [ ] T066 [P] [US2] supabase/tests/property_rpcs_test.sql에 건물이 있는 경우의 임대료 계산 계약 테스트 작성
- [ ] T067 [P] [US2] supabase/tests/property_rpcs_test.sql에 모든 자산이 소유되었을 때 second_half 트리거 계약 테스트 작성
- [ ] T068 [P] [US2] supabase/tests/property_rpcs_test.sql에 자금 부족 → 파산 흐름 계약 테스트 작성

### 데이터베이스 RPC 구현

- [ ] T069 [US2] supabase/migrations/20260104000008_property_rpcs.sql에 비관적 잠금 (SELECT FOR UPDATE)을 포함하여 buy_property RPC 구현
- [ ] T070 [US2] supabase/migrations/20260104000008_property_rpcs.sql에 자동 계산 및 이체를 포함하여 pay_rent RPC 구현
- [ ] T071 [US2] supabase/migrations/20260104000008_property_rpcs.sql에 buy_property에 후반전(second_half) 단계 전환 로직 추가 (자산 수 = 29)
- [ ] T072 [US2] supabase/migrations/20260104000009_property_triggers.sql에 property_purchased, rent_paid, second_half_started에 대한 Realtime 브로드캐스트 트리거 추가

### 프론트엔드 - 자산 구매 및 임대료 UI

- [ ] T073 [P] [US2] components/game/property-card.tsx에 구매/상세 UI가 포함된 자산 카드 컴포넌트 생성
- [ ] T074 [US2] app/room/[code]/player-panel.tsx에 플레이어 패널(하단 시트)에 자산 구매 흐름 추가
- [ ] T075 [US2] components/game/rent-notification.tsx에 임대료 지불 알림 토스트 추가
- [ ] T076 [US2] app/room/[code]/board.tsx에 게임 보드에 자산 소유권 배지 표시 업데이트

### 클라이언트 측 표시 로직

- [ ] T077 [P] [US2] lib/utils/game-rules.ts에 임대료 계산 미리보기 유틸리티 (클라이언트 측) 생성
- [ ] T078 [P] [US2] lib/utils/formatters.ts에 잔액 포맷팅 유틸리티 생성

### 통합 테스트

- [ ] T079 [P] [US2] tests/integration/property-purchase.test.ts에 통합 테스트 작성: 자산 구매 및 소유권 이전 확인
- [ ] T080 [P] [US2] tests/integration/rent-calculation.test.ts에 통합 테스트 작성: 여러 건물이 있는 경우의 임대료 지불
- [ ] T081 [P] [US2] tests/integration/game-phase.test.ts에 통합 테스트 작성: 29번째 자산 판매 후 후반전 트리거

### E2E 테스트

- [ ] T082 [P] [US2] tests/e2e/rent-payment-flow.spec.ts에 E2E 테스트 작성: 플레이어 A가 자산 구매, 플레이어 B가 도착하여 임대료 지불
- [ ] T083 [P] [US2] tests/e2e/balance-sync.spec.ts에 E2E 테스트 작성: 모든 4개 기기에서 200ms 내에 잔액 업데이트 표시

**체크포인트**: 유저 스토리 1과 2가 모두 독립적으로 작동해야 함

---

## Phase 5: 유저 스토리 8 - 실시간 네트워크 동기화 (우선순위: P1)

**목표**: 모든 상태 변경이 200ms 내에 모든 플레이어에게 브로드캐스트되며, 연결 끊김 처리가 됨

**독립 테스트**: 4개의 동시 연결 시뮬레이션. 상태 변경(주사위 굴리기, 구매) 수행. 모든 클라이언트가 200ms 내에 업데이트를 수신하는지 확인. 연결 끊김 시뮬레이션 및 일시 정지 로직 확인.

### 데이터베이스 - 연결 관리

- [ ] T084 [P] [US8] room_participants 테이블에 연결 상태 추적 컬럼 추가 (is_connected, disconnected_at) - 스키마에 이미 있다면 확인
- [ ] T085 [P] [US8] supabase/tests/connection_test.sql에 연결 끊김 시 자동 일시 정지 계약 테스트 작성
- [ ] T086 [P] [US8] supabase/tests/connection_test.sql에 3분 타임아웃 → 파산 계약 테스트 작성

### 데이터베이스 RPC

- [ ] T087 [US8] supabase/migrations/20260104000010_connection_rpcs.sql에 is_connected 상태를 업데이트하는 하트비트 RPC 구현
- [ ] T088 [US8] supabase/migrations/20260104000010_connection_rpcs.sql에 pg_cron 또는 함수를 통해 3분 타임아웃 시 자동 파산 구현
- [ ] T089 [US8] supabase/migrations/20260104000011_connection_triggers.sql에 player_disconnected, player_reconnected에 대한 Realtime 브로드캐스트 트리거 추가

### 프론트엔드 - 네트워크 복원력

- [ ] T090 [US8] lib/hooks/use-reconnect.ts의 useReconnect 훅에 3분 카운트다운 타이머 추가
- [ ] T091 [US8] components/game/connection-status.tsx에 연결 상태 표시기 컴포넌트 생성
- [ ] T092 [US8] app/room/[code]/page.tsx에 플레이어 연결 끊김 시 게임 일시 정지 오버레이 추가
- [ ] T093 [US8] lib/hooks/use-game-actions.ts에 서버 조정(reconciliation)을 포함한 낙관적 UI 구현

### 통합 테스트

- [ ] T094 [P] [US8] tests/integration/realtime-performance.test.ts에 통합 테스트 작성: 모든 이벤트 유형에 대해 브로드캐스트 지연 시간 <200ms
- [ ] T095 [P] [US8] tests/integration/reconnection.test.ts에 통합 테스트 작성: 연결 끊김 → 3분 내 재연결 시 게임 재개
- [ ] T096 [P] [US8] tests/integration/timeout-bankruptcy.test.ts에 통합 테스트 작성: 3분 후 타임아웃 시 자동 파산 트리거

### E2E 테스트

- [ ] T097 [P] [US8] tests/e2e/network-resilience.spec.ts에 E2E 테스트 작성: 한 플레이어 연결 끊김, 모든 기기에서 게임 일시 정지 확인
- [ ] T098 [P] [US8] tests/e2e/network-resilience.spec.ts에 E2E 테스트 작성: 3분 내 플레이어 재연결, 상태 동기화 확인
- [ ] T099 [P] [US8] tests/e2e/concurrent-actions.spec.ts에 E2E 테스트 작성: 동시 동작이 있는 4인 게임 (경쟁 상태 처리)

**체크포인트**: 실시간 동기화가 현장 테스트를 통과하고 <200ms 헌법적 요구사항을 충족함

---

## Phase 6: 유저 스토리 3 - 황금열쇠 카드 시스템 (우선순위: P2)

**목표**: 플레이어가 무작위 황금열쇠 카드를 뽑고 효과(현금, 이동, 인벤토리)를 적용받음

**독립 테스트**: 황금열쇠 뽑기 트리거. 서버가 30장 덱에서 무작위 카드를 반환하고, 효과(이동/현금/자산)를 올바르게 적용하며, 덱이 소진될 때까지 카드가 반복되지 않음을 확인.

### pgTAP 계약 테스트

- [ ] T100 [P] [US3] supabase/tests/golden_key_test.sql에 draw_golden_key RPC 계약 테스트 작성
- [ ] T101 [P] [US3] supabase/tests/golden_key_test.sql에 카드 효과(현금, 이동, 세금) 계약 테스트 작성
- [ ] T102 [P] [US3] supabase/tests/golden_key_test.sql에 덱 소진 → 셔플 계약 테스트 작성
- [ ] T103 [P] [US3] supabase/tests/golden_key_test.sql에 인벤토리 카드(무전기, 우대권) 계약 테스트 작성

### 데이터베이스 RPC

- [ ] T104 [US3] supabase/migrations/20260104000012_golden_key_rpcs.sql에 무작위 선택(ORDER BY random())을 포함하여 draw_golden_key RPC 구현
- [ ] T105 [US3] supabase/migrations/20260104000012_golden_key_rpcs.sql에 카드 효과 적용 로직(effect_type에 따른 switch) 구현
- [ ] T106 [US3] supabase/migrations/20260104000012_golden_key_rpcs.sql에 30장 카드가 모두 뽑혔을 때 덱 셔플 로직 추가
- [ ] T107 [US3] supabase/migrations/20260104000013_golden_key_triggers.sql에 golden_key_drawn에 대한 Realtime 브로드캐스트 트리거 추가

### 프론트엔드 - 황금열쇠 UI

- [ ] T108 [P] [US3] components/game/golden-key-modal.tsx에 애니메이션이 있는 황금열쇠 카드 공개 모달 생성
- [ ] T109 [US3] app/room/[code]/player-panel.tsx의 플레이어 패널 액션에 황금열쇠 뽑기 통합
- [ ] T110 [US3] app/room/[code]/board.tsx의 게임 보드에 황금열쇠 칸 표시기 추가

### 통합 테스트

- [ ] T111 [P] [US3] tests/integration/golden-key-deck.test.ts에 통합 테스트 작성: 30장 모두 뽑기, 셔플 전까지 중복 없음 확인
- [ ] T112 [P] [US3] tests/integration/golden-key-effects.test.ts에 통합 테스트 작성: 현금 효과 카드 (병원비, 복권 당첨)
- [ ] T113 [P] [US3] tests/integration/golden-key-effects.test.ts에 통합 테스트 작성: 이동 효과 카드 (부산으로 이동)

### E2E 테스트

- [ ] T114 [P] [US3] tests/e2e/golden-key-flow.spec.ts에 E2E 테스트 작성: 플레이어가 카드를 뽑고, 애니메이션을 보고, 효과가 적용됨
- [ ] T115 [P] [US3] tests/e2e/golden-key-inventory.spec.ts에 E2E 테스트 작성: 인벤토리 카드(무전기)가 플레이어 인벤토리에 추가됨

**체크포인트**: 황금열쇠 시스템이 30장 모든 카드에 대해 독립적으로 작동함

---

## Phase 7: 유저 스토리 4 - 무인도 탈출 로직 (우선순위: P2)

**목표**: 무인도에 갇힌 플레이어가 탈출을 시도(더블 굴리기)하거나 3턴을 기다림

**독립 테스트**: 플레이어를 무인도에 배치. 턴 카운터 감소, 탈출 시도 올바르게 작동 (더블 = 성공), 3턴 후 강제 석방 확인.

### pgTAP 계약 테스트

- [ ] T116 [P] [US4] supabase/tests/island_test.sql에 attempt_island_escape RPC 계약 테스트 작성
- [ ] T117 [P] [US4] supabase/tests/island_test.sql에 더블 → 즉시 탈출 계약 테스트 작성
- [ ] T118 [P] [US4] supabase/tests/island_test.sql에 3턴 강제 석방 계약 테스트 작성
- [ ] T119 [P] [US4] supabase/tests/island_test.sql에 무전기 카드 즉시 탈출 계약 테스트 작성

### 데이터베이스 RPC

- [ ] T120 [US4] supabase/migrations/20260104000014_island_rpcs.sql에 더블 감지를 포함하여 attempt_island_escape RPC 구현
- [ ] T121 [US4] supabase/migrations/20260104000015_inventory_rpcs.sql에 무전기 카드를 위한 use_inventory_item RPC 구현
- [ ] T122 [US4] supabase/migrations/20260104000006_dice_rpcs.sql의 roll_dice RPC를 수정하여 무인도 갇힘 처리(3회 더블, 황금열쇠) 추가
- [ ] T123 [US4] supabase/migrations/20260104000016_island_triggers.sql에 island_escape_attempted에 대한 Realtime 브로드캐스트 트리거 추가

### 프론트엔드 - 무인도 UI

- [ ] T124 [P] [US4] components/game/island-panel.tsx에 무인도 탈출 UI (탈출 시도 / 무전기 사용 / 대기) 생성
- [ ] T125 [US4] app/room/[code]/player-panel.tsx에 플레이어 패널에 무인도 상태 표시기 추가
- [ ] T126 [US4] app/room/[code]/player-panel.tsx에 플레이어 패널에 인벤토리 표시(무전기 카드) 추가

### 통합 테스트

- [ ] T127 [P] [US4] tests/integration/island-turns.test.ts에 통합 테스트 작성: 무인도 턴 카운터가 올바르게 감소함
- [ ] T128 [P] [US4] tests/integration/island-escape.test.ts에 통합 테스트 작성: 더블 굴림 → 탈출 + 합계만큼 이동
- [ ] T129 [P] [US4] tests/integration/island-auto-release.test.ts에 통합 테스트 작성: 3턴 자동 석방

### E2E 테스트

- [ ] T130 [P] [US4] tests/e2e/island-flow.spec.ts에 E2E 테스트 작성: 플레이어가 무인도로 보내짐, 3턴 대기, 자동 석방
- [ ] T131 [P] [US4] tests/e2e/inventory-usage.spec.ts에 E2E 테스트 작성: 플레이어가 무전기 카드 사용, 즉시 탈출

**체크포인트**: 무인도 메커니즘이 독립적으로 작동함

---

## Phase 8: 유저 스토리 6 - 파산 및 자산 이전 (우선순위: P2)

**목표**: 자금이 부족한 플레이어는 파산을 선언하고 자산을 채권자 또는 은행으로 이전할 수 있음

**독립 테스트**: 파산 시나리오 강제. 플레이어 부채인 경우 채권자가 모든 자산을 받는지, 세금/카드 부채인 경우 자산이 은행으로 반환되는지 확인. 파산한 플레이어가 더 이상 행동을 취할 수 없는지 확인.

### pgTAP 계약 테스트

- [ ] T132 [P] [US6] supabase/tests/bankruptcy_test.sql에 declare_bankruptcy RPC 계약 테스트 작성
- [ ] T133 [P] [US6] supabase/tests/bankruptcy_test.sql에 플레이어 채권자에게 자산 이전 계약 테스트 작성
- [ ] T134 [P] [US6] supabase/tests/bankruptcy_test.sql에 은행으로 자산 반환 (세금 부채) 계약 테스트 작성
- [ ] T135 [P] [US6] supabase/tests/bankruptcy_test.sql에 1명 남았을 때 게임 종료 계약 테스트 작성

### 데이터베이스 RPC

- [ ] T136 [US6] supabase/migrations/20260104000017_bankruptcy_rpcs.sql에 채권자 감지 로직을 포함하여 declare_bankruptcy RPC 구현
- [ ] T137 [US6] supabase/migrations/20260104000017_bankruptcy_rpcs.sql에 자산 이전 로직 (플레이어 대 은행 부채) 구현
- [ ] T138 [US6] supabase/migrations/20260104000017_bankruptcy_rpcs.sql에 게임 종료 로직 (1명 남음 → 승자 선언) 구현
- [ ] T139 [US6] supabase/migrations/20260104000018_bankruptcy_triggers.sql에 player_bankrupted, game_ended에 대한 Realtime 브로드캐스트 트리거 추가

### 프론트엔드 - 파산 UI

- [ ] T140 [P] [US6] components/game/bankruptcy-modal.tsx에 자산 요약이 포함된 파산 확인 모달 생성
- [ ] T141 [US6] app/room/[code]/game-over.tsx에 최종 순위가 있는 게임 오버 화면 생성
- [ ] T142 [US6] app/room/[code]/player-panel.tsx에 자금 부족 시 파산 버튼 추가

### 통합 테스트

- [ ] T143 [P] [US6] tests/integration/bankruptcy-player-debt.test.ts에 통합 테스트 작성: 파산 시 모든 자산이 플레이어 채권자에게 이전됨
- [ ] T144 [P] [US6] tests/integration/bankruptcy-bank-debt.test.ts에 통합 테스트 작성: 파산 시 자산이 은행으로 반환됨 (세금 부채)
- [ ] T145 [P] [US6] tests/integration/game-end.test.ts에 통합 테스트 작성: 3명 파산 시 게임 종료, 승자 선언

### E2E 테스트

- [ ] T146 [P] [US6] tests/e2e/bankruptcy-flow.spec.ts에 E2E 테스트 작성: 플레이어 파산, 자산 이전, 게임 계속
- [ ] T147 [P] [US6] tests/e2e/game-end.spec.ts에 E2E 테스트 작성: 마지막 플레이어 파산, 모든 기기에서 승자 발표

**체크포인트**: 파산 메커니즘이 올바른 자산 이전과 함께 작동함

---

## Phase 9: 유저 스토리 7 - 후반전 건물 건설 (우선순위: P3)

**목표**: 모든 자산이 판매된 후, 플레이어는 소유한 자산에 별장/빌딩/호텔을 지을 수 있음

**독립 테스트**: 모든 자산을 소유 상태로 표시. "후반전" 모드가 건설을 활성화하는지 확인. 건물 구매가 정확한 금액을 차감하고 임대료 계산을 업데이트하는지 확인.

### pgTAP 계약 테스트

- [ ] T148 [P] [US7] supabase/tests/building_test.sql에 build RPC 계약 테스트 작성
- [ ] T149 [P] [US7] supabase/tests/building_test.sql에 건물 제한 (최대 별장, 빌딩, 호텔 수) 계약 테스트 작성
- [ ] T150 [P] [US7] supabase/tests/building_test.sql에 중첩된 건물이 있는 임대료 계산 계약 테스트 작성
- [ ] T151 [P] [US7] supabase/tests/building_test.sql에 판매 시 건물 100% 환불 계약 테스트 작성

### 데이터베이스 RPC

- [ ] T152 [US7] supabase/migrations/20260104000019_building_rpcs.sql에 건물 제한 유효성 검사를 포함하여 build RPC 구현
- [ ] T153 [US7] supabase/migrations/20260104000019_building_rpcs.sql에 100% 환불을 포함하여 sell_building RPC 구현
- [ ] T154 [US7] supabase/migrations/20260104000008_property_rpcs.sql의 pay_rent RPC를 수정하여 건물 보너스 계산 추가 (US2에 이미 있다면 확인)
- [ ] T155 [US7] supabase/migrations/20260104000020_building_triggers.sql에 building_constructed에 대한 Realtime 브로드캐스트 트리거 추가

### 프론트엔드 - 건물 UI

- [ ] T156 [P] [US7] components/game/building-panel.tsx에 건물 건설 패널 (별장/빌딩/호텔 선택) 생성
- [ ] T157 [US7] components/game/property-card.tsx의 자산 카드를 업데이트하여 건물 수와 임대료 미리보기 표시
- [ ] T158 [US7] app/room/[code]/board.tsx의 게임 보드 자산 칸에 건물 아이콘 추가
- [ ] T159 [US7] components/game/phase-banner.tsx에 "후반전 시작!" 알림 배너 추가

### 통합 테스트

- [ ] T160 [P] [US7] tests/integration/building-construction.test.ts에 통합 테스트 작성: 별장/빌딩/호텔 건설, 임대료 증가 확인
- [ ] T161 [P] [US7] tests/integration/building-limits.test.ts에 통합 테스트 작성: 건물 제한 시행 (최대 별장 2개 등)
- [ ] T162 [P] [US7] tests/integration/building-sale.test.ts에 통합 테스트 작성: 건물 판매, 100% 환불 확인

### E2E 테스트

- [ ] T163 [P] [US7] tests/e2e/building-flow.spec.ts에 E2E 테스트 작성: 플레이어가 호텔 건설, 상대방이 도착하여 증가된 임대료 지불
- [ ] T164 [P] [US7] tests/e2e/building-sync.spec.ts에 E2E 테스트 작성: 모든 기기에서 건물 아이콘 실시간 업데이트 확인

**체크포인트**: 후반전 건물 시스템 작동

---

## Phase 10: 유저 스토리 5 - 우주여행 전략적 이동 (우선순위: P3)

**목표**: 우주여행에 도착한 플레이어는 다음 턴에 원하는 보드 위치로 순간이동할 수 있음

**독립 테스트**: 우주여행 도착. 다음 턴에 주사위 굴리기 대신 위치 선택 UI가 표시되는지 확인. "한 바퀴 돌 때" 월급 계산과 목적지 칸 효과가 올바르게 트리거되는지 확인.

### pgTAP 계약 테스트

- [ ] T165 [P] [US5] supabase/tests/space_travel_test.sql에 select_space_travel_destination RPC 계약 테스트 작성
- [ ] T166 [P] [US5] supabase/tests/space_travel_test.sql에 한 바퀴 돌 때(목적지 < 현재) 월급 계산 계약 테스트 작성
- [ ] T167 [P] [US5] supabase/tests/space_travel_test.sql에 목적지 칸 효과 트리거 계약 테스트 작성

### 데이터베이스 RPC

- [ ] T168 [US5] supabase/migrations/20260104000021_space_travel_rpcs.sql에 루프 감지를 포함하여 select_space_travel_destination RPC 구현
- [ ] T169 [US5] supabase/migrations/20260104000006_dice_rpcs.sql의 roll_dice RPC를 수정하여 위치 31 도착 시 space_travel_active 플래그 설정
- [ ] T170 [US5] supabase/migrations/20260104000022_space_travel_triggers.sql에 space_travel_completed에 대한 Realtime 브로드캐스트 트리거 추가

### 프론트엔드 - 우주여행 UI

- [ ] T171 [P] [US5] components/game/space-travel-modal.tsx에 위치 선택 모달 (40개 칸이 있는 보드 지도) 생성
- [ ] T172 [US5] app/room/[code]/player-panel.tsx에서 space_travel_active일 때 주사위 롤러를 위치 선택 UI로 대체
- [ ] T173 [US5] app/room/[code]/board.tsx에 우주여행 칸 표시기 추가 (위치 31)

### 통합 테스트

- [ ] T174 [P] [US5] tests/integration/space-travel-salary.test.ts에 통합 테스트 작성: 우주여행 도착, 서울 선택, 월급 지급 확인
- [ ] T175 [P] [US5] tests/integration/space-travel-effects.test.ts에 통합 테스트 작성: 목적지 선택, 목적지 칸 효과 트리거 확인

### E2E 테스트

- [ ] T176 [P] [US5] tests/e2e/space-travel-flow.spec.ts에 E2E 테스트 작성: 플레이어가 우주여행 사용, 목적지 선택, 올바르게 착륙
- [ ] T177 [P] [US5] tests/e2e/space-travel-strategy.spec.ts에 E2E 테스트 작성: 상대방 자산을 피하기 위한 전략적 우주여행

**체크포인트**: 모든 유저 스토리 완료 및 독립적으로 기능함

---

## Phase 11: 다듬기 및 공통 관심사 (Polish & Cross-Cutting Concerns)

**목적**: 여러 유저 스토리에 영향을 미치는 개선 사항

- [ ] T178 [P] supabase/migrations/20260104000023_welfare_fund.sql의 roll_dice RPC에 사회복지기금 입금/배당 추가 (위치 17, 28)
- [ ] T179 [P] lib/hooks/use-game-persistence.ts에 게임 상태 지속성(localStorage 자동 저장) 추가
- [ ] T180 [P] components/game/sound-manager.tsx에 주사위 굴리기, 구매, 임대료에 대한 효과음 추가
- [ ] T181 [P] lib/utils/haptics.ts에 모바일 액션(주사위 탭)에 대한 햅틱 피드백 추가
- [ ] T182 [P] components/game/dice-roller.tsx에 애니메이션 다듬기 (주사위 굴리기, 자산 구매) 추가
- [ ] T183 [P] app/error.tsx에 우아한 에러 처리를 위한 에러 경계(error boundary) 추가
- [ ] T184 [P] lib/hooks/use-game-actions.ts에 모든 RPC 호출에 대한 로딩 상태 추가
- [ ] T185 [P] supabase/migrations/20260104000024_optimize_broadcasts.sql에서 Realtime 페이로드 크기 최적화 (델타 업데이트)
- [ ] T186 [P] lib/utils/error-messages.ts에 포괄적인 에러 메시지 (한국어 번역) 추가
- [ ] T187 [P] components/ui/\*에 스크린 리더를 위한 접근성 레이블 추가
- [ ] T188 [P] 성능 감사: 모바일에서 Lighthouse PWA 점수 ≥90
- [ ] T189 [P] 보안 감사: RLS 정책이 모든 엣지 케이스를 커버하는지 확인
- [ ] T190 [P] specs/001-bluemarble-assistant/quickstart.md에 최종 설정 지침 업데이트
- [ ] T191 전체 테스트 스위트 실행: pgTAP + Vitest + Playwright (모두 통과)
- [ ] T192 Supabase 스테이징 환경에 배포하고 실제 기기 4대로 테스트
- [ ] T193 전체 4인 게임 흐름을 보여주는 데모 비디오 생성

---

## 의존성 및 실행 순서

### 단계별 의존성

- **설정 (Phase 1)**: 의존성 없음 - 즉시 시작 가능
- **기반 (Phase 2)**: 설정 완료에 의존 - 모든 유저 스토리 차단 (BLOCKING)
- **유저 스토리 (Phase 3-10)**: 모두 기반 단계 완료에 의존
  - US1, US2, US8 (P1 우선순위)은 Phase 2 이후 병렬 진행 가능
  - US3, US4, US6 (P2 우선순위)은 Phase 2 이후 병렬 진행 가능
  - US5, US7 (P3 우선순위)은 Phase 2 이후 병렬 진행 가능
- **다듬기 (Phase 11)**: 원하는 유저 스토리 완료에 의존

### 유저 스토리 의존성

- **User Story 1 (P1)**: 의존성 없음 (기반 주사위/방 메커니즘)
- **User Story 2 (P1)**: Phase 2 이후 시작 가능, US1과 통합 (주사위 결과 사용)
- **User Story 8 (P1)**: Phase 2 이후 시작 가능, 모든 스토리 향상 (네트워크 계층)
- **User Story 3 (P2)**: Phase 2 이후 시작 가능, US1 사용 (주사위 굴림이 뽑기 트리거)
- **User Story 4 (P2)**: Phase 2 이후 시작 가능, US1 (탈출용 주사위), US3 (무전기 카드) 사용
- **User Story 6 (P2)**: Phase 2 이후 시작 가능, US2 사용 (임대료가 파산 트리거)
- **User Story 7 (P3)**: Phase 2 이후 시작 가능, US2 필요 (second_half 트리거)
- **User Story 5 (P3)**: Phase 2 이후 시작 가능, US1 사용 (위치 관리)

### 각 유저 스토리 내에서

1. **pgTAP 계약 테스트**는 반드시 **가장 먼저** 작성하고 **실패**해야 함
2. **데이터베이스 RPC** 두 번째로 구현 (테스트가 이제 **통과**해야 함)
3. **프론트엔드 컴포넌트**는 RPC와 병렬로 개발 가능
4. **통합 테스트**는 RPC 완료 후 작성
5. **E2E 테스트**는 프론트엔드 컴포넌트 완료 후 작성
6. 스토리는 모든 테스트가 **통과**할 때만 완료로 표시

### 병렬 기회

**Phase 2 (기반)**: [P]로 표시된 모든 태스크는 다음 그룹 내에서 병렬 실행 가능:

- 데이터베이스: T011-T017 (마이그레이션, 시드)
- Supabase 클라이언트: T018-T020 (클라이언트 설정)
- UI 인프라: T021-T026 (컴포넌트)
- 타입/스토어: T027-T031 (타입, 스토어)

**유저 스토리 테스트**: 스토리 내의 모든 pgTAP 테스트는 병렬로 작성 가능
**유저 스토리 모델**: [P]로 표시된 모든 프론트엔드 컴포넌트는 병렬로 구축 가능
**다른 유저 스토리**: US1, US2, US8은 Phase 2 이후 다른 개발자가 병렬로 작업 가능

---

## 병렬 예시: User Story 1

```bash
# Phase 2 완료 → 모든 US1 pgTAP 테스트 함께 실행:
Task T032: "create_room RPC 계약 테스트 작성"
Task T033: "join_room RPC 계약 테스트 작성"
Task T034: "start_game RPC 계약 테스트 작성"
Task T035: "roll_dice RPC 계약 테스트 작성"
Task T036: "end_turn RPC 계약 테스트 작성"
Task T037: "연속 더블 로직 계약 테스트 작성"
Task T038: "시작점 통과 시 월급 지급 계약 테스트 작성"

# RPC 구현 후 → 모든 US1 프론트엔드 컴포넌트 함께 실행:
Task T045: "방 생성/참여 UI가 있는 랜딩 페이지"
Task T046: "플레이어 아바타 컴포넌트"
Task T050: "애니메이션 주사위 롤러 컴포넌트"
Task T055: "useRealtime 훅"
Task T056: "useGameActions 훅"
Task T057: "useReconnect 훅"
```

---

## 구현 전략

### MVP 우선 (Phase 2 + User Story 1 만)

1. Phase 1 완료: 설정
2. Phase 2 완료: 기반 (중요 - 모든 스토리 차단)
3. Phase 3 완료: User Story 1 (디지털 주사위)
4. **중단 및 검증**: US1 독립 테스트
5. 준비되면 배포/데모 (기본 주사위 굴리기 게임)

### 점진적 제공 (P1 → P2 → P3)

1. 설정 + 기반 완료 → 기반 준비됨
2. US1 + US2 + US8 (P1) 추가 → 독립 테스트 → 배포/데모 (전체 핵심 게임!)
3. US3 + US4 + US6 (P2) 추가 → 독립 테스트 → 배포/데모 (특수 메커니즘)
4. US5 + US7 (P3) 추가 → 독립 테스트 → 배포/데모 (고급 기능)
5. 각 배치는 이전 스토리를 깨지 않고 가치를 더함

### 병렬 팀 전략 (권장)

Phase 2 완료 후 개발자 3명 기준:

**1주차**: P1 스토리

- 개발자 A: User Story 1 (주사위 & 이동)
- 개발자 B: User Story 2 (자산 & 임대료)
- 개발자 C: User Story 8 (실시간 동기화)

**2주차**: P2 스토리

- 개발자 A: User Story 3 (황금열쇠)
- 개발자 B: User Story 4 (무인도)
- 개발자 C: User Story 6 (파산)

**3주차**: P3 스토리 + 다듬기

- 개발자 A: User Story 5 (우주여행)
- 개발자 B: User Story 7 (건물)
- 개발자 C: Phase 11 (다듬기)

---

## 요약

- **총 태스크**: 193개
- **Phase 1 (설정)**: 10개
- **Phase 2 (기반)**: 21개 (차단성)
- **Phase 3 (US1 - P1)**: 32개 (MVP 준비됨)
- **Phase 4 (US2 - P1)**: 15개
- **Phase 5 (US8 - P1)**: 16개
- **Phase 6 (US3 - P2)**: 16개
- **Phase 7 (US4 - P2)**: 16개
- **Phase 8 (US6 - P2)**: 16개
- **Phase 9 (US7 - P3)**: 17개
- **Phase 10 (US5 - P3)**: 13개
- **Phase 11 (다듬기)**: 16개

**병렬 기회**: [P]로 표시된 87개 태스크 (45% 병렬화 가능)

**독립 테스트 기준**: 각 유저 스토리는 명시적인 테스트 검증(pgTAP + Vitest + Playwright)을 가짐

**제안된 MVP 범위**: Phase 1 + Phase 2 + Phase 3 (US1 전용) = 63개 태스크

**전체 P1 제공**: Phase 4 (US2) + Phase 5 (US8) 추가 = 총 94개 태스크

---

## 참고 사항

- [P] 태스크 = 다른 파일, 의존성 없음, 병렬 실행 가능
- [스토리] 레이블은 태스크를 특정 유저 스토리에 매핑하여 추적 가능하게 함
- 각 유저 스토리는 독립적으로 완료 가능하고 테스트 가능함
- TDD: pgTAP 테스트를 **먼저** 작성(적신호 예상), 그 다음 RPC 구현(청신호), 그 다음 리팩토링
- 각 논리적 태스크 그룹 후 커밋
- 스토리 독립 검증을 위해 체크포인트에서 중단
- 헌법적 요구사항: 서버 권한(RPC), 모바일 우선(44px 타겟), TDD(테스트 우선), 실시간(<200ms), 실행 취소 없음
