import { GameId, GameAction } from '../../../shared/types';
import { FIND_MATCH_DEFAULT_ROUNDS } from '../../../shared/constants';
import { generateFindMatchRound, isOnCooldown, clearClickCooldowns } from '../games/findMatch';
import { createTTTState, applyTTTMove, resetTTTBoard } from '../games/ticTacToe';
import { createC4State, applyC4Move, resetC4 } from '../games/connectFour';
import { createRPSState, applyRPSChoice, nextRPSRound } from '../games/rockPaperScissors';
import { createRDState, setRDGo, setRDReady, applyRDReaction, nextRDRound } from '../games/reactionDuel';
import { createQTState, startQT, applyQTTap, finishQT } from '../games/quickTap';
import { createMDState, applyMDFlip } from '../games/memoryDuel';
import { createNBState, applyNBChoice, nextNBRound } from '../games/numberBattle';
import { createCCState, applyCCChoice, nextCCRound } from '../games/colorClash';
import { createDABState, applyDABEdge } from '../games/dotsAndBoxes';
import { createTapRoyaleState, startTapRoyale, applyTapRoyaleTap, finishTapRoyale } from '../games/tapRoyale';
import { createTargetRushState, applyTargetRushChoice, nextTargetRushRound } from '../games/targetRush';
import { createWSState, applyWSGuess, nextWSRound } from '../games/wordScramble';
import { createTBState, applyTBAnswer, nextTBRound } from '../games/triviaBlitz';
import { createSpeedMathState, applySpeedMathAnswer, nextSpeedMathRound } from '../games/speedMath';
import { createPatternMasterState, applyPatternInput, nextPatternRound } from '../games/patternMaster';
import { createPicComboState, applyPicComboGuess, nextPicComboRound } from '../games/picCombo';
import { createArcheryState, handleArcheryAction } from '../games/archery';
import { createBowlingState, handleBowlingAction } from '../games/bowling';
import { createHammerState, handleHammerAction } from '../games/hammer';
import { createAnimalBalanceState, handleAnimalBalanceAction } from '../games/animalBalance';
import { createPingBallState, handlePingBallAction } from '../games/pingBall';
import { createFruitNinjaState, handleFruitNinjaAction } from '../games/fruitNinja';
import { createCornholeState, handleCornholeAction } from '../games/cornhole';
import { createKnifeThrowerState, handleKnifeThrowerAction } from '../games/knifeThrower';
import { createChainReactionState, handleChainReactionAction } from '../games/chainReaction';
import { createCoopPuzzleState, handleCoopPuzzleAction } from '../games/coopPuzzle';
import { createWaterSortState, handleWaterSortAction } from '../games/waterSort';
import { createSudokuState, handleSudokuAction } from '../games/sudoku';
import { createGame2048State, handleGame2048Action } from '../games/game2048';
import { createMath24State, handleMath24Action } from '../games/math24';
import type { FindMatchRoundState } from '../../../shared/types';

type GameState = unknown;
type Players = string[];

