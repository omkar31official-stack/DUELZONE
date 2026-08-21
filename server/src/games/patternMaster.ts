import { PatternMasterState } from '../../../shared/types';

const TOTAL_ROUNDS = 6;

function generateSequence(length: number): number[] {
  const seq: number[] = [];
  for (let i = 0; i < length; i++) {
    seq.push(Math.floor(Math.random() * 4)); // 0, 1, 2, 3 (Red, Blue, Green, Yellow)
  }
  return seq;
}

function makeEmptyInputs(playerIds: string[]): Record<string, number[]> {
  return Object.fromEntries(playerIds.map(id => [id, []]));
}

function makeScores(playerIds: string[]): Record<string, number> {
  return Object.fromEntries(playerIds.map(id => [id, 0]));
}

export function createPatternMasterState(playerIds: string[]): PatternMasterState {
  return {
    round: 1,
    totalRounds: TOTAL_ROUNDS,
    sequence: generateSequence(3), // Round 1 starts with 3 notes
    playerInputs: makeEmptyInputs(playerIds),
    failedPlayers: [],
    roundWinner: null,
    scores: makeScores(playerIds),
    gameWinner: null,
    phase: 'showing',
    startedAt: Date.now(),
  };
}

export function applyPatternInput(
  state: PatternMasterState,
  playerId: string,
  padIndex: number
): PatternMasterState | null {
  if (state.phase !== 'input') return null;
  if (state.failedPlayers.includes(playerId)) return null;
  if (state.gameWinner) return null;

  const currentInputs = state.playerInputs[playerId] || [];
  const nextStepIndex = currentInputs.length;
  const expectedPad = state.sequence[nextStepIndex];

  // Did player click wrong pad?
  if (padIndex !== expectedPad) {
    const failedPlayers = [...state.failedPlayers, playerId];
    const players = Object.keys(state.scores);
    const activePlayers = players.filter(p => !failedPlayers.includes(p));

    let phase: 'showing' | 'input' | 'result' = state.phase;
    let roundWinner = state.roundWinner;
    const scores = { ...state.scores };

    if (activePlayers.length === 1 && players.length > 1) {
      roundWinner = activePlayers[0];
      scores[roundWinner] = (scores[roundWinner] || 0) + 1;
      phase = 'result';
    } else if (activePlayers.length === 0) {
      phase = 'result';
    }

    let gameWinner: string | null = null;
    if (phase === 'result' && state.round >= state.totalRounds) {
      const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
      gameWinner = ranked.length > 1 && ranked[0][1] === ranked[1][1] ? null : ranked[0]?.[0] ?? null;
    }

    return {
      ...state,
      failedPlayers,
      phase,
      roundWinner,
      scores,
      gameWinner,
    };
  }

  // Correct click!
  const newInputs = [...currentInputs, padIndex];
  const playerInputs = { ...state.playerInputs, [playerId]: newInputs };

  // Did player complete full sequence?
  let roundWinner = state.roundWinner;
  let phase: 'showing' | 'input' | 'result' = state.phase;
  const scores = { ...state.scores };

  if (newInputs.length === state.sequence.length) {
    if (!roundWinner) {
      roundWinner = playerId;
      scores[playerId] = (scores[playerId] || 0) + 1;
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
    playerInputs,
    roundWinner,
    scores,
    phase,
    gameWinner,
  };
}

export function nextPatternRound(state: PatternMasterState): PatternMasterState {
  const players = Object.keys(state.scores);
  const nextSeqLength = 3 + state.round; // Increases length each round
  return {
    ...state,
    round: state.round + 1,
    sequence: generateSequence(nextSeqLength),
    playerInputs: makeEmptyInputs(players),
    failedPlayers: [],
    roundWinner: null,
    phase: 'showing',
    startedAt: Date.now(),
  };
}
