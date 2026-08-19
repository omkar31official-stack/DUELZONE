"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDABState = createDABState;
exports.applyDABEdge = applyDABEdge;
const GRID = 4; // 4x4 boxes = 5x5 dots
function createDABState(playerIds) {
    return {
        gridSize: GRID,
        horizontalEdges: Array(GRID + 1).fill(null).map(() => Array(GRID).fill(null)),
        verticalEdges: Array(GRID).fill(null).map(() => Array(GRID + 1).fill(null)),
        boxes: Array(GRID).fill(null).map(() => Array(GRID).fill(null)),
        currentTurn: playerIds[0],
        scores: { [playerIds[0]]: 0, [playerIds[1]]: 0 },
        winner: null,
        isDone: false,
    };
}
function applyDABEdge(state, playerId, type, row, col) {
    if (state.isDone || state.winner)
        return null;
    if (state.currentTurn !== playerId)
        return null;
    let hEdges = state.horizontalEdges.map(r => [...r]);
    let vEdges = state.verticalEdges.map(r => [...r]);
    if (type === 'h') {
        if (row < 0 || row > GRID || col < 0 || col >= GRID)
            return null;
        if (hEdges[row][col] !== null)
            return null;
        hEdges[row][col] = playerId;
    }
    else {
        if (row < 0 || row >= GRID || col < 0 || col > GRID)
            return null;
        if (vEdges[row][col] !== null)
            return null;
        vEdges[row][col] = playerId;
    }
    // Check for completed boxes
    let newBoxes = state.boxes.map(r => [...r]);
    let boxesClaimed = 0;
    for (let r = 0; r < GRID; r++) {
        for (let c = 0; c < GRID; c++) {
            if (newBoxes[r][c])
                continue;
            const top = hEdges[r][c];
            const bottom = hEdges[r + 1][c];
            const left = vEdges[r][c];
            const right = vEdges[r][c + 1];
            if (top && bottom && left && right) {
                newBoxes[r][c] = playerId;
                boxesClaimed++;
            }
        }
    }
    const scores = { ...state.scores };
    scores[playerId] = (scores[playerId] || 0) + boxesClaimed;
    const totalBoxes = GRID * GRID;
    const filledBoxes = newBoxes.flat().filter(Boolean).length;
    const isDone = filledBoxes === totalBoxes;
    const players = Object.keys(state.scores);
    const nextTurn = boxesClaimed > 0 ? playerId : players.find(p => p !== playerId);
    let winner = null;
    if (isDone) {
        const [p1, p2] = players;
        winner = scores[p1] > scores[p2] ? p1 : scores[p2] > scores[p1] ? p2 : null;
    }
    return {
        ...state,
        horizontalEdges: hEdges,
        verticalEdges: vEdges,
        boxes: newBoxes,
        scores,
        currentTurn: isDone ? state.currentTurn : nextTurn,
        isDone,
        winner,
    };
}
