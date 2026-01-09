# Database Schema: 부루마블 심리 분석 데이터베이스

**Date**: 2026-01-09  
**Feature**: 001-core-game-engine  
**Database**: PostgreSQL 18  
**Purpose**: 플레이어 행동 데이터 수집 및 심리 분석 연구

---

## 개요

이 스키마는 부루마블 게임에서 발생하는 모든 플레이어 행동과 의사결정을 기록하여 심리 분석 논문 작성에 필요한 데이터를 수집합니다.

### 분석 가능 영역

1. **위험 감수 성향 (Risk-Taking)**: 증서 구매 결정, 건물 건설 타이밍, 대출 선택
2. **전략적 사고 (Strategic Thinking)**: 우주여행 목적지 선택, 경매 입찰 패턴
3. **손실 회피 (Loss Aversion)**: 자금 부족 시 정산 선택 순서, 파산 방어 전략
4. **사회적 상호작용 (Social Dynamics)**: 대출 동의/거부, 우대권 사용 대상
5. **의사결정 시간 (Decision Latency)**: 각 선택에 소요된 시간

---

## 1. 핵심 테이블

### 1.1 games (게임 세션)

```sql
CREATE TABLE games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invite_code VARCHAR(6) UNIQUE NOT NULL,

    -- 게임 설정
    player_count SMALLINT NOT NULL CHECK (player_count BETWEEN 2 AND 4),
    time_limit_minutes SMALLINT, -- NULL = 무제한

    -- 상태
    status VARCHAR(20) NOT NULL DEFAULT 'WAITING',
        -- WAITING, IN_PROGRESS, ENDED, ABANDONED
    phase VARCHAR(20),
        -- SETUP, FIRST_HALF, AUCTION, SECOND_HALF, ENDED

    -- 타임스탬프
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,

    -- 결과
    winner_id UUID REFERENCES players(id),
    end_reason VARCHAR(20),
        -- LAST_SURVIVOR, TIME_LIMIT, ABANDONED

    -- 메타데이터
    server_version VARCHAR(20),

    CONSTRAINT valid_status CHECK (status IN ('WAITING', 'IN_PROGRESS', 'ENDED', 'ABANDONED')),
    CONSTRAINT valid_phase CHECK (phase IN ('SETUP', 'FIRST_HALF', 'AUCTION', 'SECOND_HALF', 'ENDED') OR phase IS NULL)
);

CREATE INDEX idx_games_created_at ON games(created_at);
CREATE INDEX idx_games_status ON games(status);
```

### 1.2 players (플레이어)

```sql
CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,

    -- 식별
    name VARCHAR(50) NOT NULL,
    color VARCHAR(10) NOT NULL,
        -- RED, BLUE, YELLOW, WHITE
    is_host BOOLEAN NOT NULL DEFAULT FALSE,

    -- 익명화된 사용자 식별 (연구용)
    anonymous_user_id UUID, -- 같은 사람의 여러 게임 추적용

    -- 턴 순서
    turn_order SMALLINT,

    -- 최종 상태
    final_cash BIGINT,
    final_property_value BIGINT,
    final_building_value BIGINT,
    final_rank SMALLINT,
    bankrupt_at TIMESTAMPTZ,
    bankrupt_turn INTEGER,

    -- 연결 상태
    is_ai_controlled BOOLEAN NOT NULL DEFAULT FALSE,
    ai_took_over_at TIMESTAMPTZ,
    total_disconnection_time_seconds INTEGER DEFAULT 0,

    -- 메타데이터 (연구용)
    user_agent TEXT,

    CONSTRAINT valid_color CHECK (color IN ('RED', 'BLUE', 'YELLOW', 'WHITE'))
);

CREATE INDEX idx_players_game_id ON players(game_id);
CREATE INDEX idx_players_anonymous_user_id ON players(anonymous_user_id);
```

### 1.3 game_turns (턴 기록)

