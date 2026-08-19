import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Socket } from 'socket.io-client';
import { Player, RoomSnapshot } from '../../../shared/types';
import { Trophy, RotateCcw, LayoutGrid } from 'lucide-react';
import { sounds } from '../lib/sound';

interface WinnerModalProps {
  socket: Socket;
  room: RoomSnapshot;
  currentPlayer: Player | null;
  winnerId: string | null;
  gameName: string;
}

export const WinnerModal: React.FC<WinnerModalProps> = ({
  socket,
  room,
  currentPlayer,
  winnerId,
  gameName,
}) => {
  const isWinner = winnerId === currentPlayer?.id;
  const isHost = currentPlayer?.isHost;
  const winnerPlayer = room.players.find((p) => p.id === winnerId);

  useEffect(() => {
    if (isWinner) {
      sounds.playWin();
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
  }, [isWinner]);

  const handlePlayAgain = () => {
    sounds.playClick();
    socket.emit('room:startGame');
  };

  const handleReturnToLobby = () => {
    sounds.playClick();
    socket.emit('room:returnToLobby');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl p-8 max-w-md w-full flex flex-col items-center text-center shadow-2xl relative overflow-hidden">
        <div className="w-20 h-20 bg-amber-500/20 border-2 border-amber-500/50 rounded-full flex items-center justify-center mb-4 text-amber-400">
          <Trophy className="w-10 h-10 animate-bounce" />
        </div>

        <span className="text-xs uppercase tracking-widest font-extrabold text-slate-400 mb-1">
          {gameName} MATCH RESULT
        </span>

        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-2">
          {isWinner ? 'YOU ARE THE CHAMPION!' : winnerPlayer ? `${winnerPlayer.name} WINS!` : "IT'S A DRAW!"}
        </h2>

        <p className="text-sm text-slate-400 mb-6">
          {isWinner ? 'Flawless victory! Want a rematch?' : 'Better luck next round!'}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col w-full gap-3">
          {isHost && (
            <button
              onClick={handlePlayAgain}
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 font-extrabold text-white rounded-xl shadow-lg transition active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" /> PLAY AGAIN
            </button>
          )}

          <button
            onClick={handleReturnToLobby}
            className="flex items-center justify-center gap-2 w-full py-3 bg-slate-800 hover:bg-slate-700 font-bold text-slate-300 rounded-xl transition border border-slate-700 active:scale-95 cursor-pointer text-sm"
          >
            <LayoutGrid className="w-4 h-4" /> CHOOSE ANOTHER GAME
          </button>
        </div>
      </div>
    </div>
  );
};
