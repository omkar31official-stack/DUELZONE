import { CoopPuzzleState } from '../../../shared/types';

const PUZZLE_IMAGES = [
  'https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&q=80&w=600&h=600',
  'https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&q=80&w=600&h=600',
  'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?auto=format&fit=crop&q=80&w=600&h=600',
  'https://images.unsplash.com/photo-1506744626753-eda8151a1571?auto=format&fit=crop&q=80&w=600&h=600',
  'https://images.unsplash.com/photo-1533450718592-29d45635f0a9?auto=format&fit=crop&q=80&w=600&h=600',
  'https://images.unsplash.com/photo-1516117172878-fd2c41f4a759?auto=format&fit=crop&q=80&w=600&h=600',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=600&h=600', // Mountains
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=600&h=600', // Nature
  'https://images.unsplash.com/photo-1494548162494-384bba4ab999?auto=format&fit=crop&q=80&w=600&h=600', // Sunrise
  'https://images.unsplash.com/photo-1444464666168-49b626d013e2?auto=format&fit=crop&q=80&w=600&h=600', // Bird
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600&h=600', // Beach
  'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?auto=format&fit=crop&q=80&w=600&h=600', // Sunset
  'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&q=80&w=600&h=600', // Forest
  'https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&q=80&w=600&h=600', // Waterfall
  'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&q=80&w=600&h=600', // Landscape
  'https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&q=80&w=600&h=600', // Yosemite
  'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&q=80&w=600&h=600', // Tree
  'https://images.unsplash.com/photo-1490682143684-14369e18dce8?auto=format&fit=crop&q=80&w=600&h=600', // Abstract
  'https://images.unsplash.com/photo-1534081333815-ae5019106622?auto=format&fit=crop&q=80&w=600&h=600', // Space
  'https://images.unsplash.com/photo-1445905595283-21f8ae8a33d2?auto=format&fit=crop&q=80&w=600&h=600', // Nebula
  'https://images.unsplash.com/photo-1538370965046-79c0d6907d47?auto=format&fit=crop&q=80&w=600&h=600', // Galaxy
];

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

  const imageUrl = PUZZLE_IMAGES[Math.floor(Math.random() * PUZZLE_IMAGES.length)];

  return {
    phase: 'countdown',
    gridSize,
    pieces,
    imageUrl,
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