```sql
CREATE TABLE game_turns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,

    -- 턴 정보
    turn_number INTEGER NOT NULL,
    phase VARCHAR(20) NOT NULL,
    is_extra_turn BOOLEAN NOT NULL DEFAULT FALSE, -- 더블로 인한 추가 턴

    -- 주사위 결과
    die_1 SMALLINT,
    die_2 SMALLINT,
    is_double BOOLEAN,

    -- 이동
    position_before SMALLINT,
    position_after SMALLINT,
    passed_start BOOLEAN DEFAULT FALSE,
    salary_received BIGINT DEFAULT 0,

    -- 상태
    cash_before BIGINT,
    cash_after BIGINT,

    -- 특수 상태
    was_trapped_on_island BOOLEAN DEFAULT FALSE,
    escaped_island BOOLEAN DEFAULT FALSE,
    escape_method VARCHAR(20), -- DOUBLE, ESCAPE_CARD, TURNS_EXPIRED

    pending_space_choice BOOLEAN DEFAULT FALSE,

    -- 타이밍 (심리 분석용)
    turn_started_at TIMESTAMPTZ NOT NULL,
    dice_rolled_at TIMESTAMPTZ,
    turn_ended_at TIMESTAMPTZ,
    turn_duration_seconds NUMERIC(10,3),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_game_turns_game_id ON game_turns(game_id);
CREATE INDEX idx_game_turns_player_id ON game_turns(player_id);
CREATE INDEX idx_game_turns_turn_number ON game_turns(game_id, turn_number);
```

---

## 2. 행동 기록 테이블 (Behavioral Logs)

### 2.1 decisions (의사결정 기록) ⭐ 핵심 분석 테이블

```sql
CREATE TABLE decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    turn_id UUID REFERENCES game_turns(id) ON DELETE CASCADE,

    -- 의사결정 유형
    decision_type VARCHAR(30) NOT NULL,
        -- PURCHASE_PROPERTY, DECLINE_PURCHASE,
        -- BUILD_VILLA, BUILD_BUILDING, BUILD_HOTEL,
        -- PAY_TOLL, USE_FREE_PASS,
        -- SELL_BUILDING, TRANSFER_PROPERTY, TAKE_LOAN,
        -- ESCAPE_USE_CARD, ESCAPE_ROLL_DICE,
        -- CHOOSE_DESTINATION, AUCTION_BID,
        -- APPROVE_LOAN, REJECT_LOAN,
        -- END_TURN

    -- 컨텍스트 (결정 당시 상황)
    cash_at_decision BIGINT NOT NULL,
    owned_properties_count SMALLINT,
    total_assets_at_decision BIGINT,
    phase_at_decision VARCHAR(20),

    -- 결정 대상
    target_property_id VARCHAR(50), -- 증서 ID
    target_player_id UUID REFERENCES players(id),
    target_tile_index SMALLINT,

    -- 결정 내용
    amount BIGINT, -- 금액 (구매가, 통행료, 대출금 등)
    building_level VARCHAR(10), -- VILLA, BUILDING, HOTEL

    -- 대안 정보 (손실 회피 분석용)
    alternatives_available JSONB,
        -- 예: {"could_buy": true, "could_build": ["VILLA", "BUILDING"]}

    -- 타이밍 (심리 분석용)
    decision_prompted_at TIMESTAMPTZ NOT NULL,
    decision_made_at TIMESTAMPTZ NOT NULL,
    decision_latency_ms INTEGER GENERATED ALWAYS AS
        (EXTRACT(EPOCH FROM (decision_made_at - decision_prompted_at)) * 1000) STORED,

    -- 결과
    was_successful BOOLEAN,
    failure_reason VARCHAR(100),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_decisions_game_id ON decisions(game_id);
CREATE INDEX idx_decisions_player_id ON decisions(player_id);
CREATE INDEX idx_decisions_type ON decisions(decision_type);
CREATE INDEX idx_decisions_latency ON decisions(decision_latency_ms);
```

### 2.2 property_transactions (증서 거래)

