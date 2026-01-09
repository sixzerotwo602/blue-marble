import { Server, Socket } from 'socket.io';
import { GameService } from '../services/game-service.js';

export function registerSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join Room
    socket.on('joinRoom', (roomId: string) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);
      
      const game = GameService.getGame(roomId);
      if (game) {
        socket.emit('gameUpdate', { gameState: game });
      }
    });

    // Roll Dice
    socket.on('roll-dice', async ({ gameId, playerId }: { gameId: string, playerId: string }) => {
      try {
        console.log(`[Socket] roll-dice: ${gameId}, ${playerId}`);
        const gameState = await GameService.rollDice(gameId, playerId);
        io.to(gameId).emit('gameUpdate', { gameState });
      } catch (err: any) {
        socket.emit('error', { message: err.message });
      }
    });

    // Purchase Property
    socket.on('purchase-property', async ({ gameId, playerId, buy }: { gameId: string, playerId: string, buy: boolean }) => {
      try {
        console.log(`[Socket] purchase-property: ${gameId}, ${playerId}, buy=${buy}`);
        const gameState = await GameService.purchaseProperty(gameId, playerId, buy);
        io.to(gameId).emit('gameUpdate', { gameState });
      } catch (err: any) {
        socket.emit('error', { message: err.message });
      }
    });

    // End Turn
    socket.on('end-turn', async ({ gameId, playerId }: { gameId: string, playerId: string }) => {
      try {
        console.log(`[Socket] end-turn: ${gameId}, ${playerId}`);
        const gameState = await GameService.endTurn(gameId, playerId);
        io.to(gameId).emit('gameUpdate', { gameState });
      } catch (err: any) {
        socket.emit('error', { message: err.message });
      }
    });
    
    // Request Loan
    socket.on('loan-request', async ({ gameId, playerId }: { gameId: string, playerId: string }) => {
      try {
         console.log(`[Socket] loan-request: ${gameId}, ${playerId}`);
         const gameState = await GameService.takeLoan(gameId, playerId);
         io.to(gameId).emit('gameUpdate', { gameState });
      } catch (err: any) {
         socket.emit('error', { message: err.message });
      }
    });

    // Sell Property (e.g. while resolving debt or managing assets)
    socket.on('sell-property', async ({ 
      gameId, 
      playerId, 
      propertyId, 
      type 
    }: { 
      gameId: string, 
      playerId: string, 
      propertyId: string,
      type: 'villa' | 'building' | 'hotel' 
    }) => {
      try {
         console.log(`[Socket] sell-property: ${gameId}, ${playerId}, property=${propertyId}, type=${type}`);
         const gameState = await GameService.sellBuilding(gameId, playerId, propertyId, type);
         io.to(gameId).emit('gameUpdate', { gameState });
      } catch (err: any) {
         socket.emit('error', { message: err.message });
      }
    });
    
    // Resolve Debt (Cash Payment)
    socket.on('resolve-debt', async ({ gameId, playerId }: { gameId: string, playerId: string }) => {
       try {
         console.log(`[Socket] resolve-debt: ${gameId}, ${playerId}`);
         const gameState = await GameService.resolveDebt(gameId, playerId);
         io.to(gameId).emit('gameUpdate', { gameState });
       } catch (err: any) {
         socket.emit('error', { message: err.message });
       }
    });

    // Declare Bankruptcy
    socket.on('declare-bankruptcy', async ({ gameId, playerId }: { gameId: string, playerId: string }) => {
       try {
         console.log(`[Socket] declare-bankruptcy: ${gameId}, ${playerId}`);
         const gameState = await GameService.declareBankruptcy(gameId, playerId);
         io.to(gameId).emit('gameUpdate', { gameState });
       } catch (err: any) {
         socket.emit('error', { message: err.message });
       }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
}
