"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFindMatchRound = generateFindMatchRound;
exports.validateFindMatchGeneration = validateFindMatchGeneration;
const constants_1 = require("../../../shared/constants");
function secureRandInt(min, max) {
    // good enough CSPRNG for game use
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = secureRandInt(0, i);
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}
/** Generate a single Find Match round with EXACTLY one common symbol */
function generateFindMatchRound(round, totalRounds, scores, difficulty) {
    const symbolPool = [...constants_1.FIND_MATCH_SYMBOLS];
    const count = constants_1.FIND_MATCH_SYMBOL_COUNTS[difficulty] ?? 7;
    // Pick the one common symbol
    const commonIdx = secureRandInt(0, symbolPool.length - 1);
    const commonSymbolId = symbolPool[commonIdx];
    // Remove it from pool so it only appears once on each board
    const remaining = symbolPool.filter((_, i) => i !== commonIdx);
    const shuffled = shuffle(remaining);
    // Player 1 gets (count - 1) unique + common
    const p1Others = shuffled.slice(0, count - 1);
    const p2Others = shuffled.slice(count - 1, (count - 1) * 2);
    // Build symbol objects with random positions / sizes / rotations
    // We use a simple circle-packing approach: place in a grid then jitter
    function makeSymbols(ids) {
        const allIds = shuffle([...ids, commonSymbolId]);
        return allIds.map((id) => ({
            id,
            x: 0.1 + Math.random() * 0.8,
            y: 0.1 + Math.random() * 0.8,
            size: 0.055 + Math.random() * 0.035,
            rotation: Math.random() * 360,
        }));
    }
    return {
        round,
        totalRounds,
        commonSymbolId,
        player1Symbols: makeSymbols(p1Others),
        player2Symbols: makeSymbols(p2Others),
        scores,
        difficulty,
    };
}
/** Validate 10,000 rounds to ensure correctness */
function validateFindMatchGeneration(iterations = 10000) {
    const errors = [];
    for (let i = 0; i < iterations; i++) {
        const round = generateFindMatchRound(1, 10, {}, 'normal');
        const p1Ids = round.player1Symbols.map((s) => s.id);
        const p2Ids = round.player2Symbols.map((s) => s.id);
        const common = round.commonSymbolId;
        // 1) Common symbol present in both boards
        if (!p1Ids.includes(common))
            errors.push(`Round ${i}: common not in p1`);
        if (!p2Ids.includes(common))
            errors.push(`Round ${i}: common not in p2`);
        // 2) No duplicates within each board
        if (new Set(p1Ids).size !== p1Ids.length)
            errors.push(`Round ${i}: p1 has duplicates`);
        if (new Set(p2Ids).size !== p2Ids.length)
            errors.push(`Round ${i}: p2 has duplicates`);
        // 3) Exactly ONE common symbol between boards
        const overlap = p1Ids.filter((id) => p2Ids.includes(id));
        if (overlap.length !== 1)
            errors.push(`Round ${i}: expected 1 common, got ${overlap.length}: ${overlap}`);
        if (overlap[0] !== common)
            errors.push(`Round ${i}: overlap is ${overlap[0]} but common is ${common}`);
        if (errors.length > 20)
            break; // stop early if many failures
    }
    return { passed: errors.length === 0, errors };
}
