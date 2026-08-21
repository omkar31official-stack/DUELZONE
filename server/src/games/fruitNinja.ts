import { QUICK_TAP_DURATION_MS } from '../../../shared/constants';

export interface FruitNinjaState { phase: 'countdown' | 'playing' | 'result'; scores: Record<string, number>; endTime: number | null; winner: string | null; activeFruit: number | null; }

export function createFruitNinjaState(players: string[]): FruitNinjaState {
  const scores: Record<string, number> = {};
  players.forEach((p) => { scores[p] = 0; });
  return { phase: 'countdown', scores, endTime: null, winner: null, activeFruit: null };
}

export function handleFruitNinjaAction(state: FruitNinjaState, player: string, action: any): FruitNinjaState {
  if (action.type === 'START') return { ...state, phase: 'playing', endTime: Date.now() + QUICK_TAP_DURATION_MS, activeFruit: Math.floor(Math.random() * 5) };
  if (action.type === 'SLASH' && state.phase === 'playing') {
    if (action.payload?.fruitId === state.activeFruit) {
      const newScores = { ...state.scores, [player]: (state.scores[player] || 0) + 1 };
      return { ...state, scores: newScores, activeFruit: Math.floor(Math.random() * 5) };
    }
  }
  if (action.type === 'FINISH') {
    let winner = null; let max = -1;
    for (const [p, s] of Object.entries(state.scores)) { if (s > max) { max = s; winner = p; } else if (s === max) winner = null; }
    return { ...state, phase: 'result', winner, activeFruit: null };
  }
  return state;
}
