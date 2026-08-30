import React from 'react';
import { Socket } from 'socket.io-client';
import { Player, TugOfWarState } from '../../shared/types';
import { Zap } from 'lucide-react';
import { sounds } from '../../lib/sound';

interface TugOfWarGameProps {
  socket: Socket;
  state: TugOfWarState;
  currentPlayer: Player | null;
  opponentPlayer: Player | null;
}

export const TugOfWarGame: React.FC<TugOfWarGameProps> = ({
  socket,
  state,
  currentPlayer,
  opponentPlayer,
}) => {
  const playerKeys = Object.keys(state.scores);
  const isP1 = currentPlayer?.id === playerKeys[0];

  const handlePull = () => {
    sounds.playClick();
    socket.emit('game:action', { type: 'PULL' });
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md">
      <div className="flex items-center justify-between w-full px-4 py-2 bg-slate-900/90 border border-slate-800 rounded-2xl">
        <span className="font-bold text-cyan-400">P1: {state.scores[playerKeys[0]] || 0}</span>
        <span className="text-xs font-black uppercase text-slate-400">TUG OF WAR SMASH</span>
        <span className="font-bold text-pink-400">P2: {state.scores[playerKeys[1]] || 0}</span>
      </div>

      {/* Tug Track */}
      <div className="relative w-full h-16 bg-slate-950 border-2 border-slate-800 rounded-2xl flex items-center px-4 overflow-hidden shadow-2xl">
        <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-slate-700 -translate-x-1/2" />

        {/* Rope */}
        <div className="w-full h-3 bg-amber-700/80 rounded-full relative">
          {/* Flag */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-6 h-8 bg-red-500 rounded-md transition-all duration-75 shadow-lg border border-white"
            style={{ left: `calc(50% + ${state.ropePos / 2}%)` }}
          />
        </div>
      </div>

      <button
        onClick={handlePull}
        className="w-full py-6 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-500 hover:to-red-500 text-white font-black text-2xl tracking-widest rounded-3xl shadow-2xl transition active:scale-95 cursor-pointer flex items-center justify-center gap-3 animate-pulse"
      >
        <Zap className="w-8 h-8 fill-yellow-400 text-yellow-400" /> PULL ROPE!
      </button>
    </div>
  );
};
