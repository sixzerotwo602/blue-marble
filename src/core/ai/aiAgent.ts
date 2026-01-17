/**
 * AI Agent Module
 * @description Story 4.1 - AI Interface & Decision Maker
 */
import type { GameState } from '../model/GameState.js';
import type { Player } from '../model/Player.js';
import type { Tile } from '../model/Tile.js';

/**
 * AI 액션 타입
 */
export type AIAction =
  | { type: 'ROLL_DICE' }
  | { type: 'BUY_LAND'; tileId: number }
  | { type: 'SKIP_BUY' }
  | { type: 'BUILD'; tileId: number; buildingType: 'villa' | 'building' | 'hotel' }
  | { type: 'END_TURN' }
  | { type: 'USE_CARD'; cardType: 'ISLAND_ESCAPE' | 'TOLL_DISCOUNT' }
  | { type: 'PASS_AUCTION' }
  | { type: 'PLACE_BID'; amount: number };

/**
 * AI 전략 타입
 */
export type AIStrategy = 'RANDOM' | 'PURCHASE_ALL' | 'CONSERVATIVE';

/**
 * AI 의사결정 컨텍스트
 */
export interface AIContext {
  state: GameState;
  player: Player;
  currentTile: Tile;
  availableActions: AIAction['type'][];
}

/**
 * AI 에이전트 인터페이스
 */
export interface AIAgent {
  strategy: AIStrategy;
  decide: (context: AIContext) => AIAction;
}

/**
 * Random 전략 - 무작위로 유효한 액션 선택
 */
export function createRandomAgent(): AIAgent {
  return {
    strategy: 'RANDOM',
    decide: (context: AIContext): AIAction => {
      const { player, currentTile, availableActions, state } = context;

      // 무인도에 갇혀있고 탈출권이 있으면 사용
      if (player.jailTurnsRemaining > 0 && player.heldCards.includes('ISLAND_ESCAPE')) {
        if (Math.random() > 0.5) {
          return { type: 'USE_CARD', cardType: 'ISLAND_ESCAPE' };
        }
      }

      // 경매 중이면 50% 확률로 입찰
      if (state.currentAuction && availableActions.includes('PLACE_BID')) {
        if (Math.random() > 0.5) {
          const bidAmount = (state.currentAuction.currentBid ?? 0) + 10000;
          if (player.money >= bidAmount) {
            return { type: 'PLACE_BID', amount: bidAmount };
          }
        }
        return { type: 'PASS_AUCTION' };
      }

      // 빈 땅에 있고 구매 가능하면 50% 확률로 구매
      if (currentTile.ownerId === null && currentTile.type === 'city') {
        if (player.money >= (currentTile.landPrice ?? 0)) {
          if (Math.random() > 0.5) {
            return { type: 'BUY_LAND', tileId: currentTile.id };
          }
        }
        return { type: 'SKIP_BUY' };
      }

      // 내 땅에 있고 DEVELOPMENT 페이즈면 50% 확률로 건설
      if (currentTile.ownerId === player.id && state.phase === 'DEVELOPMENT') {
        if (player.money >= (currentTile.buildingPrice ?? 0)) {
          if (Math.random() > 0.5) {
            return { type: 'BUILD', tileId: currentTile.id, buildingType: 'villa' };
          }
        }
      }

      // 기본: 주사위 굴리기 또는 턴 종료
      if (availableActions.includes('ROLL_DICE')) {
        return { type: 'ROLL_DICE' };
      }

      return { type: 'END_TURN' };
    },
  };
}

/**
 * Purchase-All 전략 - 살 수 있으면 무조건 구매
 */
export function createPurchaseAllAgent(): AIAgent {
  return {
    strategy: 'PURCHASE_ALL',
    decide: (context: AIContext): AIAction => {
      const { player, currentTile, availableActions, state } = context;

      // 무인도에 갇혀있고 탈출권이 있으면 즉시 사용
      if (player.jailTurnsRemaining > 0 && player.heldCards.includes('ISLAND_ESCAPE')) {
        return { type: 'USE_CARD', cardType: 'ISLAND_ESCAPE' };
      }

      // 경매 중이면 자금 50% 이하까지 입찰
      if (state.currentAuction && availableActions.includes('PLACE_BID')) {
        const bidAmount = (state.currentAuction.currentBid ?? 0) + 10000;
        if (player.money >= bidAmount && bidAmount <= player.money * 0.5) {
          return { type: 'PLACE_BID', amount: bidAmount };
        }
        return { type: 'PASS_AUCTION' };
      }

      // 빈 땅에 있으면 무조건 구매
      if (currentTile.ownerId === null && currentTile.type === 'city') {
        if (player.money >= (currentTile.landPrice ?? 0)) {
          return { type: 'BUY_LAND', tileId: currentTile.id };
        }
        return { type: 'SKIP_BUY' };
      }

      // 내 땅에 있고 DEVELOPMENT 페이즈면 건설
      if (currentTile.ownerId === player.id && state.phase === 'DEVELOPMENT') {
        const buildingPrice = currentTile.buildingPrice ?? 0;
        
        // 호텔 → 빌딩 → 별장 순으로 시도
        if (currentTile.buildings.hotel < 1 && player.money >= buildingPrice * 5) {
          return { type: 'BUILD', tileId: currentTile.id, buildingType: 'hotel' };
        }
        if (currentTile.buildings.building < 1 && player.money >= buildingPrice * 3) {
          return { type: 'BUILD', tileId: currentTile.id, buildingType: 'building' };
        }
        if (currentTile.buildings.villa < 2 && player.money >= buildingPrice) {
          return { type: 'BUILD', tileId: currentTile.id, buildingType: 'villa' };
        }
      }

      // 기본: 주사위 굴리기 또는 턴 종료
      if (availableActions.includes('ROLL_DICE')) {
        return { type: 'ROLL_DICE' };
      }

      return { type: 'END_TURN' };
    },
  };
}

/**
 * AI 에이전트 팩토리
 */
export function createAIAgent(strategy: AIStrategy): AIAgent {
  switch (strategy) {
    case 'RANDOM':
      return createRandomAgent();
    case 'PURCHASE_ALL':
      return createPurchaseAllAgent();
    case 'CONSERVATIVE':
      // 보수적 전략 (기본은 Random으로)
      return createRandomAgent();
    default:
      return createRandomAgent();
  }
}

/**
 * AI 컨텍스트 생성 헬퍼
 */
export function createAIContext(state: GameState, playerId: string): AIContext | null {
  const player = state.players.find(p => p.id === playerId);
  if (!player) return null;

  const currentTile = state.tiles.find(t => t.id === player.position);
  if (!currentTile) return null;

  // 가능한 액션 목록 생성
  const availableActions: AIAction['type'][] = [];
  
  if (state.turnPhase === 'TURN_START') {
    availableActions.push('ROLL_DICE');
  }
  if (state.turnPhase === 'LANDED') {
    if (currentTile.ownerId === null && currentTile.type === 'city') {
      availableActions.push('BUY_LAND', 'SKIP_BUY');
    }
    if (currentTile.ownerId === player.id && state.phase === 'DEVELOPMENT') {
      availableActions.push('BUILD');
    }
    availableActions.push('END_TURN');
  }
  if (state.currentAuction) {
    availableActions.push('PLACE_BID', 'PASS_AUCTION');
  }

  return {
    state,
    player,
    currentTile,
    availableActions,
  };
}
