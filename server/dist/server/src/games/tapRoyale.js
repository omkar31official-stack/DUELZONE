"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTapRoyaleState = createTapRoyaleState;
exports.startTapRoyale = startTapRoyale;
exports.applyTapRoyaleTap = applyTapRoyaleTap;
exports.finishTapRoyale = finishTapRoyale;
const constants_1 = require("../../../shared/constants");
const MAX_TAPS_PER_SECOND = 22;
function createTapRoyaleState(playerIds) {
    return {
        phase: 'countdown',
        startTime: null,
        endTime: null,
        tapCounts: Object.fromEntries(playerIds.map(id => [id, 0])),
        winner: null,
    };
}
function startTapRoyale(state) {
    const now = Date.now();
    return {
        ...state,
        phase: 'playing',
        startTime: now,
        endTime: now + constants_1.QUICK_TAP_DURATION_MS,
    };
}
function applyTapRoyaleTap(state, playerId, serverNow) {
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
        return null;
    return {
        ...state,
        tapCounts: {
            ...state.tapCounts,
            [playerId]: currentCount + 1,
        },
    };
}
function finishTapRoyale(state) {
    const entries = Object.entries(state.tapCounts).sort((a, b) => b[1] - a[1]);
    const winner = entries.length > 1 && entries[0][1] === entries[1][1] ? null : entries[0]?.[0] ?? null;
    return { ...state, phase: 'result', winner };
}
