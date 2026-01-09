import { io } from 'socket.io-client';

const URL = import.meta.env.VITE_WS_URL || 'http://localhost:3001';

export const socket = io(URL, {
  autoConnect: true, // Auto connect for now for easier testing
});
