import { QUICK_TAP_DURATION_MS } from '../../../shared/constants';

export interface ChainReactionState { phase: 'countdown' | 'playing' | 'result'; scores: Record<string, number>; endTime: number | null; winner: string | null; cells: Record<number, string>; }

export function createChainReactionState(players: string[]): ChainReactionState {
  const scores: Record<string, number> = {};
  players.forEach((p) => { scores[p] = 0; });
  return { phase: 'countdown', scores, endTime: null, winner: null, cells: {} };
}

export function handleChainReactionAction(state: ChainReactionState, player: string, action: any): ChainReactionState {
  if (action.type === 'START') return { ...state, phase: 'playing', endTime: Date.now() + QUICK_TAP_DURATION_MS };
  if (action.type === 'CLAIM' && state.phase === 'playing') {
    const cellId = action.payload?.cellId;
    if (cellId !== undefined) {
      const newCells = { ...state.cells, [cellId]: player };
      const newScores = { ...state.scores, [player]: (state.scores[player] || 0) + 1 };
      return { ...state, cells: newCells, scores: newScores };
    }
  }
  if (action.type === 'FINISH') {
    let winner = null; let max = -1;
    for (const [p, s] of Object.entries(state.scores)) { if (s > max) { max = s; winner = p; } else if (s === max) winner = null; }
    return { ...state, phase: 'result', winner };
  }
  return state;
}
