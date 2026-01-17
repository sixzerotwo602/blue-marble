/**
 * 게임 상태 타입 정의
 * @description 부루마블 게임의 전체 상태를 나타내는 인터페이스
 */
import { Player } from './Player.js';
import { Tile } from './Tile.js';

/** 게임 페이즈 (전체 흐름) */
export type GamePhase = 
  | 'EARLY'       // 초반: 자유 구매
  | 'AUCTION'     // 경매: 6개 토지 남았을 때
  | 'DEVELOPMENT'; // 개발: 모든 토지 매각 완료

/** 턴 상태 (FSM States - AR8) */
export type TurnPhase =
  | 'TURN_START'          // 주사위 굴리기 대기
  | 'MOVING'              // 이동 중
  | 'PURCHASE_DECISION'   // 빈 땅 구매 결정 대기
  | 'BUILD_DECISION'      // 건물 건설 결정 대기
  | 'TOLL_PAYMENT'        // 통행료 지불 처리
  | 'LIQUIDATION'         // 자산 매각 중
  | 'SPECIAL_EVENT'       // 특수 이벤트 처리
  | 'TURN_END'            // 턴 종료
  | 'GAME_OVER';          // 게임 종료

/** 게임 상태 인터페이스 */
export interface GameState {
  /** 모든 플레이어 */
  players: Player[];
  /** 보드의 모든 타일 (40칸) */
  tiles: Tile[];
  /** 현재 턴인 플레이어 인덱스 */
  currentPlayerIndex: number;
  /** 게임 페이즈 */
  phase: GamePhase;
  /** 턴 내 상태 (FSM) */
  turnPhase: TurnPhase;
  /** 현재 턴 번호 */
  turnNumber: number;
  /** 사회복지기금 잔액 */
  socialFundBalance: number;
  /** 마지막 주사위 결과 */
  lastDiceResult: {
    dice1: number;
    dice2: number;
    isDouble: boolean;
  } | null;
  /** 시드 기반 난수 생성기 상태 */
  seed: string;
  /** 게임 시작 여부 */
  isGameStarted: boolean;
  /** 승자 ID (게임 종료 시) */
  winnerId: string | null;
  /** 현재 진행 중인 경매 (Story 2.4) */
  currentAuction: {
    tileId: number;
    currentBid: number;
    highestBidderId: string | null;
    passedPlayers: string[];
  } | null;
}

/**
 * 초기 게임 상태 생성
 */
export function createInitialGameState(seed: string = 'default'): GameState {
  return {
    players: [],
    tiles: [], // Story 1.2에서 BOARD_DATA로 초기화됨
    currentPlayerIndex: 0,
    phase: 'EARLY',
    turnPhase: 'TURN_START',
    turnNumber: 1,
    socialFundBalance: 0,
    lastDiceResult: null,
    seed,
    isGameStarted: false,
    winnerId: null,
    currentAuction: null,
  };
}
