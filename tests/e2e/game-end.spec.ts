/**
 * E2E 테스트: 게임 종료 (T059)
 * 
 * 테스트 시나리오:
 * 1. 파산으로 인한 게임 종료
 * 2. 승자 확인
 */
import { test, expect } from '@playwright/test';

const API_URL = process.env.API_URL || 'http://localhost:3001';

test.describe('Game End Conditions (T059)', () => {

  test('should end game when only one player remains', async ({ request }) => {
    // Setup 2-player game
    const createRes = await request.post(`${API_URL}/games`, { data: { mode: 'ordinary', timeLimit: null } });
    const { gameId } = await createRes.json();
    
    const join1 = await request.post(`${API_URL}/games/${gameId}/join`, { data: { playerName: 'Survivor' } });
    const { playerId: survivorId } = await join1.json();
    
    const join2 = await request.post(`${API_URL}/games/${gameId}/join`, { data: { playerName: 'Loser' } });
    const { playerId: loserId } = await join2.json();
    
    await request.post(`${API_URL}/games/${gameId}/start`);

    // Loser declares bankruptcy
    const bankruptRes = await request.post(`${API_URL}/games/${gameId}/bankruptcy`, {
      data: { playerId: loserId }
    });
    expect(bankruptRes.ok()).toBeTruthy();
    
    const { gameState } = await bankruptRes.json();
    
    // Game should be finished
    expect(gameState.status).toBe('finished');
    
    // Survivor should be the winner (not bankrupt)
    const survivor = gameState.players.find((p: any) => p.id === survivorId);
    expect(survivor.bankrupt).toBe(false);
    
    const loser = gameState.players.find((p: any) => p.id === loserId);
    expect(loser.bankrupt).toBe(true);
  });
});
