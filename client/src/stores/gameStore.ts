import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { GameState } from '@blue-marble/shared';

interface GameStore {
  gameState: GameState | null;
  playerId: string | null;
  
  // Actions
  setGameState: (state: GameState) => void;
  setPlayerId: (id: string) => void;
  reset: () => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      gameState: null,
      playerId: null,
      
      setGameState: (state) => set({ gameState: state }),
      setPlayerId: (id) => set({ playerId: id }),
      reset: () => set({ gameState: null, playerId: null }),
    }),
    {
      name: 'blue-marble-storage', // unique name
      storage: createJSONStorage(() => sessionStorage), // use sessionStorage (cleared on tab close)
    }
  )
);
