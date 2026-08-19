import { GameId, GameAction } from '../../../shared/types';
import { FIND_MATCH_DEFAULT_ROUNDS } from '../../../shared/constants';
import { generateFindMatchRound } from '../games/findMatch';
import { createTTTState, applyTTTMove, resetTTTBoard } from '../games/ticTacToe';
import { createC4State, applyC4Move, resetC4 } from '../games/connectFour';
import { createRPSState, applyRPSChoice, nextRPSRound } from '../games/rockPaperScissors';
import { createRDState, setRDGo, setRDReady, applyRDReaction, nextRDRound } from '../games/reactionDuel';
import { createQTState, startQT, applyQTTap, finishQT } from '../games/quickTap';
import { createMDState, applyMDFlip } from '../games/memoryDuel';
import { createNBState, applyNBChoice, nextNBRound } from '../games/numberBattle';
import { createCCState, applyCCChoice, nextCCRound } from '../games/colorClash';
import { createDABState, applyDABEdge } from '../games/dotsAndBoxes';
import type { FindMatchRoundState } from '../../../shared/types';

type GameState = unknown;
type Players = [string, string]; // [p1Id, p2Id]

// Timer registry for automated round transitions
const gameTimers = new Map<string, ReturnType<typeof setTimeout>[]>();

function addTimer(roomCode: string, t: ReturnType<typeof setTimeout>) {
  if (!gameTimers.has(roomCode)) gameTimers.set(roomCode, []);
  gameTimers.get(roomCode)!.push(t);
}

export function clearGameTimers(roomCode: string) {
  const timers = gameTimers.get(roomCode) || [];
  timers.forEach(clearTimeout);
  gameTimers.delete(roomCode);
}

export interface GameHandlerResult {
  state: GameState;
  events?: Array<{ type: string; payload?: unknown }>;
}

// ─── Create initial state ─────────────────────────────────────────────────────
export function createGameState(
  gameId: GameId,
  players: Players,
): { state: GameState; difficulty?: string } {
  switch (gameId) {
    case 'find-match': {
      const scores: Record<string, number> = { [players[0]]: 0, [players[1]]: 0 };
      const round = generateFindMatchRound(1, FIND_MATCH_DEFAULT_ROUNDS, scores, 'normal');
      const state: FindMatchRoundState = {
        ...round,
        startedAt: null,
        phase: 'countdown',
        winner: null,
      };
      return { state };
    }
    case 'tic-tac-toe':
      return { state: createTTTState(players) };
    case 'connect-four':
      return { state: createC4State(players) };
    case 'rock-paper-scissors':
      return { state: createRPSState(players) };
    case 'reaction-duel':
      return { state: createRDState(players) };
    case 'quick-tap':
      return { state: createQTState(players) };
    case 'memory-duel':
      return { state: createMDState(players) };
    case 'number-battle':
      return { state: createNBState(players) };
    case 'color-clash':
      return { state: createCCState(players) };
    case 'dots-and-boxes':
      return { state: createDABState(players) };
    default:
      return { state: null };
  }
}

// ─── Apply action and return new state + optional events ─────────────────────
export function handleGameAction(
  gameId: GameId,
  currentState: GameState,
  playerId: string,
  action: GameAction,
  roomCode: string,
  broadcastFn: (state: GameState, event?: { type: string; payload?: unknown }) => void,
): GameState | null {
  switch (gameId) {
    case 'find-match':
      return handleFindMatchAction(currentState as FindMatchRoundState, playerId, action, roomCode, broadcastFn);
    case 'tic-tac-toe':
      return handleTTTAction(currentState, playerId, action);
    case 'connect-four':
      return handleC4Action(currentState, playerId, action);
    case 'rock-paper-scissors':
      return handleRPSAction(currentState, playerId, action, broadcastFn);
    case 'reaction-duel':
      return handleRDAction(currentState, playerId, action, roomCode, broadcastFn);
    case 'quick-tap':
      return handleQTAction(currentState, playerId, action);
    case 'memory-duel':
      return handleMDAction(currentState, playerId, action);
    case 'number-battle':
      return handleNBAction(currentState, playerId, action, broadcastFn);
    case 'color-clash':
      return handleCCAction(currentState, playerId, action, broadcastFn);
    case 'dots-and-boxes':
      return handleDABAction(currentState, playerId, action);
    default:
      return null;
  }
}

