import { ColorClashState } from '../../../shared/types';
import { COLOR_CLASH_COLORS, COLOR_CLASH_WORDS } from '../../../shared/constants';

const TOTAL_ROUNDS = 10;

function generateRound() {
  const inkIdx = Math.floor(Math.random() * COLOR_CLASH_COLORS.length);
  let wordIdx: number;
  do { wordIdx = Math.floor(Math.random() * COLOR_CLASH_WORDS.length); }
  while (wordIdx === inkIdx && Math.random() > 0.3); // sometimes same, mostly different

  return {
    word: COLOR_CLASH_WORDS[wordIdx],
    inkColor: COLOR_CLASH_COLORS[inkIdx],
    wordColor: COLOR_CLASH_COLORS[wordIdx],
  };
}

export function createCCState(playerIds: [string, string]): ColorClashState {
  const { word, inkColor, wordColor } = generateRound();
  return {
    round: 1,
    totalRounds: TOTAL_ROUNDS,
    word,
    inkColor,
    wordColor,
    choices: { [playerIds[0]]: null, [playerIds[1]]: null },
    roundWinner: null,
    scores: { [playerIds[0]]: 0, [playerIds[1]]: 0 },
    gameWinner: null,
    phase: 'playing',
    startedAt: Date.now(),
  };
}

export function applyCCChoice(
  state: ColorClashState,
  playerId: string,
  color: string,
  arrivedAt: number,
): ColorClashState | null {
  if (state.phase !== 'playing') return null;
  if (state.choices[playerId] !== null) return null;
  if (!COLOR_CLASH_COLORS.includes(color)) return null;

  const choices = { ...state.choices, [playerId]: color };
  const players = Object.keys(state.scores);
  const allChosen = players.every(p => choices[p] !== null);

  if (!allChosen) return { ...state, choices };

  // Determine winners — must pick inkColor
  const scores = { ...state.scores };
  let roundWinner: string | null = null;

  const correctPlayers = players.filter(p => choices[p] === state.inkColor);
  if (correctPlayers.length === 1) {
    roundWinner = correctPlayers[0];
    scores[roundWinner] = (scores[roundWinner] || 0) + 1;
  } else if (correctPlayers.length === 2) {
    // Both correct — no point (or could award both, keeping it competitive)
  }

  const gameWinner = state.round >= TOTAL_ROUNDS
    ? (() => { const [p1, p2] = players; return scores[p1] > scores[p2] ? p1 : scores[p2] > scores[p1] ? p2 : null; })()
    : null;

  return { ...state, choices, phase: 'result', roundWinner, scores, gameWinner };
}

export function nextCCRound(state: ColorClashState): ColorClashState {
  const players = Object.keys(state.scores);
  const { word, inkColor, wordColor } = generateRound();
  return {
    ...state,
    round: state.round + 1,
    word,
    inkColor,
    wordColor,
    choices: { [players[0]]: null, [players[1]]: null },
    phase: 'playing',
    roundWinner: null,
    startedAt: Date.now(),
  };
}
