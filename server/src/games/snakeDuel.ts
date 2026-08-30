import { GameAction } from '../../../shared/types';

export interface SnakeSegment { x: number; y: number; }

export interface SnakeDuelState {
  scores: Record<string, number>;
  snakes: Record<string, { body: SnakeSegment[]; dir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'; isAlive: boolean }>;
  food: { x: number; y: number };
  gridSize: number;
  winner: string | null;
}

export function createSnakeDuelState(players: [string, string]): SnakeDuelState {
  const p1 = players[0];
  const p2 = players[1];
  return {
    scores: { [p1]: 0, [p2]: 0 },
    snakes: {
      [p1]: { body: [{ x: 3, y: 10 }, { x: 2, y: 10 }, { x: 1, y: 10 }], dir: 'RIGHT', isAlive: true },
      [p2]: { body: [{ x: 16, y: 10 }, { x: 17, y: 10 }, { x: 18, y: 10 }], dir: 'LEFT', isAlive: true },
    },
    food: { x: 10, y: 10 },
    gridSize: 20,
    winner: null,
  };
}

export function handleSnakeDuelAction(state: SnakeDuelState, playerId: string, action: GameAction): SnakeDuelState | null {
  if (state.winner) return null;
  const pKeys = Object.keys(state.snakes);
  if (!pKeys.includes(playerId)) return null;

  if (action.type === 'CHANGE_DIR') {
    const dir = (action.payload as { dir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' })?.dir;
    if (!['UP', 'DOWN', 'LEFT', 'RIGHT'].includes(dir)) return null;
    const current = state.snakes[playerId];
    if (!current || !current.isAlive) return null;

    // Prevent 180 turn
    const opposite: Record<string, string> = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' };
    if (opposite[dir] === current.dir) return null;

    return {
      ...state,
      snakes: {
        ...state.snakes,
        [playerId]: { ...current, dir },
      },
    };
  }

  if (action.type === 'ELIMINATE') {
    const deadPlayer = (action.payload as { playerId: string })?.playerId;
    if (!pKeys.includes(deadPlayer)) return null;

    const victor = pKeys.find(p => p !== deadPlayer)!;
    const scores = { ...state.scores, [victor]: (state.scores[victor] || 0) + 1 };
    const winner = scores[victor] >= 3 ? victor : null;

    return {
      ...state,
      scores,
      winner,
      snakes: {
        [pKeys[0]]: { body: [{ x: 3, y: 10 }, { x: 2, y: 10 }, { x: 1, y: 10 }], dir: 'RIGHT', isAlive: true },
        [pKeys[1]]: { body: [{ x: 16, y: 10 }, { x: 17, y: 10 }, { x: 18, y: 10 }], dir: 'LEFT', isAlive: true },
      },
    };
  }

  return null;
}
