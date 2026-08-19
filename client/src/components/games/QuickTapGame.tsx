import React from 'react';
import { Socket } from 'socket.io-client';
import { QuickTapState, Player } from '../../shared/types';
import { sounds } from '../../lib/sound';

interface QTProps {
  socket: Socket;
  state: QuickTapState;
  currentPlayer: Player | null;
  opponentPlayer: Player | null;
}

export const QuickTapGame: React.FC<QTProps> = ({
  socket,
  state,
  currentPlayer,
  opponentPlayer,
}) => {
  const isHost = currentPlayer?.isHost;
  const myTaps = currentPlayer ? state.tapCounts[currentPlayer.id] || 0 : 0;
  const oppTaps = opponentPlayer ? state.tapCounts[opponentPlayer.id] || 0 : 0;

  const handleStart = () => {
    socket.emit('game:action', { type: 'START' });
  };

  const handleTap = () => {
    if (state.phase !== 'playing') return;
    sounds.playClick();
    socket.emit('game:action', { type: 'TAP' });
  };

  return (
    <div className="flex flex-col items-center justify-between w-full max-w-lg min-h-[450px] p-6 bg-slate-900/80 rounded-2xl border border-slate-800 shadow-2xl">
      <div className="w-full flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
        <div>
          <span className="text-xs text-slate-400 font-semibold block">{currentPlayer?.name}</span>
          <span className="text-xl font-black text-purple-400">{myTaps} taps</span>
        </div>
        <div className="text-center">
          <span className="text-xs uppercase tracking-wider text-slate-500 font-bold block">10 Seconds</span>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400 font-semibold block">{opponentPlayer?.name}</span>
          <span className="text-xl font-black text-pink-400">{oppTaps} taps</span>
        </div>
      </div>

      <div className="flex-1 w-full flex items-center justify-center my-6">
        {state.phase === 'countdown' && (
          <div className="text-center space-y-4">
            <p className="text-slate-400 text-sm">Prepare your fast fingers!</p>
            {isHost && (
              <button
                onClick={handleStart}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 font-black rounded-xl text-white shadow-xl transition active:scale-95 text-lg"
              >
                START TAP DUEL
              </button>
            )}
          </div>
        )}

        {state.phase === 'playing' && (
          <button
            onClick={handleTap}
            className="w-56 h-56 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 border-8 border-purple-300 shadow-2xl flex flex-col items-center justify-center cursor-pointer active:scale-90 transition-transform"
          >
            <span className="text-4xl font-black text-white">TAP FAST!</span>
            <span className="text-2xl font-extrabold text-yellow-300 mt-2">{myTaps}</span>
          </button>
        )}

        {state.phase === 'result' && (
          <div className="text-center space-y-4">
            <div className="text-3xl font-black text-amber-400">
              {state.winner === currentPlayer?.id
                ? '🏆 YOU TAP-DOMINATED!'
                : state.winner === opponentPlayer?.id
                ? `💔 ${opponentPlayer?.name} WON!`
                : "IT'S A TAP TIE!"}
            </div>
            <div className="text-slate-300 font-semibold">
              Final score: {myTaps} vs {oppTaps}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
