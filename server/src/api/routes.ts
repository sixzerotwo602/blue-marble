import { FastifyInstance } from 'fastify';
import { GameService } from '../services/game-service.js';
import { GameMode } from '@blue-marble/shared';

declare module 'fastify' {
  interface FastifyInstance {
    io: any; // Use any to avoid complex type augmentation issues for now
  }
}

export async function gameRoutes(fastify: FastifyInstance) {
  // Create Game
  fastify.post<{ Body: { mode: GameMode; timeLimit: number } }>('/games', async (request, reply) => {
    const { mode, timeLimit } = request.body;
    try {
      const game = await GameService.createGame(mode, timeLimit);
      return { success: true, gameId: game.id, roomCode: game.roomCode };
     } catch (err: any) {
       reply.code(400).send({ error: err.message });
       return;
     }
  });

   // Join Game

   fastify.post<{ Params: { id: string }; Body: { playerName: string } }>('/games/:id/join', async (request, reply) => {
     const { id } = request.params;
     const { playerName } = request.body;
     try {
       const { player, gameState } = await GameService.joinGame(id, playerName);
       
       // Emit to room
       fastify.io.to(id).emit('playerJoined', { player, gameState });
       
       return { success: true, playerId: player.id, gameState };
     } catch (err: any) {
       reply.code(400).send({ error: err.message });
       return;
     }
   });

   // Start Game
   fastify.post<{ Params: { id: string } }>('/games/:id/start', async (request, reply) => {
     const { id } = request.params;
     try {
       const gameState = await GameService.startGame(id);
       
       fastify.io.to(id).emit('gameStarted', { gameState });
       
       return { success: true, gameState };
     } catch (err: any) {
       reply.code(400).send({ error: err.message });
       return;
     }
   });
   
   // Test Roll (Legacy/Future Phase 4)
   fastify.post<{ Params: { id: string }, Body: { playerId: string } }>('/games/:id/roll', async (request, reply) => {
      // ... keep existing logic structure
     const { id } = request.params;
     const { playerId } = request.body;
     try {
       const result = await GameService.rollDice(id, playerId);
       const game = GameService.getGame(id); // Helper needed
       fastify.io.to(id).emit('diceRolled', { playerId, result });
       if(game) fastify.io.to(id).emit('gameUpdate', { gameState: game });
       return { success: true, result };
     } catch (err: any) {
       reply.code(400).send({ error: err.message });
       return;
     }
   });

   // Purchase Property
   fastify.post<{ Params: { id: string }, Body: { playerId: string; buy: boolean } }>('/games/:id/purchase', async (request, reply) => {
     const { id } = request.params;
     const { playerId, buy } = request.body;
     try {
       const gameState = await GameService.purchaseProperty(id, playerId, buy);
       fastify.io.to(id).emit('gameUpdate', { gameState });
       return { success: true, gameState };
     } catch (err: any) {
       reply.code(400).send({ error: err.message });
       return;
     }
   });

   // Sell Building
   fastify.post<{ Params: { id: string }, Body: { playerId: string; propertyId: string; type: 'villa' | 'building' | 'hotel' } }>('/games/:id/sell-building', async (request, reply) => {
       const { id } = request.params;
       const { playerId, propertyId, type } = request.body;
       try {
           const gameState = await GameService.sellBuilding(id, playerId, propertyId, type);
           fastify.io.to(id).emit('gameUpdate', { gameState });
           return { success: true, gameState };
       } catch (err: any) {
           reply.code(400).send({ error: err.message });
           return;
       }
   });

   // Resolve Debt
   fastify.post<{ Params: { id: string }, Body: { playerId: string } }>('/games/:id/resolve-debt', async (request, reply) => {
       const { id } = request.params;
       const { playerId } = request.body;
       try {
           const gameState = await GameService.resolveDebt(id, playerId);
           fastify.io.to(id).emit('gameUpdate', { gameState });
           return { success: true, gameState };
       } catch (err: any) {
           reply.code(400).send({ error: err.message });
           return;
       }
   });

   // Take Loan
   fastify.post<{ Params: { id: string }, Body: { playerId: string } }>('/games/:id/take-loan', async (request, reply) => {
       const { id } = request.params;
       const { playerId } = request.body;
       try {
           const gameState = await GameService.takeLoan(id, playerId);
           fastify.io.to(id).emit('gameUpdate', { gameState });
           return { success: true, gameState };
       } catch (err: any) {
           reply.code(400).send({ error: err.message });
           return;
       }
   });

   // Transfer Property (Debt Resolution)
   fastify.post<{ Params: { id: string }, Body: { playerId: string; propertyId: string } }>('/games/:id/transfer-property', async (request, reply) => {
       const { id } = request.params;
       const { playerId, propertyId } = request.body;
       try {
           const gameState = await GameService.transferProperty(id, playerId, propertyId);
           fastify.io.to(id).emit('gameUpdate', { gameState });
           return { success: true, gameState };
       } catch (err: any) {
           reply.code(400).send({ error: err.message });
           return;
       }
   });

   // Construct Building
   fastify.post<{ Params: { id: string }, Body: { playerId: string; propertyId: string; type: 'villa' | 'building' | 'hotel' } }>('/games/:id/construct', async (request, reply) => {
       const { id } = request.params;
       const { playerId, propertyId, type } = request.body;
       try {
           const gameState = await GameService.constructBuilding(id, playerId, propertyId, type);
           fastify.io.to(id).emit('gameUpdate', { gameState });
           return { success: true, gameState };
       } catch (err: any) {
           reply.code(400).send({ error: err.message });
           return;
       }
   });

   // Bankruptcy



   fastify.post<{ Params: { id: string }, Body: { playerId: string } }>('/games/:id/bankruptcy', async (request, reply) => {
       const { id } = request.params;
       const { playerId } = request.body;
       try {
           const gameState = await GameService.declareBankruptcy(id, playerId);
           fastify.io.to(id).emit('gameUpdate', { gameState });
           return { success: true, gameState };
       } catch (err: any) {
           reply.code(400).send({ error: err.message });
           return;
       }
   });

   // Set Dev Mode (Test Mode for single tester)
   fastify.post<{ Params: { id: string }, Body: { enabled: boolean } }>('/games/:id/dev-mode', async (request, reply) => {
       const { id } = request.params;
       const { enabled } = request.body;
       try {
           const gameState = await GameService.setDevMode(id, enabled);
           fastify.io.to(id).emit('gameUpdate', { gameState });
           return { success: true, gameState };
       } catch (err: any) {
           reply.code(400).send({ error: err.message });
           return;
       }
   });

   // End Turn
   fastify.post<{ Params: { id: string }, Body: { playerId: string } }>('/games/:id/end-turn', async (request, reply) => {
       const { id } = request.params;
       const { playerId } = request.body;
       try {
           const gameState = await GameService.endTurn(id, playerId);
           fastify.io.to(id).emit('gameUpdate', { gameState });
           return { success: true, gameState };
       } catch (err: any) {
           reply.code(400).send({ error: err.message });
           return;
       }
   });
 }
