


export interface KnifeThrowerState {
  phase: 'countdown' | 'playing' | 'result';
  scores: Record<string, number>;
  winner: string | null;
}

export function createKnifeThrowerState(players: string[]): KnifeThrowerState {
  const scores: Record<string, number> = {};
  players.forEach((p) => { scores[p] = 0; });
  return {
    phase: 'countdown',
    scores,
    winner: null,
  };
}

export function handleKnifeThrowerAction(state: KnifeThrowerState, player: string, action: any): KnifeThrowerState {
  if (action.type === 'START') {
    return { ...state, phase: 'playing' };
  }

  if (action.type === 'THROW') {
    if (state.phase !== 'playing') return state;
    const hit = action.payload?.hit;

    if (hit) {
      const newScores = { ...state.scores, [player]: (state.scores[player] || 0) + 1 };
      let winner = null;
      if (newScores[player] >= 10) {
        winner = player;
      }
      return {
        ...state,
        scores: newScores,
        phase: winner ? 'result' : 'playing',
        winner,
      };
    } else {
      // Missed! Optional: penalty? Let's just do no points.
      return state;
    }
  }

  return state;
}
