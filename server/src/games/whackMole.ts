import { GameAction } from '../../../shared/types';

export interface WhackMoleState {
  scores: Record<string, number>;
  activeMoleIndex: number;
  winner: string | null;
  round: number;
  maxRounds: number;
}

export function createWhackMoleState(players: [string, string]): WhackMoleState {
  return {
    scores: { [players[0]]: 0, [players[1]]: 0 },
    activeMoleIndex: Math.floor(Math.random() * 9),
    winner: null,
    round: 1,
    maxRounds: 15,
  };
}

export function handleWhackMoleAction(state: WhackMoleState, playerId: string, action: GameAction): WhackMoleState | null {
  if (state.winner) return null;
  const pKeys = Object.keys(state.scores);
  if (!pKeys.includes(playerId)) return null;

  if (action.type === 'WHACK') {
    const index = (action.payload as { index: number })?.index;
    if (typeof index !== 'number') return null;

    if (index === state.activeMoleIndex) {
      const scores = { ...state.scores, [playerId]: (state.scores[playerId] || 0) + 1 };
      const nextRound = state.round + 1;
      const winner = nextRound > state.maxRounds ? (scores[pKeys[0]] > scores[pKeys[1]] ? pKeys[0] : pKeys[1]) : null;

      return {
        ...state,
        scores,
        round: nextRound,
        activeMoleIndex: Math.floor(Math.random() * 9),
        winner,
      };
    }
  }

  return null;
}
