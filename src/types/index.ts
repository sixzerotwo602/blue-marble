// 부루마블 MVP 핵심 타입 정의

// ============================================================
// Enums
// ============================================================

/** 게임 상태 */
export enum GameStatus {
  WAITING = 'waiting',   // 게임 시작 전
  PLAYING = 'playing',   // 게임 진행 중
  FINISHED = 'finished', // 게임 종료
}

/** 플레이어 색상 */
export enum PlayerColor {
  RED = 'red',
  BLUE = 'blue',
  YELLOW = 'yellow',
  GREEN = 'green',
}

/** 타일 타입 */
export enum TileType {
  START = 'start',           // 출발
  PROPERTY = 'property',     // 땅 (구매 가능)
  VEHICLE = 'vehicle',       // 교통 (구매 가능)
  GOLDEN_KEY = 'goldenKey',  // 황금열쇠 (MVP 미사용)
  ISLAND = 'island',         // 무인도 (MVP 미사용)
  TRAVEL = 'travel',         // 우주여행 (MVP 미사용)
  FUND_RECEIVE = 'fundReceive', // 복지기금 수령 (MVP 미사용)
  FUND_DONATE = 'fundDonate',   // 복지기금 기부 (MVP 미사용)
}

// ============================================================
// Interfaces
// ============================================================

/** 주사위 결과 */
export interface DiceResult {
  die1: number;      // 1~6
  die2: number;      // 1~6
  total: number;     // 2~12
  isDouble: boolean; // 더블 여부
}

/** 건물 현황 (독립 건설 방식) */
export interface Building {
  villaCount: 0 | 1 | 2;  // 별장 개수 (최대 2개)
  hasBuilding: boolean;   // 빌딩 유무 (최대 1개)
  hasHotel: boolean;      // 호텔 유무 (최대 1개)
}

/** 통행료 테이블 (합산 방식용) */
export interface RentTable {
  land: number;     // 대지료
  villa1: number;   // 별장 1개
  villa2: number;   // 별장 2개 (추가분)
  building: number; // 빌딩
  hotel: number;    // 호텔
}

/** 보드판 칸 정적 데이터 */
export interface BoardTileData {
  id: string;
  index: number;  // 0~39
  name: string;
  type: TileType;
  colorGroup?: string;  // 독점 판정용 색상 그룹
  price?: number;       // 구매가
  buildingPrices?: {
    villa: number;
    building: number;
    hotel: number;
  };
  rentTable?: RentTable;
  canBuild: boolean;
}

/** 보드판 칸 상태 (런타임) */
export interface BoardTileState {
  id: string;           // 'tile-0' ~ 'tile-39'
  ownerId?: string;     // 소유자 플레이어 ID (undefined면 미소유)
  buildings: Building;  // 건물 현황
}

/** 플레이어 */
export interface Player {
  id: string;
  name: string;
  color: PlayerColor;
  position: number;          // 0~39 (현재 위치)
  money: number;             // 현금 (초기: 2,000,000)
  ownedTileIds: string[];    // 소유한 땅 ID 목록
  isBankrupt: boolean;       // 파산 여부
  isSecondHalf: boolean;     // 후반전 상태 (출발점 1회 이상 통과 시 true)
}

/** 게임 상태 */
export interface Game {
  id: string;
  status: GameStatus;
  players: Player[];           // 2~4명
  currentPlayerIndex: number;  // 현재 턴 플레이어 인덱스
  turnOrder: string[];         // 플레이어 ID 순서 (랜덤 결정)
  board: BoardTileState[];     // 40칸 상태
  lastDiceResult?: DiceResult; // 마지막 주사위 결과
  turnCount: number;           // 현재 턴 번호
  doubleCount: number;         // 현재 플레이어의 연속 더블 횟수 (최대 3)
}

// ============================================================
// Factory Functions
// ============================================================

/** 빈 건물 상태 생성 */
export function createEmptyBuilding(): Building {
  return {
    villaCount: 0,
    hasBuilding: false,
    hasHotel: false,
  };
}

/** 새 플레이어 생성 */
export function createPlayer(
  id: string,
  name: string,
  color: PlayerColor,
  initialMoney: number
): Player {
  return {
    id,
    name,
    color,
    position: 0,
    money: initialMoney,
    ownedTileIds: [],
    isBankrupt: false,
    isSecondHalf: false,
  };
}
