"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.snapshot = snapshot;
exports.createRoom = createRoom;
exports.joinRoom = joinRoom;
exports.reconnectPlayer = reconnectPlayer;
exports.disconnectPlayer = disconnectPlayer;
exports.getRoom = getRoom;
exports.getRoomBySocket = getRoomBySocket;
exports.getPlayerBySocket = getPlayerBySocket;
exports.selectGame = selectGame;
exports.setGameState = setGameState;
exports.returnToLobby = returnToLobby;
exports.migrateHost = migrateHost;
exports.incrementWin = incrementWin;
const crypto_1 = require("crypto");
const uuid_1 = require("uuid");
const constants_1 = require("../../../shared/constants");
// ─── In-memory store (Redis-ready interface) ─────────────────────────────────
const rooms = new Map();
// ─── Helpers ─────────────────────────────────────────────────────────────────
function genCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    const bytes = (0, crypto_1.randomBytes)(constants_1.ROOM_CODE_LENGTH);
    for (let i = 0; i < constants_1.ROOM_CODE_LENGTH; i++) {
        code += chars[bytes[i] % chars.length];
    }
    return code;
}
function sanitizeName(name) {
    return name.trim().slice(0, constants_1.MAX_PLAYER_NAME_LENGTH).replace(/[<>]/g, '');
}
function randomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
function snapshot(room) {
    return {
        code: room.code,
        status: room.status,
        players: room.players,
        selectedGame: room.selectedGame,
        gameState: room.gameState,
    };
}
// ─── Room lifecycle ───────────────────────────────────────────────────────────
function createRoom(playerName, socketId) {
    let code;
    do {
        code = genCode();
    } while (rooms.has(code));
    const player = {
        id: (0, uuid_1.v4)(),
        socketId,
        name: sanitizeName(playerName) || 'Player1',
        avatarSeed: randomElement(constants_1.AVATAR_SEEDS),
        accentColor: randomElement(constants_1.ACCENT_COLORS),
        isHost: true,
        isConnected: true,
        gamesWon: 0,
    };
    const room = {
        code,
        status: 'waiting',
        players: [player],
        selectedGame: null,
        gameState: null,
        createdAt: Date.now(),
        lastActivity: Date.now(),
    };
    rooms.set(code, room);
    return { room, player };
}
function joinRoom(code, playerName, socketId) {
    const room = rooms.get(code.toUpperCase());
    if (!room)
        return { error: 'Room not found.' };
    const connected = room.players.filter(p => p.isConnected);
    if (connected.length >= constants_1.MAX_ROOM_PLAYERS)
        return { error: 'This room is already full.' };
    if (room.status === 'playing')
        return { error: 'A game is already in progress.' };
    // Check if this is a reconnect (same name, disconnected slot)
    const existing = room.players.find(p => !p.isConnected && p.name === sanitizeName(playerName));
    if (existing) {
        existing.socketId = socketId;
        existing.isConnected = true;
        room.lastActivity = Date.now();
        return { room, player: existing };
    }
    const player = {
        id: (0, uuid_1.v4)(),
        socketId,
        name: sanitizeName(playerName) || `Player${room.players.length + 1}`,
        avatarSeed: randomElement(constants_1.AVATAR_SEEDS),
        accentColor: randomElement(constants_1.ACCENT_COLORS),
        isHost: false,
        isConnected: true,
        gamesWon: 0,
    };
    room.players.push(player);
    if (room.players.length >= 2)
        room.status = 'lobby';
    room.lastActivity = Date.now();
    return { room, player };
}
function reconnectPlayer(code, playerId, socketId) {
    const room = rooms.get(code.toUpperCase());
    if (!room)
        return { error: 'Room expired or not found.' };
    const player = room.players.find(p => p.id === playerId);
    if (!player)
        return { error: 'Player not found in room.' };
    player.socketId = socketId;
    player.isConnected = true;
    room.lastActivity = Date.now();
    return { room, player };
}
function disconnectPlayer(socketId) {
    for (const room of rooms.values()) {
        const player = room.players.find(p => p.socketId === socketId);
        if (player) {
            player.isConnected = false;
            room.lastActivity = Date.now();
            // Schedule cleanup
            scheduleCleanup(room.code);
            return room;
        }
    }
    return null;
}
function getRoom(code) {
    return rooms.get(code.toUpperCase());
}
function getRoomBySocket(socketId) {
    return [...rooms.values()].find(r => r.players.some(p => p.socketId === socketId));
}
function getPlayerBySocket(socketId) {
    for (const room of rooms.values()) {
        const p = room.players.find(pl => pl.socketId === socketId);
        if (p)
            return p;
    }
    return undefined;
}
function selectGame(code, playerId, gameId) {
    const room = rooms.get(code);
    if (!room)
        return null;
    const player = room.players.find(p => p.id === playerId);
    if (!player?.isHost)
        return null;
    room.selectedGame = gameId;
    room.lastActivity = Date.now();
    return room;
}
function setGameState(code, state) {
    const room = rooms.get(code);
    if (room) {
        room.gameState = state;
        room.status = 'playing';
        room.lastActivity = Date.now();
    }
}
function returnToLobby(code) {
    const room = rooms.get(code);
    if (!room)
        return null;
    room.status = 'lobby';
    room.gameState = null;
    room.lastActivity = Date.now();
    return room;
}
function migrateHost(room) {
    const connected = room.players.filter(p => p.isConnected);
    if (connected.length > 0 && !connected.some(p => p.isHost)) {
        connected[0].isHost = true;
    }
}
function incrementWin(code, playerId) {
    const room = rooms.get(code);
    if (!room)
        return;
    const player = room.players.find(p => p.id === playerId);
    if (player)
        player.gamesWon++;
}
// ─── Cleanup ──────────────────────────────────────────────────────────────────
const cleanupTimers = new Map();
function scheduleCleanup(code) {
    if (cleanupTimers.has(code))
        clearTimeout(cleanupTimers.get(code));
    const timer = setTimeout(() => {
        const room = rooms.get(code);
        if (!room)
            return;
        const connected = room.players.filter(p => p.isConnected);
        if (connected.length === 0) {
            rooms.delete(code);
            cleanupTimers.delete(code);
        }
    }, constants_1.ROOM_EXPIRE_ONE_PLAYER_MS);
    cleanupTimers.set(code, timer);
}
// Periodic cleanup of expired empty rooms
setInterval(() => {
    const now = Date.now();
    for (const [code, room] of rooms.entries()) {
        if (room.players.every(p => !p.isConnected) && now - room.lastActivity > constants_1.ROOM_EXPIRE_EMPTY_MS) {
            rooms.delete(code);
            const t = cleanupTimers.get(code);
            if (t) {
                clearTimeout(t);
                cleanupTimers.delete(code);
            }
        }
    }
}, 60000);
