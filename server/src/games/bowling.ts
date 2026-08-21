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

const PIN_RADIUS = 0.08;
const BALL_RADIUS = 0.12;

const INITIAL_PINS = [
  { id: 0, x: 0, y: 0.1 },
  { id: 1, x: -0.15, y: 0.00 }, { id: 2, x: 0.15, y: 0.00 },
  { id: 3, x: -0.3, y: -0.10 }, { id: 4, x: 0, y: -0.10 }, { id: 5, x: 0.3, y: -0.10 },
  { id: 6, x: -0.45, y: -0.20 }, { id: 7, x: -0.15, y: -0.20 }, { id: 8, x: 0.15, y: -0.20 }, { id: 9, x: 0.45, y: -0.20 }
];

function simulateBowlingPhysics(startX: number, angle: number, power: number, activePinIds: number[]): number[] {
  let ball = { x: startX, y: 1.5, vx: angle * power * 0.06, vy: -power * 0.08 };
  
  let pins = INITIAL_PINS.map(p => ({ ...p, vx: 0, vy: 0, isStanding: activePinIds.includes(p.id) }));
  
  for (let frame = 0; frame < 150; frame++) {
    ball.x += ball.vx;
    ball.y += ball.vy;
    
    // Gutter detection (lane is x: -1 to 1)
    if (ball.x < -1 || ball.x > 1) {
      ball.x = -100; ball.vx = 0; ball.vy = 0;
    }

    for (let p of pins) {
      if (!p.isStanding) continue;
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.95;
      p.vy *= 0.95;
      
      const orig = INITIAL_PINS[p.id];
      const distSq = (p.x - orig.x)**2 + (p.y - orig.y)**2;
      // If pin moves more than 0.1 units, it falls over
      if (distSq > 0.01) p.isStanding = false;
    }

    // Ball -> Pin collisions
    for (let p of pins) {
      if (!p.isStanding) continue;
      const dx = p.x - ball.x;
      const dy = p.y - ball.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < BALL_RADIUS + PIN_RADIUS) {
        const nx = dx / dist;
        const ny = dy / dist;
        const force = 0.08 * power;
        p.vx += nx * force;
        p.vy += ny * force;
        ball.vx *= 0.85;
        ball.vy *= 0.85;
      }
    }

    // Pin -> Pin collisions
    for (let i = 0; i < pins.length; i++) {
      if (!pins[i].isStanding) continue;
      for (let j = i + 1; j < pins.length; j++) {
        if (!pins[j].isStanding) continue;
        const dx = pins[j].x - pins[i].x;
        const dy = pins[j].y - pins[i].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < PIN_RADIUS * 2) {
          const nx = dx / dist;
          const ny = dy / dist;
          const relVx = pins[i].vx - pins[j].vx;
          const relVy = pins[i].vy - pins[j].vy;
          const transfer = (relVx * nx + relVy * ny) * 0.8;
          if (transfer > 0) {
            pins[i].vx -= nx * transfer;
            pins[i].vy -= ny * transfer;
            pins[j].vx += nx * transfer;
            pins[j].vy += ny * transfer;
          }
        }
      }
    }
  }

  return pins.filter(p => !p.isStanding && activePinIds.includes(p.id)).map(p => p.id);
}

export function handleBowlingAction(state: BowlingState, player: string, action: any): BowlingState {
  const allPlayers = Object.keys(state.scores);
  if (action.type === 'START') {
    return { ...state, phase: 'playing' };
  }

  if (action.type === 'ROLL' && state.phase === 'playing') {
    const currentPlayerId = allPlayers[state.currentTurnIndex];
    if (player !== currentPlayerId) return state; // Not your turn!

    const { startX, angle, power } = action.payload; // startX: -1 to 1, angle: -1 to 1, power: 0.2 to 1

    // True deterministic 2D physics simulation to get fallen pins
    const fallenPins = simulateBowlingPhysics(startX, angle, power, state.activePins);

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
