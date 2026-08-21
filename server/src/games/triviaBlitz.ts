import { TriviaBlitzState, TriviaQuestion } from '../../../shared/types';

const TOTAL_ROUNDS = 8;

const TRIVIA_BANK: TriviaQuestion[] = [
  { question: 'What planet is known as the Red Planet?', options: ['Venus', 'Mars', 'Jupiter', 'Saturn'], correctIndex: 1 },
  { question: 'How many sides does a hexagon have?', options: ['5', '6', '7', '8'], correctIndex: 1 },
  { question: 'What is the chemical symbol for Gold?', options: ['Go', 'Gd', 'Au', 'Ag'], correctIndex: 2 },
  { question: 'Which ocean is the largest?', options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'], correctIndex: 3 },
  { question: 'What year did the Titanic sink?', options: ['1910', '1912', '1915', '1920'], correctIndex: 1 },
  { question: 'How many bones does a human adult have?', options: ['186', '206', '226', '256'], correctIndex: 1 },
  { question: 'What is the speed of light in km/s?', options: ['150,000', '300,000', '450,000', '600,000'], correctIndex: 1 },
  { question: 'Which element has the atomic number 1?', options: ['Helium', 'Hydrogen', 'Lithium', 'Carbon'], correctIndex: 1 },
  { question: 'Who painted the Mona Lisa?', options: ['Michelangelo', 'Da Vinci', 'Raphael', 'Donatello'], correctIndex: 1 },
  { question: 'What is the largest mammal?', options: ['Elephant', 'Giraffe', 'Blue Whale', 'Hippopotamus'], correctIndex: 2 },
  { question: 'How many continents are there?', options: ['5', '6', '7', '8'], correctIndex: 2 },
  { question: 'What is the tallest mountain on Earth?', options: ['K2', 'Kangchenjunga', 'Everest', 'Lhotse'], correctIndex: 2 },
  { question: 'What is the capital of Australia?', options: ['Sydney', 'Melbourne', 'Canberra', 'Perth'], correctIndex: 2 },
  { question: 'How many teeth does an adult human have?', options: ['28', '30', '32', '34'], correctIndex: 2 },
  { question: 'What gas do plants absorb from air?', options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'], correctIndex: 2 },
  { question: 'Which planet has the most moons?', options: ['Jupiter', 'Saturn', 'Uranus', 'Neptune'], correctIndex: 1 },
  { question: 'What is the hardest natural substance?', options: ['Iron', 'Diamond', 'Platinum', 'Titanium'], correctIndex: 1 },
  { question: 'What language has the most speakers?', options: ['English', 'Spanish', 'Mandarin', 'Hindi'], correctIndex: 2 },
  { question: 'How many chambers does a human heart have?', options: ['2', '3', '4', '5'], correctIndex: 2 },
  { question: 'What is the smallest country in the world?', options: ['Monaco', 'Vatican City', 'San Marino', 'Liechtenstein'], correctIndex: 1 },
  { question: 'Which animal is known as the King of the Jungle?', options: ['Tiger', 'Lion', 'Elephant', 'Gorilla'], correctIndex: 1 },
  { question: 'What is H₂O commonly known as?', options: ['Salt', 'Water', 'Acid', 'Alcohol'], correctIndex: 1 },
  { question: 'How many minutes are in one day?', options: ['1,240', '1,340', '1,440', '1,540'], correctIndex: 2 },
  { question: 'What is the square root of 144?', options: ['10', '11', '12', '14'], correctIndex: 2 },
  { question: 'Which country invented pizza?', options: ['France', 'Spain', 'Italy', 'Greece'], correctIndex: 2 },
  { question: 'What does "www" stand for?', options: ['World Wide Web', 'World Web Watcher', 'Web World Wide', 'Wide World Web'], correctIndex: 0 },
  { question: 'What is the boiling point of water in °C?', options: ['90', '95', '100', '105'], correctIndex: 2 },
  { question: 'Which blood type is universal donor?', options: ['A+', 'B+', 'AB+', 'O-'], correctIndex: 3 },
  { question: 'What is the largest desert on Earth?', options: ['Sahara', 'Antarctic', 'Arctic', 'Gobi'], correctIndex: 1 },
  { question: 'How many colors are in a rainbow?', options: ['5', '6', '7', '8'], correctIndex: 2 },
  { question: 'What organ produces insulin?', options: ['Liver', 'Kidney', 'Pancreas', 'Stomach'], correctIndex: 2 },
  { question: 'Which planet is closest to the Sun?', options: ['Venus', 'Mercury', 'Earth', 'Mars'], correctIndex: 1 },
];

function getRandomQuestions(count: number): TriviaQuestion[] {
  const shuffled = [...TRIVIA_BANK].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function makeNullAnswers(playerIds: string[]): Record<string, number | null> {
  return Object.fromEntries(playerIds.map(id => [id, null]));
}

function makeScores(playerIds: string[]): Record<string, number> {
  return Object.fromEntries(playerIds.map(id => [id, 0]));
}

export function createTBState(playerIds: string[]): TriviaBlitzState {
  const questions = getRandomQuestions(TOTAL_ROUNDS);
  return {
    round: 1,
    totalRounds: TOTAL_ROUNDS,
    currentQuestion: questions[0],
    remainingQuestions: questions.slice(1),
    answers: makeNullAnswers(playerIds),
    roundWinner: null,
    scores: makeScores(playerIds),
    gameWinner: null,
    phase: 'playing',
    startedAt: Date.now(),
  };
}

export function applyTBAnswer(
  state: TriviaBlitzState,
  playerId: string,
  answerIndex: number,
): TriviaBlitzState | null {
  if (state.phase !== 'playing') return null;
  if (state.answers[playerId] !== null) return null;
  if (state.gameWinner) return null;
  if (answerIndex < 0 || answerIndex > 3) return null;

  const answers = { ...state.answers, [playerId]: answerIndex };
  const players = Object.keys(state.scores);
  const allAnswered = players.every(p => answers[p] !== null);

  if (!allAnswered) return { ...state, answers };

  // Evaluate round
  const scores = { ...state.scores };
  const correct = state.currentQuestion.correctIndex;
  const correctPlayers = players.filter(p => answers[p] === correct);

  let roundWinner: string | null = null;
  if (correctPlayers.length === 1) {
    roundWinner = correctPlayers[0];
    scores[roundWinner] = (scores[roundWinner] || 0) + 1;
  } else if (correctPlayers.length > 1) {
    // All correct get a point
    correctPlayers.forEach(p => {
      scores[p] = (scores[p] || 0) + 1;
    });
  }

  let gameWinner: string | null = null;
  if (state.round >= state.totalRounds) {
    const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    gameWinner = ranked.length > 1 && ranked[0][1] === ranked[1][1] ? null : ranked[0]?.[0] ?? null;
  }

  return {
    ...state,
    answers,
    roundWinner,
    scores,
    phase: 'result',
    gameWinner,
  };
}

export function nextTBRound(state: TriviaBlitzState): TriviaBlitzState {
  const players = Object.keys(state.scores);
  const nextQ = state.remainingQuestions[0];
  return {
    ...state,
    round: state.round + 1,
    currentQuestion: nextQ,
    remainingQuestions: state.remainingQuestions.slice(1),
    answers: makeNullAnswers(players),
    roundWinner: null,
    phase: 'playing',
    startedAt: Date.now(),
  };
}
