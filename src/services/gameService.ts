// 게임 서비스 - 게임 흐름 및 상태 관리

import {
  Game,
  Player,
  GameStatus,
  PlayerColor,
  BoardTileState,
  DiceResult,
  createPlayer,
  createEmptyBuilding,
} from '../types/index.js';
import { BOARD_TILES } from '../data/boardData.js';
import { GAME_CONSTANTS } from '../data/constants.js';

// ============================================================
// T013: 게임 초기화
// ============================================================

/** 게임 ID 생성 */
function generateGameId(): string {
  return `game-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/** 40칸 초기 상태 생성 */
function createInitialBoardState(): BoardTileState[] {
  return BOARD_TILES.map(tile => ({
    id: tile.id,
    ownerId: undefined,
    buildings: createEmptyBuilding(),
  }));
}

/** 게임 초기화 */
export function initializeGame(playerNames: string[]): Game {
  const playerCount = playerNames.length;
  if (playerCount < GAME_CONSTANTS.MIN_PLAYERS || playerCount > GAME_CONSTANTS.MAX_PLAYERS) {
    throw new Error(`플레이어 수는 ${GAME_CONSTANTS.MIN_PLAYERS}~${GAME_CONSTANTS.MAX_PLAYERS}명이어야 합니다.`);
  }

  const colors: PlayerColor[] = [
    PlayerColor.RED,
    PlayerColor.BLUE,
    PlayerColor.YELLOW,
    PlayerColor.GREEN,
  ];

  const players: Player[] = playerNames.map((name, index) => 
    createPlayer(
      `player-${index}`,
      name,
      colors[index],
      GAME_CONSTANTS.INITIAL_MONEY
    )
  );

  const turnOrder = generateTurnOrder(players.map(p => p.id));

  return {
    id: generateGameId(),
    status: GameStatus.PLAYING,
    players,
    currentPlayerIndex: 0,
    turnOrder,
    board: createInitialBoardState(),
    turnCount: 1,
    doubleCount: 0,
  };
}

// ============================================================
// T014: 턴 순서 랜덤 결정
// ============================================================

/** 턴 순서 랜덤 결정 (Fisher-Yates 셔플) */
export function generateTurnOrder(playerIds: string[]): string[] {
  const order = [...playerIds];
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

// ============================================================
// T021: 플레이어 이동
// ============================================================

/** 플레이어 이동 (출발점 통과 감지) */
export function movePlayer(
  game: Game,
  playerId: string,
  steps: number
): { passedStart: boolean; newPosition: number } {
  const player = game.players.find(p => p.id === playerId);
  if (!player) throw new Error('플레이어를 찾을 수 없습니다.');

  const oldPosition = player.position;
  const newPosition = (oldPosition + steps) % GAME_CONSTANTS.BOARD_TILES;
  
  // 출발점 통과 여부 (새 위치가 이전 위치보다 작으면 출발점 통과)
  const passedStart = newPosition < oldPosition;

  player.position = newPosition;

  return { passedStart, newPosition };
}

// ============================================================
// T022: 출발점 통과 처리 (월급 + 후반전 전환)
// ============================================================

/** 출발점 통과 처리 */
export function handlePassStart(game: Game, playerId: string): void {
  const player = game.players.find(p => p.id === playerId);
  if (!player) return;

  // 월급 지급
  player.money += GAME_CONSTANTS.SALARY;

  // 후반전 전환
  if (!player.isSecondHalf) {
    player.isSecondHalf = true;
  }
}

// ============================================================
// T049: 턴 종료
// ============================================================

/** 턴 종료 (더블 처리 포함, 3회 제한) */
export function endTurn(game: Game): { nextPlayerId: string; isExtraTurn: boolean } {
  const isDouble = game.lastDiceResult?.isDouble ?? false;

  if (isDouble) {
    game.doubleCount++;
    
    // 3연속 더블이면 턴 종료 (추가 턴 없음)
    if (game.doubleCount >= 3) {
      game.doubleCount = 0;
      // 다음 플레이어로 이동
    } else {
      // 추가 턴 (같은 플레이어)
      const currentPlayerId = game.turnOrder[game.currentPlayerIndex];
      return { nextPlayerId: currentPlayerId, isExtraTurn: true };
    }
  } else {
    // 더블 아니면 카운트 리셋
    game.doubleCount = 0;
  }

  // 다음 플레이어로 이동 (파산자 스킵)
  let nextIndex = game.currentPlayerIndex;
  do {
    nextIndex = (nextIndex + 1) % game.turnOrder.length;
  } while (
    game.players.find(p => p.id === game.turnOrder[nextIndex])?.isBankrupt &&
    nextIndex !== game.currentPlayerIndex
  );

  game.currentPlayerIndex = nextIndex;
  game.turnCount++;

  return {
    nextPlayerId: game.turnOrder[nextIndex],
    isExtraTurn: false,
  };
}

// ============================================================
// T050: 게임 종료 판정
// ============================================================

/** 게임 종료 판정 (생존자 1명) */
export function checkGameEnd(game: Game): { isEnded: boolean; winnerId?: string } {
  const alivePlayers = game.players.filter(p => !p.isBankrupt);
  
  if (alivePlayers.length <= 1) {
    game.status = GameStatus.FINISHED;
    return {
      isEnded: true,
      winnerId: alivePlayers[0]?.id,
    };
  }

  return { isEnded: false };
}

// ============================================================
// 유틸리티
// ============================================================

/** 현재 턴 플레이어 가져오기 */
export function getCurrentPlayer(game: Game): Player {
  const playerId = game.turnOrder[game.currentPlayerIndex];
  const player = game.players.find(p => p.id === playerId);
  if (!player) throw new Error('현재 플레이어를 찾을 수 없습니다.');
  return player;
}

/** 플레이어 ID로 찾기 */
export function getPlayerById(game: Game, playerId: string): Player | undefined {
  return game.players.find(p => p.id === playerId);
}

/** 타일 상태 가져오기 */
export function getTileState(game: Game, tileId: string): BoardTileState | undefined {
  return game.board.find(t => t.id === tileId);
}

/** 플레이어 이름 목록 (턴 순서대로) */
export function getPlayerNamesInOrder(game: Game): string[] {
  return game.turnOrder.map(id => {
    const player = game.players.find(p => p.id === id);
    return player?.name ?? '???';
  });
}
