import { WordScrambleState } from '../../../shared/types';

const TOTAL_ROUNDS = 8;

const WORD_BANK = [
  'ALGORITHM', 'BINARY', 'COMPILE', 'DATABASE', 'ENCRYPT',
  'FUNCTION', 'GRAPHIC', 'HASHTAG', 'INTEGER', 'JAVASCRIPT',
  'KEYBOARD', 'LIBRARY', 'MALWARE', 'NETWORK', 'OPERATE',
  'PROGRAM', 'QUANTUM', 'RUNTIME', 'SYNTAX', 'TERMINAL',
  'UNICODE', 'VIRTUAL', 'WEBSITE', 'PYTHON', 'BROWSER',
  'CLUSTER', 'DIGITAL', 'ELASTIC', 'FIREWALL', 'GATEWAY',
  'HOSTING', 'INSTALL', 'JUPYTER', 'KERNEL', 'LOGGING',
  'MACHINE', 'NEUTRAL', 'ORBITAL', 'PACKAGE', 'RESOLVE',
  'STORAGE', 'TRACKER', 'UPGRADE', 'VOLTAGE', 'WEBPACK',
  'CRYSTAL', 'DOLPHIN', 'ELEMENT', 'FORTUNE', 'GRAVITY',
  'HARMONY', 'IMAGINE', 'JUSTICE', 'KITCHEN', 'LANTERN',
  'MIRACLE', 'NATURAL', 'OCTAGON', 'PHOENIX', 'RAINBOW',
];

function scrambleWord(word: string): string {
  const arr = word.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  const scrambled = arr.join('');
  // Make sure it's actually scrambled
  if (scrambled === word && word.length > 1) return scrambleWord(word);
  return scrambled;
}

function makeNullGuesses(playerIds: string[]): Record<string, string | null> {
  return Object.fromEntries(playerIds.map(id => [id, null]));
}

function makeScores(playerIds: string[]): Record<string, number> {
  return Object.fromEntries(playerIds.map(id => [id, 0]));
}

export function createWSState(playerIds: string[]): WordScrambleState {
  const wordIdx = Math.floor(Math.random() * WORD_BANK.length);
  const originalWord = WORD_BANK[wordIdx];
  return {
    round: 1,
    totalRounds: TOTAL_ROUNDS,
    scrambledWord: scrambleWord(originalWord),
    originalWord,
    guesses: makeNullGuesses(playerIds),
    roundWinner: null,
    scores: makeScores(playerIds),
    gameWinner: null,
    phase: 'playing',
    startedAt: Date.now(),
    hint: originalWord[0] + '...' + originalWord[originalWord.length - 1],
  };
}

export function applyWSGuess(
  state: WordScrambleState,
  playerId: string,
  guess: string,
): WordScrambleState | null {
  if (state.phase !== 'playing') return null;
  if (state.guesses[playerId] !== null) return null;
  if (state.gameWinner) return null;

  const normalGuess = guess.trim().toUpperCase();
  const guesses = { ...state.guesses, [playerId]: normalGuess };

  // If correct, immediately win the round
  if (normalGuess === state.originalWord) {
    const scores = { ...state.scores };
    scores[playerId] = (scores[playerId] || 0) + 1;

    const gameWinner = state.round >= TOTAL_ROUNDS
      ? (() => {
          const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
          return ranked.length > 1 && ranked[0][1] === ranked[1][1] ? null : ranked[0]?.[0] ?? null;
        })()
      : null;

    return {
      ...state,
      guesses,
      roundWinner: playerId,
      scores,
      phase: 'result',
      gameWinner,
    };
  }

  // Wrong guess — just record it, no penalty
  return { ...state, guesses };
}

export function nextWSRound(state: WordScrambleState): WordScrambleState {
  const players = Object.keys(state.scores);
  const wordIdx = Math.floor(Math.random() * WORD_BANK.length);
  const originalWord = WORD_BANK[wordIdx];
  return {
    ...state,
    round: state.round + 1,
    scrambledWord: scrambleWord(originalWord),
    originalWord,
    guesses: makeNullGuesses(players),
    roundWinner: null,
    phase: 'playing',
    startedAt: Date.now(),
    hint: originalWord[0] + '...' + originalWord[originalWord.length - 1],
  };
}
