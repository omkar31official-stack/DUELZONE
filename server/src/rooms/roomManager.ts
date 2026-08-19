import { randomBytes } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import {
  Room, Player, RoomSnapshot, GameId, RoomStatus,
} from '../../../shared/types';
import {
  ACCENT_COLORS, AVATAR_SEEDS, ROOM_CODE_LENGTH,
  ROOM_EXPIRE_EMPTY_MS, ROOM_EXPIRE_ONE_PLAYER_MS, MAX_PLAYER_NAME_LENGTH,
} from '../../../shared/constants';

// ─── In-memory store (Redis-ready interface) ─────────────────────────────────
const rooms = new Map<string, Room>();

// ─── Helpers ─────────────────────────────────────────────────────────────────
function genCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  const bytes = randomBytes(ROOM_CODE_LENGTH);
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return code;
}

function sanitizeName(name: string): string {
  return name.trim().slice(0, MAX_PLAYER_NAME_LENGTH).replace(/[<>]/g, '');
}

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function snapshot(room: Room): RoomSnapshot {
  return {
    code: room.code,
    status: room.status,
    players: room.players,
    selectedGame: room.selectedGame,
    gameState: room.gameState,
  };
}

// ─── Room lifecycle ───────────────────────────────────────────────────────────
export function createRoom(playerName: string, socketId: string): { room: Room; player: Player } {
  let code: string;
  do { code = genCode(); } while (rooms.has(code));

  const player: Player = {
    id: uuidv4(),
    socketId,
    name: sanitizeName(playerName) || 'Player1',
    avatarSeed: randomElement(AVATAR_SEEDS),
    accentColor: randomElement(ACCENT_COLORS),
    isHost: true,
    isConnected: true,
    gamesWon: 0,
  };

  const room: Room = {
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

export function joinRoom(code: string, playerName: string, socketId: string): { room: Room; player: Player } | { error: string } {
  const room = rooms.get(code.toUpperCase());
  if (!room) return { error: 'Room not found.' };

  const connected = room.players.filter(p => p.isConnected);
  if (connected.length >= 2) return { error: 'This room is already full.' };
  if (room.status === 'playing') return { error: 'A game is already in progress.' };

  // Check if this is a reconnect (same name, disconnected slot)
  const existing = room.players.find(p => !p.isConnected && p.name === sanitizeName(playerName));
  if (existing) {
    existing.socketId = socketId;
    existing.isConnected = true;
    room.lastActivity = Date.now();
    return { room, player: existing };
  }

  const player: Player = {
    id: uuidv4(),
    socketId,
    name: sanitizeName(playerName) || 'Player2',
    avatarSeed: randomElement(AVATAR_SEEDS),
    accentColor: randomElement(ACCENT_COLORS),
    isHost: false,
    isConnected: true,
    gamesWon: 0,
  };

  room.players.push(player);
  if (room.players.length === 2) room.status = 'lobby';
  room.lastActivity = Date.now();
  return { room, player };
}

export function reconnectPlayer(
  code: string,
  playerId: string,
  socketId: string,
): { room: Room; player: Player } | { error: string } {
  const room = rooms.get(code.toUpperCase());
  if (!room) return { error: 'Room expired or not found.' };
  const player = room.players.find(p => p.id === playerId);
  if (!player) return { error: 'Player not found in room.' };
  player.socketId = socketId;
  player.isConnected = true;
  room.lastActivity = Date.now();
  return { room, player };
}

export function disconnectPlayer(socketId: string): Room | null {
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

export function getRoom(code: string): Room | undefined {
  return rooms.get(code.toUpperCase());
}

export function getRoomBySocket(socketId: string): Room | undefined {
  return [...rooms.values()].find(r => r.players.some(p => p.socketId === socketId));
}

export function getPlayerBySocket(socketId: string): Player | undefined {
  for (const room of rooms.values()) {
    const p = room.players.find(pl => pl.socketId === socketId);
    if (p) return p;
  }
  return undefined;
}

export function selectGame(code: string, playerId: string, gameId: GameId): Room | null {
  const room = rooms.get(code);
  if (!room) return null;
  const player = room.players.find(p => p.id === playerId);
  if (!player?.isHost) return null;
  room.selectedGame = gameId;
  room.lastActivity = Date.now();
  return room;
}

export function setGameState(code: string, state: unknown): void {
  const room = rooms.get(code);
  if (room) {
    room.gameState = state;
    room.status = 'playing';
    room.lastActivity = Date.now();
  }
}

export function returnToLobby(code: string): Room | null {
  const room = rooms.get(code);
  if (!room) return null;
  room.status = 'lobby';
  room.gameState = null;
  room.lastActivity = Date.now();
  return room;
}

export function migrateHost(room: Room): void {
  const connected = room.players.filter(p => p.isConnected);
  if (connected.length > 0 && !connected.some(p => p.isHost)) {
    connected[0].isHost = true;
  }
}

export function incrementWin(code: string, playerId: string): void {
  const room = rooms.get(code);
  if (!room) return;
  const player = room.players.find(p => p.id === playerId);
  if (player) player.gamesWon++;
}

// ─── Cleanup ──────────────────────────────────────────────────────────────────
const cleanupTimers = new Map<string, ReturnType<typeof setTimeout>>();

function scheduleCleanup(code: string) {
  if (cleanupTimers.has(code)) clearTimeout(cleanupTimers.get(code)!);
  const timer = setTimeout(() => {
    const room = rooms.get(code);
    if (!room) return;
    const connected = room.players.filter(p => p.isConnected);
    if (connected.length === 0) {
      rooms.delete(code);
      cleanupTimers.delete(code);
    }
  }, ROOM_EXPIRE_ONE_PLAYER_MS);
  cleanupTimers.set(code, timer);
}

// Periodic cleanup of expired empty rooms
setInterval(() => {
  const now = Date.now();
  for (const [code, room] of rooms.entries()) {
    if (room.players.every(p => !p.isConnected) && now - room.lastActivity > ROOM_EXPIRE_EMPTY_MS) {
      rooms.delete(code);
      const t = cleanupTimers.get(code);
      if (t) { clearTimeout(t); cleanupTimers.delete(code); }
    }
  }
}, 60_000);
