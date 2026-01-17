/**
 * Simulation Runner Module
 * @description Story 4.2 - Headless Game Simulation
 */
import { createTestStore } from '../state/store.js';
import {
  initializeGame,
  addPlayer,
  startGame,
  movePlayer,
  buyLand,
  endTurn,
  payToll,
  declareBankruptcy,
  checkAuctionTrigger,
  buildBuilding,
} from '../state/gameSlice.js';
import { BOARD_DATA } from '../data/boardData.js';
import { createAIAgent, createAIContext } from '../ai/aiAgent.js';
import { DiceRoller } from '../logic/diceRoller.js';
import type { AIStrategy, AIAction } from '../ai/aiAgent.js';
import type { GameState } from '../model/GameState.js';

/**
 * 시뮬레이션 결과 타입
 */
export interface SimulationResult {
  /** 승자 ID (무승부면 null) */
  winnerId: string | null;
  /** 총 턴 수 */
  totalTurns: number;
  /** 실행 시간 (ms) */
  durationMs: number;
  /** 최종 플레이어 상태 */
  playerStats: Array<{
    id: string;
    name: string;
    money: number;
    ownedTiles: number;
    isBankrupt: boolean;
  }>;
  /** 게임 종료 사유 */
  endReason: 'BANKRUPTCY' | 'TURN_LIMIT' | 'ERROR';
}

/**
 * 시뮬레이션 옵션
 */
export interface SimulationOptions {
  /** 최대 턴 수 */
  maxTurns: number;
  /** AI 전략 */
  aiStrategy: AIStrategy;
  /** 시드 (결정론적 실행) */
  seed: string;
  /** 디버그 로깅 */
  debug?: boolean;
}

/**
 * 시뮬레이션 실행
 */
export function runSimulation(options: SimulationOptions): SimulationResult {
  const startTime = performance.now();
  const { maxTurns, aiStrategy, seed, debug } = options;

  // 스토어 및 게임 초기화
  const store = createTestStore();
  store.dispatch(initializeGame({ seed, tiles: [...BOARD_DATA] }));
  store.dispatch(addPlayer({ id: 'ai1', name: 'AI Player 1' }));
  store.dispatch(addPlayer({ id: 'ai2', name: 'AI Player 2' }));
  store.dispatch(startGame());

  // AI 에이전트 및 주사위 생성
  const agent = createAIAgent(aiStrategy);
  const diceRoller = new DiceRoller(seed);

  let turn = 0;
  let endReason: SimulationResult['endReason'] = 'TURN_LIMIT';

  // 메인 게임 루프
  while (turn < maxTurns) {
    const state = store.getState().game;

    // 게임 종료 체크
    if (state.winnerId || state.turnPhase === 'GAME_OVER') {
      endReason = 'BANKRUPTCY';
      break;
    }

    // 현재 플레이어
    const currentPlayer = state.players[state.currentPlayerIndex];
    if (!currentPlayer || currentPlayer.isBankrupt) {
      store.dispatch(endTurn());
      continue;
    }

    // AI 컨텍스트 생성 및 의사결정
    const context = createAIContext(state, currentPlayer.id);
    if (!context) {
      store.dispatch(endTurn());
      continue;
    }

    const action = agent.decide(context);

    if (debug) {
      console.log(`Turn ${turn}: ${currentPlayer.name} -> ${action.type}`);
    }

    // 액션 실행
    executeAction(store, currentPlayer.id, action, diceRoller);

    // 턴 종료 조건 체크
    const newState = store.getState().game;
    if (newState.turnPhase === 'TURN_END' || action.type === 'END_TURN') {
      store.dispatch(checkAuctionTrigger());
      store.dispatch(endTurn());
      turn++;
    }
  }

  const endTime = performance.now();
  const finalState = store.getState().game;

  return {
    winnerId: finalState.winnerId,
    totalTurns: turn,
    durationMs: Math.round(endTime - startTime),
    playerStats: finalState.players.map(p => ({
      id: p.id,
      name: p.name,
      money: p.money,
      ownedTiles: p.ownedTileIds.length,
      isBankrupt: p.isBankrupt,
    })),
    endReason,
  };
}

/**
 * AI 액션 실행
 */
function executeAction(
  store: ReturnType<typeof createTestStore>,
  playerId: string,
  action: AIAction,
  diceRoller: DiceRoller
): void {
  switch (action.type) {
    case 'ROLL_DICE': {
      const rollResult = diceRoller.roll();
      store.dispatch(movePlayer({ playerId, steps: rollResult.sum }));
      
      // 이동 후 통행료 체크
      const newState = store.getState().game;
      const player = newState.players.find(p => p.id === playerId);
      if (player) {
        const tile = newState.tiles.find(t => t.id === player.position);
        if (tile && tile.ownerId && tile.ownerId !== playerId) {
          store.dispatch(payToll({ payerId: playerId, tileId: tile.id }));
          
          // 파산 체크
          const afterToll = store.getState().game;
          const payer = afterToll.players.find(p => p.id === playerId);
          if (payer && payer.money < 0) {
            store.dispatch(declareBankruptcy({ playerId, creditorId: tile.ownerId }));
          }
        }
      }
      break;
    }
    case 'BUY_LAND':
      store.dispatch(buyLand({ playerId, tileId: action.tileId }));
      break;
    case 'SKIP_BUY':
      // 구매 스킵
      break;
    case 'BUILD':
      store.dispatch(buildBuilding({
        playerId,
        tileId: action.tileId,
        buildingType: action.buildingType,
      }));
      break;
    case 'END_TURN':
      // endTurn은 메인 루프에서 처리
      break;
    default:
      // 기타 액션은 무시
      break;
  }
}

/**
 * 다중 시뮬레이션 실행
 */
export function runMultipleSimulations(
  count: number,
  options: Omit<SimulationOptions, 'seed'>
): SimulationResult[] {
  const results: SimulationResult[] = [];
  for (let i = 0; i < count; i++) {
    const result = runSimulation({
      ...options,
      seed: `SIM_${i}_${Date.now()}`,
    });
    results.push(result);
  }
  return results;
}

/**
 * 시뮬레이션 통계 집계
 */
export function aggregateResults(results: SimulationResult[]): {
  totalGames: number;
  ai1Wins: number;
  ai2Wins: number;
  draws: number;
  averageTurns: number;
  averageDurationMs: number;
} {
  let ai1Wins = 0;
  let ai2Wins = 0;
  let draws = 0;
  let totalTurns = 0;
  let totalDuration = 0;

  for (const result of results) {
    if (result.winnerId === 'ai1') ai1Wins++;
    else if (result.winnerId === 'ai2') ai2Wins++;
    else draws++;
    totalTurns += result.totalTurns;
    totalDuration += result.durationMs;
  }

  return {
    totalGames: results.length,
    ai1Wins,
    ai2Wins,
    draws,
    averageTurns: Math.round(totalTurns / results.length),
    averageDurationMs: Math.round(totalDuration / results.length),
  };
}
