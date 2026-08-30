import { GameAction } from '../../../shared/types';

export interface SpinnerBattleState {
  scores: Record<string, number>;
  spinners: Record<string, { x: number; y: number; vx: number; vy: number; radius: number }>;
  winner: string | null;
  targetScore: number;
}

export function createSpinnerBattleState(players: [string, string]): SpinnerBattleState {
  return {
    scores: { [players[0]]: 0, [players[1]]: 0 },
    spinners: {
      [players[0]]: { x: 0.35, y: 0.5, vx: 0, vy: 0, radius: 0.08 },
      [players[1]]: { x: 0.65, y: 0.5, vx: 0, vy: 0, radius: 0.08 },
    },
    winner: null,
    targetScore: 3,
  };
}

export function handleSpinnerBattleAction(state: SpinnerBattleState, playerId: string, action: GameAction): SpinnerBattleState | null {
  if (state.winner) return null;
  const pKeys = Object.keys(state.scores);
  if (!pKeys.includes(playerId)) return null;

  if (action.type === 'BOOST') {
    const { angle, power } = action.payload as { angle: number; power: number };
    if (typeof angle !== 'number' || typeof power !== 'number') return null;
    const force = Math.min(0.04, Math.max(0.01, power));
    const current = state.spinners[playerId];
    if (!current) return null;

    return {
      ...state,
      spinners: {
        ...state.spinners,
        [playerId]: {
          ...current,
          vx: current.vx + Math.cos(angle) * force,
          vy: current.vy + Math.sin(angle) * force,
        },
      },
    };
  }

  if (action.type === 'KNOCKOUT') {
    const knockedOutPlayer = (action.payload as { playerId: string })?.playerId;
    if (!pKeys.includes(knockedOutPlayer)) return null;
    const victor = pKeys.find(p => p !== knockedOutPlayer)!;
    const scores = { ...state.scores, [victor]: (state.scores[victor] || 0) + 1 };
    const winner = scores[victor] >= state.targetScore ? victor : null;

    return {
      ...state,
      scores,
      winner,
      spinners: {
        [pKeys[0]]: { x: 0.35, y: 0.5, vx: 0, vy: 0, radius: 0.08 },
        [pKeys[1]]: { x: 0.65, y: 0.5, vx: 0, vy: 0, radius: 0.08 },
      },
    };
  }

  return null;
}
