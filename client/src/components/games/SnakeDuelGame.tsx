import React, { useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { Player, SnakeDuelState } from '../../shared/types';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface SnakeDuelGameProps {
  socket: Socket;
  state: SnakeDuelState;
  currentPlayer: Player | null;
  opponentPlayer: Player | null;
}

export const SnakeDuelGame: React.FC<SnakeDuelGameProps> = ({
  socket,
  state,
  currentPlayer,
  opponentPlayer,
}) => {
  const playerKeys = Object.keys(state.snakes);
  const isP1 = currentPlayer?.id === playerKeys[0];

  const handleDir = (dir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    socket.emit('game:action', { type: 'CHANGE_DIR', payload: { dir } });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'w', 'W'].includes(e.key)) handleDir('UP');
      if (['ArrowDown', 's', 'S'].includes(e.key)) handleDir('DOWN');
      if (['ArrowLeft', 'a', 'A'].includes(e.key)) handleDir('LEFT');
      if (['ArrowRight', 'd', 'D'].includes(e.key)) handleDir('RIGHT');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const apple = state.apple || (state as any).food;

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md">
      <div className="flex items-center justify-between w-full px-4 py-2 bg-slate-900/90 border border-slate-800 rounded-2xl">
        <span className="font-bold text-emerald-400">P1: {state.scores[playerKeys[0]] || 0}</span>
        <span className="text-xs font-black uppercase text-slate-400">SNAKE DUEL ARENA</span>
        <span className="font-bold text-amber-400">P2: {state.scores[playerKeys[1]] || 0}</span>
      </div>

      <div className="grid grid-cols-20 grid-rows-20 gap-0.5 w-full aspect-square bg-slate-950 p-2 border-2 border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        {Array.from({ length: 400 }).map((_, idx) => {
          const x = idx % 20;
          const y = Math.floor(idx / 20);

          const isFood = apple?.x === x && apple?.y === y;

          const p1Snake = state.snakes[playerKeys[0]];
          const p2Snake = state.snakes[playerKeys[1]];

          const isP1Body = p1Snake?.body.some(b => b.x === x && b.y === y);
          const isP2Body = p2Snake?.body.some(b => b.x === x && b.y === y);

          let cellClass = 'bg-slate-900/40';
          if (isFood) cellClass = 'bg-red-500 rounded-full animate-ping';
          else if (isP1Body) cellClass = 'bg-emerald-400 rounded-sm';
          else if (isP2Body) cellClass = 'bg-amber-400 rounded-sm';

          return <div key={idx} className={`${cellClass} w-full h-full`} />;
        })}
      </div>

      <div className="grid grid-cols-3 gap-2 w-48">
        <div />
        <button onClick={() => handleDir('UP')} className="p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl flex justify-center active:scale-95">
          <ArrowUp className="w-5 h-5" />
        </button>
        <div />
        <button onClick={() => handleDir('LEFT')} className="p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl flex justify-center active:scale-95">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <button onClick={() => handleDir('DOWN')} className="p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl flex justify-center active:scale-95">
          <ArrowDown className="w-5 h-5" />
        </button>
        <button onClick={() => handleDir('RIGHT')} className="p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl flex justify-center active:scale-95">
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
