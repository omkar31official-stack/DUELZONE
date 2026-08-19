import { ConnectFourState } from '../../../shared/types';

const ROWS = 6;
const COLS = 7;

export function createC4State(playerIds: [string, string]): ConnectFourState {
  return {
    board: Array(ROWS).fill(null).map(() => Array(COLS).fill(null)),
    currentTurn: playerIds[0],
    winner: null,
    isDraw: false,
    scores: { [playerIds[0]]: 0, [playerIds[1]]: 0 },
    winningCells: [],
  };
}

export function applyC4Move(
  state: ConnectFourState,
  playerId: string,
  col: number,
): ConnectFourState | null {
  if (state.winner || state.isDraw) return null;
  if (state.currentTurn !== playerId) return null;
  if (col < 0 || col >= COLS) return null;

  const board = state.board.map(row => [...row]);

  // Drop to lowest empty row
  let row = -1;
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r][col] === null) { row = r; break; }
  }
  if (row === -1) return null; // column full

  board[row][col] = playerId;

  const { winner, winningCells } = checkC4Winner(board);
  const isDraw = !winner && board[0].every(cell => cell !== null);
  const scores = { ...state.scores };
  if (winner) scores[winner] = (scores[winner] || 0) + 1;

  const players = Object.keys(state.scores);
  const nextTurn = players.find(p => p !== playerId)!;

  return { ...state, board, currentTurn: winner || isDraw ? state.currentTurn : nextTurn, winner: winner ?? null, isDraw, scores, winningCells };
}

function checkC4Winner(board: (string | null)[][]): { winner: string | null; winningCells: [number, number][] } {
  const directions = [[0,1],[1,0],[1,1],[1,-1]];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (!board[r][c]) continue;
      for (const [dr, dc] of directions) {
        const cells: [number,number][] = [[r,c]];
        for (let k = 1; k < 4; k++) {
          const nr = r + dr*k, nc = c + dc*k;
          if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) break;
          if (board[nr][nc] !== board[r][c]) break;
          cells.push([nr, nc]);
        }
        if (cells.length === 4) return { winner: board[r][c], winningCells: cells };
      }
    }
  }
  return { winner: null, winningCells: [] };
}

export function resetC4(state: ConnectFourState, playerIds: [string, string]): ConnectFourState {
  return {
    ...createC4State(playerIds),
    scores: state.scores,
  };
}
