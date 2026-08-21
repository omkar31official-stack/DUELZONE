import { Game2048State } from '../../../shared/types';

// Helper to spawn a new tile (2 or 4) on an empty spot
function spawnTile(board: number[][]): boolean {
  const emptyCells = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (board[r][c] === 0) emptyCells.push({ r, c });
    }
  }

  if (emptyCells.length === 0) return false;

  const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  board[r][c] = Math.random() < 0.9 ? 2 : 4;
  return true;
}

export function createGame2048State(players: string[]): Game2048State {
  const board = Array.from({ length: 4 }, () => Array(4).fill(0));
  spawnTile(board);
  spawnTile(board);

  return {
    phase: 'countdown',
    board,
    score: 0,
    bestScore: 0,
    moves: 0,
    startedAt: null,
    completedAt: null,
    lastMoveByPlayer: null,
    lastMoveDirection: null,
  };
}

function checkGameOver(board: number[][]): boolean {
  // If there are empty cells, not over
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (board[r][c] === 0) return false;
    }
  }

  // Check horizontally and vertically for adjacent matches
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (c < 3 && board[r][c] === board[r][c + 1]) return false;
      if (r < 3 && board[r][c] === board[r + 1][c]) return false;
    }
  }

  return true;
}

function moveLeft(board: number[][]): { newBoard: number[][], scoreAdded: number, moved: boolean } {
  let moved = false;
  let scoreAdded = 0;
  const newBoard = Array.from({ length: 4 }, () => Array(4).fill(0));

  for (let r = 0; r < 4; r++) {
    let writeIdx = 0;
    let lastValue = 0;
    for (let c = 0; c < 4; c++) {
      let val = board[r][c];
      if (val !== 0) {
        if (lastValue === 0) {
          lastValue = val;
        } else if (lastValue === val) {
          newBoard[r][writeIdx++] = val * 2;
          scoreAdded += val * 2;
          lastValue = 0;
          moved = true;
        } else {
          newBoard[r][writeIdx++] = lastValue;
          lastValue = val;
        }
      }
    }
    if (lastValue !== 0) {
      newBoard[r][writeIdx++] = lastValue;
    }
    
    // Check if row changed
    for (let c = 0; c < 4; c++) {
      if (newBoard[r][c] !== board[r][c]) moved = true;
    }
  }

  return { newBoard, scoreAdded, moved };
}

function rotateBoard(board: number[][]): number[][] {
  const newBoard = Array.from({ length: 4 }, () => Array(4).fill(0));
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      newBoard[c][3 - r] = board[r][c];
    }
  }
  return newBoard;
}

export function handleGame2048Action(state: Game2048State, playerId: string, action: any): Game2048State {
  if (action.type === 'START' && state.phase === 'countdown') {
    return { ...state, phase: 'playing', startedAt: Date.now() };
  }

  if (action.type === 'MOVE') {
    if (state.phase !== 'playing' && state.phase !== 'won') return state;
    
    const { direction } = action.payload; // 'left', 'right', 'up', 'down'
    let currentBoard = state.board.map(r => [...r]);
    
    // Rotate to make all moves "left" moves internally
    let rotations = 0;
    if (direction === 'up') rotations = 3;
    else if (direction === 'right') rotations = 2;
    else if (direction === 'down') rotations = 1;

    for (let i = 0; i < rotations; i++) currentBoard = rotateBoard(currentBoard);

    const { newBoard, scoreAdded, moved } = moveLeft(currentBoard);
    
    if (!moved) return state; // Invalid move

    currentBoard = newBoard;
    // Rotate back
    for (let i = 0; i < (4 - rotations) % 4; i++) currentBoard = rotateBoard(currentBoard);

    spawnTile(currentBoard);
    
    const isOver = checkGameOver(currentBoard);
    const has2048 = currentBoard.some(row => row.includes(2048));

    let nextPhase: Game2048State['phase'] = state.phase;
    if (has2048 && state.phase !== 'won') {
      nextPhase = 'won';
    } else if (isOver) {
      nextPhase = 'gameover';
    }

    const newScore = state.score + scoreAdded;
    const newBest = Math.max(state.bestScore, newScore);

    return {
      ...state,
      board: currentBoard,
      score: newScore,
      bestScore: newBest,
      moves: state.moves + 1,
      lastMoveByPlayer: playerId,
      lastMoveDirection: direction,
      phase: nextPhase as any,
      completedAt: isOver || (has2048 && state.phase !== 'won') ? Date.now() : null,
    };
  }
  
  if (action.type === 'CONTINUE' && state.phase === 'won') {
    // Keep playing after reaching 2048
    return { ...state, phase: 'playing', completedAt: null };
  }
  
  if (action.type === 'RESTART' && (state.phase === 'gameover' || state.phase === 'won')) {
    const board = Array.from({ length: 4 }, () => Array(4).fill(0));
    spawnTile(board);
    spawnTile(board);

    return {
      phase: 'playing',
      board,
      score: 0,
      bestScore: state.bestScore,
      moves: 0,
      startedAt: Date.now(),
      completedAt: null,
      lastMoveByPlayer: null,
      lastMoveDirection: null,
    };
  }

  return state;
}
