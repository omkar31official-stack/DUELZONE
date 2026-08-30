import React from 'react';
import { Socket } from 'socket.io-client';
import { Player, SlidingPuzzleState } from '../../shared/types';
import { Grid, Sparkles } from 'lucide-react';
import { sounds } from '../../lib/sound';

interface SlidingPuzzleGameProps {
  socket: Socket;
  state: SlidingPuzzleState;
  currentPlayer: Player | null;
  opponentPlayer: Player | null;
}

export const SlidingPuzzleGame: React.FC<SlidingPuzzleGameProps> = ({
  socket,
  state,
  currentPlayer,
  opponentPlayer,
}) => {
  const myBoard = state.boards?.[currentPlayer?.id || ''] || [1, 2, 3, 4, 5, 0, 7, 8, 6];

  const handleTileClick = (tileIndex: number) => {
    sounds.playClick();
    socket.emit('game:action', { type: 'MOVE_TILE', payload: { tileIndex } });
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md">
      {/* Header */}
      <div className="flex items-center justify-between w-full px-4 py-2 bg-slate-900/90 border border-slate-800 rounded-2xl">
        <span className="text-xs font-bold text-emerald-400">SLIDE TILES TO ORDER 1-8</span>
        <span className="text-xs font-black uppercase text-slate-400">SLIDING PUZZLE</span>
      </div>

      {/* 3x3 Tile Grid */}
      <div className="grid grid-cols-3 gap-2 w-full aspect-square bg-slate-950 p-4 border-2 border-slate-800 rounded-3xl shadow-2xl">
        {myBoard.map((val, idx) => {
          if (val === 0) {
            return <div key={idx} className="w-full h-full bg-slate-900/30 rounded-2xl border border-dashed border-slate-800" />;
          }

          return (
            <button
              key={idx}
              onClick={() => handleTileClick(idx)}
              className="w-full h-full bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-3xl rounded-2xl shadow-lg border border-white/20 flex items-center justify-center transition active:scale-95 cursor-pointer"
            >
              {val}
            </button>
          );
        })}
      </div>
    </div>
  );
};
