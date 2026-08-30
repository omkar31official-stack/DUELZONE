import { GameState } from '../types';

export interface Riddle {
  id: number;
  question: string;
  emojiHint: string;
  options: string[];
  answer: number;
}

export interface RiddleDuelState extends GameState {
  scores: Record<string, number>;
  currentRiddleIndex: number;
  riddles: Riddle[];
  answers: Record<string, number>;
  winner: string | null;
}

const SAMPLE_RIDDLES: Riddle[] = [
  { id: 1, question: 'What gets wetter the more it dries?', emojiHint: '🚿 🧼 🧴', options: ['Sponge', 'Towel', 'Cloud', 'Rain'], answer: 1 },
  { id: 2, question: 'I speak without a mouth and hear without ears. What am I?', emojiHint: '🗣️ 👂 ⛰️', options: ['Wind', 'Echo', 'Radio', 'Whistle'], answer: 1 },
  { id: 3, question: 'What has keys but no locks, space but no room?', emojiHint: '⌨️ 💻 🔤', options: ['Piano', 'Keyboard', 'Map', 'Vault'], answer: 1 },
  { id: 4, question: 'What comes once in a minute, twice in a moment, but never in a thousand years?', emojiHint: '⏱️ ⏳ 🔡', options: ['Letter M', 'Second', 'Time', 'Chance'], answer: 0 },
  { id: 5, question: 'The more of this there is, the less you see. What is it?', emojiHint: '🌑 🌃 🙈', options: ['Fog', 'Darkness', 'Smoke', 'Blindfold'], answer: 1 },
];

export const createRiddleDuelState = (players: string[]): RiddleDuelState => {
  const scores: Record<string, number> = {};
  players.forEach((pId) => (scores[pId] = 0));

  return {
    scores,
    currentRiddleIndex: 0,
    riddles: SAMPLE_RIDDLES,
    answers: {},
    winner: null,
  };
};

export const handleRiddleDuelAction = (
  state: RiddleDuelState,
  playerId: string,
  action: { type: string; payload?: any }
): RiddleDuelState => {
  if (state.winner) return state;

  if (action.type === 'ANSWER_RIDDLE') {
    const selectedOption = action.payload?.optionIndex;
    const currentRiddle = state.riddles[state.currentRiddleIndex];

    if (!currentRiddle) return state;

    state.answers[playerId] = selectedOption;

    if (selectedOption === currentRiddle.answer) {
      state.scores[playerId] = (state.scores[playerId] || 0) + 10;
    }

    const playerKeys = Object.keys(state.scores);
    const bothAnswered = playerKeys.every((id) => state.answers[id] !== undefined);

    if (bothAnswered) {
      state.currentRiddleIndex += 1;
      state.answers = {};

      if (state.currentRiddleIndex >= state.riddles.length) {
        let maxScore = -1;
        let winner: string | null = null;
        playerKeys.forEach((id) => {
          if (state.scores[id] > maxScore) {
            maxScore = state.scores[id];
            winner = id;
          }
        });
        state.winner = winner;
      }
    }

    return { ...state };
  }

  return state;
};
