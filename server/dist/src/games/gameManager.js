"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearGameTimers = clearGameTimers;
exports.createGameState = createGameState;
exports.handleGameAction = handleGameAction;
const constants_1 = require("../../../shared/constants");
const findMatch_1 = require("../games/findMatch");
const ticTacToe_1 = require("../games/ticTacToe");
const connectFour_1 = require("../games/connectFour");
const rockPaperScissors_1 = require("../games/rockPaperScissors");
const reactionDuel_1 = require("../games/reactionDuel");
const quickTap_1 = require("../games/quickTap");
const memoryDuel_1 = require("../games/memoryDuel");
const numberBattle_1 = require("../games/numberBattle");
const colorClash_1 = require("../games/colorClash");
const dotsAndBoxes_1 = require("../games/dotsAndBoxes");
// Timer registry for automated round transitions
const gameTimers = new Map();
function addTimer(roomCode, t) {
    if (!gameTimers.has(roomCode))
        gameTimers.set(roomCode, []);
    gameTimers.get(roomCode).push(t);
}
function clearGameTimers(roomCode) {
    const timers = gameTimers.get(roomCode) || [];
    timers.forEach(clearTimeout);
    gameTimers.delete(roomCode);
}
// ─── Create initial state ─────────────────────────────────────────────────────
function createGameState(gameId, players) {
    switch (gameId) {
        case 'find-match': {
            const scores = { [players[0]]: 0, [players[1]]: 0 };
            const round = (0, findMatch_1.generateFindMatchRound)(1, constants_1.FIND_MATCH_DEFAULT_ROUNDS, scores, 'normal');
            const state = {
                ...round,
                startedAt: null,
                phase: 'countdown',
                winner: null,
            };
            return { state };
        }
        case 'tic-tac-toe':
            return { state: (0, ticTacToe_1.createTTTState)(players) };
        case 'connect-four':
            return { state: (0, connectFour_1.createC4State)(players) };
        case 'rock-paper-scissors':
            return { state: (0, rockPaperScissors_1.createRPSState)(players) };
        case 'reaction-duel':
            return { state: (0, reactionDuel_1.createRDState)(players) };
        case 'quick-tap':
            return { state: (0, quickTap_1.createQTState)(players) };
        case 'memory-duel':
            return { state: (0, memoryDuel_1.createMDState)(players) };
        case 'number-battle':
            return { state: (0, numberBattle_1.createNBState)(players) };
        case 'color-clash':
            return { state: (0, colorClash_1.createCCState)(players) };
        case 'dots-and-boxes':
            return { state: (0, dotsAndBoxes_1.createDABState)(players) };
        default:
            return { state: null };
    }
}
// ─── Apply action and return new state + optional events ─────────────────────
function handleGameAction(gameId, currentState, playerId, action, roomCode, broadcastFn) {
    switch (gameId) {
        case 'find-match':
            return handleFindMatchAction(currentState, playerId, action, roomCode, broadcastFn);
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
function handleFindMatchAction(state, playerId, action, roomCode, broadcast) {
    if (action.type === 'ROUND_START') {
        // Server-side: start countdown, then GO
        const newState = { ...state, phase: 'countdown', startedAt: null, winner: null };
        // Schedule GO after 3s
        const t = setTimeout(() => {
            const goState = { ...newState, phase: 'playing', startedAt: Date.now() };
            broadcast(goState, { type: 'ROUND_GO' });
        }, 3000);
        addTimer(roomCode, t);
        return newState;
    }
    if (action.type === 'SELECT_SYMBOL') {
        if (state.phase !== 'playing')
            return null;
        if (state.winner)
            return null;
        const symbolId = action.payload?.symbolId;
        if (!symbolId)
            return null;
        // Validate: is the symbol on this player's board?
        const isP1 = state.player1Symbols.some(s => s.id === playerId && s.id === symbolId) ||
            (Object.keys(state.scores)[0] === playerId && state.player1Symbols.some(s => s.id === symbolId));
        // More precise: identify which player slot
        const playerKeys = Object.keys(state.scores);
        const playerIndex = playerKeys.indexOf(playerId);
        const mySymbols = playerIndex === 0 ? state.player1Symbols : state.player2Symbols;
        if (!mySymbols.some(s => s.id === symbolId))
            return null;
        // Is it the common symbol?
        if (symbolId !== state.commonSymbolId) {
            // Wrong! No penalty in basic mode
            return null;
        }
        // Correct! Player wins round
        const scores = { ...state.scores, [playerId]: (state.scores[playerId] || 0) + 1 };
        const newRound = state.round + 1;
        const isGameOver = newRound > state.totalRounds;
        const winState = { ...state, winner: playerId, phase: 'result', scores };
        broadcast(winState, { type: 'ROUND_WON', payload: { winner: playerId } });
        if (!isGameOver) {
            // Next round after 3 seconds
            const t = setTimeout(() => {
                const next = (0, findMatch_1.generateFindMatchRound)(newRound, state.totalRounds, scores, state.difficulty);
                const nextState = {
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
        }
        else {
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
function handleTTTAction(state, playerId, action) {
    if (action.type === 'MOVE') {
        const cell = action.payload?.cell;
        return (0, ticTacToe_1.applyTTTMove)(state, playerId, cell);
    }
    if (action.type === 'RESET') {
        const s = state;
        const players = Object.keys(s.scores);
        return (0, ticTacToe_1.resetTTTBoard)(s, players);
    }
    return null;
}
// ─── Connect Four ─────────────────────────────────────────────────────────────
function handleC4Action(state, playerId, action) {
    if (action.type === 'DROP') {
        const col = action.payload?.col;
        return (0, connectFour_1.applyC4Move)(state, playerId, col);
    }
    if (action.type === 'RESET') {
        const s = state;
        const players = Object.keys(s.scores);
        return (0, connectFour_1.resetC4)(s, players);
    }
    return null;
}
// ─── RPS ──────────────────────────────────────────────────────────────────────
function handleRPSAction(state, playerId, action, broadcast) {
    if (action.type === 'CHOOSE') {
        const choice = action.payload?.choice;
        const newState = (0, rockPaperScissors_1.applyRPSChoice)(state, playerId, choice);
        if (!newState)
            return null;
        if (newState.revealed) {
            // Auto-advance to next round after delay
            setTimeout(() => {
                if (!newState.gameWinner)
                    broadcast((0, rockPaperScissors_1.nextRPSRound)(newState));
            }, 2500);
        }
        return newState;
    }
    return null;
}
// ─── Reaction Duel ────────────────────────────────────────────────────────────
function handleRDAction(state, playerId, action, roomCode, broadcast) {
    const s = state;
    if (action.type === 'START_ROUND') {
        const readyState = (0, reactionDuel_1.setRDReady)(s);
        // Random delay 1-4 seconds then GO
        const delay = 1000 + Math.random() * 3000;
        const t = setTimeout(() => {
            const goState = (0, reactionDuel_1.setRDGo)(readyState, Date.now());
            broadcast(goState, { type: 'REACTION_GO' });
        }, delay);
        addTimer(roomCode, t);
        return readyState;
    }
    if (action.type === 'REACT') {
        const result = (0, reactionDuel_1.applyRDReaction)(s, playerId, Date.now());
        if (!result)
            return null;
        if (result.phase === 'result' && !result.gameWinner) {
            const t = setTimeout(() => {
                broadcast((0, reactionDuel_1.nextRDRound)(result));
            }, 2500);
            addTimer(roomCode, t);
        }
        return result;
    }
    return null;
}
// ─── Quick Tap ────────────────────────────────────────────────────────────────
function handleQTAction(state, playerId, action) {
    const s = state;
    if (action.type === 'START') {
        return (0, quickTap_1.startQT)(s);
    }
    if (action.type === 'TAP') {
        const result = (0, quickTap_1.applyQTTap)(s, playerId, Date.now());
        if (!result)
            return null;
        // Check if game should end
        if (result.endTime && Date.now() >= result.endTime) {
            return (0, quickTap_1.finishQT)(result);
        }
        return result;
    }
    if (action.type === 'FINISH') {
        return (0, quickTap_1.finishQT)(s);
    }
    return null;
}
// ─── Memory Duel ──────────────────────────────────────────────────────────────
function handleMDAction(state, playerId, action) {
    if (action.type === 'FLIP') {
        const cardId = action.payload?.cardId;
        const result = (0, memoryDuel_1.applyMDFlip)(state, playerId, cardId);
        if (!result)
            return null;
        return result.state;
    }
    return null;
}
// ─── Number Battle ────────────────────────────────────────────────────────────
function handleNBAction(state, playerId, action, broadcast) {
    if (action.type === 'CHOOSE') {
        const number = action.payload?.number;
        const result = (0, numberBattle_1.applyNBChoice)(state, playerId, number);
        if (!result)
            return null;
        if (result.revealed && !result.gameWinner) {
            setTimeout(() => broadcast((0, numberBattle_1.nextNBRound)(result)), 2500);
        }
        return result;
    }
    return null;
}
// ─── Color Clash ──────────────────────────────────────────────────────────────
function handleCCAction(state, playerId, action, broadcast) {
    if (action.type === 'CHOOSE_COLOR') {
        const color = action.payload?.color;
        const result = (0, colorClash_1.applyCCChoice)(state, playerId, color, Date.now());
        if (!result)
            return null;
        if (result.phase === 'result' && !result.gameWinner) {
            setTimeout(() => broadcast((0, colorClash_1.nextCCRound)(result)), 2000);
        }
        return result;
    }
    return null;
}
// ─── Dots & Boxes ─────────────────────────────────────────────────────────────
function handleDABAction(state, playerId, action) {
    if (action.type === 'DRAW_EDGE') {
        const { type, row, col } = action.payload;
        return (0, dotsAndBoxes_1.applyDABEdge)(state, playerId, type, row, col);
    }
    return null;
}