```sql
CREATE TABLE property_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    turn_id UUID REFERENCES game_turns(id),
    decision_id UUID REFERENCES decisions(id),

    -- 증서 정보
    property_id VARCHAR(50) NOT NULL,
    property_name VARCHAR(50) NOT NULL,
    tile_index SMALLINT NOT NULL,

    -- 거래 유형
    transaction_type VARCHAR(20) NOT NULL,
        -- PURCHASE, SALE, TRANSFER, AUCTION_WIN

    -- 당사자
    from_player_id UUID REFERENCES players(id), -- NULL = 은행
    to_player_id UUID REFERENCES players(id),   -- NULL = 은행

    -- 금액
    amount BIGINT NOT NULL,
    building_level_at_transaction VARCHAR(10),

    -- 컨텍스트
    phase VARCHAR(20) NOT NULL,
    was_forced BOOLEAN DEFAULT FALSE, -- 파산으로 인한 강제 이전

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_property_tx_game_id ON property_transactions(game_id);
CREATE INDEX idx_property_tx_property_id ON property_transactions(property_id);
```

### 2.3 building_events (건물 이벤트)

```sql
CREATE TABLE building_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES players(id),
    turn_id UUID REFERENCES game_turns(id),
    decision_id UUID REFERENCES decisions(id),

    -- 증서 정보
    property_id VARCHAR(50) NOT NULL,
    tile_index SMALLINT NOT NULL,

    -- 이벤트 유형
    event_type VARCHAR(10) NOT NULL, -- BUILD, SELL

    -- 건물 레벨 변화
    level_before VARCHAR(10), -- NONE, VILLA, BUILDING, HOTEL
    level_after VARCHAR(10) NOT NULL,

    -- 금액
    cost_or_refund BIGINT NOT NULL, -- BUILD: 음수(비용), SELL: 양수(환급)

    -- 컨텍스트
    phase VARCHAR(20) NOT NULL,
    cash_before BIGINT,
    cash_after BIGINT,
    was_forced BOOLEAN DEFAULT FALSE, -- 정산으로 인한 강제 매각

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_building_events_game_id ON building_events(game_id);
CREATE INDEX idx_building_events_player_id ON building_events(player_id);
```

### 2.4 payments (지불 기록)

```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    turn_id UUID REFERENCES game_turns(id),
    decision_id UUID REFERENCES decisions(id),

    -- 지불 유형
    payment_type VARCHAR(20) NOT NULL,
        -- TOLL, GOLDEN_KEY_PAY, WELFARE_DONATION,
        -- SPACE_TRAVEL_FEE, BUILDING_COST, LOAN_REPAY

    -- 당사자
    from_player_id UUID NOT NULL REFERENCES players(id),
    to_player_id UUID REFERENCES players(id), -- NULL = 은행/기금

    -- 금액
    amount BIGINT NOT NULL,

    -- 통행료 상세 (분석용)
    property_id VARCHAR(50),
    building_level VARCHAR(10),
    used_free_pass BOOLEAN DEFAULT FALSE,

    -- 컨텍스트
    required_settlement BOOLEAN DEFAULT FALSE, -- 정산 필요했는지
    settlement_actions JSONB, -- 정산 내역 (손실 회피 분석용)
        -- 예: [{"type": "SELL_BUILDING", "property": "tokyo"}, {"type": "TAKE_LOAN", "amount": 500000}]

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_game_id ON payments(game_id);
CREATE INDEX idx_payments_from_player ON payments(from_player_id);
CREATE INDEX idx_payments_type ON payments(payment_type);
```

### 2.5 golden_key_events (황금열쇠 이벤트)

