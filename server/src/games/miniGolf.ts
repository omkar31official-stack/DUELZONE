import { GameAction } from '../../../shared/types';

export interface MiniGolfState {
  scores: Record<string, number>;
  currentTurn: string;
  strokes: Record<string, number>;
  ballPositions: Record<string, { x: number; y: number }>;
  hole: { x: number; y: number };
  obstacles: { x: number; y: number; width: number; height: number }[];
  winner: string | null;
  holeNumber: number;
}

export function createMiniGolfState(players: [string, string]): MiniGolfState {
  return {
    scores: { [players[0]]: 0, [players[1]]: 0 },
    currentTurn: players[0],
    strokes: { [players[0]]: 0, [players[1]]: 0 },
    ballPositions: {
      [players[0]]: { x: 0.15, y: 0.8 },
      [players[1]]: { x: 0.15, y: 0.8 },
    },
    hole: { x: 0.85, y: 0.2 },
    obstacles: [
      { x: 0.4, y: 0.3, width: 0.2, height: 0.4 },
    ],
    winner: null,
    holeNumber: 1,
  };
}

export function handleMiniGolfAction(state: MiniGolfState, playerId: string, action: GameAction): MiniGolfState | null {
  if (state.winner) return null;
  const pKeys = Object.keys(state.scores);
  if (state.currentTurn !== playerId) return null;

  if (action.type === 'PULL_SHOT') {
    const { power, angle } = action.payload as { power: number; angle: number };
    if (typeof power !== 'number' || typeof angle !== 'number') return null;

    const currentStrokes = (state.strokes[playerId] || 0) + 1;
    const nextTurn = pKeys.find(p => p !== playerId)!;

    return {
      ...state,
      strokes: { ...state.strokes, [playerId]: currentStrokes },
      currentTurn: nextTurn,
    };
  }

  if (action.type === 'SINK_HOLE') {
    const nextHole = state.holeNumber + 1;
    const winner = nextHole > 3 ? (state.strokes[pKeys[0]] < state.strokes[pKeys[1]] ? pKeys[0] : pKeys[1]) : null;

    return {
      ...state,
      holeNumber: nextHole,
      winner,
      ballPositions: {
        [pKeys[0]]: { x: 0.15, y: 0.8 },
        [pKeys[1]]: { x: 0.15, y: 0.8 },
      },
    };
  }

  return null;
}
