import { CodeBreakerState } from '../../../shared/types';

export interface CodeGuess {
  colors: string[];
  blackPegs: number;
  whitePegs: number;
}

const COLOR_PALETTE = ['🔴', '🔵', '🟢', '🟡', '🟣', '🟠'];

export const createCodeBreakerState = (players: string[]): CodeBreakerState => {
  const secretCode = [
    COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)],
    COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)],
    COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)],
    COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)],
  ];

  const scores: Record<string, number> = {};
  const guesses: Record<string, CodeGuess[]> = {};

  players.forEach((pId) => {
    scores[pId] = 0;
    guesses[pId] = [];
  });

  return {
    scores,
    secretCode,
    guesses,
    currentTurn: players[0] || '',
    winner: null,
    maxAttempts: 8,
  };
};

export const handleCodeBreakerAction = (
  state: CodeBreakerState,
  playerId: string,
  action: { type: string; payload?: any }
): CodeBreakerState => {
  if (state.winner || state.currentTurn !== playerId) return state;

  if (action.type === 'SUBMIT_GUESS') {
    const guessColors: string[] = action.payload?.colors;
    if (!guessColors || guessColors.length !== 4) return state;

    let blackPegs = 0;
    let whitePegs = 0;

    const secretCopy = [...state.secretCode];
    const guessCopy = [...guessColors];

    // Check Black Pegs
    for (let i = 0; i < 4; i++) {
      if (guessCopy[i] === secretCopy[i]) {
        blackPegs++;
        secretCopy[i] = '';
        guessCopy[i] = '';
      }
    }

    // Check White Pegs
    for (let i = 0; i < 4; i++) {
      if (guessCopy[i] !== '') {
        const foundIdx = secretCopy.findIndex((c) => c !== '' && c === guessCopy[i]);
        if (foundIdx !== -1) {
          whitePegs++;
          secretCopy[foundIdx] = '';
        }
      }
    }

    const playerGuesses = state.guesses[playerId] || [];
    playerGuesses.push({ colors: guessColors, blackPegs, whitePegs });
    state.guesses[playerId] = playerGuesses;

    const playerKeys = Object.keys(state.guesses);
    const nextTurn = playerKeys.find((id) => id !== playerId) || playerId;

    if (blackPegs === 4) {
      state.winner = playerId;
      state.scores[playerId] = 100;
    } else if (playerGuesses.length >= state.maxAttempts) {
      state.currentTurn = nextTurn;
    } else {
      state.currentTurn = nextTurn;
    }

    return { ...state };
  }

  return state;
};
