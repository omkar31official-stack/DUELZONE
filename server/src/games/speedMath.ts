import { SpeedMathState, SpeedMathProblem } from '../../../shared/types';

const TOTAL_ROUNDS = 8;

function generateProblem(): SpeedMathProblem {
  const ops = ['+', '-', '×'];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a = 0, b = 0, correct = 0;

  if (op === '+') {
    a = Math.floor(Math.random() * 40) + 10;
    b = Math.floor(Math.random() * 40) + 10;
    correct = a + b;
  } else if (op === '-') {
    a = Math.floor(Math.random() * 50) + 20;
    b = Math.floor(Math.random() * a) + 5;
    correct = a - b;
  } else {
    a = Math.floor(Math.random() * 12) + 2;
    b = Math.floor(Math.random() * 12) + 2;
    correct = a * b;
  }

  const equation = `${a} ${op} ${b} = ?`;

  // Generate 3 wrong options
  const wrongSet = new Set<number>();
  while (wrongSet.size < 3) {
    const diff = (Math.floor(Math.random() * 7) + 1) * (Math.random() > 0.5 ? 1 : -1);
    const val = correct + diff;
    if (val !== correct && val >= 0) {
      wrongSet.add(val);
    }
  }

  const options = [correct, ...Array.from(wrongSet)].sort(() => Math.random() - 0.5);

  return { equation, options, correctAnswer: correct };
}

function makeNullAnswers(playerIds: string[]): Record<string, number | null> {
  return Object.fromEntries(playerIds.map(id => [id, null]));
}

function makeScores(playerIds: string[]): Record<string, number> {
  return Object.fromEntries(playerIds.map(id => [id, 0]));
}

export function createSpeedMathState(playerIds: string[]): SpeedMathState {
  return {
    round: 1,
    totalRounds: TOTAL_ROUNDS,
    currentProblem: generateProblem(),
    answers: makeNullAnswers(playerIds),
    roundWinner: null,
    scores: makeScores(playerIds),
    gameWinner: null,
    phase: 'playing',
    startedAt: Date.now(),
  };
}

export function applySpeedMathAnswer(
  state: SpeedMathState,
  playerId: string,
  chosenVal: number
): SpeedMathState | null {
  if (state.phase !== 'playing') return null;
  if (state.answers[playerId] !== null) return null;
  if (state.gameWinner) return null;

  const answers = { ...state.answers, [playerId]: chosenVal };
  const players = Object.keys(state.scores);
  const correct = state.currentProblem.correctAnswer;

  // Is this answer correct? First correct answer in round wins immediately!
  let roundWinner = state.roundWinner;
  let phase: 'playing' | 'result' = state.phase;
  const scores = { ...state.scores };

  if (chosenVal === correct && !roundWinner) {
    roundWinner = playerId;
    scores[playerId] = (scores[playerId] || 0) + 1;
    phase = 'result';
  } else {
    // If all players answered wrong/right, finish round
    const allAnswered = players.every(p => answers[p] !== null);
    if (allAnswered) {
      phase = 'result';
    }
  }

  let gameWinner: string | null = null;
  if (phase === 'result' && state.round >= state.totalRounds) {
    const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    gameWinner = ranked.length > 1 && ranked[0][1] === ranked[1][1] ? null : ranked[0]?.[0] ?? null;
  }

  return {
    ...state,
    answers,
    roundWinner,
    scores,
    phase,
    gameWinner,
  };
}

export function nextSpeedMathRound(state: SpeedMathState): SpeedMathState {
  const players = Object.keys(state.scores);
  return {
    ...state,
    round: state.round + 1,
    currentProblem: generateProblem(),
    answers: makeNullAnswers(players),
    roundWinner: null,
    phase: 'playing',
    startedAt: Date.now(),
  };
}
