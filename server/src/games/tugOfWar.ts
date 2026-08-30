import { GameAction } from '../../../shared/types';

export interface TugOfWarState {
  scores: Record<string, number>;
  ropePos: number; // -100 to 100 (0 is center, -100 P1 wins, 100 P2 wins)
  winner: string | null;
  targetWins: number;
}

export function createTugOfWarState(players: [string, string]): TugOfWarState {
  return {
    scores: { [players[0]]: 0, [players[1]]: 0 },
    ropePos: 0,
    winner: null,
    targetWins: 3,
  };
}

export function handleTugOfWarAction(state: TugOfWarState, playerId: string, action: GameAction): TugOfWarState | null {
  if (state.winner) return null;
  const pKeys = Object.keys(state.scores);
  if (!pKeys.includes(playerId)) return null;

  if (action.type === 'PULL') {
    const isP1 = playerId === pKeys[0];
    const pullForce = isP1 ? -5 : 5;
    let newPos = state.ropePos + pullForce;

    let winner = state.winner;
    const scores = { ...state.scores };

    if (newPos <= -100) {
      scores[pKeys[0]] = (scores[pKeys[0]] || 0) + 1;
      newPos = 0;
    } else if (newPos >= 100) {
      scores[pKeys[1]] = (scores[pKeys[1]] || 0) + 1;
      newPos = 0;
    }

    if (scores[pKeys[0]] >= state.targetWins) winner = pKeys[0];
    if (scores[pKeys[1]] >= state.targetWins) winner = pKeys[1];

    return {
      ...state,
      ropePos: newPos,
      scores,
      winner,
    };
  }

  return null;
}
