"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRDState = createRDState;
exports.setRDGo = setRDGo;
exports.setRDReady = setRDReady;
exports.applyRDReaction = applyRDReaction;
exports.nextRDRound = nextRDRound;
const constants_1 = require("../../../shared/constants");
function createRDState(playerIds) {
    return {
        round: 1,
        totalRounds: constants_1.REACTION_DUEL_ROUNDS,
        phase: 'waiting',
        goTime: null,
        reactions: { [playerIds[0]]: null, [playerIds[1]]: null },
        roundWinner: null,
        scores: { [playerIds[0]]: 0, [playerIds[1]]: 0 },
        gameWinner: null,
        reactionTimes: { [playerIds[0]]: [], [playerIds[1]]: [] },
    };
}
function setRDGo(state, goTime) {
    return { ...state, phase: 'go', goTime };
}
function setRDReady(state) {
    return { ...state, phase: 'ready' };
}
function applyRDReaction(state, playerId, arrivedAt) {
    if (state.phase !== 'go' && state.phase !== 'ready')
        return null;
    if (state.reactions[playerId] !== null)
        return null;
    if (!(playerId in state.reactions))
        return null;
    const newReactions = { ...state.reactions };
    // False start detection
    if (state.phase === 'ready' || state.goTime === null || arrivedAt < state.goTime) {
        newReactions[playerId] = 'false-start';
    }
    else {
        newReactions[playerId] = arrivedAt - state.goTime;
    }
    const players = Object.keys(state.scores);
    const allDone = players.every(p => newReactions[p] !== null);
    if (!allDone)
        return { ...state, reactions: newReactions };
    // Determine round winner
    const [p1, p2] = players;
    const r1 = newReactions[p1];
    const r2 = newReactions[p2];
    let roundWinner = null;
    if (r1 === 'false-start' && r2 === 'false-start')
        roundWinner = null;
    else if (r1 === 'false-start')
        roundWinner = p2;
    else if (r2 === 'false-start')
        roundWinner = p1;
    else
        roundWinner = r1 <= r2 ? p1 : p2;
    const scores = { ...state.scores };
    if (roundWinner)
        scores[roundWinner] = (scores[roundWinner] || 0) + 1;
    const reactionTimes = {
        [p1]: [...(state.reactionTimes[p1] || [])],
        [p2]: [...(state.reactionTimes[p2] || [])],
    };
    if (typeof r1 === 'number')
        reactionTimes[p1].push(r1);
    if (typeof r2 === 'number')
        reactionTimes[p2].push(r2);
    const gameWinner = state.round >= state.totalRounds
        ? (scores[p1] > scores[p2] ? p1 : scores[p2] > scores[p1] ? p2 : null)
        : null;
    return {
        ...state,
        reactions: newReactions,
        phase: 'result',
        roundWinner,
        scores,
        reactionTimes,
        gameWinner,
    };
}
function nextRDRound(state) {
    const players = Object.keys(state.scores);
    return {
        ...state,
        phase: 'waiting',
        goTime: null,
        reactions: { [players[0]]: null, [players[1]]: null },
        roundWinner: null,
        round: state.round + 1,
    };
}
