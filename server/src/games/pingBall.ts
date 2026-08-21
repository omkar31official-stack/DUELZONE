import { QUICK_TAP_DURATION_MS } from '../../../shared/constants';

export interface PingBallState { phase: 'countdown' | 'playing' | 'result'; scores: Record<string, number>; endTime: number | null; winner: string | null; }

export function createPingBallState(players: string[]): PingBallState {
  const scores: Record<string, number> = {};
  players.forEach((p) => { scores[p] = 0; });
  return { phase: 'countdown', scores, endTime: null, winner: null };
}

export function handlePingBallAction(state: PingBallState, player: string, action: any): PingBallState {
  if (action.type === 'START') return { ...state, phase: 'playing', endTime: Date.now() + QUICK_TAP_DURATION_MS };
  if (action.type === 'BOUNCE' && state.phase === 'playing') {
    const newScores = { ...state.scores, [player]: (state.scores[player] || 0) + 1 };
    return { ...state, scores: newScores };
  }
  if (action.type === 'FINISH') {
    let winner = null; let max = -1;
    for (const [p, s] of Object.entries(state.scores)) { if (s > max) { max = s; winner = p; } else if (s === max) winner = null; }
    return { ...state, phase: 'result', winner };
  }
  return state;
}
