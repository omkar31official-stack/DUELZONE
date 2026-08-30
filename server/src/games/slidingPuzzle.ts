import { SlidingPuzzleState } from '../../../shared/types';

const SOLVED_BOARD = [1, 2, 3, 4, 5, 6, 7, 8, 0];

const generateSolvableBoard = (): number[] => {
  // Simple shuffled solvable board
  return [1, 2, 3, 4, 5, 0, 7, 8, 6];
};

export const createSlidingPuzzleState = (players: string[]): SlidingPuzzleState => {
  const scores: Record<string, number> = {};
  const boards: Record<string, number[]> = {};

  players.forEach((pId) => {
    scores[pId] = 0;
    boards[pId] = generateSolvableBoard();
  });

  return {
    scores,
    boards,
    winner: null,
  };
};

export const handleSlidingPuzzleAction = (
  state: SlidingPuzzleState,
  playerId: string,
  action: { type: string; payload?: any }
): SlidingPuzzleState => {
  if (state.winner) return state;

  if (action.type === 'MOVE_TILE') {
    const tileIndex = action.payload?.tileIndex;
    const board = state.boards[playerId];

    if (!board || tileIndex === undefined || tileIndex < 0 || tileIndex > 8) return state;

    const zeroIndex = board.indexOf(0);
    const isAdjacent =
      (Math.abs(tileIndex - zeroIndex) === 1 && Math.floor(tileIndex / 3) === Math.floor(zeroIndex / 3)) ||
      Math.abs(tileIndex - zeroIndex) === 3;

    if (isAdjacent) {
      // Swap tile with 0
      const newBoard = [...board];
      newBoard[zeroIndex] = newBoard[tileIndex];
      newBoard[tileIndex] = 0;
      state.boards[playerId] = newBoard;

      // Check if solved
      const isSolved = newBoard.every((val, idx) => val === SOLVED_BOARD[idx]);
      if (isSolved) {
        state.winner = playerId;
        state.scores[playerId] = 10;
      }
    }

    return { ...state };
  }

  return state;
};
