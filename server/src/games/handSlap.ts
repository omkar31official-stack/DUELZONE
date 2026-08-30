import { GameAction } from '../../../shared/types';

export interface HandSlapState {
  scores: Record<string, number>;
  attackerId: string;
  phase: 'ready' | 'slapped' | 'dodged' | 'round_over';
  winner: string | null;
  round: number;
}

export function createHandSlapState(players: [string, string]): HandSlapState {
  return {
    scores: { [players[0]]: 0, [players[1]]: 0 },
    attackerId: players[0],
    phase: 'ready',
    winner: null,
    round: 1,
  };
}

export function handleHandSlapAction(state: HandSlapState, playerId: string, action: GameAction): HandSlapState | null {
  if (state.winner) return null;
  const pKeys = Object.keys(state.scores);
  if (!pKeys.includes(playerId)) return null;

  if (action.type === 'SLAP' && playerId === state.attackerId && state.phase === 'ready') {
    const defenderId = pKeys.find(p => p !== playerId)!;
    const scores = { ...state.scores, [playerId]: (state.scores[playerId] || 0) + 1 };
    const winner = scores[playerId] >= 5 ? playerId : null;

    return {
      ...state,
      phase: 'slapped',
      scores,
      winner,
      attackerId: defenderId,
    };
  }

  if (action.type === 'DODGE' && playerId !== state.attackerId && state.phase === 'ready') {
    return {
      ...state,
      phase: 'dodged',
      attackerId: playerId, // Defender dodged successfully, gets to attack next!
    };
  }

  if (action.type === 'RESET_ROUND') {
    return {
      ...state,
      phase: 'ready',
      round: state.round + 1,
    };
  }

  return null;
}