// ─── Find Match ───────────────────────────────────────────────────────────────
function handleFindMatchAction(
  state: FindMatchRoundState,
  playerId: string,
  action: GameAction,
  roomCode: string,
  broadcast: (state: GameState, event?: { type: string; payload?: unknown }) => void,
): GameState | null {
  if (action.type === 'ROUND_START') {
    // Server-side: start countdown, then GO
    const newState: FindMatchRoundState = { ...state, phase: 'countdown', startedAt: null, winner: null };
    // Schedule GO after 3s
    const t = setTimeout(() => {
      const goState: FindMatchRoundState = { ...newState, phase: 'playing', startedAt: Date.now() };
      broadcast(goState, { type: 'ROUND_GO' });
    }, 3000);
    addTimer(roomCode, t);
    return newState;
  }

  if (action.type === 'SELECT_SYMBOL') {
    if (state.phase !== 'playing') return null;
    if (state.winner) return null;
    const symbolId = (action.payload as { symbolId: string })?.symbolId;
    if (!symbolId) return null;

    // Validate: is the symbol on this player's board?
    const isP1 = state.player1Symbols.some(s => s.id === playerId && s.id === symbolId) ||
                  (Object.keys(state.scores)[0] === playerId && state.player1Symbols.some(s => s.id === symbolId));
    // More precise: identify which player slot
    const playerKeys = Object.keys(state.scores);
    const playerIndex = playerKeys.indexOf(playerId);
    const mySymbols = playerIndex === 0 ? state.player1Symbols : state.player2Symbols;
    if (!mySymbols.some(s => s.id === symbolId)) return null;

    // Is it the common symbol?
    if (symbolId !== state.commonSymbolId) {
      // Wrong! No penalty in basic mode
      return null;
    }

    // Correct! Player wins round
    const scores = { ...state.scores, [playerId]: (state.scores[playerId] || 0) + 1 };
    const newRound = state.round + 1;
    const isGameOver = newRound > state.totalRounds;

    const winState: FindMatchRoundState = { ...state, winner: playerId, phase: 'result', scores };
    broadcast(winState, { type: 'ROUND_WON', payload: { winner: playerId } });

    if (!isGameOver) {
      // Next round after 3 seconds
      const t = setTimeout(() => {
        const next = generateFindMatchRound(newRound, state.totalRounds, scores, state.difficulty);
        const nextState: FindMatchRoundState = {
          ...next,
          startedAt: null,
          phase: 'countdown',
          winner: null,
        };
        broadcast(nextState);
        // Start the round
        const t2 = setTimeout(() => {
          broadcast({ ...nextState, phase: 'playing', startedAt: Date.now() }, { type: 'ROUND_GO' });
        }, 3000);
        addTimer(roomCode, t2);
      }, 2500);
      addTimer(roomCode, t);
    } else {
      // Game over
      const [p1, p2] = playerKeys;
      const gameWinner = scores[p1] > scores[p2] ? p1 : scores[p2] > scores[p1] ? p2 : null;
      const t = setTimeout(() => {
        broadcast({ ...winState, phase: 'result' }, { type: 'GAME_OVER', payload: { winner: gameWinner, scores } });
      }, 2500);
      addTimer(roomCode, t);
    }

    return winState;
  }

  return null;
}

// ─── Tic Tac Toe ──────────────────────────────────────────────────────────────
function handleTTTAction(state: GameState, playerId: string, action: GameAction): GameState | null {
  if (action.type === 'MOVE') {
    const cell = (action.payload as { cell: number })?.cell;
    return applyTTTMove(state as any, playerId, cell);
  }
  if (action.type === 'RESET') {
    const s = state as any;
    const players: [string, string] = Object.keys(s.scores) as [string, string];
    return resetTTTBoard(s, players);
  }
  return null;
}

// ─── Connect Four ─────────────────────────────────────────────────────────────
function handleC4Action(state: GameState, playerId: string, action: GameAction): GameState | null {
  if (action.type === 'DROP') {
    const col = (action.payload as { col: number })?.col;
    return applyC4Move(state as any, playerId, col);
  }
  if (action.type === 'RESET') {
    const s = state as any;
    const players: [string, string] = Object.keys(s.scores) as [string, string];
    return resetC4(s, players);
  }
  return null;
}