```sql
CREATE TABLE golden_key_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES players(id),
    turn_id UUID REFERENCES game_turns(id),

    -- 카드 정보
    card_id VARCHAR(50) NOT NULL,
    card_name VARCHAR(50) NOT NULL,
    card_category VARCHAR(20) NOT NULL,
        -- MOVE_TO, PRIZE, MAINTENANCE, EXPENSE, RETREAT, ESCAPE, FREE_PASS, HALF_SALE, OTHER

    -- 효과
    effect_applied BOOLEAN NOT NULL,
    effect_nullified_reason VARCHAR(50), -- FIRST_HALF, NO_BUILDINGS 등

    -- 결과
    cash_change BIGINT DEFAULT 0,
    moved_to_tile SMALLINT,
    card_kept BOOLEAN DEFAULT FALSE, -- 보관 카드인 경우

    -- 컨텍스트
    phase VARCHAR(20) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_golden_key_events_game_id ON golden_key_events(game_id);
CREATE INDEX idx_golden_key_events_card_id ON golden_key_events(card_id);
```

---

## 3. 분석용 집계 테이블

### 3.1 player_game_stats (플레이어별 게임 통계)

```sql
CREATE TABLE player_game_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,

    -- 턴 통계
    total_turns INTEGER NOT NULL DEFAULT 0,
    total_doubles INTEGER NOT NULL DEFAULT 0,
    island_visits INTEGER NOT NULL DEFAULT 0,
    island_escape_by_double INTEGER NOT NULL DEFAULT 0,
    island_escape_by_card INTEGER NOT NULL DEFAULT 0,

    -- 증서 통계
    properties_purchased INTEGER NOT NULL DEFAULT 0,
    properties_declined INTEGER NOT NULL DEFAULT 0,
    purchase_decision_ratio NUMERIC(5,4), -- 구매율 (위험 감수 지표)

    -- 건물 통계
    buildings_built INTEGER NOT NULL DEFAULT 0,
    buildings_sold INTEGER NOT NULL DEFAULT 0,
    max_building_level_reached VARCHAR(10),

    -- 재정 통계
    total_tolls_paid BIGINT NOT NULL DEFAULT 0,
    total_tolls_received BIGINT NOT NULL DEFAULT 0,
    total_golden_key_gain BIGINT NOT NULL DEFAULT 0,
    total_golden_key_loss BIGINT NOT NULL DEFAULT 0,

    -- 대출 통계
    loans_taken INTEGER NOT NULL DEFAULT 0,
    loans_approved_for_others INTEGER NOT NULL DEFAULT 0,
    loans_rejected_for_others INTEGER NOT NULL DEFAULT 0,
    loan_approval_ratio NUMERIC(5,4), -- 대출 동의율 (사회성 지표)

    -- 정산 통계 (손실 회피 분석)
    settlements_required INTEGER NOT NULL DEFAULT 0,
    buildings_sold_in_settlement INTEGER NOT NULL DEFAULT 0,
    properties_transferred_in_settlement INTEGER NOT NULL DEFAULT 0,

    -- 의사결정 시간 통계
    avg_decision_latency_ms NUMERIC(10,2),
    max_decision_latency_ms INTEGER,
    min_decision_latency_ms INTEGER,

    -- 우대권 사용 패턴
    free_passes_received INTEGER NOT NULL DEFAULT 0,
    free_passes_used INTEGER NOT NULL DEFAULT 0,
    free_pass_avg_toll_saved BIGINT, -- 평균 면제 통행료 (경제적 판단 지표)

    -- 우주여행 패턴
    space_travels INTEGER NOT NULL DEFAULT 0,
    space_travel_destinations JSONB, -- [{"tile": 39, "count": 2}, ...]

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(game_id, player_id)
);

CREATE INDEX idx_player_stats_game_id ON player_game_stats(game_id);
CREATE INDEX idx_player_stats_player_id ON player_game_stats(player_id);
```

### 3.2 game_state_snapshots (게임 상태 스냅샷)

```sql
CREATE TABLE game_state_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    turn_number INTEGER NOT NULL,

    -- 전체 상태 (JSON)
    game_state JSONB NOT NULL,
        -- 모든 플레이어 위치, 현금, 증서, 건물 상태 포함

    -- 경제 지표
    total_cash_in_play BIGINT,
    welfare_pot BIGINT,
    unsold_properties_count SMALLINT,

    -- 타임스탬프
    snapshot_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_snapshots_game_id ON game_state_snapshots(game_id);
CREATE INDEX idx_snapshots_turn ON game_state_snapshots(game_id, turn_number);
```

