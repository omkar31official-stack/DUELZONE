// End-to-end simulation: Create room → Select game → Start game
import * as RM from '../rooms/roomManager';
import { createGameState } from '../games/gameManager';

console.log('\n🔬 END-TO-END GAME START SIMULATION\n');

// Step 1: Create a room
const { room, player } = RM.createRoom('TestPlayer', 'socket-1');
console.log(`✅ Room created: code=${room.code}, status=${room.status}, host=${player.name}`);
console.log(`   Room code is numeric: ${/^\d+$/.test(room.code) ? 'YES ✅' : 'NO ❌'}`);

// Step 2: Add second player  
const joinResult = RM.joinRoom(room.code, 'Player2', 'socket-2');
if ('error' in joinResult) {
  console.log(`❌ Join failed: ${joinResult.error}`);
  process.exit(1);
}
console.log(`✅ Player2 joined. Room status=${joinResult.room.status}, players=${joinResult.room.players.length}`);

// Step 3: Test EVERY game - select, create state, set state
const newGames = ['word-scramble', 'trivia-blitz', 'speed-math', 'pattern-master', 'pic-combo', 'tap-royale', 'target-rush'];
const oldGames = ['find-match', 'tic-tac-toe', 'connect-four', 'rock-paper-scissors', 'reaction-duel', 'quick-tap', 'memory-duel', 'number-battle', 'color-clash', 'dots-and-boxes'];

let allOK = true;

for (const gameId of [...oldGames, ...newGames]) {
  // Reset room to lobby
  RM.returnToLobby(room.code);
  
  // Select game
  const selectedRoom = RM.selectGame(room.code, player.id, gameId as any);
  if (!selectedRoom) {
    console.log(`❌ ${gameId}: Failed to select game`);
    allOK = false;
    continue;
  }
  
  // Create game state (what socketManager does on room:startGame)
  const playerIds = selectedRoom.players.filter(p => p.isConnected).map(p => p.id);
  const { state } = createGameState(gameId as any, playerIds);
  
  if (!state) {
    console.log(`❌ ${gameId}: createGameState returned NULL! Game cannot start!`);
    allOK = false;
    continue;
  }
  
  // Set game state (transitions room to 'playing')
  RM.setGameState(room.code, state);
  const updatedRoom = RM.getRoom(room.code);
  
  if (updatedRoom?.status !== 'playing') {
    console.log(`❌ ${gameId}: Room didn't transition to 'playing' (status=${updatedRoom?.status})`);
    allOK = false;
    continue;
  }
  
  const tag = newGames.includes(gameId) ? '🆕' : '📦';
  console.log(`${tag} ✅ ${gameId}: Select ✓ → CreateState ✓ → Status=playing ✓`);
}

console.log(`\n${allOK ? '🎉 ALL 17 GAMES START SUCCESSFULLY!' : '⚠️ SOME GAMES FAILED!'}\n`);
