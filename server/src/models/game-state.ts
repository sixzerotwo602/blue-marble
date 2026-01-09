import { GameState, GameStatus, GamePhase, GameMode, TurnPhase, createShuffledDeck } from '@blue-marble/shared';

import { randomUUID } from 'crypto';

export const createGameState = (roomCode: string, hostPlayerId: string, mode: GameMode = GameMode.ORDINARY): GameState => {
  return {
    id: randomUUID(),
    roomCode,
    status: GameStatus.WAITING,
    phase: GamePhase.SETUP,
    mode,
    hostPlayerId,
    players: [],
    currentTurnIndex: 0,
    turnOrder: [],
    turnPhase: TurnPhase.IDLE,
    diceResult: null,
    propertyStates: {},
    welfarePot: 0,
    goldenKeyDeck: createShuffledDeck(),
    unsoldPropertyIds: [],
    createdAt: Date.now(),
    startedAt: null,
    turnsElapsed: 0,
    gameEndByTimeLimit: false,
    timeLimitMinutes: null,
    logs: [],
    pendingDebt: null,
    devMode: false,
  };
};



