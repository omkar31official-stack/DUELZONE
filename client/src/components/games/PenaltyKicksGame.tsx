import React from 'react';
import { Socket } from 'socket.io-client';
import { Player, PenaltyKicksState } from '../../shared/types';
import { Target, Shield } from 'lucide-react';
import { sounds } from '../../lib/sound';

interface PenaltyKicksGameProps {
  socket: Socket;
  state: PenaltyKicksState;
  currentPlayer: Player | null;
  opponentPlayer: Player | null;
}

export const PenaltyKicksGame: React.FC<PenaltyKicksGameProps> = ({
  socket,
  state,
  currentPlayer,
  opponentPlayer,
}) => {
  const isStriker = currentPlayer?.id === (state.kickerId || (state as any).strikerId);

  const handlePickPos = (x: number, y: number) => {
    sounds.playClick();
    if (isStriker) {
      socket.emit('game:action', { type: 'AIM_KICK', payload: { x, y } });
    } else {
      socket.emit('game:action', { type: 'JUMP_KEEPER', payload: { x, y } });
    }
    if ((state as any).kickTarget || (state as any).keeperJump || state.kickResult) {
      setTimeout(() => {
        socket.emit('game:action', { type: 'RESOLVE_KICK' });
      }, 500);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md">
      <div className="flex items-center justify-between w-full px-4 py-2 bg-slate-900/90 border border-slate-800 rounded-2xl">
        <span className="text-xs font-black uppercase text-emerald-400">
          ROLE: {isStriker ? 'STRIKER ⚽' : 'GOALKEEPER 🧤'}
        </span>
        <span className="text-xs font-bold text-slate-400">ROUND {state.round}</span>
      </div>

      <div className="relative w-full aspect-[4/3] bg-gradient-to-b from-slate-900 to-emerald-900 border-4 border-slate-700 rounded-3xl shadow-2xl overflow-hidden p-6 flex flex-col justify-between">
        {/* Goal Frame */}
        <div className="w-full h-36 border-8 border-white bg-slate-950/60 rounded-t-xl grid grid-cols-3 grid-rows-2 gap-2 p-2">
          {Array.from({ length: 6 }).map((_, idx) => {
            const x = (idx % 3) * 0.4 + 0.1;
            const y = Math.floor(idx / 3) * 0.5 + 0.1;

            return (
              <button
                key={idx}
                onClick={() => handlePickPos(x, y)}
                className="w-full h-full bg-slate-800/40 hover:bg-emerald-500/40 border border-white/20 rounded-lg flex items-center justify-center text-white font-bold transition active:scale-95 cursor-pointer"
              >
                {isStriker ? <Target className="w-5 h-5 opacity-60" /> : <Shield className="w-5 h-5 opacity-60" />}
              </button>
            );
          })}
        </div>

        <p className="text-xs text-center text-slate-300 font-bold">
          {isStriker ? 'Select a goal corner to aim your kick!' : 'Select a goal corner to dive & save!'}
        </p>
      </div>
    </div>
  );
};
