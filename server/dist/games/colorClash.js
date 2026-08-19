"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCCState = createCCState;
exports.applyCCChoice = applyCCChoice;
exports.nextCCRound = nextCCRound;
const constants_1 = require("../../../shared/constants");
const TOTAL_ROUNDS = 10;
function generateRound() {
    const inkIdx = Math.floor(Math.random() * constants_1.COLOR_CLASH_COLORS.length);
    let wordIdx;
    do {
        wordIdx = Math.floor(Math.random() * constants_1.COLOR_CLASH_WORDS.length);
    } while (wordIdx === inkIdx && Math.random() > 0.3); // sometimes same, mostly different
    return {
        word: constants_1.COLOR_CLASH_WORDS[wordIdx],
        inkColor: constants_1.COLOR_CLASH_COLORS[inkIdx],
        wordColor: constants_1.COLOR_CLASH_COLORS[wordIdx],
    };
}
function createCCState(playerIds) {
    const { word, inkColor, wordColor } = generateRound();
    return {
        round: 1,
        totalRounds: TOTAL_ROUNDS,
        word,
        inkColor,
        wordColor,
        choices: { [playerIds[0]]: null, [playerIds[1]]: null },
        roundWinner: null,
        scores: { [playerIds[0]]: 0, [playerIds[1]]: 0 },
        gameWinner: null,
        phase: 'playing',
        startedAt: Date.now(),
    };
}
function applyCCChoice(state, playerId, color, arrivedAt) {
    if (state.phase !== 'playing')
        return null;
    if (state.choices[playerId] !== null)
        return null;
    if (!constants_1.COLOR_CLASH_COLORS.includes(color))
        return null;
    const choices = { ...state.choices, [playerId]: color };
    const players = Object.keys(state.scores);
    const allChosen = players.every(p => choices[p] !== null);
    if (!allChosen)
        return { ...state, choices };
    // Determine winners — must pick inkColor
    const scores = { ...state.scores };
    let roundWinner = null;
    const correctPlayers = players.filter(p => choices[p] === state.inkColor);
    if (correctPlayers.length === 1) {
        roundWinner = correctPlayers[0];
        scores[roundWinner] = (scores[roundWinner] || 0) + 1;
    }
    else if (correctPlayers.length === 2) {
        // Both correct — no point (or could award both, keeping it competitive)
    }
    const gameWinner = state.round >= TOTAL_ROUNDS
        ? (() => { const [p1, p2] = players; return scores[p1] > scores[p2] ? p1 : scores[p2] > scores[p1] ? p2 : null; })()
        : null;
    return { ...state, choices, phase: 'result', roundWinner, scores, gameWinner };
}
function nextCCRound(state) {
    const players = Object.keys(state.scores);
    const { word, inkColor, wordColor } = generateRound();
    return {
        ...state,
        round: state.round + 1,
        word,
        inkColor,
        wordColor,
        choices: { [players[0]]: null, [players[1]]: null },
        phase: 'playing',
        roundWinner: null,
        startedAt: Date.now(),
    };
}
