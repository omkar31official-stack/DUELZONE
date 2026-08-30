import { GameState } from '../types';

export interface EscapeRoomStage {
  stageNum: number;
  type: 'keypad' | 'wires' | 'symbol' | 'terminal';
  code?: string;
  wireSequence?: string[];
  terminalPrompt?: string;
  solution?: string;
}

export interface EscapeRoomState extends GameState {
  scores: Record<string, number>;
  stage: number;
  maxStages: number;
  unlockedStages: Record<string, number>;
  terminalOutput: string[];
  clues: string[];
  winner: string | null;
}

const STAGES: EscapeRoomStage[] = [
  { stageNum: 1, type: 'keypad', code: '4829' },
  { stageNum: 2, type: 'wires', wireSequence: ['RED', 'BLUE', 'YELLOW'] },
  { stageNum: 3, type: 'symbol', solution: 'ALPHA_OMEGA' },
  { stageNum: 4, type: 'terminal', code: 'OVERRIDE_99' },
];

export const createEscapeRoomState = (players: string[]): EscapeRoomState => {
  const scores: Record<string, number> = {};
  const unlockedStages: Record<string, number> = {};

  players.forEach((pId) => {
    scores[pId] = 0;
    unlockedStages[pId] = 1;
  });

  return {
    scores,
    stage: 1,
    maxStages: 4,
    unlockedStages,
    terminalOutput: ['SYSTEM LOCKED.', 'SOLVE STAGE 1 KEYPAD CODE TO ESCAPE.'],
    clues: ['Clue 1: Check code on wall: 4-8-2-9'],
    winner: null,
  };
};

export const handleEscapeRoomAction = (
  state: EscapeRoomState,
  playerId: string,
  action: { type: string; payload?: any }
): EscapeRoomState => {
  if (state.winner) return state;

  const currentStageNum = state.unlockedStages[playerId] || 1;

  if (action.type === 'SUBMIT_CODE') {
    const inputCode = action.payload?.code;
    const stageInfo = STAGES[currentStageNum - 1];

    if (stageInfo && inputCode === stageInfo.code) {
      const nextStage = currentStageNum + 1;
      state.unlockedStages[playerId] = nextStage;
      state.scores[playerId] = (state.scores[playerId] || 0) + 25;

      if (nextStage > state.maxStages) {
        state.winner = playerId;
        state.terminalOutput.push(`ACCESS GRANTED. PLAYER ${playerId} ESCAPED!`);
      } else {
        state.terminalOutput.push(`STAGE ${currentStageNum} CLEARED! PROCEEDING TO STAGE ${nextStage}.`);
      }
    } else {
      state.terminalOutput.push(`ACCESS DENIED. INVALID CODE ENTERED.`);
    }

    return { ...state };
  }

  if (action.type === 'CUT_WIRE') {
    const wireColor = action.payload?.color;
    if (wireColor === 'RED') {
      state.unlockedStages[playerId] = (state.unlockedStages[playerId] || 1) + 1;
      state.scores[playerId] = (state.scores[playerId] || 0) + 25;
      state.terminalOutput.push(`WIRE DISARMED SUCCESSFUL!`);
    } else {
      state.terminalOutput.push(`BOOM! WRONG WIRE CUT!`);
    }
    return { ...state };
  }

  return state;
};
