import { QUICK_TAP_DURATION_MS } from '../../../shared/constants';

export interface BowlingRollResult {
  playerId: string;
  startX: number;
  angle: number;
  power: number;
  fallenPins: number[];
}

export interface BowlingFrame {
  rolls: number[];
  score: number | null;
}

export interface BowlingState {
  phase: 'countdown' | 'playing' | 'result';
  scores: Record<string, number>;
  frames: Record<string, BowlingFrame[]>;
  currentTurnIndex: number;
  currentFrame: number;
  currentRollIndex: number;
  activePins: number[]; // 0 to 9
  lastRoll: BowlingRollResult | null;
  winner: string | null;
}

export function createBowlingState(players: string[]): BowlingState {
  const scores: Record<string, number> = {};
  const frames: Record<string, BowlingFrame[]> = {};
  players.forEach((p) => {
    scores[p] = 0;
    frames[p] = Array.from({ length: 10 }, () => ({ rolls: [], score: null }));
  });
  return {
    phase: 'countdown',
    scores,
    frames,
    currentTurnIndex: 0,
    currentFrame: 0,
    currentRollIndex: 0,
    activePins: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    lastRoll: null,
    winner: null,
  };
}

function calculateStandardBowlingScore(frames: BowlingFrame[]): number {
  let score = 0;
  const allRolls: number[] = [];
  
  for (let i = 0; i < 10; i++) {
    if (frames[i] && frames[i].rolls) {
      allRolls.push(...frames[i].rolls);
    }
  }

  let flatIndex = 0;
  for (let frameIndex = 0; frameIndex < 10; frameIndex++) {
    if (flatIndex >= allRolls.length) break;

    const frame = frames[frameIndex];
    if (!frame || frame.rolls.length === 0) break;

    const roll1 = allRolls[flatIndex] || 0;
    
    if (roll1 === 10) { // Strike
      score += 10;
      if (flatIndex + 1 < allRolls.length) score += allRolls[flatIndex + 1];
      if (flatIndex + 2 < allRolls.length) score += allRolls[flatIndex + 2];
      flatIndex += 1;
    } else {
      const roll2 = allRolls[flatIndex + 1];
      if (roll2 !== undefined) {
        if (roll1 + roll2 === 10) { // Spare
          score += 10;
          if (flatIndex + 2 < allRolls.length) score += allRolls[flatIndex + 2];
        } else { // Open frame
          score += roll1 + roll2;
        }
      } else {
        score += roll1; // incomplete frame
      }
      flatIndex += 2;
    }
  }
  return score;
}

export function handleBowlingAction(state: BowlingState, player: string, action: any): BowlingState {
  const allPlayers = Object.keys(state.scores);
  if (action.type === 'START') {
    return { ...state, phase: 'playing' };
  }

  if (action.type === 'ROLL' && state.phase === 'playing') {
    const currentPlayerId = allPlayers[state.currentTurnIndex];
    if (player !== currentPlayerId) return state; // Not your turn!

    const { startX, angle, power } = action.payload; // startX: -1 to 1, angle: -1 to 1, power: 0 to 1

    // Deterministic physics calculation for the throw
    const endX = startX + angle * 2; // Where the ball crosses the pin line
    let fallenPins: number[] = [];

    // Gutter ball
    if (endX < -1.2 || endX > 1.2) {
      fallenPins = [];
    } else {
      // Perfect pocket hit is around -0.15 or 0.15
      const offset = Math.abs(endX) - 0.15;
      const accuracy = 1 - Math.min(1, Math.abs(offset) * 2);
      
      // Calculate how many pins fall based on accuracy and power
      const hitStrength = accuracy * power;
      const numPinsToFall = Math.floor(hitStrength * 10) + (Math.random() > 0.5 ? 1 : 0); // slight randomness for realism
      
      const availablePins = [...state.activePins];
      if (numPinsToFall >= availablePins.length) {
        fallenPins = [...availablePins];
      } else {
        for (let i = 0; i < numPinsToFall; i++) {
          if (availablePins.length === 0) break;
          const idx = Math.floor(Math.random() * availablePins.length);
          fallenPins.push(availablePins[idx]);
          availablePins.splice(idx, 1);
        }
      }
    }

    const newActivePins = state.activePins.filter(p => !fallenPins.includes(p));
    const isStrike = state.currentRollIndex === 0 && fallenPins.length === 10;
    
    // Update frames
    const newFrames = JSON.parse(JSON.stringify(state.frames));
    const playerFrames = newFrames[player];
    playerFrames[state.currentFrame].rolls.push(fallenPins.length);
    
    // Calculate full standard score
    const newScores = { ...state.scores };
    newScores[player] = calculateStandardBowlingScore(playerFrames);

    let nextRollIndex = state.currentRollIndex + 1;
    let nextTurnIndex = state.currentTurnIndex;
    let nextFrame = state.currentFrame;
    let nextActivePins = newActivePins;
    let frameOver = false;

    if (state.currentFrame < 9) {
      if (isStrike || nextRollIndex >= 2) frameOver = true;
    } else {
      // 10th frame rules
      const rollsThisFrame = playerFrames[state.currentFrame].rolls;
      if (rollsThisFrame.length === 2 && rollsThisFrame[0] + rollsThisFrame[1] < 10) {
        frameOver = true;
      } else if (rollsThisFrame.length >= 3) {
        frameOver = true;
      } else if (rollsThisFrame.length < 3 && nextActivePins.length === 0) {
         // Reset pins for the bonus roll!
         nextActivePins = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
      }
    }

    if (frameOver) {
      nextRollIndex = 0;
      nextTurnIndex = (state.currentTurnIndex + 1) % allPlayers.length;
      nextActivePins = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
      if (nextTurnIndex === 0) nextFrame++;
    }

    let newPhase: 'countdown' | 'playing' | 'result' = state.phase;
    let winner = null;
    if (nextFrame >= 10) {
      newPhase = 'result';
      let max = -1;
      for (const [p, s] of Object.entries(newScores)) {
        if (s > max) { max = s; winner = p; }
      }
    }

    return {
      ...state,
      phase: newPhase,
      scores: newScores,
      frames: newFrames,
      currentTurnIndex: nextTurnIndex,
      currentFrame: nextFrame,
      currentRollIndex: nextRollIndex,
      activePins: nextActivePins,
      lastRoll: { playerId: player, startX, angle, power, fallenPins },
      winner
    };
  }

  return state;
}
