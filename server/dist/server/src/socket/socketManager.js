"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSocketHandlers = registerSocketHandlers;
const constants_1 = require("../../../shared/constants");
const RM = __importStar(require("../rooms/roomManager"));
const gameManager_1 = require("../games/gameManager");
const uuid_1 = require("uuid");
function registerSocketHandlers(io) {
    io.on('connection', (socket) => {
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
            }
            catch (e) {
                cb({ ok: false, error: 'Could not create room.' });
            }
        });
        // ─── Join Room ─────────────────────────────────────────────────────────
        socket.on('room:join', ({ code, playerName }, cb) => {
            try {
                const result = RM.joinRoom(code, playerName, socket.id);
                if ('error' in result)
                    return cb({ ok: false, error: result.error });
                const { room, player } = result;
                socket.data.playerId = player.id;
                socket.data.roomCode = room.code;
                socket.join(room.code);
                cb({ ok: true, room: RM.snapshot(room), player });
                // Notify all in room
                io.to(room.code).emit('room:update', RM.snapshot(room));
                console.log(`[room] joined: ${room.code} by ${player.name}`);
            }
            catch (e) {
                cb({ ok: false, error: 'Could not join room.' });
            }
        });
        // ─── Reconnect ─────────────────────────────────────────────────────────
        socket.on('room:reconnect', ({ code, playerId }, cb) => {
            try {
                const result = RM.reconnectPlayer(code, playerId, socket.id);
                if ('error' in result)
                    return cb({ ok: false, error: result.error });
                const { room, player } = result;
                socket.data.playerId = player.id;
                socket.data.roomCode = room.code;
                socket.join(room.code);
                cb({ ok: true, room: RM.snapshot(room), player });
                io.to(room.code).emit('room:update', RM.snapshot(room));
                io.to(room.code).emit('player:reconnected', player.id);
                console.log(`[room] reconnected: ${room.code} by ${player.name}`);
            }
            catch (e) {
                cb({ ok: false, error: 'Reconnect failed.' });
            }
        });
        // ─── Select Game ───────────────────────────────────────────────────────
        socket.on('room:selectGame', ({ gameId }) => {
            const playerId = socket.data.playerId;
            const roomCode = socket.data.roomCode;
            if (!playerId || !roomCode)
                return;
            const room = RM.selectGame(roomCode, playerId, gameId);
            if (!room)
                return;
            io.to(roomCode).emit('room:update', RM.snapshot(room));
        });
        // ─── Start Game ────────────────────────────────────────────────────────
        socket.on('room:startGame', () => {
            const playerId = socket.data.playerId;
            const roomCode = socket.data.roomCode;
            if (!playerId || !roomCode)
                return;
            const room = RM.getRoom(roomCode);
            if (!room)
                return;
            const player = room.players.find(p => p.id === playerId);
            if (!player?.isHost)
                return;
            if (!room.selectedGame)
                return;
            const gameMeta = constants_1.ALL_GAMES.find(game => game.id === room.selectedGame);
            const connectedPlayers = room.players.filter(p => p.isConnected);
            if (!gameMeta)
                return;
            if (connectedPlayers.length < gameMeta.minPlayers || connectedPlayers.length > gameMeta.maxPlayers) {
                socket.emit('room:error', `${gameMeta.name} needs ${gameMeta.minPlayers === gameMeta.maxPlayers ? gameMeta.minPlayers : `${gameMeta.minPlayers}-${gameMeta.maxPlayers}`} players.`);
                return;
            }
            (0, gameManager_1.clearGameTimers)(roomCode);
            const playerIds = connectedPlayers.map(p => p.id);
            const { state } = (0, gameManager_1.createGameState)(room.selectedGame, playerIds);
            RM.setGameState(roomCode, state);
            const snap = RM.snapshot(room);
            io.to(roomCode).emit('room:update', snap);
            io.to(roomCode).emit('game:state', state);
            // For find-match: auto-start countdown
            if (room.selectedGame === 'find-match') {
                // Trigger ROUND_START via gameManager
                const broadcast = (newState, event) => {
                    RM.setGameState(roomCode, newState);
                    io.to(roomCode).emit('game:state', newState);
                    if (event)
                        io.to(roomCode).emit('game:event', event);
                };
                (0, gameManager_1.handleGameAction)(room.selectedGame, state, playerId, { type: 'ROUND_START' }, roomCode, broadcast);
            }
            console.log(`[game] started: ${room.selectedGame} in ${roomCode}`);
        });
        // ─── Game Action ───────────────────────────────────────────────────────
        socket.on('game:action', (action) => {
            const playerId = socket.data.playerId;
            const roomCode = socket.data.roomCode;
            if (!playerId || !roomCode)
                return;
            const room = RM.getRoom(roomCode);
            if (!room || !room.selectedGame || !room.gameState)
                return;
            const broadcast = (newState, event) => {
                RM.setGameState(roomCode, newState);
                io.to(roomCode).emit('game:state', newState);
                if (event)
                    io.to(roomCode).emit('game:event', event);
            };
            const newState = (0, gameManager_1.handleGameAction)(room.selectedGame, room.gameState, playerId, action, roomCode, broadcast);
            if (newState !== null) {
                RM.setGameState(roomCode, newState);
                io.to(roomCode).emit('game:state', newState);
            }
        });
        // ─── Return to Lobby ───────────────────────────────────────────────────
        socket.on('room:returnToLobby', () => {
            const roomCode = socket.data.roomCode;
            if (!roomCode)
                return;
            (0, gameManager_1.clearGameTimers)(roomCode);
            const room = RM.returnToLobby(roomCode);
            if (room)
                io.to(roomCode).emit('room:update', RM.snapshot(room));
        });
        // ─── Chat ──────────────────────────────────────────────────────────────
        socket.on('chat:send', ({ text, emote }) => {
            const playerId = socket.data.playerId;
            const roomCode = socket.data.roomCode;
            if (!playerId || !roomCode)
                return;
            const room = RM.getRoom(roomCode);
            if (!room)
                return;
            const player = room.players.find(p => p.id === playerId);
            if (!player)
                return;
            const clean = typeof text === 'string' ? text.trim().slice(0, constants_1.MAX_CHAT_LENGTH) : '';
            if (!clean && !emote)
                return;
            const msg = {
                id: (0, uuid_1.v4)(),
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
            if (!room)
                return;
            RM.migrateHost(room);
            io.to(room.code).emit('room:update', RM.snapshot(room));
            const connected = room.players.filter(p => p.isConnected);
            if (connected.length === 0) {
                (0, gameManager_1.clearGameTimers)(room.code);
                io.to(room.code).emit('room:closed', 'All players left.');
            }
        });
    });
}
