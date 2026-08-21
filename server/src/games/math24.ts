import { Math24State } from '../../../shared/types';

// A predefined list of 4 numbers that can make 24
const SOLVABLE_SETS = [
  [8, 8, 3, 3], [1, 2, 3, 4], [2, 3, 4, 5], [4, 4, 4, 6], [1, 1, 4, 6],
  [5, 5, 5, 1], [3, 3, 8, 8], [2, 4, 6, 8], [1, 3, 4, 6], [2, 3, 5, 12],
  [1, 2, 7, 7], [1, 4, 5, 6], [2, 2, 2, 3], [3, 4, 5, 6], [2, 4, 4, 8],
  [3, 6, 8, 8], [4, 5, 6, 9], [1, 3, 9, 9], [2, 3, 3, 4], [1, 5, 5, 5],
  [1, 2, 2, 9], [3, 4, 6, 6], [4, 6, 6, 8], [2, 3, 6, 9], [1, 8, 8, 8],
  [2, 3, 8, 9], [4, 4, 7, 7], [3, 3, 4, 8], [1, 1, 3, 8], [2, 2, 4, 7],
];

const TOTAL_ROUNDS = 5;

function getRandomNumbers(): number[] {
  const set = SOLVABLE_SETS[Math.floor(Math.random() * SOLVABLE_SETS.length)];
  // shuffle them
  const arr = [...set];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function createMath24State(players: string[]): Math24State {
  return {
    round: 1,
    totalRounds: TOTAL_ROUNDS,
    numbers: getRandomNumbers(),
    phase: 'countdown',
    roundWinner: null,
    winningExpression: null,
    scores: Object.fromEntries(players.map(p => [p, 0])),
    gameWinner: null,
    startedAt: null,
  };
}

// Check if expression uses exactly the 4 numbers
function validateNumbers(expression: string, numbers: number[]): boolean {
  // Extract all numbers from the expression
  const matches = expression.match(/\d+/g);
  if (!matches) return false;
  
  const exprNums = matches.map(Number);
  if (exprNums.length !== 4) return false;

  const sortedTarget = [...numbers].sort((a, b) => a - b);
  const sortedExpr = [...exprNums].sort((a, b) => a - b);

  for (let i = 0; i < 4; i++) {
    if (sortedTarget[i] !== sortedExpr[i]) return false;
  }
  return true;
}

// Evaluate safely
function evaluateSafe(expression: string): number | null {
  // Allow only digits, +, -, *, /, (, )
  if (!/^[0-9+\-*/() ]+$/.test(expression)) return null;
  
  try {
    // eslint-disable-next-line no-new-func
    const result = new Function(`return ${expression}`)();
    return typeof result === 'number' && !isNaN(result) ? result : null;
  } catch (e) {
    return null;
  }
}

export function handleMath24Action(state: Math24State, playerId: string, action: any): Math24State {
  if (action.type === 'START' && state.phase === 'countdown') {
    return { ...state, phase: 'playing', startedAt: Date.now() };
  }

  if (state.phase !== 'playing' && action.type !== 'NEXT_ROUND') return state;

  if (action.type === 'SUBMIT') {
    const { expression } = action.payload;

    if (!validateNumbers(expression, state.numbers)) {
      return state; // Invalid numbers used
    }

    const result = evaluateSafe(expression);

    // Using epsilon to handle floating point precision just in case
    if (result !== null && Math.abs(result - 24) < 0.0001) {
      // WINNER!
      const scores = { ...state.scores };
      scores[playerId] = (scores[playerId] || 0) + 1;

      const gameWinner = state.round >= state.totalRounds
        ? (() => {
            const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
            return ranked.length > 1 && ranked[0][1] === ranked[1][1] ? null : ranked[0]?.[0] ?? null;
          })()
        : null;

      return {
        ...state,
        scores,
        roundWinner: playerId,
        winningExpression: expression,
        phase: 'result',
        gameWinner,
      };
    }
  }

  if (action.type === 'NEXT_ROUND' && state.phase === 'result' && !state.gameWinner) {
    return {
      ...state,
      round: state.round + 1,
      numbers: getRandomNumbers(),
      phase: 'playing',
      roundWinner: null,
      winningExpression: null,
      startedAt: Date.now(),
    };
  }

  return state;
}
