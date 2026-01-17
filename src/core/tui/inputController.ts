/**
 * Input Controller Module
 * @description Story 5.2 - Inquirer Controller (UX)
 */
import type { GameState, TurnPhase } from '../model/GameState.js';
import type { Player } from '../model/Player.js';
import type { Tile } from '../model/Tile.js';

/**
 * 사용자 선택 옵션
 */
export interface MenuOption {
  label: string;
  value: string;
  disabled?: boolean;
}

/**
 * 메뉴 유형
 */
export type MenuType = 'TURN_START' | 'LANDED' | 'BUY_DECISION' | 'BUILD_MENU' | 'JAIL_OPTIONS';

/**
 * 턴 시작 메뉴 옵션 생성
 */
export function getTurnStartOptions(player: Player): MenuOption[] {
  const options: MenuOption[] = [
    { label: '🎲 주사위 굴리기', value: 'ROLL_DICE' },
  ];

  // 무인도에 갇힌 경우 추가 옵션
  if (player.jailTurnsRemaining > 0) {
    if (player.heldCards.includes('ISLAND_ESCAPE')) {
      options.push({ label: '🎫 탈출권 사용', value: 'USE_ESCAPE_CARD' });
    }
    options.push({ label: '💰 보석금 지불 (50만)', value: 'PAY_BAIL' });
  }

  return options;
}

/**
 * 착지 후 메뉴 옵션 생성
 */
export function getLandedOptions(state: GameState, player: Player, tile: Tile): MenuOption[] {
  const options: MenuOption[] = [];

  // 빈 땅인 경우 구매 옵션
  if (tile.type === 'city' && tile.ownerId === null) {
    const canAfford = player.money >= (tile.landPrice ?? 0);
    options.push({
      label: `🏠 구매 (${formatPrice(tile.landPrice ?? 0)})`,
      value: 'BUY_LAND',
      disabled: !canAfford,
    });
    options.push({ label: '⏭️ 구매 안 함', value: 'SKIP_BUY' });
  }

  // 내 땅인 경우 건설 옵션 (DEVELOPMENT 페이즈)
  if (tile.ownerId === player.id && state.phase === 'DEVELOPMENT') {
    const buildingPrice = tile.buildingPrice ?? 0;

    if (tile.buildings.villa < 2 && player.money >= buildingPrice) {
      options.push({
        label: `🏡 별장 건설 (${formatPrice(buildingPrice)})`,
        value: 'BUILD_VILLA',
      });
    }
    if (tile.buildings.building < 1 && player.money >= buildingPrice * 3) {
      options.push({
        label: `🏢 빌딩 건설 (${formatPrice(buildingPrice * 3)})`,
        value: 'BUILD_BUILDING',
      });
    }
    if (tile.buildings.hotel < 1 && player.money >= buildingPrice * 5) {
      options.push({
        label: `🏨 호텔 건설 (${formatPrice(buildingPrice * 5)})`,
        value: 'BUILD_HOTEL',
      });
    }
  }

  // 턴 종료
  options.push({ label: '✅ 턴 종료', value: 'END_TURN' });

  return options;
}

/**
 * 경매 메뉴 옵션 생성
 */
export function getAuctionOptions(player: Player, currentBid: number): MenuOption[] {
  const options: MenuOption[] = [];
  const minBid = currentBid + 10000;

  if (player.money >= minBid) {
    options.push({
      label: `💵 입찰 (${formatPrice(minBid)}+)`,
      value: 'PLACE_BID',
    });
  }

  options.push({ label: '🚫 패스', value: 'PASS_AUCTION' });

  return options;
}

/**
 * 가격 포맷
 */
function formatPrice(amount: number): string {
  if (amount >= 10000) {
    return `${(amount / 10000).toFixed(0)}만`;
  }
  return `${amount}원`;
}

/**
 * 현재 턴 페이즈에 따른 메뉴 옵션 생성
 */
export function getMenuOptions(state: GameState): MenuOption[] {
  const player = state.players[state.currentPlayerIndex];
  if (!player) return [];

  const tile = state.tiles.find(t => t.id === player.position);
  if (!tile) return [];

  switch (state.turnPhase) {
    case 'TURN_START':
      return getTurnStartOptions(player);
    case 'MOVING':
    case 'PURCHASE_DECISION':
    case 'BUILD_DECISION':
      return getLandedOptions(state, player, tile);
    default:
      return [{ label: '✅ 턴 종료', value: 'END_TURN' }];
  }
}

/**
 * 선택된 옵션을 Redux 액션으로 변환
 */
export function mapOptionToAction(
  option: string,
  playerId: string,
  tileId: number
): { type: string; payload?: object } | null {
  switch (option) {
    case 'ROLL_DICE':
      return { type: 'game/rollDice' };
    case 'BUY_LAND':
      return { type: 'game/buyLand', payload: { playerId, tileId } };
    case 'SKIP_BUY':
      return null; // 패스
    case 'BUILD_VILLA':
      return { type: 'game/buildBuilding', payload: { playerId, tileId, buildingType: 'villa' } };
    case 'BUILD_BUILDING':
      return { type: 'game/buildBuilding', payload: { playerId, tileId, buildingType: 'building' } };
    case 'BUILD_HOTEL':
      return { type: 'game/buildBuilding', payload: { playerId, tileId, buildingType: 'hotel' } };
    case 'END_TURN':
      return { type: 'game/endTurn' };
    case 'USE_ESCAPE_CARD':
      return { type: 'game/useCard', payload: { playerId, cardType: 'ISLAND_ESCAPE' } };
    case 'PAY_BAIL':
      return { type: 'game/payBail', payload: { playerId } };
    case 'PASS_AUCTION':
      return { type: 'game/passAuction', payload: { playerId } };
    default:
      return null;
  }
}

/**
 * 메뉴 텍스트 렌더링 (콘솔용)
 */
export function renderMenu(options: MenuOption[]): string[] {
  return options.map((opt, index) => {
    const prefix = opt.disabled ? '  ' : `${index + 1}.`;
    const suffix = opt.disabled ? ' (자금 부족)' : '';
    return `${prefix} ${opt.label}${suffix}`;
  });
}
