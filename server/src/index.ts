import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import {
  ServerToClientEvents, ClientToServerEvents,
  InterServerEvents, SocketData,
} from '../../shared/types';
import { registerSocketHandlers } from './socket/socketManager';
import { validateFindMatchGeneration } from './games/findMatch';

const PORT = parseInt(process.env.PORT ?? '3001', 10);
const CLIENT_URL = process.env.CLIENT_URL ?? 'http://localhost:5173';

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

const httpServer = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(
  httpServer,
  {
    cors: {
      origin: true,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  },
);


// ─── Health check ──────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Run Find Match validation on startup ──────────────────────────────────
const validation = validateFindMatchGeneration(10000);
if (validation.passed) {
  console.log('✅ Find Match generation: 10,000 rounds validated — exactly 1 common symbol each.');
} else {
  console.error('❌ Find Match validation FAILED:');
  validation.errors.slice(0, 5).forEach(e => console.error('  ', e));
}

// ─── Register socket handlers ──────────────────────────────────────────────
registerSocketHandlers(io);

httpServer.listen(PORT, () => {
  console.log(`🚀 DUELZONE server running on port ${PORT}`);
  console.log(`   CORS allowed: ${CLIENT_URL}`);
});

export { io };
