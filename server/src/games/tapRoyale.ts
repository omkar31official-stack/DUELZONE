import { TapRoyaleState } from '../../../shared/types';
import { QUICK_TAP_DURATION_MS } from '../../../shared/constants';

const MAX_TAPS_PER_SECOND = 22;

export function createTapRoyaleState(playerIds: string[]): TapRoyaleState {
  return {
    phase: 'countdown',
    startTime: null,
    endTime: null,
    tapCounts: Object.fromEntries(playerIds.map(id => [id, 0])),
    winner: null,
  };
}

export function startTapRoyale(state: TapRoyaleState): TapRoyaleState {
  const now = Date.now();
  return {
    ...state,
    phase: 'playing',
    startTime: now,
    endTime: now + QUICK_TAP_DURATION_MS,
  };
}

export function applyTapRoyaleTap(
  state: TapRoyaleState,
  playerId: string,
  serverNow: number,
): TapRoyaleState | null {
  if (state.phase !== 'playing') return null;
  if (state.endTime && serverNow > state.endTime) return null;
  if (!(playerId in state.tapCounts)) return null;

  const elapsed = serverNow - (state.startTime ?? serverNow);
  const currentCount = state.tapCounts[playerId];
  const maxAllowed = Math.floor((elapsed / 1000) * MAX_TAPS_PER_SECOND) + MAX_TAPS_PER_SECOND;
  if (currentCount >= maxAllowed) return null;

  return {
    ...state,
    tapCounts: {
      ...state.tapCounts,
      [playerId]: currentCount + 1,
    },
  };
}

export function finishTapRoyale(state: TapRoyaleState): TapRoyaleState {
  const entries = Object.entries(state.tapCounts).sort((a, b) => b[1] - a[1]);
  const winner = entries.length > 1 && entries[0][1] === entries[1][1] ? null : entries[0]?.[0] ?? null;
  return { ...state, phase: 'result', winner };
}
