import { PlayerState, PlayerColor, GAME_CONSTANTS } from '@blue-marble/shared';
import { randomUUID } from 'crypto';

export const createPlayer = (name: string, color: PlayerColor, initialMoney: number = GAME_CONSTANTS.INITIAL_MONEY): PlayerState => {
  return {
    id: randomUUID(),
    name,
    color,
    position: 0,
    money: initialMoney,
    ownedPropertyIds: [],
    bankrupt: false,
    hasLoan: false,
    isConnected: true,

    disconnectedAt: null,
    islandTurnsLeft: 0,
    pendingSpaceChoice: false,
    doubleCount: 0,
    freePassCardCount: 0,
    escapeCardCount: 0,
  };
};
