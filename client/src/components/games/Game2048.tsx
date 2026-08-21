import React, { useEffect, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { Player, RoomSnapshot, Game2048State } from '../../shared/types';
import { sounds } from '../../lib/sound';
import { Trophy, RefreshCw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Play } from 'lucide-react';

interface Props {
  socket: Socket;
  state: Game2048State;
  currentPlayer: Player | null;
  room: RoomSnapshot;
}

const TILE_COLORS: Record<number, string> = {
  0: 'bg-slate-800/50',
  2: 'bg-slate-200 text-slate-900',
  4: 'bg-stone-200 text-slate-900',
  8: 'bg-orange-300 text-white',
  16: 'bg-orange-400 text-white shadow-[0_0_15px_rgba(251,146,60,0.5)]',
  32: 'bg-orange-500 text-white shadow-[0_0_20px_rgba(249,115,22,0.6)]',
  64: 'bg-red-500 text-white shadow-[0_0_25px_rgba(239,68,68,0.7)]',
  128: 'bg-yellow-300 text-slate-900 shadow-[0_0_30px_rgba(253,224,71,0.8)] text-[32px]',
  256: 'bg-yellow-400 text-slate-900 shadow-[0_0_30px_rgba(250,204,21,0.8)] text-[32px]',
  512: 'bg-yellow-500 text-white shadow-[0_0_35px_rgba(234,179,8,0.9)] text-[32px]',
  1024: 'bg-yellow-600 text-white shadow-[0_0_40px_rgba(202,138,4,1)] text-[24px]',
  2048: 'bg-amber-500 text-white shadow-[0_0_50px_rgba(245,158,11,1)] text-[24px] ring-4 ring-white',
};

export const Game2048: React.FC<Props> = ({ socket, state, currentPlayer, room }) => {
  const isHost = currentPlayer?.isHost;

  const handleStart = () => {
    sounds.playClick();
    socket.emit('game:action', { type: 'START' });
  };

  const handleRestart = () => {
    sounds.playClick();
    socket.emit('game:action', { type: 'RESTART' });
  };

  const handleContinue = () => {
    sounds.playClick();
    socket.emit('game:action', { type: 'CONTINUE' });
  };

  const handleMove = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (state.phase !== 'playing' && state.phase !== 'won') return;
    
    // Check if the move is actually valid client-side? No, we just send it.
    sounds.playClick();
    socket.emit('game:action', { type: 'MOVE', payload: { direction } });
  }, [state.phase, socket]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'w', 'W'].includes(e.key)) handleMove('up');
      if (['ArrowDown', 's', 'S'].includes(e.key)) handleMove('down');
      if (['ArrowLeft', 'a', 'A'].includes(e.key)) handleMove('left');
      if (['ArrowRight', 'd', 'D'].includes(e.key)) handleMove('right');
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleMove]);

  return (
    <div className="flex flex-col items-center justify-between w-full max-w-lg min-h-[500px] p-6 glass-card fade-in relative overflow-hidden">
      {/* Header */}
      <div className="w-full flex items-center justify-between glass-card-highlight px-6 py-4 rounded-xl mb-6">
        <div>
          <h2 className="text-3xl font-black text-white drop-shadow-md">2048</h2>
          <div className="text-xs text-slate-400 font-semibold tracking-widest uppercase flex items-center gap-1 mt-1">
            <Trophy className="w-3 h-3 text-amber-400" /> Best: {state.bestScore}
          </div>
        </div>
        
        <div className="flex gap-3">
          <div className="flex flex-col items-end bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-700/50">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Score</span>
            <span className="text-xl font-black text-emerald-400">{state.score}</span>
          </div>
        </div>
      </div>

      {state.phase === 'countdown' && (
        <div className="flex-1 flex flex-col items-center justify-center fade-in">
          <h2 className="text-4xl font-black text-white mb-8 text-center drop-shadow-lg">
            Reach 2048 Together!
          </h2>
          <div className="text-slate-400 text-center max-w-sm mb-8 leading-relaxed">
            Use arrow keys or WASD to move the tiles. Tiles with the same number merge into one when they touch.
          </div>
          <div className="flex gap-4">
            {isHost ? (
              <button
                onClick={handleStart}
                className="flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xl transition transform active:scale-95 shadow-[0_0_20px_rgba(5,150,105,0.4)] border border-emerald-400/30"
              >
                <Play className="w-6 h-6" /> START GAME
              </button>
            ) : (
              <div className="text-xl font-bold text-slate-400 animate-pulse">
                Waiting for host to start...
              </div>
            )}
          </div>
        </div>
      )}

      {(state.phase === 'playing' || state.phase === 'won' || state.phase === 'gameover') && (
        <div className="flex flex-col items-center w-full fade-in pb-4 relative">
          
          {/* Game Over / Won Overlay */}
          {(state.phase === 'gameover' || (state.phase === 'won' && !state.completedAt)) && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md rounded-xl border border-slate-700/50 p-6 text-center shadow-2xl">
              {state.phase === 'won' ? (
                <>
                  <h2 className="text-5xl font-black text-amber-400 mb-2 drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]">YOU WIN!</h2>
                  <p className="text-slate-300 mb-8">You reached 2048 in {state.moves} moves.</p>
                  <div className="flex gap-4">
                    <button onClick={handleContinue} className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold transition">
                      KEEP PLAYING
                    </button>
                    {isHost && (
                      <button onClick={handleRestart} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold transition">
                        PLAY AGAIN
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-5xl font-black text-rose-500 mb-2 drop-shadow-[0_0_20px_rgba(244,63,94,0.6)]">GAME OVER!</h2>
                  <p className="text-slate-300 mb-8">No more valid moves.</p>
                  {isHost && (
                    <button onClick={handleRestart} className="flex items-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold transition">
                      <RefreshCw className="w-5 h-5" /> TRY AGAIN
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {/* Board */}
          <div className="bg-slate-700 p-3 sm:p-4 rounded-xl shadow-2xl">
            <div className="grid grid-cols-4 gap-2 sm:gap-3 relative">
              {state.board.map((row, r) => 
                row.map((val, c) => (
                  <div 
                    key={`${r}-${c}`}
                    className={`
                      w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-lg font-black text-2xl transition-all duration-200
                      ${TILE_COLORS[val > 2048 ? 2048 : val] || TILE_COLORS[0]}
                      ${val !== 0 ? 'scale-100 opacity-100' : 'scale-95 opacity-50'}
                    `}
                  >
                    {val !== 0 ? val : ''}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* On-Screen Controls for Mobile */}
          <div className="mt-8 grid grid-cols-3 gap-2 sm:hidden opacity-80">
            <div />
            <button onClick={() => handleMove('up')} className="w-14 h-14 bg-slate-800 rounded-lg flex items-center justify-center text-slate-300 active:bg-slate-700 active:scale-95 transition border border-slate-700"><ArrowUp /></button>
            <div />
            <button onClick={() => handleMove('left')} className="w-14 h-14 bg-slate-800 rounded-lg flex items-center justify-center text-slate-300 active:bg-slate-700 active:scale-95 transition border border-slate-700"><ArrowLeft /></button>
            <button onClick={() => handleMove('down')} className="w-14 h-14 bg-slate-800 rounded-lg flex items-center justify-center text-slate-300 active:bg-slate-700 active:scale-95 transition border border-slate-700"><ArrowDown /></button>
            <button onClick={() => handleMove('right')} className="w-14 h-14 bg-slate-800 rounded-lg flex items-center justify-center text-slate-300 active:bg-slate-700 active:scale-95 transition border border-slate-700"><ArrowRight /></button>
          </div>

          {state.lastMoveByPlayer && (
            <div className="mt-6 text-sm font-medium text-slate-400">
              {room.players.find(p => p.id === state.lastMoveByPlayer)?.name} moved {state.lastMoveDirection?.toUpperCase()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
