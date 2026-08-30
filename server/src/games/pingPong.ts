import { GameAction } from '../../../shared/types';

export interface PingPongState {
  scores: Record<string, number>;
  ball: { x: number; y: number; vx: number; vy: number };
  paddles: Record<string, number>; // y position 0-1
  winner: string | null;
  targetScore: number;
}

export function createPingPongState(players: [string, string]): PingPongState {
  return {
    scores: { [players[0]]: 0, [players[1]]: 0 },
    ball: { x: 0.5, y: 0.5, vx: 0.012 * (Math.random() > 0.5 ? 1 : -1), vy: (Math.random() - 0.5) * 0.01 },
    paddles: { [players[0]]: 0.5, [players[1]]: 0.5 },
    winner: null,
    targetScore: 5,
  };
}

export function handlePingPongAction(state: PingPongState, playerId: string, action: GameAction): PingPongState | null {
  if (state.winner) return null;
  const pKeys = Object.keys(state.scores);
  if (!pKeys.includes(playerId)) return null;

  if (action.type === 'MOVE_PADDLE') {
    const y = Number((action.payload as { y: number })?.y);
    if (isNaN(y)) return null;
    const clampedY = Math.max(0.1, Math.min(0.9, y));
    return {
      ...state,
      paddles: {
        ...state.paddles,
        [playerId]: clampedY,
      },
    };
  }

  if (action.type === 'TICK') {
    // Ball physics step
    let { x, y, vx, vy } = state.ball;
    x += vx;
    y += vy;

    // Bounce top/bottom
    if (y <= 0.05 || y >= 0.95) {
      vy = -vy;
      y = y <= 0.05 ? 0.05 : 0.95;
    }

    const p1 = pKeys[0];
    const p2 = pKeys[1];
    const p1Y = state.paddles[p1] ?? 0.5;
    const p2Y = state.paddles[p2] ?? 0.5;

    // Check left paddle hit (x <= 0.08)
    if (x <= 0.08 && x >= 0.04) {
      if (Math.abs(y - p1Y) <= 0.15) {
        vx = Math.abs(vx) * 1.05;
        vy = (y - p1Y) * 0.03;
        x = 0.08;
      }
    }

    // Check right paddle hit (x >= 0.92)
    if (x >= 0.92 && x <= 0.96) {
      if (Math.abs(y - p2Y) <= 0.15) {
        vx = -Math.abs(vx) * 1.05;
        vy = (y - p2Y) * 0.03;
        x = 0.92;
      }
    }

    let winner = state.winner;
    const scores = { ...state.scores };

    // Goal scored
    if (x < 0.01) {
      scores[p2] = (scores[p2] || 0) + 1;
      x = 0.5; y = 0.5; vx = 0.012; vy = (Math.random() - 0.5) * 0.01;
    } else if (x > 0.99) {
      scores[p1] = (scores[p1] || 0) + 1;
      x = 0.5; y = 0.5; vx = -0.012; vy = (Math.random() - 0.5) * 0.01;
    }

    if (scores[p1] >= state.targetScore) winner = p1;
    if (scores[p2] >= state.targetScore) winner = p2;

    return {
      ...state,
      ball: { x, y, vx, vy },
      scores,
      winner,
    };
  }

  return null;
}
