import 'dotenv/config';
import Fastify, { FastifyInstance } from 'fastify';
import { Server } from 'socket.io';
import { gameRoutes } from './api/routes.js';
import { GameService } from './services/game-service.js';

const fastify: FastifyInstance = Fastify({ logger: true });

// Health check endpoint
fastify.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3001', 10);
    
    // Register routes BEFORE ready()
    await fastify.register(gameRoutes);
    
    // Start listening first
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`Server listening on http://localhost:${port}`);
    
    // Setup Socket.IO AFTER server is listening
    const io = new Server(fastify.server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    // Store io reference for routes to use
    (fastify as any).io = io;

    io.on('connection', (socket) => {
      fastify.log.info(`Client connected: ${socket.id}`);
      
      socket.on('joinRoom', (roomId: string) => {
        socket.join(roomId);
        fastify.log.info(`Socket ${socket.id} joined room ${roomId}`);
        
        // Send current game state to the reconnected client
        const game = GameService.getGame(roomId);
        if (game) {
             socket.emit('gameUpdate', { gameState: game });
        }
      });


      socket.on('ping', () => {
        socket.emit('pong');
      });

      socket.on('disconnect', () => {
        fastify.log.info(`Client disconnected: ${socket.id}`);
      });
    });

  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
