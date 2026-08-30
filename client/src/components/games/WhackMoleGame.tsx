import React from 'react';
import { Socket } from 'socket.io-client';
import { Player, WhackMoleState } from '../../shared/types';
import { sounds } from '../../lib/sound';

interface WhackMoleGameProps {
  socket: Socket;
  state: WhackMoleState;
  currentPlayer: Player | null;
  opponentPlayer: Player | null;
}

export const WhackMoleGame: React.FC<WhackMoleGameProps> = ({
  socket,
  state,
  currentPlayer,
  opponentPlayer,
}) => {
  const playerKeys = Object.keys(state.scores);

  const handleWhack = (index: number) => {
    sounds.playClick();
    socket.emit('game:action', { type: 'WHACK', payload: { index } });
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md">
      <div className="flex items-center justify-between w-full px-4 py-2 bg-slate-900/90 border border-slate-800 rounded-2xl">
        <span className="font-bold text-amber-400">ROUND {state.round} / {state.maxRounds}</span>
        <span className="text-xs font-black uppercase text-slate-400">WHACK-A-MOLE</span>
      </div>

      <div className="grid grid-cols-3 gap-4 w-full aspect-square bg-slate-950 p-6 border-2 border-slate-800 rounded-3xl shadow-2xl">
        {Array.from({ length: 9 }).map((_, idx) => {
          const isMole = state.activeMoleIndex === idx;

          return (
            <button
              key={idx}
              onClick={() => handleWhack(idx)}
              className={`w-full h-full rounded-2xl border-4 transition-all duration-100 flex items-center justify-center text-4xl shadow-inner active:scale-90 cursor-pointer ${
                isMole
                  ? 'bg-amber-600 border-amber-400 animate-bounce'
                  : 'bg-amber-950/60 border-amber-900/40'
              }`}
            >
              {isMole ? '🐹' : ''}
            </button>
          );
        })}
      </div>
    </div>
  );
};
