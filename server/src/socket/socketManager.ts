import { Server, Socket } from 'socket.io';
import {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
  GameId,
  ChatMessage,
} from '../../../shared/types';
import { ALL_GAMES, MAX_CHAT_LENGTH } from '../../../shared/constants';
import * as RM from '../rooms/roomManager';
import { createGameState, handleGameAction, clearGameTimers } from '../games/gameManager';
import { v4 as uuidv4 } from 'uuid';

type AppSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
type AppServer = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

export function registerSocketHandlers(io: AppServer) {
  io.on('connection', (socket: AppSocket) => {
    console.log(`[socket] connected: ${socket.id}`);

    // ─── Create Room ───────────────────────────────────────────────────────
    socket.on('room:create', ({ playerName }, cb) => {
      try {
        const { room, player } = RM.createRoom(playerName, socket.id);
        socket.data.playerId = player.id;
        socket.data.roomCode = room.code;
        socket.join(room.code);
        cb({ ok: true, room: RM.snapshot(room), player });
        console.log(`[room] created: ${room.code} by ${player.name}`);
      } catch (e) {
        cb({ ok: false, error: 'Could not create room.' });
      }
    });

    // ─── Join Room ─────────────────────────────────────────────────────────
    socket.on('room:join', ({ code, playerName }, cb) => {
      try {
        const result = RM.joinRoom(code, playerName, socket.id);
        if ('error' in result) return cb({ ok: false, error: result.error });

        const { room, player } = result;
        socket.data.playerId = player.id;
        socket.data.roomCode = room.code;
        socket.join(room.code);
        cb({ ok: true, room: RM.snapshot(room), player });

        // Notify all in room
        io.to(room.code).emit('room:update', RM.snapshot(room));
        console.log(`[room] joined: ${room.code} by ${player.name}`);
      } catch (e) {
        cb({ ok: false, error: 'Could not join room.' });
      }
    });

    // ─── Reconnect ─────────────────────────────────────────────────────────
    socket.on('room:reconnect', ({ code, playerId }, cb) => {
      try {
        const result = RM.reconnectPlayer(code, playerId, socket.id);
        if ('error' in result) return cb({ ok: false, error: result.error });

        const { room, player } = result;
        socket.data.playerId = player.id;
        socket.data.roomCode = room.code;
        socket.join(room.code);
        cb({ ok: true, room: RM.snapshot(room), player });
        io.to(room.code).emit('room:update', RM.snapshot(room));
        io.to(room.code).emit('player:reconnected', player.id);
        console.log(`[room] reconnected: ${room.code} by ${player.name}`);
      } catch (e) {
        cb({ ok: false, error: 'Reconnect failed.' });
      }
    });

    // ─── Select Game ───────────────────────────────────────────────────────
    socket.on('room:selectGame', ({ gameId }) => {
      const playerId = socket.data.playerId;
      const roomCode = socket.data.roomCode;
      if (!playerId || !roomCode) return;

      const room = RM.selectGame(roomCode, playerId, gameId);
      if (!room) return;

      io.to(roomCode).emit('room:update', RM.snapshot(room));
    });

    // ─── Start Game ────────────────────────────────────────────────────────
    socket.on('room:startGame', () => {
      const playerId = socket.data.playerId;
      const roomCode = socket.data.roomCode;
      if (!playerId || !roomCode) return;

      const room = RM.getRoom(roomCode);
      if (!room) return;
      const player = room.players.find(p => p.id === playerId);
      if (!player?.isHost) return;
      if (!room.selectedGame) return;
      const gameMeta = ALL_GAMES.find(game => game.id === room.selectedGame);
      const connectedPlayers = room.players.filter(p => p.isConnected);
      if (!gameMeta) return;
      if (connectedPlayers.length < gameMeta.minPlayers || connectedPlayers.length > gameMeta.maxPlayers) {
        socket.emit(
          'room:error',
          `${gameMeta.name} needs ${gameMeta.minPlayers === gameMeta.maxPlayers ? gameMeta.minPlayers : `${gameMeta.minPlayers}-${gameMeta.maxPlayers}`} players.`,
        );
        return;
      }

      clearGameTimers(roomCode);

      const playerIds = connectedPlayers.map(p => p.id);
      const { state } = createGameState(room.selectedGame, playerIds);
      RM.setGameState(roomCode, state);

      const snap = RM.snapshot(room);
      io.to(roomCode).emit('room:update', snap);
      io.to(roomCode).emit('game:state', state);

      const broadcast = (newState: unknown, event?: { type: string; payload?: unknown }) => {
        RM.setGameState(roomCode, newState);
        io.to(roomCode).emit('game:state', newState);
        if (event) io.to(roomCode).emit('game:event', event);
      };

      if (room.selectedGame === 'find-match') {
        handleGameAction(room.selectedGame, state, playerId, { type: 'ROUND_START' }, roomCode, broadcast);
      } else if (room.selectedGame === 'reaction-duel') {
        handleGameAction(room.selectedGame, state, playerId, { type: 'START_ROUND' }, roomCode, broadcast);
      } else if (room.selectedGame === 'quick-tap' || room.selectedGame === 'tap-royale') {
        handleGameAction(room.selectedGame, state, playerId, { type: 'START' }, roomCode, broadcast);
      }

      console.log(`[game] started: ${room.selectedGame} in ${roomCode}`);
    });

    // ─── Game Action ───────────────────────────────────────────────────────
    socket.on('game:action', (action) => {
      const playerId = socket.data.playerId;
      const roomCode = socket.data.roomCode;
      if (!playerId || !roomCode) return;

      const room = RM.getRoom(roomCode);
      if (!room || !room.selectedGame || !room.gameState) return;

      const broadcast = (newState: unknown, event?: { type: string; payload?: unknown }) => {
        RM.setGameState(roomCode, newState);
        io.to(roomCode).emit('game:state', newState);
        if (event) io.to(roomCode).emit('game:event', event);
      };

      const newState = handleGameAction(
        room.selectedGame,
        room.gameState,
        playerId,
        action,
        roomCode,
        broadcast,
      );

      if (newState !== null) {
        RM.setGameState(roomCode, newState);
        io.to(roomCode).emit('game:state', newState);
      }
    });

    // ─── Return to Lobby ───────────────────────────────────────────────────
    socket.on('room:returnToLobby', () => {
      const roomCode = socket.data.roomCode;
      if (!roomCode) return;
      clearGameTimers(roomCode);
      const room = RM.returnToLobby(roomCode);
      if (room) io.to(roomCode).emit('room:update', RM.snapshot(room));
    });

    // ─── Chat ──────────────────────────────────────────────────────────────
    socket.on('chat:send', ({ text, emote }) => {
      const playerId = socket.data.playerId;
      const roomCode = socket.data.roomCode;
      if (!playerId || !roomCode) return;

      const room = RM.getRoom(roomCode);
      if (!room) return;
      const player = room.players.find(p => p.id === playerId);
      if (!player) return;

      const clean = typeof text === 'string' ? text.trim().slice(0, MAX_CHAT_LENGTH) : '';
      if (!clean && !emote) return;

      const msg: ChatMessage = {
        id: uuidv4(),
        senderId: playerId,
        senderName: player.name,
        ...(clean ? { text: clean } : {}),
        ...(emote ? { emote } : {}),
        timestamp: Date.now(),
      };
      io.to(roomCode).emit('chat:message', msg);
    });

    // ─── Disconnect ────────────────────────────────────────────────────────
    socket.on('disconnect', (reason) => {
      console.log(`[socket] disconnected: ${socket.id}, reason: ${reason}`);
      const room = RM.disconnectPlayer(socket.id);
      if (!room) return;

      RM.migrateHost(room);
      io.to(room.code).emit('room:update', RM.snapshot(room));

      const connected = room.players.filter(p => p.isConnected);
      if (connected.length === 0) {
        clearGameTimers(room.code);
        io.to(room.code).emit('room:closed', 'All players left.');
      }
    });

    // ─── WebRTC Voice Chat Signaling ───────────────────────────────────────
    socket.on('webrtc:offer', ({ targetId, offer }) => {
      const room = RM.getRoom(socket.data.roomCode!);
      if (!room) return;
      const target = room.players.find(p => p.id === targetId);
      if (target?.isConnected) {
        io.to(target.socketId).emit('webrtc:offer', { senderId: socket.data.playerId!, offer });
      }
    });

    socket.on('webrtc:answer', ({ targetId, answer }) => {
      const room = RM.getRoom(socket.data.roomCode!);
      if (!room) return;
      const target = room.players.find(p => p.id === targetId);
      if (target?.isConnected) {
        io.to(target.socketId).emit('webrtc:answer', { senderId: socket.data.playerId!, answer });
      }
    });

    socket.on('webrtc:ice-candidate', ({ targetId, candidate }) => {
      const room = RM.getRoom(socket.data.roomCode!);
      if (!room) return;
      const target = room.players.find(p => p.id === targetId);
      if (target?.isConnected) {
        io.to(target.socketId).emit('webrtc:ice-candidate', { senderId: socket.data.playerId!, candidate });
      }
    });

  });
}
