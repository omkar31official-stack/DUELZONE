import { CoopPuzzleState } from '../../../shared/types';

// Let's use a nice default image for the puzzle
const DEFAULT_IMAGE_URL = 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&q=80&w=600&h=600';

export function createCoopPuzzleState(players: string[]): CoopPuzzleState {
  const gridSize = 3;
  const numPieces = gridSize * gridSize;
  
  // Create an array of pieces [0, 1, 2, ..., 8] and shuffle it
  let pieces = Array.from({ length: numPieces }, (_, i) => i);
  
  // Simple Fisher-Yates shuffle that ensures the puzzle is scrambled
  let isSorted = true;
  while (isSorted) {
    for (let i = pieces.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
    }
    
    isSorted = pieces.every((p, i) => p === i);
  }

  return {
    phase: 'countdown',
    gridSize,
    pieces,
    imageUrl: DEFAULT_IMAGE_URL,
    moves: 0,
    startedAt: null,
    completedAt: null,
    selectedPieceIndex: null,
    selectedByPlayer: null,
  };
}

export function handleCoopPuzzleAction(state: CoopPuzzleState, playerId: string, action: any): CoopPuzzleState {
  if (action.type === 'START' && state.phase === 'countdown') {
    return { ...state, phase: 'playing', startedAt: Date.now() };
  }

  if (state.phase !== 'playing') return state;

  if (action.type === 'SELECT') {
    const { index } = action.payload; // the grid index clicked
    
    // If someone already selected a piece, we swap!
    if (state.selectedPieceIndex !== null && state.selectedPieceIndex !== index) {
      const newPieces = [...state.pieces];
      const temp = newPieces[state.selectedPieceIndex];
      newPieces[state.selectedPieceIndex] = newPieces[index];
      newPieces[index] = temp;
      
      const isComplete = newPieces.every((p, i) => p === i);
      
      return {
        ...state,
        pieces: newPieces,
        moves: state.moves + 1,
        selectedPieceIndex: null,
        selectedByPlayer: null,
        phase: isComplete ? 'result' : 'playing',
        completedAt: isComplete ? Date.now() : null,
      };
    } else if (state.selectedPieceIndex === index) {
      // Deselect if clicking the same piece
      return {
        ...state,
        selectedPieceIndex: null,
        selectedByPlayer: null,
      };
    } else {
      // Select the piece
      return {
        ...state,
        selectedPieceIndex: index,
        selectedByPlayer: playerId,
      };
    }
  }

  return state;
}
