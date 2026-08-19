"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const findMatch_1 = require("../games/findMatch");
const ticTacToe_1 = require("../games/ticTacToe");
const connectFour_1 = require("../games/connectFour");
const rockPaperScissors_1 = require("../games/rockPaperScissors");
const reactionDuel_1 = require("../games/reactionDuel");
console.log('🧪 RUNNING AUTOMATED MULTIPLAYER & GAME SUITE TESTS...\n');
let passed = 0;
let failed = 0;
function assert(condition, msg) {
    if (condition) {
        console.log(`  ✅ PASS: ${msg}`);
        passed++;
    }
    else {
        console.error(`  ❌ FAIL: ${msg}`);
        failed++;
    }
}
// 1. FIND MATCH 10,000 ROUND VALIDATION
console.log('1️⃣ Testing Find Match 10,000 Rounds Generation...');
const fmRes = (0, findMatch_1.validateFindMatchGeneration)(10000);
assert(fmRes.passed, '10,000 Find Match rounds generated — EXACTLY 1 common symbol in all rounds');
// 2. TIC TAC TOE
console.log('\n2️⃣ Testing Tic Tac Toe Server Logic...');
let ttt = (0, ticTacToe_1.createTTTState)(['p1', 'p2']);
ttt = (0, ticTacToe_1.applyTTTMove)(ttt, 'p1', 0);
ttt = (0, ticTacToe_1.applyTTTMove)(ttt, 'p2', 3);
ttt = (0, ticTacToe_1.applyTTTMove)(ttt, 'p1', 1);
ttt = (0, ticTacToe_1.applyTTTMove)(ttt, 'p2', 4);
ttt = (0, ticTacToe_1.applyTTTMove)(ttt, 'p1', 2); // Row 0 complete
assert(ttt.winner === 'p1', 'P1 wins top row');
assert(ttt.scores['p1'] === 1, 'P1 score updated to 1');
// 3. CONNECT FOUR
console.log('\n3️⃣ Testing Connect Four Logic...');
let c4 = (0, connectFour_1.createC4State)(['p1', 'p2']);
for (let i = 0; i < 3; i++) {
    c4 = (0, connectFour_1.applyC4Move)(c4, 'p1', 0);
    c4 = (0, connectFour_1.applyC4Move)(c4, 'p2', 1);
}
c4 = (0, connectFour_1.applyC4Move)(c4, 'p1', 0); // Vertical 4
assert(c4.winner === 'p1', 'P1 wins vertical Connect Four');
// 4. ROCK PAPER SCISSORS
console.log('\n4️⃣ Testing Rock Paper Scissors Logic...');
let rps = (0, rockPaperScissors_1.createRPSState)(['p1', 'p2']);
rps = (0, rockPaperScissors_1.applyRPSChoice)(rps, 'p1', 'rock');
rps = (0, rockPaperScissors_1.applyRPSChoice)(rps, 'p2', 'scissors');
assert(rps.roundWinner === 'p1', 'Rock beats Scissors');
assert(rps.scores['p1'] === 1, 'P1 score incremented');
// 5. REACTION DUEL
console.log('\n5️⃣ Testing Reaction Duel False Start Protection...');
let rd = (0, reactionDuel_1.createRDState)(['p1', 'p2']);
rd = (0, reactionDuel_1.setRDReady)(rd);
rd = (0, reactionDuel_1.applyRDReaction)(rd, 'p1', Date.now()); // Reacted during ready phase
assert(rd.reactions['p1'] === 'false-start', 'Early tap detected as false start');
// Summary
console.log('\n========================================');
console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log('========================================');
if (failed > 0)
    process.exit(1);
