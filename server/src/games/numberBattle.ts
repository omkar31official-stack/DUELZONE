import { NumberBattleState } from '../../../shared/types';

const TOTAL_ROUNDS = 7;
const HAND_SIZE = 5;

function genNumbers(exclude: number[] = []): number[] {
  const nums: number[] = [];
  while (nums.length < HAND_SIZE) {
    const n = Math.floor(Math.random() * 100) + 1;
    if (!exclude.includes(n) && !nums.includes(n)) nums.push(n);
  }
  return nums;
}

export function createNBState(playerIds: [string, string]): NumberBattleState {
  const target = Math.floor(Math.random() * 100) + 1;
  return {
    round: 1,
    totalRounds: TOTAL_ROUNDS,
    target,
    playerNumbers: {
      [playerIds[0]]: genNumbers(),
      [playerIds[1]]: genNumbers(),
    },
    choices: { [playerIds[0]]: null, [playerIds[1]]: null },
    revealed: false,
    roundWinner: null,
    scores: { [playerIds[0]]: 0, [playerIds[1]]: 0 },
    gameWinner: null,
  };
}

export function applyNBChoice(
  state: NumberBattleState,
  playerId: string,
  number: number,
): NumberBattleState | null {
  if (state.revealed) return null;
  if (state.gameWinner) return null;
  if (state.choices[playerId] !== null) return null;
  if (!state.playerNumbers[playerId]?.includes(number)) return null;

  const choices = { ...state.choices, [playerId]: number };
  const players = Object.keys(state.scores);
  const allChosen = players.every(p => choices[p] !== null);

  if (!allChosen) return { ...state, choices };

  const [p1, p2] = players;
  const c1 = choices[p1] as number;
  const c2 = choices[p2] as number;
  const diff1 = Math.abs(c1 - state.target);
  const diff2 = Math.abs(c2 - state.target);

  let roundWinner: string | null = null;
  if (diff1 < diff2) roundWinner = p1;
  else if (diff2 < diff1) roundWinner = p2;

  const scores = { ...state.scores };
  if (roundWinner) scores[roundWinner] = (scores[roundWinner] || 0) + 1;

  const gameWinner = state.round >= TOTAL_ROUNDS
    ? (scores[p1] > scores[p2] ? p1 : scores[p2] > scores[p1] ? p2 : null)
    : null;

  return { ...state, choices, revealed: true, roundWinner, scores, gameWinner };
}

export function nextNBRound(state: NumberBattleState): NumberBattleState {
  const players = Object.keys(state.scores);
  const target = Math.floor(Math.random() * 100) + 1;
  return {
    ...state,
    round: state.round + 1,
    target,
    playerNumbers: {
      [players[0]]: genNumbers(),
      [players[1]]: genNumbers(),
    },
    choices: { [players[0]]: null, [players[1]]: null },
    revealed: false,
    roundWinner: null,
  };
}
