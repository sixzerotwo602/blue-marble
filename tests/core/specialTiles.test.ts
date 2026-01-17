/**
 * Special Tile Tests
 * @description Story 1.7 - 특수 타일 메카닉 테스트
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { createTestStore } from '../../src/core/state/store.js';
import {
  addPlayer,
  startGame,
  sendToIsland,
  tryEscapeIsland,
  setSpaceTravelReady,
  spaceTravelTo,
  handleSocialFund,
} from '../../src/core/state/gameSlice.js';
import {
  isIslandTile,
  isSpaceTravelTile,
  isSocialFundTile,
  isGoldenKeyTile,
  ISLAND_TURNS,
  SOCIAL_FUND_AMOUNT,
} from '../../src/core/logic/specialTiles.js';

describe('Special Tiles - Story 1.7', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
    store.dispatch(addPlayer({ id: 'p1', name: 'Player 1' }));
    store.dispatch(addPlayer({ id: 'p2', name: 'Player 2' }));
    store.dispatch(startGame());
  });

  describe('AC1: 무인도 메카닉', () => {
    it('무인도는 인덱스 10에 위치해야 한다', () => {
      expect(isIslandTile(10)).toBe(true);
      expect(isIslandTile(5)).toBe(false);
    });

    it('sendToIsland 시 플레이어 위치가 10이 되고 3턴 잠금되어야 한다', () => {
      store.dispatch(sendToIsland({ playerId: 'p1' }));
      
      const player = store.getState().game.players.find(p => p.id === 'p1')!;
      expect(player.position).toBe(10);
      expect(player.jailTurnsRemaining).toBe(ISLAND_TURNS);
    });

    it('더블을 굴리면 무인도에서 탈출해야 한다', () => {
      store.dispatch(sendToIsland({ playerId: 'p1' }));
      store.dispatch(tryEscapeIsland({ playerId: 'p1', isDouble: true }));

      const player = store.getState().game.players.find(p => p.id === 'p1')!;
      expect(player.jailTurnsRemaining).toBe(0);
    });

    it('더블이 아니면 남은 턴이 감소해야 한다', () => {
      store.dispatch(sendToIsland({ playerId: 'p1' }));
      store.dispatch(tryEscapeIsland({ playerId: 'p1', isDouble: false }));

      const player = store.getState().game.players.find(p => p.id === 'p1')!;
      expect(player.jailTurnsRemaining).toBe(2);
    });
  });

  describe('AC2: 우주여행 메카닉', () => {
    it('우주여행은 인덱스 30에 위치해야 한다', () => {
      expect(isSpaceTravelTile(30)).toBe(true);
      expect(isSpaceTravelTile(20)).toBe(false);
    });

    it('setSpaceTravelReady 시 canChooseDestination이 true가 되어야 한다', () => {
      store.dispatch(setSpaceTravelReady({ playerId: 'p1' }));

      const player = store.getState().game.players.find(p => p.id === 'p1')!;
      expect(player.canChooseDestination).toBe(true);
    });

    it('spaceTravelTo 시 원하는 위치로 이동하고 상태가 리셋되어야 한다', () => {
      store.dispatch(setSpaceTravelReady({ playerId: 'p1' }));
      store.dispatch(spaceTravelTo({ playerId: 'p1', destination: 15 }));

      const player = store.getState().game.players.find(p => p.id === 'p1')!;
      expect(player.position).toBe(15);
      expect(player.canChooseDestination).toBe(false);
    });

    it('canChooseDestination이 false면 이동할 수 없어야 한다', () => {
      store.dispatch(spaceTravelTo({ playerId: 'p1', destination: 15 }));

      const player = store.getState().game.players.find(p => p.id === 'p1')!;
      expect(player.position).toBe(0); // 이동하지 않음
    });
  });

  describe('AC3: 사회복지기금 메카닉', () => {
    it('사회복지기금은 인덱스 20에 위치해야 한다', () => {
      expect(isSocialFundTile(20)).toBe(true);
      expect(isSocialFundTile(10)).toBe(false);
    });

    it('기금이 비어있으면 기부해야 한다 (150,000원)', () => {
      const playerBefore = store.getState().game.players.find(p => p.id === 'p1')!;
      const moneyBefore = playerBefore.money;

      store.dispatch(handleSocialFund({ playerId: 'p1' }));

      const playerAfter = store.getState().game.players.find(p => p.id === 'p1')!;
      const fundAfter = store.getState().game.socialFundBalance;

      expect(playerAfter.money).toBe(moneyBefore - SOCIAL_FUND_AMOUNT);
      expect(fundAfter).toBe(SOCIAL_FUND_AMOUNT);
    });

    it('기금이 있으면 전액 수령해야 한다', () => {
      // p1이 먼저 기부
      store.dispatch(handleSocialFund({ playerId: 'p1' }));

      const p2Before = store.getState().game.players.find(p => p.id === 'p2')!;
      const p2MoneyBefore = p2Before.money;

      // p2가 수령
      store.dispatch(handleSocialFund({ playerId: 'p2' }));

      const p2After = store.getState().game.players.find(p => p.id === 'p2')!;
      const fundAfter = store.getState().game.socialFundBalance;

      expect(p2After.money).toBe(p2MoneyBefore + SOCIAL_FUND_AMOUNT);
      expect(fundAfter).toBe(0);
    });
  });

  describe('AC4: 황금열쇠 타일 확인', () => {
    it('황금열쇠 타일 위치가 올바르게 감지되어야 한다', () => {
      const goldenKeyPositions = [2, 7, 12, 17, 22, 27, 32, 37];
      goldenKeyPositions.forEach(pos => {
        expect(isGoldenKeyTile(pos)).toBe(true);
      });

      expect(isGoldenKeyTile(1)).toBe(false);
      expect(isGoldenKeyTile(10)).toBe(false);
    });
  });
});
