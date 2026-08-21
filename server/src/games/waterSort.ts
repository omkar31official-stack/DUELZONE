import { WaterSortState } from '../../../shared/types';

const COLORS = [
  '#ef4444', // red
  '#3b82f6', // blue
  '#22c55e', // green
  '#eab308', // yellow
  '#a855f7', // purple
];

// Helper to shuffle array
function shuffle<T>(array: T[]): T[] {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

export function createWaterSortState(players: string[]): WaterSortState {
  const numColors = 5;
  const numFullTubes = 5;
  const numEmptyTubes = 2;
  const tubeCapacity = 4;

  // Create an array of 20 colors (4 of each of the 5 colors)
  let allLiquids: string[] = [];
  for (let i = 0; i < numColors; i++) {
    for (let j = 0; j < tubeCapacity; j++) {
      allLiquids.push(COLORS[i]);
    }
  }

  // Shuffle them
  allLiquids = shuffle(allLiquids);

  // Fill the first 5 tubes
  const tubes: string[][] = [];
  for (let i = 0; i < numFullTubes; i++) {
    const tube = allLiquids.splice(0, tubeCapacity);
    tubes.push(tube);
  }

  // Add empty tubes
  for (let i = 0; i < numEmptyTubes; i++) {
    tubes.push([]);
  }

  return {
    phase: 'countdown',
    tubes,
    tubeCapacity,
    moves: 0,
    startedAt: null,
    completedAt: null,
    selectedTubeIndex: null,
    selectedByPlayer: null,
  };
}

// Check if all tubes are either empty or full of a single color
function checkWinCondition(tubes: string[][], capacity: number): boolean {
  for (const tube of tubes) {
    if (tube.length === 0) continue; // Empty tube is fine
    if (tube.length !== capacity) return false; // Must be full
    
    // Check if all colors in this tube are the same
    const firstColor = tube[0];
    if (tube.some(color => color !== firstColor)) {
      return false; // Mixed tube
    }
  }
  return true; // All tubes are either empty or perfectly sorted
}

export function handleWaterSortAction(state: WaterSortState, playerId: string, action: any): WaterSortState {
  if (action.type === 'START' && state.phase === 'countdown') {
    return { ...state, phase: 'playing', startedAt: Date.now() };
  }

  if (state.phase !== 'playing') return state;

  if (action.type === 'SELECT') {
    const { index } = action.payload; // The tube clicked
    
    if (state.selectedTubeIndex === null) {
      // Trying to select a tube to pour FROM
      const tube = state.tubes[index];
      if (tube.length === 0) {
        // Can't pour from an empty tube
        return state;
      }
      return {
        ...state,
        selectedTubeIndex: index,
        selectedByPlayer: playerId,
      };
    } else if (state.selectedTubeIndex === index) {
      // Clicked the same tube again -> deselect
      return {
        ...state,
        selectedTubeIndex: null,
        selectedByPlayer: null,
      };
    } else {
      // Trying to pour INTO tube 'index' from 'selectedTubeIndex'
      const fromIndex = state.selectedTubeIndex;
      const toIndex = index;

      const fromTube = [...state.tubes[fromIndex]];
      const toTube = [...state.tubes[toIndex]];

      // Can we pour?
      if (fromTube.length === 0) {
        // Nothing to pour (shouldn't happen, but just in case)
        return { ...state, selectedTubeIndex: null, selectedByPlayer: null };
      }

      if (toTube.length >= state.tubeCapacity) {
        // Target is full
        return { ...state, selectedTubeIndex: null, selectedByPlayer: null };
      }

      const topColorFrom = fromTube[fromTube.length - 1];
      const topColorTo = toTube.length > 0 ? toTube[toTube.length - 1] : null;

      if (topColorTo !== null && topColorTo !== topColorFrom) {
        // Can only pour onto the same color (or empty tube)
        return { ...state, selectedTubeIndex: null, selectedByPlayer: null };
      }

      // Valid move! We can pour
      // Optimization: Pour all consecutive liquid of the same color if it fits
      let pouredCount = 0;
      while (
        fromTube.length > 0 &&
        fromTube[fromTube.length - 1] === topColorFrom &&
        toTube.length < state.tubeCapacity
      ) {
        toTube.push(fromTube.pop() as string);
        pouredCount++;
      }

      const newTubes = [...state.tubes];
      newTubes[fromIndex] = fromTube;
      newTubes[toIndex] = toTube;

      const isComplete = checkWinCondition(newTubes, state.tubeCapacity);

      return {
        ...state,
        tubes: newTubes,
        moves: state.moves + 1,
        selectedTubeIndex: null,
        selectedByPlayer: null,
        phase: isComplete ? 'result' : 'playing',
        completedAt: isComplete ? Date.now() : null,
      };
    }
  }

  return state;
}
