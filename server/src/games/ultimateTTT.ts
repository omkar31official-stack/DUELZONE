import { GameAction } from '../../../shared/types';

export interface UltimateTTTState {
  mainBoard: (string | null)[]; // 9 sub-board winners
  subBoards: (string | null)[][]; // 9 sub-boards of 9 cells each
  currentTurn: string;
  activeBoardIndex: number | null; // null means can play in any board
  winner: string | null;
  scores: Record<string, number>;
}

export function createUltimateTTTState(players: [string, string]): UltimateTTTState {
  return {
    mainBoard: Array(9).fill(null),
    subBoards: Array(9).fill(null).map(() => Array(9).fill(null)),
    currentTurn: players[0],
    activeBoardIndex: null,
    winner: null,
    scores: { [players[0]]: 0, [players[1]]: 0 },
  };
}

function checkBoardWin(board: (string | null)[]): string | null {
  const lines = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

export function handleUltimateTTTAction(state: UltimateTTTState, playerId: string, action: GameAction): UltimateTTTState | null {
  if (state.winner) return null;
  if (state.currentTurn !== playerId) return null;

  if (action.type === 'MOVE') {
    const { boardIndex, cellIndex } = action.payload as { boardIndex: number; cellIndex: number };
    if (typeof boardIndex !== 'number' || typeof cellIndex !== 'number') return null;

    if (state.activeBoardIndex !== null && state.activeBoardIndex !== boardIndex) return null;
    if (state.mainBoard[boardIndex] !== null) return null;
    if (state.subBoards[boardIndex][cellIndex] !== null) return null;

    const newSubBoards = state.subBoards.map((sb, bi) =>
      bi === boardIndex ? sb.map((cell, ci) => (ci === cellIndex ? playerId : cell)) : sb
    );

    const newMainBoard = [...state.mainBoard];
    const subWin = checkBoardWin(newSubBoards[boardIndex]);
    if (subWin) {
      newMainBoard[boardIndex] = subWin;
    }

    const gameWinner = checkBoardWin(newMainBoard);
    const pKeys = Object.keys(state.scores);
    const nextTurn = pKeys.find(p => p !== playerId)!;
    const nextActiveBoard = newMainBoard[cellIndex] !== null ? null : cellIndex;

    return {
      ...state,
      subBoards: newSubBoards,
      mainBoard: newMainBoard,
      currentTurn: nextTurn,
      activeBoardIndex: nextActiveBoard,
      winner: gameWinner,
      scores: gameWinner ? { ...state.scores, [gameWinner]: (state.scores[gameWinner] || 0) + 1 } : state.scores,
    };
  }

  return null;
}
