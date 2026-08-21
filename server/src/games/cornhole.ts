import { QUICK_TAP_DURATION_MS } from '../../../shared/constants';

export interface CornholeState { phase: 'countdown' | 'playing' | 'result'; scores: Record<string, number>; endTime: number | null; winner: string | null; }

export function createCornholeState(players: string[]): CornholeState {
  const scores: Record<string, number> = {};
  players.forEach((p) => { scores[p] = 0; });
  return { phase: 'countdown', scores, endTime: null, winner: null };
}

export function handleCornholeAction(state: CornholeState, player: string, action: any): CornholeState {
  if (action.type === 'START') return { ...state, phase: 'playing', endTime: Date.now() + QUICK_TAP_DURATION_MS };
  if (action.type === 'TOSS' && state.phase === 'playing') {
    const points = action.payload?.points || 0;
    const newScores = { ...state.scores, [player]: (state.scores[player] || 0) + points };
    return { ...state, scores: newScores };
  }
  if (action.type === 'FINISH') {
    let winner = null; let max = -1;
    for (const [p, s] of Object.entries(state.scores)) { if (s > max) { max = s; winner = p; } else if (s === max) winner = null; }
    return { ...state, phase: 'result', winner };
  }
  return state;
}