function asDuelPlayers(players: Players): [string, string] {
  return [players[0], players[1] || 'Bot'];
}

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
  clearClickCooldowns(roomCode);
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
      const p2 = players[1] || 'Bot';
      const scores: Record<string, number> = { [players[0]]: 0, [p2]: 0 };
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
      return { state: createTTTState(asDuelPlayers(players)) };
    case 'connect-four':
      return { state: createC4State(asDuelPlayers(players)) };
    case 'rock-paper-scissors':
      return { state: createRPSState(asDuelPlayers(players)) };
    case 'reaction-duel':
      return { state: createRDState(asDuelPlayers(players)) };
    case 'quick-tap':
      return { state: createQTState(asDuelPlayers(players)) };
    case 'memory-duel':
      return { state: createMDState(asDuelPlayers(players)) };
    case 'number-battle':
      return { state: createNBState(asDuelPlayers(players)) };
    case 'color-clash':
      return { state: createCCState(asDuelPlayers(players)) };
    case 'dots-and-boxes':
      return { state: createDABState(asDuelPlayers(players)) };
    case 'tap-royale':
      return { state: createTapRoyaleState(players) };
    case 'target-rush':
      return { state: createTargetRushState(players) };
    case 'word-scramble':
      return { state: createWSState(players) };
    case 'trivia-blitz':
      return { state: createTBState(players) };
    case 'speed-math':
      return { state: createSpeedMathState(players) };
    case 'pattern-master':
      return { state: createPatternMasterState(players) };
    case 'pic-combo':
      return { state: createPicComboState(players) };
    case 'archery':
      return { state: createArcheryState(players) };
    case 'bowling':
      return { state: createBowlingState(players) };
    case 'hammer':
      return { state: createHammerState(players) };
    case 'animal-balance':
      return { state: createAnimalBalanceState(players) };
    case 'ping-ball':
      return { state: createPingBallState(players) };
    case 'fruit-ninja':
      return { state: createFruitNinjaState(players) };
    case 'cornhole':
      return { state: createCornholeState(players) };
    case 'knife-thrower':
      return { state: createKnifeThrowerState(players) };
    case 'chain-reaction':
      return { state: createChainReactionState(players) };
    case 'coop-puzzle':
      return { state: createCoopPuzzleState(players) };
    case 'water-sort':
      return { state: createWaterSortState(players) };
    case 'sudoku':
      return { state: createSudokuState(players) };
    case '2048':
      return { state: createGame2048State(players) };
    case 'math-24':
      return { state: createMath24State(players) };
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
    case 'tap-royale':
      return handleTapRoyaleAction(currentState, playerId, action);
    case 'target-rush':
      return handleTargetRushAction(currentState, playerId, action, broadcastFn);
    case 'word-scramble':
      return handleWSAction(currentState, playerId, action, broadcastFn);
    case 'trivia-blitz':
      return handleTBAction(currentState, playerId, action, broadcastFn);
    case 'speed-math':
      return handleSpeedMathAction(currentState, playerId, action, broadcastFn);
    case 'pattern-master':
      return handlePatternMasterAction(currentState, playerId, action, roomCode, broadcastFn);
    case 'pic-combo':
      return handlePicComboAction(currentState, playerId, action, broadcastFn);
    case 'archery':
      return handleArcheryAction(currentState as any, playerId, action);
    case 'bowling':
      return handleBowlingAction(currentState as any, playerId, action);
    case 'hammer':
      return handleHammerAction(currentState as any, playerId, action);
    case 'animal-balance':
      return handleAnimalBalanceAction(currentState as any, playerId, action);
    case 'ping-ball':
      return handlePingBallAction(currentState as any, playerId, action);
    case 'fruit-ninja':
      return handleFruitNinjaAction(currentState as any, playerId, action);
    case 'cornhole':
      return handleCornholeAction(currentState as any, playerId, action);
    case 'knife-thrower':
      return handleKnifeThrowerAction(currentState as any, playerId, action);
    case 'chain-reaction':
      return handleChainReactionAction(currentState as any, playerId, action);
    case 'coop-puzzle':
      return handleCoopPuzzleAction(currentState as any, playerId, action);
    case 'water-sort':
      return handleWaterSortAction(currentState as any, playerId, action);
    case 'sudoku':
      return handleSudokuAction(currentState as any, playerId, action);
    case '2048':
      return handleGame2048Action(currentState as any, playerId, action);
    case 'math-24':
      return handleMath24Action(currentState as any, playerId, action);
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

    // Anti-spam: server-side click cooldown
    if (isOnCooldown(roomCode, playerId)) return null;

    // Identify which player slot
    const playerKeys = Object.keys(state.scores);
    const playerIndex = playerKeys.indexOf(playerId);
    if (playerIndex === -1) return null;
    const mySymbols = playerIndex === 0 ? state.player1Symbols : state.player2Symbols;
    if (!mySymbols.some(s => s.id === symbolId)) return null;

    // Is it the common symbol?
    if (symbolId !== state.commonSymbolId) {
      // WRONG CLICK! Award 1 point to the opponent as penalty
      const opponentId = playerKeys.find(p => p !== playerId)!;
      const scores = { ...state.scores, [opponentId]: (state.scores[opponentId] || 0) + 1 };
      const penaltyState: FindMatchRoundState = { ...state, scores, winner: opponentId, phase: 'result' };
      broadcast(penaltyState, { type: 'WRONG_CLICK', payload: { playerId, opponentId, symbolId } });

      const newRound = state.round + 1;
      const isGameOver = newRound > state.totalRounds;

      if (!isGameOver) {
        const t = setTimeout(() => {
          const next = generateFindMatchRound(newRound, state.totalRounds, scores, state.difficulty);
          const nextState: FindMatchRoundState = {
            ...next,
            startedAt: null,
            phase: 'countdown',
            winner: null,
          };
          broadcast(nextState);
          const t2 = setTimeout(() => {
            broadcast({ ...nextState, phase: 'playing', startedAt: Date.now() }, { type: 'ROUND_GO' });
          }, 3000);
          addTimer(roomCode, t2);
        }, 2500);
        addTimer(roomCode, t);
      } else {
        const [p1, p2] = playerKeys;
        const gameWinner = scores[p1] > scores[p2] ? p1 : scores[p2] > scores[p1] ? p2 : null;
        const t = setTimeout(() => {
          broadcast({ ...penaltyState, phase: 'result' }, { type: 'GAME_OVER', payload: { winner: gameWinner, scores } });
        }, 2500);
        addTimer(roomCode, t);
      }

      return penaltyState;
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

// ─── Tap Royale ──────────────────────────────────────────────────────────────
function handleTapRoyaleAction(state: GameState, playerId: string, action: GameAction): GameState | null {
  const s = state as any;
  if (action.type === 'START') {
    return startTapRoyale(s);
  }
  if (action.type === 'TAP') {
    const result = applyTapRoyaleTap(s, playerId, Date.now());
    if (!result) return null;
    if (result.endTime && Date.now() >= result.endTime) return finishTapRoyale(result);
    return result;
  }
  if (action.type === 'FINISH') {
    return finishTapRoyale(s);
  }
  return null;
}

// ─── Target Rush ─────────────────────────────────────────────────────────────
function handleTargetRushAction(
  state: GameState,
  playerId: string,
  action: GameAction,
  broadcast: (state: GameState) => void,
): GameState | null {
  if (action.type === 'CHOOSE') {
    const number = (action.payload as { number: number })?.number;
    const result = applyTargetRushChoice(state as any, playerId, number);
    if (!result) return null;
    if (result.revealed && !result.gameWinner) {
      setTimeout(() => broadcast(nextTargetRushRound(result)), 2500);
    }
    return result;
  }
  return null;
}

// ─── Word Scramble ───────────────────────────────────────────────────────────
function handleWSAction(
  state: GameState,
  playerId: string,
  action: GameAction,
  broadcast: (state: GameState) => void,
): GameState | null {
  if (action.type === 'GUESS') {
    const guess = (action.payload as { guess: string })?.guess;
    if (!guess || typeof guess !== 'string') return null;
    const result = applyWSGuess(state as any, playerId, guess);
    if (!result) return null;
    if (result.phase === 'result' && !result.gameWinner) {
      setTimeout(() => broadcast(nextWSRound(result)), 2500);
    }
    return result;
  }
  return null;
}

// ─── Trivia Blitz ────────────────────────────────────────────────────────────
function handleTBAction(
  state: GameState,
  playerId: string,
  action: GameAction,
  broadcast: (state: GameState) => void,
): GameState | null {
  if (action.type === 'ANSWER') {
    const answerIndex = (action.payload as { answerIndex: number })?.answerIndex;
    if (typeof answerIndex !== 'number') return null;
    const result = applyTBAnswer(state as any, playerId, answerIndex);
    if (!result) return null;
    if (result.phase === 'result' && !result.gameWinner) {
      setTimeout(() => broadcast(nextTBRound(result)), 2500);
    }
    return result;
  }
  return null;
}
// ─── Speed Math ──────────────────────────────────────────────────────────────
function handleSpeedMathAction(
  state: GameState,
  playerId: string,
  action: GameAction,
  broadcast: (state: GameState) => void,
): GameState | null {
  if (action.type === 'ANSWER') {
    const chosenVal = (action.payload as { chosenVal: number })?.chosenVal;
    if (typeof chosenVal !== 'number') return null;
    const result = applySpeedMathAnswer(state as any, playerId, chosenVal);
    if (!result) return null;
    if (result.phase === 'result' && !result.gameWinner) {
      setTimeout(() => broadcast(nextSpeedMathRound(result)), 2500);
    }
    return result;
  }
  return null;
}

// ─── Pattern Master ──────────────────────────────────────────────────────────
function handlePatternMasterAction(
  state: GameState,
  playerId: string,
  action: GameAction,
  roomCode: string,
  broadcast: (state: GameState) => void,
): GameState | null {
  const s = state as any;
  if (action.type === 'SHOW_COMPLETE') {
    return { ...s, phase: 'input' };
  }
  if (action.type === 'INPUT') {
    const padIndex = (action.payload as { padIndex: number })?.padIndex;
    if (typeof padIndex !== 'number') return null;
    const result = applyPatternInput(s, playerId, padIndex);
    if (!result) return null;
    if (result.phase === 'result' && !result.gameWinner) {
      setTimeout(() => broadcast(nextPatternRound(result)), 2500);
    }
    return result;
  }
  return null;
}

// ─── Pic Combo ───────────────────────────────────────────────────────────────
function handlePicComboAction(
  state: GameState,
  playerId: string,
  action: GameAction,
  broadcast: (state: GameState) => void,
): GameState | null {
  if (action.type === 'GUESS') {
    const guess = (action.payload as { guess: string })?.guess;
    if (!guess || typeof guess !== 'string') return null;
    const result = applyPicComboGuess(state as any, playerId, guess);
    if (!result) return null;
    if (result.phase === 'result' && !result.gameWinner) {
      setTimeout(() => broadcast(nextPicComboRound(result)), 2500);
    }
    return result;
  }
  return null;
}