---

## 4. 연구 메타데이터 테이블

### 4.1 research_sessions (연구 세션)

```sql
CREATE TABLE research_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 연구 정보
    research_id VARCHAR(50) NOT NULL, -- 연구 식별자 (IRB 승인 번호 등)
    session_name VARCHAR(100),
    description TEXT,

    -- 기간
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,

    -- 설정
    consent_required BOOLEAN NOT NULL DEFAULT TRUE,
    anonymization_level VARCHAR(20) NOT NULL DEFAULT 'FULL',
        -- FULL, PARTIAL, NONE

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE research_session_games (
    research_session_id UUID NOT NULL REFERENCES research_sessions(id),
    game_id UUID NOT NULL REFERENCES games(id),

    -- 동의
    all_players_consented BOOLEAN NOT NULL DEFAULT FALSE,
    consent_obtained_at TIMESTAMPTZ,

    PRIMARY KEY (research_session_id, game_id)
);
```

### 4.2 player_consent (플레이어 동의)

```sql
CREATE TABLE player_consent (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    research_session_id UUID REFERENCES research_sessions(id),

    consent_given BOOLEAN NOT NULL,
    consent_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    consent_method VARCHAR(20), -- CLICK, FORM

    -- 동의 철회
    withdrawn BOOLEAN NOT NULL DEFAULT FALSE,
    withdrawn_at TIMESTAMPTZ,

    -- 메타데이터
    ip_address_hash VARCHAR(64), -- SHA-256 해시 (익명화)

    UNIQUE(player_id, research_session_id)
);
```

---

## 5. 인덱스 및 파티셔닝

### 5.1 시계열 데이터 파티셔닝

```sql
-- game_turns 테이블 월별 파티셔닝
CREATE TABLE game_turns_partitioned (
    LIKE game_turns INCLUDING ALL
) PARTITION BY RANGE (created_at);

-- 월별 파티션 생성 예시
CREATE TABLE game_turns_2026_01 PARTITION OF game_turns_partitioned
    FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

CREATE TABLE game_turns_2026_02 PARTITION OF game_turns_partitioned
    FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
```

### 5.2 분석용 뷰

```sql
-- 플레이어별 위험 감수 성향 뷰
CREATE VIEW v_player_risk_profile AS
SELECT
    p.id AS player_id,
    p.anonymous_user_id,
    pgs.game_id,

    -- 위험 감수 지표
    pgs.purchase_decision_ratio AS purchase_rate,
    pgs.buildings_built::NUMERIC / NULLIF(pgs.total_turns, 0) AS build_frequency,
    pgs.loans_taken > 0 AS used_loan,

    -- 손실 회피 지표
    pgs.buildings_sold_in_settlement::NUMERIC /
        NULLIF(pgs.settlements_required, 0) AS settlement_building_sale_rate,

    -- 의사결정 속도
    pgs.avg_decision_latency_ms,

    -- 결과
    p.final_rank,
    p.bankrupt_at IS NOT NULL AS went_bankrupt
FROM players p
JOIN player_game_stats pgs ON p.id = pgs.player_id;

-- 게임별 경쟁 강도 뷰
CREATE VIEW v_game_intensity AS
SELECT
    g.id AS game_id,
    g.started_at,
    g.ended_at,
    g.player_count,

    -- 경쟁 강도 지표
    COUNT(DISTINCT pt.id) AS total_property_changes,
    SUM(pmt.amount) FILTER (WHERE pmt.payment_type = 'TOLL') AS total_tolls_exchanged,
    AVG(pgs.settlements_required) AS avg_settlements_per_player,

    -- 게임 길이
    EXTRACT(EPOCH FROM (g.ended_at - g.started_at)) / 60 AS duration_minutes,
    MAX(gt.turn_number) AS total_turns
FROM games g
LEFT JOIN property_transactions pt ON g.id = pt.game_id
LEFT JOIN payments pmt ON g.id = pmt.game_id
LEFT JOIN player_game_stats pgs ON g.id = pgs.game_id
LEFT JOIN game_turns gt ON g.id = gt.game_id
WHERE g.status = 'ENDED'
GROUP BY g.id;
```

