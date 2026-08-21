import React, { useEffect, useState } from 'react';
import { socket } from './lib/socket';
import { RoomSnapshot, Player, ChatMessage } from './shared/types';
import { HomePage } from './components/HomePage';
import { RoomLobby } from './components/RoomLobby';
import { WinnerModal } from './components/WinnerModal';
import { VideoPanel } from './components/VideoPanel';
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
import { TapRoyaleGame } from './components/games/TapRoyaleGame';
import { TargetRushGame } from './components/games/TargetRushGame';
import { WordScrambleGame } from './components/games/WordScrambleGame';
import { TriviaBlitzGame } from './components/games/TriviaBlitzGame';
import { SpeedMathGame } from './components/games/SpeedMathGame';
import { PatternMasterGame } from './components/games/PatternMasterGame';
import { PicComboGame } from './components/games/PicComboGame';
import { ArcheryGame } from './components/games/ArcheryGame';
import { BowlingGame } from './components/games/BowlingGame';
import { HammerGame } from './components/games/HammerGame';
import { AnimalBalanceGame } from './components/games/AnimalBalanceGame';
import { PingBallGame } from './components/games/PingBallGame';
import { FruitNinjaGame } from './components/games/FruitNinjaGame';
import { CornholeGame } from './components/games/CornholeGame';
import { KnifeThrowerGame } from './components/games/KnifeThrowerGame';
import { ChainReactionGame } from './components/games/ChainReactionGame';
import { ALL_GAMES } from './shared/constants.ts';
import { Volume2, VolumeX, Swords, Mic, MicOff, Video, VideoOff, LogOut } from 'lucide-react';
import { sounds } from './lib/sound';
import { useMediaChat } from './hooks/useMediaChat';

