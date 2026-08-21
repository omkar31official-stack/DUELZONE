import { PicComboState, PicComboQuestion } from '../../../shared/types';

const TOTAL_ROUNDS = 8;

const QUESTION_BANK: PicComboQuestion[] = [
  { id: '1', img1: '🐱', img2: '🐟', hint: '', answer: 'CATFISH' },
  { id: '2', img1: '☀️', img2: '🕶️', hint: '', answer: 'SUNGLASSES' },
  { id: '3', img1: '🌧️', img2: '🏹', hint: '', answer: 'RAINBOW' },
  { id: '4', img1: '🥞', img2: '🎂', hint: '', answer: 'PANCAKE' },
  { id: '5', img1: '🍿', img2: '🌽', hint: '', answer: 'POPCORN' },
  { id: '6', img1: '🔥', img2: '🦊', hint: '', answer: 'FIREFOX' },
  { id: '7', img1: '⭐️', img2: '🐟', hint: '', answer: 'STARFISH' },
  { id: '8', img1: '🔑', img2: '🎹', hint: '', answer: 'KEYBOARD' },
  { id: '9', img1: '❄️', img2: '⚽', hint: '', answer: 'SNOWBALL' },
  { id: '10', img1: '🚪', img2: '🔔', hint: '', answer: 'DOORBELL' },
  { id: '11', img1: '🍦', img2: '🍧', hint: '', answer: 'ICECREAM' },
  { id: '12', img1: '🌙', img2: '💡', hint: '', answer: 'MOONLIGHT' },
  { id: '13', img1: '🐴', img2: '👟', hint: '', answer: 'HORSESHOE' },
  { id: '14', img1: '📱', img2: '📞', hint: '', answer: 'HEADPHONE' },
  { id: '15', img1: '🌊', img2: '🐎', hint: '', answer: 'SEAHORSE' },
  { id: '16', img1: '🍯', img2: '🐝', hint: '', answer: 'HONEYBEE' },
  { id: '17', img1: '☀️', img2: '🌻', hint: '', answer: 'SUNFLOWER' },
  { id: '18', img1: '🌲', img2: '🍎', hint: '', answer: 'PINEAPPLE' },
  { id: '19', img1: '🍉', img2: '🍈', hint: '', answer: 'WATERMELON' },
  { id: '20', img1: '🏠', img2: '🏢', hint: '', answer: 'HOMETOWN' },
  { id: '21', img1: '🦷', img2: '🖌️', hint: '', answer: 'TOOTHBRUSH' },
  { id: '22', img1: '👁️', img2: '👓', hint: '', answer: 'EYEGLASSES' },
  { id: '23', img1: '🦶', img2: '⚽', hint: '', answer: 'FOOTBALL' },
  { id: '24', img1: '🏀', img2: '🧺', hint: '', answer: 'BASKETBALL' },
];

function getRandomQuestions(count: number): PicComboQuestion[] {
  const shuffled = [...QUESTION_BANK].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function makeNullGuesses(playerIds: string[]): Record<string, string | null> {
  return Object.fromEntries(playerIds.map(id => [id, null]));
}

function makeScores(playerIds: string[]): Record<string, number> {
  return Object.fromEntries(playerIds.map(id => [id, 0]));
}

export function createPicComboState(playerIds: string[]): PicComboState {
  const questions = getRandomQuestions(TOTAL_ROUNDS);
  return {
    round: 1,
    totalRounds: TOTAL_ROUNDS,
    currentQuestion: questions[0],
    remainingQuestions: questions.slice(1),
    guesses: makeNullGuesses(playerIds),
    roundWinner: null,
    scores: makeScores(playerIds),
    gameWinner: null,
    phase: 'playing',
    startedAt: Date.now(),
  };
}

export function applyPicComboGuess(
  state: PicComboState,
  playerId: string,
  guess: string
): PicComboState | null {
  if (state.phase !== 'playing') return null;
  if (state.guesses[playerId] !== null) return null;
  if (state.gameWinner) return null;

  const clean = guess.trim().toUpperCase();
  const guesses = { ...state.guesses, [playerId]: clean };
  const players = Object.keys(state.scores);
  const correct = state.currentQuestion.answer.toUpperCase();

  let roundWinner = state.roundWinner;
  let phase: 'playing' | 'result' = state.phase;
  const scores = { ...state.scores };

  if (clean === correct && !roundWinner) {
    roundWinner = playerId;
    scores[playerId] = (scores[playerId] || 0) + 1;
    phase = 'result';
  } else {
    const allGuessed = players.every(p => guesses[p] !== null);
    if (allGuessed) {
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
    guesses,
    roundWinner,
    scores,
    phase,
    gameWinner,
  };
}

export function nextPicComboRound(state: PicComboState): PicComboState {
  const players = Object.keys(state.scores);
  const nextQ = state.remainingQuestions[0];
  return {
    ...state,
    round: state.round + 1,
    currentQuestion: nextQ,
    remainingQuestions: state.remainingQuestions.slice(1),
    guesses: makeNullGuesses(players),
    roundWinner: null,
    phase: 'playing',
    startedAt: Date.now(),
  };
}
