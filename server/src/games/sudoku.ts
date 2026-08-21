import { SudokuState } from '../../../shared/types';

function generateSudoku(level: number) {
  // 1. Initialize empty 9x9 board
  const board: number[][] = Array.from({ length: 9 }, () => Array(9).fill(0));

  // Helper functions
  const isValid = (board: number[][], row: number, col: number, num: number) => {
    for (let x = 0; x <= 8; x++) if (board[row][x] === num) return false;
    for (let x = 0; x <= 8; x++) if (board[x][col] === num) return false;
    let startRow = row - row % 3, startCol = col - col % 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[i + startRow][j + startCol] === num) return false;
      }
    }
    return true;
  };

  const fillBox = (board: number[][], rowStart: number, colStart: number) => {
    let num;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        do {
          num = Math.floor(Math.random() * 9) + 1;
        } while (!isValid(board, rowStart + i, colStart + j, num));
        board[rowStart + i][colStart + j] = num;
      }
    }
  };

  const fillRemaining = (board: number[][], i: number, j: number): boolean => {
    if (j >= 9 && i < 8) {
      i = i + 1;
      j = 0;
    }
    if (i >= 9 && j >= 9) return true;
    if (i < 3) {
      if (j < 3) j = 3;
    } else if (i < 6) {
      if (j === (i - i % 3)) j = j + 3;
    } else {
      if (j === 6) {
        i = i + 1;
        j = 0;
        if (i >= 9) return true;
      }
    }

    for (let num = 1; num <= 9; num++) {
      if (isValid(board, i, j, num)) {
        board[i][j] = num;
        if (fillRemaining(board, i, j + 1)) return true;
        board[i][j] = 0;
      }
    }
    return false;
  };

  // Generate complete board
  fillBox(board, 0, 0);
  fillBox(board, 3, 3);
  fillBox(board, 6, 6);
  fillRemaining(board, 0, 3);

  // Copy solution
  const solution = board.map(row => [...row]);

  // Remove cells based on level (level 1: remove 30, level 2: 40, level 3: 50, etc)
  const cellsToRemove = Math.min(25 + level * 5, 60); 
  let count = cellsToRemove;
  while (count !== 0) {
    let cellId = Math.floor(Math.random() * 81);
    let i = Math.floor(cellId / 9);
    let j = cellId % 9;
    if (board[i][j] !== 0) {
      board[i][j] = 0;
      count--;
    }
  }

  // Create initialBoard mask
  const initialBoard: boolean[][] = board.map(row => row.map(cell => cell !== 0));

  return { board, solution, initialBoard };
}

export function createSudokuState(players: string[]): SudokuState {
  const { board, solution, initialBoard } = generateSudoku(1);
  return {
    phase: 'countdown',
    level: 1,
    board,
    solution,
    initialBoard,
    hintsRemaining: 3,
    moves: 0,
    mistakes: 0,
    startedAt: null,
    completedAt: null,
  };
}

export function handleSudokuAction(state: SudokuState, playerId: string, action: any): SudokuState {
  if (action.type === 'START' && state.phase === 'countdown') {
    return { ...state, phase: 'playing', startedAt: Date.now() };
  }

  if (state.phase !== 'playing' && action.type !== 'NEXT_LEVEL') return state;

  if (action.type === 'INPUT') {
    const { row, col, value } = action.payload; // value can be 0 (clear) or 1-9
    
    if (state.initialBoard[row][col]) return state; // Cannot edit initial cells

    const newBoard = state.board.map(r => [...r]);
    newBoard[row][col] = value;

    let mistakes = state.mistakes;
    if (value !== 0 && value !== state.solution[row][col]) {
      mistakes += 1;
    }

    // Check win condition
    let isComplete = true;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (newBoard[r][c] !== state.solution[r][c]) {
          isComplete = false;
        }
      }
    }

    return {
      ...state,
      board: newBoard,
      moves: state.moves + 1,
      mistakes,
      phase: isComplete ? 'result' : 'playing',
      completedAt: isComplete ? Date.now() : null,
    };
  }

  if (action.type === 'HINT') {
    if (state.hintsRemaining <= 0) return state;

    // Find an empty or incorrect cell and fill it with the correct solution
    let emptyCells = [];
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (!state.initialBoard[r][c] && state.board[r][c] !== state.solution[r][c]) {
          emptyCells.push({ r, c });
        }
      }
    }

    if (emptyCells.length === 0) return state; // Already complete somehow

    const target = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newBoard = state.board.map(row => [...row]);
    newBoard[target.r][target.c] = state.solution[target.r][target.c];

    // Check win condition again
    let isComplete = true;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (newBoard[r][c] !== state.solution[r][c]) {
          isComplete = false;
        }
      }
    }

    // Also mark it as initial so players don't accidentally clear it? Or just leave it editable.
    const newInitialBoard = state.initialBoard.map(row => [...row]);
    newInitialBoard[target.r][target.c] = true;

    return {
      ...state,
      board: newBoard,
      initialBoard: newInitialBoard,
      hintsRemaining: state.hintsRemaining - 1,
      phase: isComplete ? 'result' : 'playing',
      completedAt: isComplete ? Date.now() : null,
    };
  }

  if (action.type === 'NEXT_LEVEL' && state.phase === 'result') {
    const nextLevel = state.level + 1;
    const { board, solution, initialBoard } = generateSudoku(nextLevel);
    return {
      ...state,
      phase: 'playing',
      level: nextLevel,
      board,
      solution,
      initialBoard,
      hintsRemaining: 3, // reset hints
      moves: 0,
      mistakes: 0,
      startedAt: Date.now(),
      completedAt: null,
    };
  }

  return state;
}
