import React, { useEffect, useState } from 'react';
import { socket } from './lib/socket';
import { RoomSnapshot, Player, ChatMessage } from './shared/types';
import { HomePage } from './components/HomePage';
import { RoomLobby } from './components/RoomLobby';
import { WinnerModal } from './components/WinnerModal';
import { FindMatchGame } from './components/games/FindMatchGame';
import { TicTacToeGame } from './components/games/TicTacToeGame';
import { ReactionDuelGame } from './components/games/ReactionDuelGame';
import { ConnectFourGame } from './components/games/ConnectFourGame';
import { RockPaperScissorsGame } from './components/games/RockPaperScissorsGame';
import { QuickTapGame } from './components/games/QuickTapGame';
import { MemoryDuelGame } from './components/games/MemoryDuelGame';
import { NumberBattleGame } from './components/games/NumberBattleGame';
import { ColorClashGame } from './components/games/ColorClashGame';
import { DotsAndBoxesGame } from './components/games/DotsAndBoxesGame';
import { ALL_GAMES } from './shared/constants.ts';
import { Volume2, VolumeX, Swords } from 'lucide-react';
import { sounds } from './lib/sound';

export function App() {
  const [room, setRoom] = useState<RoomSnapshot | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    socket.on('room:update', (updatedRoom) => {
      setRoom(updatedRoom);
    });

    socket.on('room:error', (msg) => {
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(null), 4000);
    });

    socket.on('chat:message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('game:state', (gameState) => {
      setRoom((prev) => (prev ? { ...prev, gameState } : null));
    });

    socket.on('room:closed', (reason) => {
      setRoom(null);
      setCurrentPlayer(null);
      setErrorMessage(reason);
      setTimeout(() => setErrorMessage(null), 4000);
    });

    return () => {
      socket.off('room:update');
      socket.off('room:error');
      socket.off('chat:message');
      socket.off('game:state');
      socket.off('room:closed');
    };
  }, []);

  const handleCreateRoom = (playerName: string) => {
    socket.emit('room:create', { playerName }, (res) => {
      if (res.ok && res.room && res.player) {
        setRoom(res.room);
        setCurrentPlayer(res.player);
      } else {
        setErrorMessage(res.error || 'Failed to create room.');
      }
    });
  };

  const handleJoinRoom = (code: string, playerName: string) => {
    socket.emit('room:join', { code, playerName }, (res) => {
      if (res.ok && res.room && res.player) {
        setRoom(res.room);
        setCurrentPlayer(res.player);
      } else {
        setErrorMessage(res.error || 'Failed to join room.');
      }
    });
  };

  const toggleSound = () => {
    sounds.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
  };

  const opponent = room?.players.find((p) => p.id !== currentPlayer?.id) || null;

  // Determine game winner
  let winnerId: string | null = null;
  const gameState = room?.gameState as any;
  if (gameState) {
    if (gameState.gameWinner) winnerId = gameState.gameWinner;
    else if (gameState.winner) winnerId = gameState.winner;
  }

  const selectedGameMeta = ALL_GAMES.find((g) => g.id === room?.selectedGame);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col items-center p-4 sm:p-6 font-sans relative">
      {/* Top Navbar */}
      <header className="w-full max-w-6xl flex items-center justify-between py-4 border-b border-slate-800/80 mb-6">
        <div
          onClick={() => {
            if (!room) window.location.href = '/';
          }}
          className="flex items-center gap-2 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center shadow-lg font-black text-white">
            <Swords className="w-6 h-6" />
          </div>
          <span className="text-2xl font-black tracking-tight text-white">
            DUEL<span className="text-purple-400">ZONE</span>
          </span>
        </div>

        <button
          onClick={toggleSound}
          className="p-2.5 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 transition active:scale-95 text-slate-300 cursor-pointer"
          title="Toggle Sound"
        >
          {soundEnabled ? <Volume2 className="w-5 h-5 text-emerald-400" /> : <VolumeX className="w-5 h-5 text-slate-500" />}
        </button>
      </header>

      {/* Error Toast */}
      {errorMessage && (
        <div className="fixed top-6 z-50 bg-rose-950 border border-rose-700 text-rose-200 px-6 py-3 rounded-full shadow-2xl font-bold text-sm animate-bounce">
          ⚠️ {errorMessage}
        </div>
      )}

      {/* Screen Router */}
      {!room ? (
        <HomePage onCreateRoom={handleCreateRoom} onJoinRoom={handleJoinRoom} />
      ) : room.status === 'playing' && room.selectedGame && room.gameState ? (
        <main className="w-full flex flex-col items-center justify-center">
          {room.selectedGame === 'find-match' && (
            <FindMatchGame
              socket={socket}
              state={room.gameState as any}
              currentPlayer={currentPlayer}
              opponentPlayer={opponent}
            />
          )}
          {room.selectedGame === 'tic-tac-toe' && (
            <TicTacToeGame
              socket={socket}
              state={room.gameState as any}
              currentPlayer={currentPlayer}
              opponentPlayer={opponent}
            />
          )}
          {room.selectedGame === 'reaction-duel' && (
            <ReactionDuelGame
              socket={socket}
              state={room.gameState as any}
              currentPlayer={currentPlayer}
              opponentPlayer={opponent}
            />
          )}
          {room.selectedGame === 'connect-four' && (
            <ConnectFourGame
              socket={socket}
              state={room.gameState as any}
              currentPlayer={currentPlayer}
              opponentPlayer={opponent}
            />
          )}
          {room.selectedGame === 'rock-paper-scissors' && (
            <RockPaperScissorsGame
              socket={socket}
              state={room.gameState as any}
              currentPlayer={currentPlayer}
              opponentPlayer={opponent}
            />
          )}
          {room.selectedGame === 'quick-tap' && (
            <QuickTapGame
              socket={socket}
              state={room.gameState as any}
              currentPlayer={currentPlayer}
              opponentPlayer={opponent}
            />
          )}
          {room.selectedGame === 'memory-duel' && (
            <MemoryDuelGame
              socket={socket}
              state={room.gameState as any}
              currentPlayer={currentPlayer}
              opponentPlayer={opponent}
            />
          )}
          {room.selectedGame === 'number-battle' && (
            <NumberBattleGame
              socket={socket}
              state={room.gameState as any}
              currentPlayer={currentPlayer}
              opponentPlayer={opponent}
            />
          )}
          {room.selectedGame === 'color-clash' && (
            <ColorClashGame
              socket={socket}
              state={room.gameState as any}
              currentPlayer={currentPlayer}
              opponentPlayer={opponent}
            />
          )}
          {room.selectedGame === 'dots-and-boxes' && (
            <DotsAndBoxesGame
              socket={socket}
              state={room.gameState as any}
              currentPlayer={currentPlayer}
              opponentPlayer={opponent}
            />
          )}

          {/* Winner Modal */}
          {winnerId && (
            <WinnerModal
              socket={socket}
              room={room}
              currentPlayer={currentPlayer}
              winnerId={winnerId}
              gameName={selectedGameMeta?.name || 'DUEL'}
            />
          )}
        </main>
      ) : (
        <RoomLobby
          socket={socket}
          room={room}
          currentPlayer={currentPlayer}
          messages={messages}
        />
      )}
    </div>
  );
}

export default App;
