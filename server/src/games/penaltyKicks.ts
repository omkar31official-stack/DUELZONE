import { GameAction } from '../../../shared/types';

export interface PenaltyKicksState {
  scores: Record<string, number>;
  strikerId: string;
  keeperId: string;
  kickTarget: { x: number; y: number } | null;
  keeperJump: { x: number; y: number } | null;
  round: number;
  winner: string | null;
}

export function createPenaltyKicksState(players: [string, string]): PenaltyKicksState {
  return {
    scores: { [players[0]]: 0, [players[1]]: 0 },
    strikerId: players[0],
    keeperId: players[1],
    kickTarget: null,
    keeperJump: null,
    round: 1,
    winner: null,
  };
}

export function handlePenaltyKicksAction(state: PenaltyKicksState, playerId: string, action: GameAction): PenaltyKicksState | null {
  if (state.winner) return null;
  const pKeys = Object.keys(state.scores);
  if (!pKeys.includes(playerId)) return null;

  if (action.type === 'AIM_KICK' && playerId === state.strikerId) {
    const { x, y } = action.payload as { x: number; y: number };
    return { ...state, kickTarget: { x, y } };
  }

  if (action.type === 'JUMP_KEEPER' && playerId === state.keeperId) {
    const { x, y } = action.payload as { x: number; y: number };
    return { ...state, keeperJump: { x, y } };
  }

  if (action.type === 'RESOLVE_KICK') {
    if (!state.kickTarget || !state.keeperJump) return null;
    const dx = Math.abs(state.kickTarget.x - state.keeperJump.x);
    const dy = Math.abs(state.kickTarget.y - state.keeperJump.y);
    const saved = dx < 0.2 && dy < 0.2;

    const scores = { ...state.scores };
    if (!saved) {
      scores[state.strikerId] = (scores[state.strikerId] || 0) + 1;
    }

    const nextRound = state.round + 1;
    const winner = nextRound > 6 ? (scores[pKeys[0]] > scores[pKeys[1]] ? pKeys[0] : pKeys[1]) : null;

    return {
      ...state,
      scores,
      strikerId: state.keeperId,
      keeperId: state.strikerId,
      kickTarget: null,
      keeperJump: null,
      round: nextRound,
      winner,
    };
  }

  return null;
}
