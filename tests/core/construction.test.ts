/**
 * Construction System Tests
 * @description Story 3.2 - 건설 시스템 테스트
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { createTestStore } from '../../src/core/state/store.js';
import {
  initializeGame,
  addPlayer,
  startGame,
  buyLand,
  checkAuctionTrigger,
  buildBuilding,
} from '../../src/core/state/gameSlice.js';
import { BOARD_DATA } from '../../src/core/data/boardData.js';

describe('Construction System - Story 3.2', () => {
  let store: ReturnType<typeof createTestStore>;

  const setupDevelopmentPhase = () => {
    // 모든 도시 타일 구매하여 DEVELOPMENT 페이즈로 전환
    const cityTiles = store.getState().game.tiles.filter(
      t => t.type === 'city' && t.ownerId === null
    );
    
    // 6개 남기고 구매
    const tilesToBuyFirst = cityTiles.slice(0, cityTiles.length - 6);
    tilesToBuyFirst.forEach(tile => {
      store.dispatch(buyLand({ playerId: 'p1', tileId: tile.id }));
    });
    store.dispatch(checkAuctionTrigger());
    
    // 나머지 구매
    const remaining = store.getState().game.tiles.filter(
      t => t.type === 'city' && t.ownerId === null
    );
    remaining.forEach(tile => {
      store.dispatch(buyLand({ playerId: 'p2', tileId: tile.id }));
    });
    store.dispatch(checkAuctionTrigger());
  };

  beforeEach(() => {
    store = createTestStore();
    store.dispatch(initializeGame({ seed: 'TEST_SEED', tiles: [...BOARD_DATA] }));
    store.dispatch(addPlayer({ id: 'p1', name: 'Player 1' }));
    store.dispatch(addPlayer({ id: 'p2', name: 'Player 2' }));
    store.dispatch(startGame());
  });

  describe('AC1: Phase Restriction', () => {
    it('DEVELOPMENT 페이즈가 아니면 건설할 수 없어야 한다', () => {
      store.dispatch(buyLand({ playerId: 'p1', tileId: 1 }));
      
      const playerBefore = store.getState().game.players.find(p => p.id === 'p1')!;
      
      // EARLY 페이즈에서 건설 시도
      store.dispatch(buildBuilding({ playerId: 'p1', tileId: 1, buildingType: 'villa' }));

      const playerAfter = store.getState().game.players.find(p => p.id === 'p1')!;
      expect(playerAfter.money).toBe(playerBefore.money); // 변화 없음
    });
  });

  describe('AC2: Building Costs', () => {
    it('별장 건설 시 건물 비용이 차감되어야 한다', () => {
      setupDevelopmentPhase();
      
      const ownedTile = store.getState().game.tiles.find(
        t => t.type === 'city' && t.ownerId === 'p1'
      )!;
      const buildingPrice = ownedTile.buildingPrice ?? 0;
      const playerBefore = store.getState().game.players.find(p => p.id === 'p1')!;

      store.dispatch(buildBuilding({ playerId: 'p1', tileId: ownedTile.id, buildingType: 'villa' }));

      const playerAfter = store.getState().game.players.find(p => p.id === 'p1')!;
      expect(playerAfter.money).toBe(playerBefore.money - buildingPrice);
    });

    it('타일 건물 상태가 업데이트되어야 한다', () => {
      setupDevelopmentPhase();
      
      const ownedTile = store.getState().game.tiles.find(
        t => t.type === 'city' && t.ownerId === 'p1'
      )!;

      store.dispatch(buildBuilding({ playerId: 'p1', tileId: ownedTile.id, buildingType: 'villa' }));

      const tileAfter = store.getState().game.tiles.find(t => t.id === ownedTile.id)!;
      expect(tileAfter.buildings.villa).toBe(1);
    });
  });

  describe('AC3: Building Limits', () => {
    it('별장은 최대 2채까지만 건설할 수 있어야 한다', () => {
      setupDevelopmentPhase();
      
      const ownedTile = store.getState().game.tiles.find(
        t => t.type === 'city' && t.ownerId === 'p1'
      )!;

      store.dispatch(buildBuilding({ playerId: 'p1', tileId: ownedTile.id, buildingType: 'villa' }));
      store.dispatch(buildBuilding({ playerId: 'p1', tileId: ownedTile.id, buildingType: 'villa' }));
      store.dispatch(buildBuilding({ playerId: 'p1', tileId: ownedTile.id, buildingType: 'villa' })); // 초과

      const tile = store.getState().game.tiles.find(t => t.id === ownedTile.id)!;
      expect(tile.buildings.villa).toBe(2); // 최대 2
    });

    it('호텔은 최대 1채까지만 건설할 수 있어야 한다', () => {
      setupDevelopmentPhase();
      
      const ownedTile = store.getState().game.tiles.find(
        t => t.type === 'city' && t.ownerId === 'p1'
      )!;

      store.dispatch(buildBuilding({ playerId: 'p1', tileId: ownedTile.id, buildingType: 'hotel' }));
      store.dispatch(buildBuilding({ playerId: 'p1', tileId: ownedTile.id, buildingType: 'hotel' })); // 초과

      const tile = store.getState().game.tiles.find(t => t.id === ownedTile.id)!;
      expect(tile.buildings.hotel).toBe(1); // 최대 1
    });
  });
});
