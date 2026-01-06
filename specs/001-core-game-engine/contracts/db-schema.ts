/**
 * Database Schema - PostgreSQL 테이블 스키마 정의
 *
 * Feature: 001-core-game-engine
 * Date: 2026-01-06
 *
 * 이 파일은 게임 플레이 데이터 축적을 위한 PostgreSQL 테이블 구조를 정의합니다.
 * 실제 구현 시 Prisma 스키마로 변환됩니다.
 *
 * 테이블 구조:
 * - game_sessions: 게임 세션 메타데이터
 * - game_players: 세션별 참여 플레이어
 * - game_events: 모든 게임 이벤트 로그 (JSONB 기반)
 * - turn_snapshots: 턴별 게임 상태 스냅샷
 */

import { PlayerColor } from './enums';

// ============================================================================
// 게임 이벤트 타입 (확장된 버전)
// ============================================================================

export enum GameEventType {
  // 턴 관련
  TURN_START = 'turnStart',
  TURN_END = 'turnEnd',

  // 주사위/이동
  DICE_ROLL = 'diceRoll',
  MOVE = 'move',
  DOUBLE_ROLLED = 'doubleRolled',         // 더블 주사위
  TRIPLE_DOUBLE = 'tripleDouble',         // 3연속 더블 (턴 종료)

  // 부동산 거래
  PROPERTY_PURCHASE = 'propertyPurchase',
  PROPERTY_SKIP = 'propertySkip',         // 구매 포기 (분석용)
  BUILDING_CONSTRUCT = 'buildingConstruct',
  ASSET_SOLD = 'assetSold',               // 자산 매각

  // 통행료
  RENT_PAID = 'rentPaid',

  // 담보
  MORTGAGE_SET = 'mortgageSet',
  MORTGAGE_RELEASE = 'mortgageRelease',

  // 황금열쇠
  GOLDEN_KEY_DRAWN = 'goldenKeyDrawn',
  GOLDEN_KEY_EFFECT = 'goldenKeyEffect',

  // 무인도
  ISLAND_ENTER = 'islandEnter',
  ISLAND_ESCAPE = 'islandEscape',
  ISLAND_ESCAPE_FAIL = 'islandEscapeFail',

  // 우주여행
  SPACE_TRAVEL_BOARD = 'spaceTravelBoard', // 우주여행 탑승 (대기)
  SPACE_TRAVEL_LAND = 'spaceTravelLand',   // 우주여행 착륙 (목적지 선택)

  // 특수 칸
  FUND_DONATE = 'fundDonate',
  FUND_RECEIVE = 'fundReceive',
  SALARY_RECEIVED = 'salaryReceived',     // 출발 통과 월급

  // 카드 관련
  CARD_ACQUIRED = 'cardAcquired',         // 보관 카드 획득
  CARD_USE = 'cardUse',                   // 보관 카드 사용
  CARD_SOLD = 'cardSold',                 // 탈출권 은행 매각
  WORLD_TOUR = 'worldTour',               // 세계일주 카드

  // 파산
  BANKRUPTCY = 'bankruptcy',
}

// ============================================================================
// 구매 포기 사유 (세분화)
// ============================================================================

export type PropertySkipReason =
  | 'insufficient_funds'    // 돈 부족
  | 'strategic_skip'        // 전략적 포기 (돈은 있지만 안 삼)
  | 'timeout';              // 시간 초과로 자동 패스

// ============================================================================
// 게임 세션 (game_sessions)
// ============================================================================

export interface GameSession {
  id: string;                                         // UUID (PK)
  roomCode: string;                                   // 방 코드
  startedAt: Date;                                    // 게임 시작 시간
  endedAt: Date | null;                               // 게임 종료 시간
  winnerId: string | null;                            // 승자 플레이어 ID
  totalTurns: number;                                 // 총 턴 수
  endReason: 'bankruptcy' | 'timeout' | 'manual' | null;
  createdAt: Date;
}

// ============================================================================
// 게임 참여자 (game_players)
// ============================================================================

export interface GamePlayer {
  id: string;                                         // UUID (PK)
  sessionId: string;                                  // FK → game_sessions

  // 식별자 계층 (익명 + 향후 계정 연동 대비)
  visitorId: string;                                  // 기기 기반 익명 ID (앱 설치 시 생성)
  accountId: string | null;                           // 계정 ID (향후 로그인 시 연결)

