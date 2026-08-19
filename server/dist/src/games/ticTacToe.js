"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTTTState = createTTTState;
exports.checkTTTWinner = checkTTTWinner;
exports.applyTTTMove = applyTTTMove;
exports.resetTTTBoard = resetTTTBoard;
function createTTTState(playerIds) {
    return {
        board: Array(9).fill(null),
        currentTurn: playerIds[0],
        winner: null,
        isDraw: false,
        scores: { [playerIds[0]]: 0, [playerIds[1]]: 0 },
        round: 1,
    };
}
function checkTTTWinner(board) {
    const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6],
    ];
    for (const [a, b, c] of lines) {
        if (board[a] && board[a] === board[b] && board[a] === board[c])
            return board[a];
    }
    return null;
}
function applyTTTMove(state, playerId, cell) {
    if (state.winner || state.isDraw)
        return null;
    if (state.currentTurn !== playerId)
        return null;
    if (cell < 0 || cell > 8 || state.board[cell] !== null)
        return null;
    const board = [...state.board];
    board[cell] = playerId;
    const winner = checkTTTWinner(board);
    const isDraw = !winner && board.every(Boolean);
    const scores = { ...state.scores };
    if (winner)
        scores[winner] = (scores[winner] || 0) + 1;
    // figure out opponent for next turn
    const players = Object.keys(state.scores);
    const nextTurn = players.find(p => p !== playerId);
    return {
        ...state,
        board,
        currentTurn: isDraw || winner ? state.currentTurn : nextTurn,
        winner: winner ?? null,
        isDraw,
        scores,
    };
}
function resetTTTBoard(state, playerIds) {
    // Alternate who goes first each round
    const players = playerIds;
    const nextFirst = players[state.round % 2];
    return {
        ...state,
        board: Array(9).fill(null),
        winner: null,
        isDraw: false,
        currentTurn: nextFirst,
        round: state.round + 1,
    };
}
