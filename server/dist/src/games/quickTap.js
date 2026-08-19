"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createQTState = createQTState;
exports.startQT = startQT;
exports.applyQTTap = applyQTTap;
exports.finishQT = finishQT;
const constants_1 = require("../../../shared/constants");
const MAX_TAPS_PER_SECOND = 20; // anti-cheat ceiling
function createQTState(playerIds) {
    return {
        phase: 'countdown',
        startTime: null,
        endTime: null,
        tapCounts: { [playerIds[0]]: 0, [playerIds[1]]: 0 },
        winner: null,
    };
}
function startQT(state) {
    const now = Date.now();
    return {
        ...state,
        phase: 'playing',
        startTime: now,
        endTime: now + constants_1.QUICK_TAP_DURATION_MS,
    };
}
function applyQTTap(state, playerId, serverNow) {
    if (state.phase !== 'playing')
        return null;
    if (state.endTime && serverNow > state.endTime)
        return null;
    if (!(playerId in state.tapCounts))
        return null;
    const elapsed = serverNow - (state.startTime ?? serverNow);
    const currentCount = state.tapCounts[playerId];
    const maxAllowed = Math.floor((elapsed / 1000) * MAX_TAPS_PER_SECOND) + MAX_TAPS_PER_SECOND;
    if (currentCount >= maxAllowed)
        return null; // rate limit
    const tapCounts = { ...state.tapCounts, [playerId]: currentCount + 1 };
    return { ...state, tapCounts };
}
function finishQT(state) {
    const players = Object.keys(state.tapCounts);
    const [p1, p2] = players;
    const t1 = state.tapCounts[p1];
    const t2 = state.tapCounts[p2];
    const winner = t1 > t2 ? p1 : t2 > t1 ? p2 : null;
    return { ...state, phase: 'result', winner };
}