  // 세션 내 정보
  playerName: string;                                 // 닉네임
  color: PlayerColor;                                 // 말 색상

  // 최종 결과
  finalRank: number | null;                           // 최종 순위 (1~4)
  finalMoney: number | null;                          // 최종 현금
  finalAssetValue: number | null;                     // 최종 총 자산

  // 타임스탬프
  joinedAt: Date;                                     // 입장 시간
  leftAt: Date | null;                                // 이탈 시간 (파산/연결 끊김)
}

// ============================================================================
// 게임 이벤트 (game_events) - 핵심 로깅 테이블
// ============================================================================

export interface GameEvent {
  id: string;                                         // UUID (PK)
  sessionId: string;                                  // FK → game_sessions
  playerId: string;                                   // 이벤트 주체 플레이어 ID
  turnNumber: number;                                 // 턴 번호
  eventType: GameEventType;                           // 이벤트 종류
  eventData: Record<string, unknown>;                 // JSONB - 유연한 이벤트 데이터
  decisionDurationMs: number | null;                  // 의사결정 소요 시간 (밀리초)
  createdAt: Date;                                    // 이벤트 발생 시간
}

// ============================================================================
// 턴 스냅샷 (turn_snapshots) - 시계열 분석용
// ============================================================================

export interface TurnSnapshot {
  id: string;                                         // UUID (PK)
  sessionId: string;                                  // FK → game_sessions
  turnNumber: number;                                 // 턴 번호
  playerId: string;                                   // 플레이어 ID

  // 상태 정보
  position: number;                                   // 현재 위치 (0-39)
  money: number;                                      // 현금
  ownedTiles: number[];                               // 소유 부동산 인덱스 배열
  buildingLevels: Record<number, number>;             // 타일별 건물 레벨 {tileIndex: level}
  isBankrupt: boolean;                                // 파산 여부
  isOnIsland: boolean;                                // 무인도 체류 여부
  heldCards: string[];                                // 보유 카드 ID 배열

  // 계산값
  totalAssetValue: number;                            // 총 자산 가치 (현금 + 부동산 + 건물)

  createdAt: Date;
}

// ============================================================================
// EventData 타입별 인터페이스 (JSONB 내용)
// ============================================================================

/** 주사위 굴림 이벤트 데이터 */
export interface DiceRollEventData {
  dice1: number;
  dice2: number;
  total: number;
  isDouble: boolean;
  consecutiveDoubles: number;
}

/** 부동산 구매 이벤트 데이터 (맥락 정보 포함) */
export interface PropertyPurchaseEventData {
  tileIndex: number;
  tileName: string;
  price: number;
  playerMoneyBefore: number;
  playerMoneyAfter: number;
  playerOwnedTileCount: number;
  playerOwnedSameColorGroup: boolean;   // 같은 색상 그룹 보유 여부
}

/** 부동산 구매 포기 이벤트 데이터 */
export interface PropertySkipEventData {
  tileIndex: number;
  tileName: string;
  price: number;
  playerMoney: number;
  reason: PropertySkipReason;           // 포기 사유 세분화
}

/** 건물 건설 이벤트 데이터 */
export interface BuildingConstructEventData {
  tileIndex: number;
  tileName: string;
  buildingLevelBefore: number;
  buildingLevelAfter: number;
  cost: number;
  playerMoneyBefore: number;
  playerMoneyAfter: number;
}

/** 통행료 지불 이벤트 데이터 */
export interface RentPaidEventData {
  tileIndex: number;
  tileName: string;
  amount: number;
  ownerId: string;
  ownerName: string;
  buildingLevel: number;
  payerMoneyBefore: number;
  payerMoneyAfter: number;
}

/** 황금열쇠 뽑기 이벤트 데이터 */
export interface GoldenKeyDrawnEventData {
  cardId: string;
  cardName: string;
  effectType: string;
  isHoldable: boolean;
}

/** 무인도 탈출 이벤트 데이터 */
export interface IslandEscapeEventData {
  method: 'double' | 'pay' | 'card' | 'wait';
  turnsSpent: number;                   // 무인도에서 보낸 턴 수
  cost: number | null;                  // 지불 비용 (비용 탈출 시)
}

/** 우주여행 착륙 이벤트 데이터 */
export interface SpaceTravelLandEventData {
  destinationIndex: number;
  destinationName: string;
  passedStart: boolean;                 // 출발 통과 여부 (월급 지급)
}
