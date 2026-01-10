// 땅 구매 서비스

import { Game, Player, TileType } from '../types/index.js';
import { getTileDataByIndex } from '../data/boardData.js';

// ============================================================
// T027: 구매 가능 여부 확인
// ============================================================

/** 구매 가능 여부 확인 */
export function canAffordPurchase(player: Player, tileIndex: number): boolean {
  const tileData = getTileDataByIndex(tileIndex);
  if (!tileData?.price) return false;
  return player.money >= tileData.price;
}

/** 구매 가능한 타일인지 확인 */
export function isPurchasableTile(tileIndex: number): boolean {
  const tileData = getTileDataByIndex(tileIndex);
  if (!tileData) return false;
  return (
    (tileData.type === TileType.PROPERTY || tileData.type === TileType.VEHICLE) &&
    tileData.price !== undefined
  );
}

// ============================================================
// T028: 땅 구매
// ============================================================

/** 땅 구매 */
export function purchaseProperty(
  game: Game,
  playerId: string,
  tileIndex: number
): { success: boolean; error?: string } {
  const player = game.players.find(p => p.id === playerId);
  if (!player) return { success: false, error: '플레이어를 찾을 수 없습니다.' };

  const tileData = getTileDataByIndex(tileIndex);
  if (!tileData?.price) return { success: false, error: '구매할 수 없는 칸입니다.' };

  const tileState = game.board[tileIndex];
  if (tileState.ownerId) return { success: false, error: '이미 소유자가 있습니다.' };

  if (player.money < tileData.price) {
    return { success: false, error: '잔고가 부족합니다.' };
  }

  // 구매 처리
  player.money -= tileData.price;
  tileState.ownerId = playerId;
  player.ownedTileIds.push(tileData.id);

  return { success: true };
}
