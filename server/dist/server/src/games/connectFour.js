"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createC4State = createC4State;
exports.applyC4Move = applyC4Move;
exports.resetC4 = resetC4;
const ROWS = 6;
const COLS = 7;
function createC4State(playerIds) {
    return {
        board: Array(ROWS).fill(null).map(() => Array(COLS).fill(null)),
        currentTurn: playerIds[0],
        winner: null,
        isDraw: false,
        scores: { [playerIds[0]]: 0, [playerIds[1]]: 0 },
        winningCells: [],
    };
}
function applyC4Move(state, playerId, col) {
    if (state.winner || state.isDraw)
        return null;
    if (state.currentTurn !== playerId)
        return null;
    if (col < 0 || col >= COLS)
        return null;
    const board = state.board.map(row => [...row]);
    // Drop to lowest empty row
    let row = -1;
    for (let r = ROWS - 1; r >= 0; r--) {
        if (board[r][col] === null) {
            row = r;
            break;
        }
    }
    if (row === -1)
        return null; // column full
    board[row][col] = playerId;
    const { winner, winningCells } = checkC4Winner(board);
    const isDraw = !winner && board[0].every(cell => cell !== null);
    const scores = { ...state.scores };
    if (winner)
        scores[winner] = (scores[winner] || 0) + 1;
    const players = Object.keys(state.scores);
    const nextTurn = players.find(p => p !== playerId);
    return { ...state, board, currentTurn: winner || isDraw ? state.currentTurn : nextTurn, winner: winner ?? null, isDraw, scores, winningCells };
}
function checkC4Winner(board) {
    const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (!board[r][c])
                continue;
            for (const [dr, dc] of directions) {
                const cells = [[r, c]];
                for (let k = 1; k < 4; k++) {
                    const nr = r + dr * k, nc = c + dc * k;
                    if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS)
                        break;
                    if (board[nr][nc] !== board[r][c])
                        break;
                    cells.push([nr, nc]);
                }
                if (cells.length === 4)
                    return { winner: board[r][c], winningCells: cells };
            }
        }
    }
    return { winner: null, winningCells: [] };
}
function resetC4(state, playerIds) {
    return {
        ...createC4State(playerIds),
        scores: state.scores,
    };
}
