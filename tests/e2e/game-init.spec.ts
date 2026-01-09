/**
 * E2E 테스트: 게임 초기화 (T023)
 * 
 * 테스트 시나리오:
 * 1. 4인 게임 생성
 * 2. 초기 상태 확인 (위치 0, 현금 293만원)
 */
import { test, expect } from '@playwright/test';

const API_URL = process.env.API_URL || 'http://localhost:3001';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

test.describe('Game Initialization (T023)', () => {
  
  test('should create a 4-player game with correct initial state', async ({ request }) => {
    // 1. Create Game
    const createResponse = await request.post(`${API_URL}/games`, {
      data: { mode: 'ordinary', timeLimit: null }
    });
    expect(createResponse.ok()).toBeTruthy();
    const { gameId } = await createResponse.json();
    expect(gameId).toBeTruthy();

    // 2. Join 4 Players
    const players: string[] = [];
    for (let i = 1; i <= 4; i++) {
      const joinResponse = await request.post(`${API_URL}/games/${gameId}/join`, {
        data: { playerName: `Player${i}` }
      });
      expect(joinResponse.ok()).toBeTruthy();
      const { playerId, gameState } = await joinResponse.json();
      players.push(playerId);
      
      // Verify player count
      expect(gameState.players.length).toBe(i);
    }

    // 3. Start Game
    const startResponse = await request.post(`${API_URL}/games/${gameId}/start`);
    expect(startResponse.ok()).toBeTruthy();
    const { gameState } = await startResponse.json();

    // 4. Verify Initial State
    expect(gameState.status).toBe('playing');
    expect(gameState.players.length).toBe(4);
    
    for (const player of gameState.players) {
      // Position should be 0 (Start)
      expect(player.position).toBe(0);
      // Initial money for 3-4 players: 2,930,000
      expect(player.money).toBe(2_930_000);
      // No owned properties
      expect(player.ownedPropertyIds.length).toBe(0);
      // Not bankrupt
      expect(player.bankrupt).toBe(false);
    }
  });

  test('should create a 2-player game with doubled initial money', async ({ request }) => {
    // 1. Create Game
    const createResponse = await request.post(`${API_URL}/games`, {
      data: { mode: 'ordinary', timeLimit: 60 }
    });
    const { gameId } = await createResponse.json();

    // 2. Join 2 Players
    for (let i = 1; i <= 2; i++) {
      await request.post(`${API_URL}/games/${gameId}/join`, {
        data: { playerName: `Player${i}` }
      });
    }

    // 3. Start Game
    const startResponse = await request.post(`${API_URL}/games/${gameId}/start`);
    const { gameState } = await startResponse.json();

    // 4. Verify 2P Initial Money: 5,860,000
    for (const player of gameState.players) {
      expect(player.money).toBe(5_860_000);
    }
  });
});
