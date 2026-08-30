import { validateFindMatchGeneration } from '../games/findMatch';
import { createTTTState, applyTTTMove } from '../games/ticTacToe';
import { createC4State, applyC4Move } from '../games/connectFour';
import { createRPSState, applyRPSChoice } from '../games/rockPaperScissors';
import { createRDState, setRDReady, applyRDReaction } from '../games/reactionDuel';
import { createQTState, startQT, applyQTTap, finishQT } from '../games/quickTap';
import { createMDState } from '../games/memoryDuel';
import { createNBState, applyNBChoice } from '../games/numberBattle';
import { createCCState, applyCCChoice } from '../games/colorClash';
import { createDABState, applyDABEdge } from '../games/dotsAndBoxes';
import { createTapRoyaleState, startTapRoyale, applyTapRoyaleTap, finishTapRoyale } from '../games/tapRoyale';
import { createTargetRushState } from '../games/targetRush';
import { createWSState, applyWSGuess } from '../games/wordScramble';
import { createTBState, applyTBAnswer } from '../games/triviaBlitz';
import { createGameState, handleGameAction } from '../games/gameManager';
import { createRoom, joinRoom, selectGame, snapshot, incrementWin } from '../rooms/roomManager';
import { GameId } from '../../../shared/types';

console.log('🧪 RUNNING EXTENDED DUELZONE MULTIPLAYER TEST SUITE...\n');

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${msg}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${msg}`);
    failed++;
  }
}

const players2 = ['p1', 'p2'];
const players5 = ['p1', 'p2', 'p3', 'p4', 'p5'];

// 1. ROOM MANAGER & MATCH MODE LIFECYCLE
console.log('1️⃣ Testing Room Manager & Match Mode...');
const { room: r1, player: p1 } = createRoom('HostUser', 'socket_1');
assert(r1.players.length === 1 && r1.players[0].isHost, 'Host room created successfully');

const joinRes = joinRoom(r1.code, 'GuestUser', 'socket_2');
assert('player' in joinRes && r1.players.length === 2 && r1.status === 'lobby', 'Guest joined -> status changed to lobby');

r1.matchMode = 'bo3';
const rSnap = snapshot(r1);
assert(rSnap.matchMode === 'bo3', 'MatchMode snapshot exported as BO3');

incrementWin(r1.code, p1.id);
assert(r1.players[0].gamesWon === 1, 'Player gamesWon incremented to 1');

// 2. FIND MATCH 10,000 ROUND VALIDATION
console.log('\n2️⃣ Testing Find Match (10,000 rounds generation)...');
const fmRes = validateFindMatchGeneration(10000);
assert(fmRes.passed, '10,000 Find Match rounds generated — EXACTLY 1 common symbol in all rounds');

// 3. TIC TAC TOE
console.log('\n3️⃣ Testing Tic Tac Toe Server Logic...');
let ttt = createTTTState(['p1', 'p2']);
ttt = applyTTTMove(ttt, 'p1', 0)!;
ttt = applyTTTMove(ttt, 'p2', 3)!;
ttt = applyTTTMove(ttt, 'p1', 1)!;
ttt = applyTTTMove(ttt, 'p2', 4)!;
ttt = applyTTTMove(ttt, 'p1', 2)!; // Row 0 complete
assert(ttt.winner === 'p1', 'P1 wins top row');
assert(ttt.scores['p1'] === 1, 'P1 score updated to 1');

// 4. CONNECT FOUR
console.log('\n4️⃣ Testing Connect Four Logic...');
let c4 = createC4State(['p1', 'p2']);
for (let i = 0; i < 3; i++) {
  c4 = applyC4Move(c4, 'p1', 0)!;
  c4 = applyC4Move(c4, 'p2', 1)!;
}
c4 = applyC4Move(c4, 'p1', 0)!; // Vertical 4
assert(c4.winner === 'p1', 'P1 wins vertical Connect Four');

// 5. ROCK PAPER SCISSORS
console.log('\n5️⃣ Testing Rock Paper Scissors Logic...');
let rps = createRPSState(['p1', 'p2']);
rps = applyRPSChoice(rps, 'p1', 'rock')!;
rps = applyRPSChoice(rps, 'p2', 'scissors')!;
assert(rps.roundWinner === 'p1', 'Rock beats Scissors');
assert(rps.scores['p1'] === 1, 'P1 score incremented');

// 6. REACTION DUEL
console.log('\n6️⃣ Testing Reaction Duel False Start Protection...');
let rd = createRDState(['p1', 'p2']);
rd = setRDReady(rd);
rd = applyRDReaction(rd, 'p1', Date.now())!; // Reacted during ready phase
assert(rd.reactions['p1'] === 'false-start', 'Early tap detected as false start');

// 7. QUICK TAP
console.log('\n7️⃣ Testing Quick Tap Game...');
let qt = createQTState(['p1', 'p2']);
qt = startQT(qt);
qt = applyQTTap(qt, 'p1', Date.now())!;
qt = applyQTTap(qt, 'p1', Date.now())!;
qt = applyQTTap(qt, 'p2', Date.now())!;
qt = finishQT(qt);
assert(qt.tapCounts['p1'] === 2 && qt.tapCounts['p2'] === 1, 'Tap counts registered correctly');
assert(qt.winner === 'p1', 'P1 wins Quick Tap with most taps');

// 8. MEMORY DUEL
console.log('\n8️⃣ Testing Memory Duel Logic...');
let md = createMDState(['p1', 'p2']);
assert(md.cards.length === 16, '16 cards generated for Memory Duel');
assert(md.currentTurn === 'p1', 'First turn assigned to P1');

// 9. NUMBER BATTLE
console.log('\n9️⃣ Testing Number Battle Logic...');
let nb = createNBState(['p1', 'p2']);
const p1Num = nb.playerNumbers['p1'][0];
const p2Num = nb.playerNumbers['p2'][0];
nb = applyNBChoice(nb, 'p1', p1Num)!;
nb = applyNBChoice(nb, 'p2', p2Num)!;
assert(nb.revealed === true, 'Both players chose -> round revealed');

// 10. COLOR CLASH
console.log('\n🔟 Testing Color Clash Logic...');
let cc = createCCState(['p1', 'p2']);
const correctColor = cc.inkColor;
cc = applyCCChoice(cc, 'p1', correctColor, Date.now())!;
assert(cc.choices['p1'] === correctColor, 'Color choice recorded accurately');

// 11. DOTS AND BOXES
console.log('\n1️⃣1️⃣ Testing Dots & Boxes Logic...');
let dab = createDABState(['p1', 'p2']);
dab = applyDABEdge(dab, 'p1', 'h', 0, 0)!;
assert(dab.horizontalEdges[0][0] === 'p1', 'Horizontal edge drawn by P1');
assert(dab.currentTurn === 'p2', 'Turn passed to P2');

// 12. TAP ROYALE (5-PLAYER)
console.log('\n1️⃣2️⃣ Testing 5-Player Tap Royale...');
let tr = createTapRoyaleState(players5);
tr = startTapRoyale(tr);
players5.forEach((p, idx) => {
  for (let i = 0; i <= idx; i++) {
    tr = applyTapRoyaleTap(tr, p, Date.now())!;
  }
});
tr = finishTapRoyale(tr);
assert(tr.winner === 'p5', 'P5 wins 5-Player Tap Royale with 5 taps');

// 13. TARGET RUSH (5-PLAYER)
console.log('\n1️⃣3️⃣ Testing 5-Player Target Rush...');
let trush = createTargetRushState(players5);
assert(Object.keys(trush.playerNumbers).length === 5, '5 player hands initialized in Target Rush');

// 14. WORD SCRAMBLE (5-PLAYER)
console.log('\n1️⃣4️⃣ Testing 5-Player Word Scramble...');
let ws = createWSState(players5);
assert(ws.scrambledWord !== '', 'Scrambled word generated');
assert(ws.originalWord !== '', 'Original word present');
ws = applyWSGuess(ws, 'p1', ws.originalWord)!;
assert(ws.roundWinner === 'p1', 'Correct guess wins round');
assert(ws.scores['p1'] === 1, 'P1 score updated');

// 15. TRIVIA BLITZ (5-PLAYER)
console.log('\n1️⃣5️⃣ Testing 5-Player Trivia Blitz...');
let tb = createTBState(players5);
assert(tb.currentQuestion.options.length === 4, 'Trivia question has 4 options');
const correctIdx = tb.currentQuestion.correctIndex;
players5.forEach((p, idx) => {
  tb = applyTBAnswer(tb, p, idx === 0 ? correctIdx : (correctIdx + 1) % 4)!;
});
assert(tb.roundWinner === 'p1', 'P1 wins Trivia Blitz round with correct answer');

// 16. GAMEMANAGER INSTANTIATION & ACTION DISPATCH FOR ALL GAMES
console.log('\n1️⃣6️⃣ Verifying GameManager Instantiation for ALL 27+ Games...');
const gameIds: GameId[] = [
  'find-match', 'tic-tac-toe', 'connect-four', 'rock-paper-scissors',
  'reaction-duel', 'quick-tap', 'memory-duel', 'number-battle',
  'color-clash', 'dots-and-boxes', 'tap-royale', 'target-rush',
  'word-scramble', 'trivia-blitz', 'speed-math', 'pattern-master',
  'pic-combo', 'archery', 'bowling', 'hammer', 'animal-balance',
  'ping-ball', 'knife-thrower', 'fruit-ninja', 'cornhole',
  'chain-reaction', 'coop-puzzle', 'water-sort', 'sudoku',
  '2048', 'math-24', 'ping-pong', 'air-hockey', 'spinner-battle',
  'snake-duel', 'mini-golf', 'tug-of-war', 'whack-mole',
  'hand-slap', 'penalty-kicks', 'ultimate-ttt'
];

let allCreated = true;
gameIds.forEach((id) => {
  const { state } = createGameState(id, players2);
  if (!state) {
    console.error(`  ❌ Failed to create game state for ${id}`);
    allCreated = false;
  }
});
assert(allCreated, 'All 41 listed game IDs successfully initialized via GameManager');

// 17. TUG OF WAR ACTION TEST
console.log('\n1️⃣7️⃣ Testing Tug of War Action Handling...');
const { state: towState } = createGameState('tug-of-war', players2);
const dummyBroadcast = () => {};
const nextTowState = handleGameAction('tug-of-war', towState, 'p1', { type: 'PULL' }, 'ROOM1', dummyBroadcast);
assert(nextTowState !== null && (nextTowState as any).ropePos === -5, 'P1 pull moves Tug of War rope toward P1 side');

// 18. WHACK A MOLE ACTION TEST
console.log('\n1️⃣8️⃣ Testing Whack-a-Mole Action Handling...');
const { state: wamState } = createGameState('whack-mole', players2);
const activeIndex = (wamState as any).activeMoleIndex;
const nextWamState = handleGameAction('whack-mole', wamState, 'p1', { type: 'WHACK', payload: { index: activeIndex } }, 'ROOM1', dummyBroadcast);
assert(nextWamState !== null && (nextWamState as any).scores['p1'] === 1, 'Whack-a-Mole action correctly scores point');

// Summary
console.log('\n========================================');
console.log(`FINAL TEST SUITE RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log('========================================');

if (failed > 0) process.exit(1);
