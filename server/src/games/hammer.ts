import { QUICK_TAP_DURATION_MS } from '../../../shared/constants';

export interface HammerState {
  phase: 'countdown' | 'playing' | 'result';
  scores: Record<string, number>;
  activeHoleIndex: number | null;
  endTime: number | null;
  winner: string | null;
}

export function createHammerState(players: string[]): HammerState {
  const scores: Record<string, number> = {};
  players.forEach((p) => { scores[p] = 0; });
  return {
    phase: 'countdown',
    scores,
    activeHoleIndex: null,
    endTime: null,
    winner: null,
  };
}

export function handleHammerAction(state: HammerState, player: string, action: any): HammerState {
  if (action.type === 'START') {
    return {
      ...state,
      phase: 'playing',
      endTime: Date.now() + QUICK_TAP_DURATION_MS,
      activeHoleIndex: Math.floor(Math.random() * 9),
    };
  }

  if (action.type === 'SMASH') {
    if (state.phase !== 'playing') return state;
    if (state.endTime && Date.now() > state.endTime) return state;

    const holeIndex = action.payload?.holeIndex;
    if (holeIndex !== undefined && holeIndex === state.activeHoleIndex) {
      // Player hit the active target
      const newScores = { ...state.scores, [player]: (state.scores[player] || 0) + 1 };
      
      // Select new hole that is different from current
      let newHole = Math.floor(Math.random() * 9);
      while (newHole === holeIndex) newHole = Math.floor(Math.random() * 9);

      return {
        ...state,
        scores: newScores,
        activeHoleIndex: newHole,
      };
    }
  }

  if (action.type === 'FINISH') {
    if (state.phase === 'result') return state;
    let winner = null;
    let max = -1;
    for (const [p, s] of Object.entries(state.scores)) {
      if (s > max) {
        max = s;
        winner = p;
      } else if (s === max) {
        winner = null; // Tie
      }
    }
    return {
      ...state,
      phase: 'result',
      activeHoleIndex: null,
      winner,
    };
  }

  return state;
}
