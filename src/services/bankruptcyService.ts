// 파산 처리 서비스

import { Game, Player } from '../types/index.js';
import { getTileDataByIndex } from '../data/boardData.js';
import { GAME_CONSTANTS } from '../data/constants.js';

/** 매각 가능 아이템 */
export interface SellableItem {
  index: number;
  type: 'building' | 'land';
  subType?: 'villa' | 'building' | 'hotel';
  tileId: string;
  tileName: string;
  value: number;
}

// ============================================================
// T042: 지불 가능 여부 확인
// ============================================================

/** 지불 가능 여부 확인 */
export function canAfford(player: Player, amount: number): boolean {
  return player.money >= amount;
}

/** 매각 가능한 아이템 목록 */
export function getSellableItems(game: Game, playerId: string): SellableItem[] {
  const player = game.players.find(p => p.id === playerId);
  if (!player) return [];

  const items: SellableItem[] = [];
  let itemIndex = 0;

  for (const tileId of player.ownedTileIds) {
    const tileState = game.board.find(t => t.id === tileId);
    const tileData = getTileDataByIndex(parseInt(tileId.replace('tile-', '')));
    if (!tileState || !tileData) continue;

    const { buildings } = tileState;

    // 건물 매각 (100% 환급)
    if (tileData.buildingPrices) {
      if (buildings.hasHotel) {
        items.push({
          index: itemIndex++,
          type: 'building',
          subType: 'hotel',
          tileId,
          tileName: `${tileData.name} 호텔`,
          value: tileData.buildingPrices.hotel * GAME_CONSTANTS.BUILDING_SELL_RATE,
        });
      }
      if (buildings.hasBuilding) {
        items.push({
          index: itemIndex++,
          type: 'building',
          subType: 'building',
          tileId,
          tileName: `${tileData.name} 빌딩`,
          value: tileData.buildingPrices.building * GAME_CONSTANTS.BUILDING_SELL_RATE,
        });
      }
      if (buildings.villaCount > 0) {
        for (let i = 0; i < buildings.villaCount; i++) {
          items.push({
            index: itemIndex++,
            type: 'building',
            subType: 'villa',
            tileId,
            tileName: `${tileData.name} 별장`,
            value: tileData.buildingPrices.villa * GAME_CONSTANTS.BUILDING_SELL_RATE,
          });
        }
      }
    }

    // 땅 매각 (50% 환급) - 건물이 없는 경우만
    if (
      buildings.villaCount === 0 &&
      !buildings.hasBuilding &&
      !buildings.hasHotel &&
      tileData.price
    ) {
      items.push({
        index: itemIndex++,
        type: 'land',
        tileId,
        tileName: tileData.name,
        value: tileData.price * GAME_CONSTANTS.LAND_SELL_RATE,
      });
    }
  }

  return items;
}

// ============================================================
// T043: 건물 매각 (100% 환급)
// ============================================================

/** 건물 매각 */
export function sellBuilding(
  game: Game,
  player: Player,
  item: SellableItem
): { success: boolean } {
  if (item.type !== 'building') return { success: false };

  const tileState = game.board.find(t => t.id === item.tileId);
  if (!tileState) return { success: false };

  // 환급
  player.money += item.value;

  // 건물 제거
  switch (item.subType) {
    case 'hotel':
      tileState.buildings.hasHotel = false;
      break;
    case 'building':
      tileState.buildings.hasBuilding = false;
      break;
    case 'villa':
      tileState.buildings.villaCount = Math.max(0, tileState.buildings.villaCount - 1) as 0 | 1 | 2;
      break;
  }

  return { success: true };
}

// ============================================================
// T044: 땅 매각 (50% 환급)
// ============================================================

/** 땅 매각 */
export function sellLand(
  game: Game,
  player: Player,
  item: SellableItem
): { success: boolean } {
  if (item.type !== 'land') return { success: false };

  const tileState = game.board.find(t => t.id === item.tileId);
  if (!tileState) return { success: false };

  // 환급
  player.money += item.value;

  // 소유권 해제
  tileState.ownerId = undefined;
  player.ownedTileIds = player.ownedTileIds.filter(id => id !== item.tileId);

  return { success: true };
}

// ============================================================
// T045: 파산 선언
// ============================================================

/** 파산 선언 */
export function declareBankruptcy(game: Game, playerId: string): void {
  const player = game.players.find(p => p.id === playerId);
  if (!player) return;

  // 파산 상태 설정
  player.isBankrupt = true;
  player.money = 0;

  // 모든 소유 땅 은행 귀속
  for (const tileId of player.ownedTileIds) {
    const tileState = game.board.find(t => t.id === tileId);
    if (tileState) {
      tileState.ownerId = undefined;
      tileState.buildings = { villaCount: 0, hasBuilding: false, hasHotel: false };
    }
  }

  player.ownedTileIds = [];
}
