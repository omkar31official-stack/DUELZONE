import { QUICK_TAP_DURATION_MS } from '../../../shared/constants';

export interface Fruit {
  id: string;
  type: 'apple' | 'banana' | 'watermelon' | 'bomb';
  startX: number; // 0.1 to 0.9 (percentage of screen width)
  vx: number; // Horizontal velocity
  vy: number; // Vertical velocity (negative for up)
  spawnTime: number; // ms offset from game start
}

export interface FruitNinjaState {
  phase: 'countdown' | 'playing' | 'result';
  scores: Record<string, number>;
  startTime: number | null;
  endTime: number | null;
  winner: string | null;
  fruits: Fruit[];
  slashed: string[]; // Fruit IDs that have been slashed
}

export function createFruitNinjaState(players: string[]): FruitNinjaState {
  const scores: Record<string, number> = {};
  players.forEach((p) => { scores[p] = 0; });
  return { phase: 'countdown', scores, startTime: null, endTime: null, winner: null, fruits: [], slashed: [] };
}

export function handleFruitNinjaAction(state: FruitNinjaState, player: string, action: any): FruitNinjaState {
  if (action.type === 'START') {
    // Pre-generate a sequence of fruits for the entire round to ensure perfect multiplayer sync without lag!
    const fruits: Fruit[] = [];
    let currentTime = 1000; // First fruit at 1 second
    const types: ('apple' | 'banana' | 'watermelon' | 'bomb')[] = ['apple', 'banana', 'watermelon', 'bomb'];
    
    for (let i = 0; i < 40; i++) { // 40 fruits total
      fruits.push({
        id: `fruit_${i}`,
        type: types[Math.floor(Math.random() * (Math.random() > 0.8 ? 4 : 3))], // 20% chance of bomb
        startX: 0.2 + (Math.random() * 0.6), // 20% to 80% width
        vx: (Math.random() - 0.5) * 0.8, // -0.4 to 0.4
        vy: -1.2 - (Math.random() * 0.8), // Upward force (-1.2 to -2.0)
        spawnTime: currentTime
      });
      currentTime += 300 + Math.random() * 800; // Random delay between fruits
    }

    const duration = 25000; // 25 seconds
    const startTime = Date.now();
    return { ...state, phase: 'playing', startTime, endTime: startTime + duration, fruits, slashed: [] };
  }

  if (action.type === 'SLASH' && state.phase === 'playing') {
    const fruitId = action.payload?.fruitId;
    if (fruitId && !state.slashed.includes(fruitId)) {
      const fruit = state.fruits.find(f => f.id === fruitId);
      if (fruit) {
        let points = 0;
        if (fruit.type === 'bomb') points = -3;
        else if (fruit.type === 'watermelon') points = 2;
        else points = 1;

        const newScores = { ...state.scores, [player]: Math.max(0, (state.scores[player] || 0) + points) };
        return { ...state, scores: newScores, slashed: [...state.slashed, fruitId] };
      }
    }
  }

  if (action.type === 'FINISH') {
    let winner = null; let max = -1;
    for (const [p, s] of Object.entries(state.scores)) { if (s > max) { max = s; winner = p; } else if (s === max) winner = null; }
    return { ...state, phase: 'result', winner };
  }
  return state;
}