---

## 6. 연결 정보

### 6.1 환경 변수

```env
# .env
DATABASE_URL=postgresql://user:password@your-db-server:5432/bluemarble_research
DATABASE_POOL_SIZE=20
DATABASE_SSL_MODE=require
```

### 6.2 Prisma 스키마 예시 (서버 연동용)

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Game {
  id              String    @id @default(uuid())
  inviteCode      String    @unique @map("invite_code")
  playerCount     Int       @map("player_count")
  timeLimitMinutes Int?     @map("time_limit_minutes")
  status          String    @default("WAITING")
  phase           String?
  createdAt       DateTime  @default(now()) @map("created_at")
  startedAt       DateTime? @map("started_at")
  endedAt         DateTime? @map("ended_at")
  winnerId        String?   @map("winner_id")
  endReason       String?   @map("end_reason")

  players         Player[]
  turns           GameTurn[]
  decisions       Decision[]

  @@map("games")
}

// ... 나머지 모델들
```

---

## 7. 마이그레이션 실행

```bash
# 마이그레이션 파일 생성
psql -U postgres -d bluemarble_research -f migrations/001_create_core_tables.sql
psql -U postgres -d bluemarble_research -f migrations/002_create_behavioral_tables.sql
psql -U postgres -d bluemarble_research -f migrations/003_create_analysis_views.sql

# 또는 Prisma 사용 시
npx prisma migrate dev --name init
```

---

## 8. 데이터 수집 흐름

```text
게임 이벤트 발생
       ↓
WebSocket Handler에서 처리
       ↓
┌──────────────────┐
│ In-Memory State  │ ← 실시간 게임 로직
│ (Redis/Memory)   │
└────────┬─────────┘
         ↓
    비동기 저장
         ↓
┌──────────────────┐
│ PostgreSQL 18    │ ← 분석용 영구 저장
│ (decisions 등)   │
└──────────────────┘
         ↓
    정기 집계
         ↓
┌──────────────────┐
│ player_game_stats│ ← 분석용 집계 데이터
└──────────────────┘
```

---

## 분석 쿼리 예시

### 위험 감수 성향과 승률 상관관계

```sql
SELECT
    CASE
        WHEN purchase_decision_ratio >= 0.8 THEN 'High Risk Taker'
        WHEN purchase_decision_ratio >= 0.5 THEN 'Moderate'
        ELSE 'Risk Averse'
    END AS risk_profile,
    COUNT(*) AS player_count,
    AVG(CASE WHEN final_rank = 1 THEN 1.0 ELSE 0.0 END) AS win_rate,
    AVG(avg_decision_latency_ms) AS avg_decision_time_ms
FROM player_game_stats pgs
JOIN players p ON pgs.player_id = p.id
WHERE p.is_ai_controlled = FALSE
GROUP BY 1
ORDER BY win_rate DESC;
```

### 손실 회피와 파산 관계

```sql
SELECT
    CASE
        WHEN settlements_required > 0 AND buildings_sold_in_settlement > 0 THEN 'Sells Buildings First'
        WHEN settlements_required > 0 AND properties_transferred_in_settlement > 0 THEN 'Transfers Properties First'
        WHEN loans_taken > 0 THEN 'Uses Loan'
        ELSE 'Never Needed Settlement'
    END AS settlement_strategy,
    COUNT(*) AS count,
    AVG(CASE WHEN p.bankrupt_at IS NOT NULL THEN 1.0 ELSE 0.0 END) AS bankruptcy_rate
FROM player_game_stats pgs
JOIN players p ON pgs.player_id = p.id
GROUP BY 1;
```