export function App() {
  const [room, setRoom] = useState<RoomSnapshot | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { micEnabled, cameraEnabled, toggleMic, toggleCamera, activeSpeakers, remoteStreams, localStream, mediaError } = useMediaChat(
    socket,
    room,
    currentPlayer?.id
  );

  useEffect(() => {
    if (mediaError) {
      setErrorMessage(mediaError);
      setTimeout(() => setErrorMessage(null), 4000);
    }
  }, [mediaError]);

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
    <div className="min-h-screen text-slate-100 flex flex-col items-center p-4 sm:p-6 font-sans relative overflow-x-hidden arcade-bg">
      <div className="pointer-events-none absolute inset-0 opacity-70 scanlines" />
      {/* Top Navbar */}
      <header className="relative z-10 w-full max-w-7xl flex items-center justify-between rounded-3xl border border-slate-800/80 bg-slate-950/55 px-5 py-4 mb-6 shadow-2xl backdrop-blur-xl">
        <div
          onClick={() => {
            if (!room) window.location.href = '/';
          }}
          className="flex items-center gap-2 cursor-pointer"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-300 via-fuchsia-500 to-amber-300 flex items-center justify-center shadow-lg font-black text-slate-950">
            <Swords className="w-6 h-6" />
          </div>
          <span className="text-2xl font-black tracking-tight text-white">
            DUEL<span className="text-cyan-300">ZONE</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {room && (
            <>
              <button
                onClick={toggleMic}
                className={`p-2.5 rounded-xl border transition active:scale-95 flex items-center gap-2 font-bold text-xs ${
                  micEnabled 
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-400'
                }`}
                title="Toggle Voice Chat"
              >
                {micEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                <span className="hidden sm:inline">{micEnabled ? 'MIC ON' : 'MIC OFF'}</span>
              </button>

              <button
                onClick={toggleCamera}
                className={`p-2.5 rounded-xl border transition active:scale-95 flex items-center gap-2 font-bold text-xs ${
                  cameraEnabled 
                    ? 'bg-fuchsia-500/20 border-fuchsia-500/50 text-fuchsia-400 shadow-[0_0_15px_rgba(217,70,239,0.2)]' 
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-400'
                }`}
                title="Toggle Video Chat"
              >
                {cameraEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                <span className="hidden sm:inline">{cameraEnabled ? 'CAM ON' : 'CAM OFF'}</span>
              </button>

              {room.status === 'playing' && (
                <button
                  onClick={() => {
                    sounds.playClick();
                    socket.emit('room:returnToLobby');
                  }}
                  className="p-2.5 bg-rose-950/80 hover:bg-rose-900 border border-rose-700/60 text-rose-200 rounded-xl transition active:scale-95 flex items-center gap-2 font-black text-xs shadow-lg cursor-pointer"
                  title="Exit current game and return to lobby"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>EXIT GAME</span>
                </button>
              )}
            </>
          )}

          <button
            onClick={toggleSound}
            className="p-2.5 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 transition active:scale-95 text-slate-300 cursor-pointer focus-visible:outline focus-visible:outline-4 focus-visible:outline-cyan-300"
            title="Toggle Game Sounds"
          >
            {soundEnabled ? <Volume2 className="w-5 h-5 text-emerald-400" /> : <VolumeX className="w-5 h-5 text-slate-500" />}
          </button>
        </div>
      </header>

      {/* Floating Video Panel — always visible when any camera is on */}
      {room && (
        <VideoPanel
          players={room.players}
          currentPlayerId={currentPlayer?.id}
          localStream={localStream}
          remoteStreams={remoteStreams}
          activeSpeakers={activeSpeakers}
        />
      )}

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
        <main className="relative z-10 w-full flex flex-col items-center justify-center">
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
          {room.selectedGame === 'tap-royale' && (
            <TapRoyaleGame
              socket={socket}
              state={room.gameState as any}
              currentPlayer={currentPlayer}
              room={room}
            />
          )}
          {room.selectedGame === 'target-rush' && (
            <TargetRushGame
              socket={socket}
              state={room.gameState as any}
              currentPlayer={currentPlayer}
              room={room}
            />
          )}
          {room.selectedGame === 'word-scramble' && (
            <WordScrambleGame
              socket={socket}
              state={room.gameState as any}
              currentPlayer={currentPlayer}
              room={room}
            />
          )}
          {room.selectedGame === 'trivia-blitz' && (
            <TriviaBlitzGame
              socket={socket}
              state={room.gameState as any}
              currentPlayer={currentPlayer}
              room={room}
            />
          )}
          {room.selectedGame === 'speed-math' && (
            <SpeedMathGame
              socket={socket}
              state={room.gameState as any}
              currentPlayer={currentPlayer}
              room={room}
            />
          )}
          {room.selectedGame === 'pattern-master' && (
            <PatternMasterGame
              socket={socket}
              state={room.gameState as any}
              currentPlayer={currentPlayer}
              room={room}
            />
          )}
          {room.selectedGame === 'pic-combo' && (
            <PicComboGame
              socket={socket}
              state={room.gameState as any}
              currentPlayer={currentPlayer}
              room={room}
            />
          )}
          {room.selectedGame === 'archery' && <ArcheryGame />}
          {room.selectedGame === 'bowling' && <BowlingGame />}
          {room.selectedGame === 'hammer' && <HammerGame />}
          {room.selectedGame === 'animal-balance' && <AnimalBalanceGame />}
          {room.selectedGame === 'ping-ball' && <PingBallGame />}
          {room.selectedGame === 'fruit-ninja' && <FruitNinjaGame />}
          {room.selectedGame === 'cornhole' && <CornholeGame />}
          {room.selectedGame === 'knife-thrower' && <KnifeThrowerGame />}
          {room.selectedGame === 'chain-reaction' && <ChainReactionGame />}

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
          activeSpeakers={activeSpeakers}
          remoteStreams={remoteStreams}
          localStream={localStream}
        />
      )}
    </div>
  );
}

export default App;
