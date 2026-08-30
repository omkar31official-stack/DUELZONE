import { GameAction } from '../../../shared/types';

export interface AirHockeyState {
  scores: Record<string, number>;
  puck: { x: number; y: number; vx: number; vy: number };
  mallets: Record<string, { x: number; y: number }>;
  winner: string | null;
  targetScore: number;
}

export function createAirHockeyState(players: [string, string]): AirHockeyState {
  return {
    scores: { [players[0]]: 0, [players[1]]: 0 },
    puck: { x: 0.5, y: 0.5, vx: 0, vy: 0 },
    mallets: {
      [players[0]]: { x: 0.5, y: 0.15 },
      [players[1]]: { x: 0.5, y: 0.85 },
    },
    winner: null,
    targetScore: 5,
  };
}

export function handleAirHockeyAction(state: AirHockeyState, playerId: string, action: GameAction): AirHockeyState | null {
  if (state.winner) return null;
  const pKeys = Object.keys(state.scores);
  if (!pKeys.includes(playerId)) return null;

  if (action.type === 'MOVE_MALLET') {
    const { x, y } = action.payload as { x: number; y: number };
    if (typeof x !== 'number' || typeof y !== 'number') return null;

    const isTopPlayer = playerId === pKeys[0];
    const clampedX = Math.max(0.1, Math.min(0.9, x));
    const clampedY = isTopPlayer ? Math.max(0.08, Math.min(0.45, y)) : Math.max(0.55, Math.min(0.92, y));

    return {
      ...state,
      mallets: {
        ...state.mallets,
        [playerId]: { x: clampedX, y: clampedY },
      },
    };
  }

  if (action.type === 'STRIKE_PUCK') {
    const { vx, vy } = action.payload as { vx: number; vy: number };
    if (typeof vx !== 'number' || typeof vy !== 'number') return null;
    return {
      ...state,
      puck: {
        ...state.puck,
        vx: Math.max(-0.03, Math.min(0.03, vx)),
        vy: Math.max(-0.03, Math.min(0.03, vy)),
      },
    };
  }

  if (action.type === 'GOAL') {
    const scorerId = (action.payload as { scorerId: string })?.scorerId;
    if (!pKeys.includes(scorerId)) return null;
    const scores = { ...state.scores, [scorerId]: (state.scores[scorerId] || 0) + 1 };
    const winner = scores[scorerId] >= state.targetScore ? scorerId : null;
    return {
      ...state,
      scores,
      winner,
      puck: { x: 0.5, y: 0.5, vx: 0, vy: 0 },
    };
  }

  return null;
}
