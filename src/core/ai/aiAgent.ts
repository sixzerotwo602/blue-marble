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
/**
 * AI 전략 타입
 */
export type AIStrategy = 'RANDOM' | 'PURCHASE_ALL' | 'CONSERVATIVE' | 'SMART';

// ... (existing interfaces)

/**
 * Smart 전략 - 전략적 판단
 * - 구매: 잔고의 30% 이상 남으면 구매
 * - 건설: 잔고의 20% 이상 남으면 최대 건설
 * - 경매: 자산 가치 판단 (구현 예정)
 */
export function createSmartAgent(): AIAgent {
  return {
    strategy: 'SMART',
    decide: (context: AIContext): AIAction => {
      const { player, currentTile, availableActions, state } = context;

      // 무인도 탈출
      if (player.jailTurnsRemaining > 0 && player.heldCards.includes('ISLAND_ESCAPE')) {
        return { type: 'USE_CARD', cardType: 'ISLAND_ESCAPE' };
      }

      // 경매: 보수적 입찰 (자금 30% 이하까지)
      if (state.currentAuction && availableActions.includes('PLACE_BID')) {
        const bidAmount = (state.currentAuction.currentBid ?? 0) + 10000;
        if (player.money >= bidAmount && bidAmount <= player.money * 0.3) {
          return { type: 'PLACE_BID', amount: bidAmount };
        }
        return { type: 'PASS_AUCTION' };
      }

      // 빈 땅 구매 결정
      if (currentTile.ownerId === null && currentTile.type === 'city') {
        const price = currentTile.landPrice ?? 0;
        if (player.money >= price) {
          const remainingAfter = player.money - price;
          // 잔고의 30%는 남겨야 함
          if (remainingAfter >= player.money * 0.3) {
            return { type: 'BUY_LAND', tileId: currentTile.id };
          }
        }
        return { type: 'SKIP_BUY' };
      }

      // 건설 결정
      if (currentTile.ownerId === player.id && state.phase === 'DEVELOPMENT') {
        const buildingPrice = currentTile.buildingPrice ?? 0;
        const minReserve = player.money * 0.2; // 최소 20% 보유

        // 호텔 → 빌딩 → 별장 순으로 시도 (자금 여유 확인)
        if (currentTile.buildings.hotel < 1 && player.money - (buildingPrice * 5) >= minReserve) {
          return { type: 'BUILD', tileId: currentTile.id, buildingType: 'hotel' };
        }
        if (currentTile.buildings.building < 1 && player.money - (buildingPrice * 3) >= minReserve) {
          return { type: 'BUILD', tileId: currentTile.id, buildingType: 'building' };
        }
        if (currentTile.buildings.villa < 2 && player.money - buildingPrice >= minReserve) {
          return { type: 'BUILD', tileId: currentTile.id, buildingType: 'villa' };
        }
      }

      // 기본 동작
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
      return createRandomAgent();
    case 'SMART':
      return createSmartAgent();
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