// ─── RPS ──────────────────────────────────────────────────────────────────────
function handleRPSAction(
  state: GameState,
  playerId: string,
  action: GameAction,
  broadcast: (state: GameState) => void,
): GameState | null {
  if (action.type === 'CHOOSE') {
    const choice = (action.payload as { choice: string })?.choice as any;
    const newState = applyRPSChoice(state as any, playerId, choice);
    if (!newState) return null;
    if (newState.revealed) {
      // Auto-advance to next round after delay
      setTimeout(() => {
        if (!newState.gameWinner) broadcast(nextRPSRound(newState));
      }, 2500);
    }
    return newState;
  }
  return null;
}

// ─── Reaction Duel ────────────────────────────────────────────────────────────
function handleRDAction(
  state: GameState,
  playerId: string,
  action: GameAction,
  roomCode: string,
  broadcast: (state: GameState, event?: { type: string; payload?: unknown }) => void,
): GameState | null {
  const s = state as any;
  if (action.type === 'START_ROUND') {
    const readyState = setRDReady(s);
    // Random delay 1-4 seconds then GO
    const delay = 1000 + Math.random() * 3000;
    const t = setTimeout(() => {
      const goState = setRDGo(readyState, Date.now());
      broadcast(goState, { type: 'REACTION_GO' });
    }, delay);
    addTimer(roomCode, t);
    return readyState;
  }
  if (action.type === 'REACT') {
    const result = applyRDReaction(s, playerId, Date.now());
    if (!result) return null;
    if (result.phase === 'result' && !result.gameWinner) {
      const t = setTimeout(() => {
        broadcast(nextRDRound(result));
      }, 2500);
      addTimer(roomCode, t);
    }
    return result;
  }
  return null;
}

// ─── Quick Tap ────────────────────────────────────────────────────────────────
function handleQTAction(state: GameState, playerId: string, action: GameAction): GameState | null {
  const s = state as any;
  if (action.type === 'START') {
    return startQT(s);
  }
  if (action.type === 'TAP') {
    const result = applyQTTap(s, playerId, Date.now());
    if (!result) return null;
    // Check if game should end
    if (result.endTime && Date.now() >= result.endTime) {
      return finishQT(result);
    }
    return result;
  }
  if (action.type === 'FINISH') {
    return finishQT(s);
  }
  return null;
}

// ─── Memory Duel ──────────────────────────────────────────────────────────────
function handleMDAction(state: GameState, playerId: string, action: GameAction): GameState | null {
  if (action.type === 'FLIP') {
    const cardId = (action.payload as { cardId: number })?.cardId;
    const result = applyMDFlip(state as any, playerId, cardId);
    if (!result) return null;
    return result.state;
  }
  return null;
}

// ─── Number Battle ────────────────────────────────────────────────────────────
function handleNBAction(
  state: GameState,
  playerId: string,
  action: GameAction,
  broadcast: (state: GameState) => void,
): GameState | null {
  if (action.type === 'CHOOSE') {
    const number = (action.payload as { number: number })?.number;
    const result = applyNBChoice(state as any, playerId, number);
    if (!result) return null;
    if (result.revealed && !result.gameWinner) {
      setTimeout(() => broadcast(nextNBRound(result)), 2500);
    }
    return result;
  }
  return null;
}

// ─── Color Clash ──────────────────────────────────────────────────────────────
function handleCCAction(
  state: GameState,
  playerId: string,
  action: GameAction,
  broadcast: (state: GameState) => void,
): GameState | null {
  if (action.type === 'CHOOSE_COLOR') {
    const color = (action.payload as { color: string })?.color;
    const result = applyCCChoice(state as any, playerId, color, Date.now());
    if (!result) return null;
    if (result.phase === 'result' && !result.gameWinner) {
      setTimeout(() => broadcast(nextCCRound(result)), 2000);
    }
    return result;
  }
  return null;
}

// ─── Dots & Boxes ─────────────────────────────────────────────────────────────
function handleDABAction(state: GameState, playerId: string, action: GameAction): GameState | null {
  if (action.type === 'DRAW_EDGE') {
    const { type, row, col } = action.payload as { type: 'h' | 'v'; row: number; col: number };
    return applyDABEdge(state as any, playerId, type, row, col);
  }
  return null;
}
