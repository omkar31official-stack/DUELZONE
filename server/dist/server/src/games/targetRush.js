"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTargetRushState = createTargetRushState;
exports.applyTargetRushChoice = applyTargetRushChoice;
exports.nextTargetRushRound = nextTargetRushRound;
const TOTAL_ROUNDS = 6;
const HAND_SIZE = 5;
function genNumbers() {
    const nums = [];
    while (nums.length < HAND_SIZE) {
        const n = Math.floor(Math.random() * 100) + 1;
        if (!nums.includes(n))
            nums.push(n);
    }
    return nums.sort((a, b) => a - b);
}
function makeHands(playerIds) {
    return Object.fromEntries(playerIds.map(id => [id, genNumbers()]));
}
function makeNullChoices(playerIds) {
    return Object.fromEntries(playerIds.map(id => [id, null]));
}
function makeScores(playerIds) {
    return Object.fromEntries(playerIds.map(id => [id, 0]));
}
function createTargetRushState(playerIds) {
    return {
        round: 1,
        totalRounds: TOTAL_ROUNDS,
        target: Math.floor(Math.random() * 100) + 1,
        playerNumbers: makeHands(playerIds),
        choices: makeNullChoices(playerIds),
        revealed: false,
        roundWinner: null,
        scores: makeScores(playerIds),
        gameWinner: null,
    };
}
function applyTargetRushChoice(state, playerId, number) {
    if (state.revealed || state.gameWinner)
        return null;
    if (!(playerId in state.choices))
        return null;
    if (state.choices[playerId] !== null)
        return null;
    if (!state.playerNumbers[playerId]?.includes(number))
        return null;
    const choices = { ...state.choices, [playerId]: number };
    const players = Object.keys(state.scores);
    const allChosen = players.every(p => choices[p] !== null);
    if (!allChosen)
        return { ...state, choices };
    let bestDiff = Number.POSITIVE_INFINITY;
    let winners = [];
    for (const id of players) {
        const diff = Math.abs(choices[id] - state.target);
        if (diff < bestDiff) {
            bestDiff = diff;
            winners = [id];
        }
        else if (diff === bestDiff) {
            winners.push(id);
        }
    }
    const roundWinner = winners.length === 1 ? winners[0] : null;
    const scores = { ...state.scores };
    if (roundWinner)
        scores[roundWinner] = (scores[roundWinner] || 0) + 1;
    let gameWinner = null;
    if (state.round >= state.totalRounds) {
        const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
        gameWinner = ranked.length > 1 && ranked[0][1] === ranked[1][1] ? null : ranked[0]?.[0] ?? null;
    }
    return { ...state, choices, revealed: true, roundWinner, scores, gameWinner };
}
function nextTargetRushRound(state) {
    const players = Object.keys(state.scores);
    return {
        ...state,
        round: state.round + 1,
        target: Math.floor(Math.random() * 100) + 1,
        playerNumbers: makeHands(players),
        choices: makeNullChoices(players),
        revealed: false,
        roundWinner: null,
    };
}
