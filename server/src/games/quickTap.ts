import { QuickTapState } from '../../../shared/types';
import { QUICK_TAP_DURATION_MS } from '../../../shared/constants';

const MAX_TAPS_PER_SECOND = 20; // anti-cheat ceiling

export function createQTState(playerIds: [string, string]): QuickTapState {
  return {
    phase: 'countdown',
    startTime: null,
    endTime: null,
    tapCounts: { [playerIds[0]]: 0, [playerIds[1]]: 0 },
    winner: null,
  };
}

export function startQT(state: QuickTapState): QuickTapState {
  const now = Date.now();
  return {
    ...state,
    phase: 'playing',
    startTime: now,
    endTime: now + QUICK_TAP_DURATION_MS,
  };
}

export function applyQTTap(
  state: QuickTapState,
  playerId: string,
  serverNow: number,
): QuickTapState | null {
  if (state.phase !== 'playing') return null;
  if (state.endTime && serverNow > state.endTime) return null;
  if (!(playerId in state.tapCounts)) return null;

  const elapsed = serverNow - (state.startTime ?? serverNow);
  const currentCount = state.tapCounts[playerId];
  const maxAllowed = Math.floor((elapsed / 1000) * MAX_TAPS_PER_SECOND) + MAX_TAPS_PER_SECOND;
  if (currentCount >= maxAllowed) return null; // rate limit

  const tapCounts = { ...state.tapCounts, [playerId]: currentCount + 1 };
  return { ...state, tapCounts };
}

export function finishQT(state: QuickTapState): QuickTapState {
  const players = Object.keys(state.tapCounts);
  const [p1, p2] = players;
  const t1 = state.tapCounts[p1];
  const t2 = state.tapCounts[p2];
  const winner = t1 > t2 ? p1 : t2 > t1 ? p2 : null;
  return { ...state, phase: 'result', winner };
}
