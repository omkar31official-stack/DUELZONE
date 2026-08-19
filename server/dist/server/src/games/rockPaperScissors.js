"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRPSState = createRPSState;
exports.applyRPSChoice = applyRPSChoice;
exports.nextRPSRound = nextRPSRound;
const constants_1 = require("../../../shared/constants");
function createRPSState(playerIds) {
    return {
        round: 1,
        totalRounds: constants_1.RPS_WIN_SCORE * 2 - 1,
        choices: { [playerIds[0]]: null, [playerIds[1]]: null },
        revealed: false,
        roundWinner: null,
        scores: { [playerIds[0]]: 0, [playerIds[1]]: 0 },
        gameWinner: null,
    };
}
const beats = {
    rock: 'scissors',
    scissors: 'paper',
    paper: 'rock',
};
function applyRPSChoice(state, playerId, choice) {
    if (state.gameWinner)
        return null;
    if (state.revealed)
        return null;
    if (!(playerId in state.choices))
        return null;
    if (state.choices[playerId] !== null)
        return null;
    const newChoices = { ...state.choices, [playerId]: choice };
    const players = Object.keys(state.choices);
    const allChosen = players.every(p => newChoices[p] !== null);
    if (!allChosen) {
        return { ...state, choices: newChoices };
    }
    // Both chose — determine winner
    const [p1, p2] = players;
    const c1 = newChoices[p1];
    const c2 = newChoices[p2];
    let roundWinner = null;
    if (c1 === c2)
        roundWinner = null;
    else if (beats[c1] === c2)
        roundWinner = p1;
    else
        roundWinner = p2;
    const scores = { ...state.scores };
    if (roundWinner)
        scores[roundWinner] = (scores[roundWinner] || 0) + 1;
    const gameWinner = players.find(p => scores[p] >= constants_1.RPS_WIN_SCORE) ?? null;
    return {
        ...state,
        choices: newChoices,
        revealed: true,
        roundWinner: roundWinner ?? null,
        scores,
        gameWinner: gameWinner ?? null,
        round: state.round + 1,
    };
}
function nextRPSRound(state) {
    if (state.gameWinner)
        return state;
    const players = Object.keys(state.scores);
    return {
        ...state,
        choices: { [players[0]]: null, [players[1]]: null },
        revealed: false,
        roundWinner: null,
    };
}
