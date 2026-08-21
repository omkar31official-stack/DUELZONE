import React, { useState } from 'react';
import { Socket } from 'socket.io-client';
import { Player, RoomSnapshot, SudokuState } from '../../shared/types';
import { sounds } from '../../lib/sound';
import { Lightbulb, MousePointerClick } from 'lucide-react';

interface Props {
  socket: Socket;
  state: SudokuState;
  currentPlayer: Player | null;
  room: RoomSnapshot;
}

export const SudokuGame: React.FC<Props> = ({ socket, state, currentPlayer, room }) => {
  const isHost = currentPlayer?.isHost;
  const [selectedCell, setSelectedCell] = useState<{ r: number, c: number } | null>(null);

  const handleStart = () => {
    sounds.playClick();
    socket.emit('game:action', { type: 'START' });
  };

  const handleNextLevel = () => {
    sounds.playClick();
    socket.emit('game:action', { type: 'NEXT_LEVEL' });
  };

  const handleHint = () => {
    if (state.hintsRemaining <= 0) return;
    sounds.playClick();
    socket.emit('game:action', { type: 'HINT' });
  };

  const handleCellClick = (r: number, c: number) => {
    if (state.phase !== 'playing') return;
    if (state.initialBoard[r][c]) return; // Can't edit initial cells
    setSelectedCell({ r, c });
    sounds.playClick();
  };

  const handleNumberInput = (num: number) => {
    if (state.phase !== 'playing' || !selectedCell) return;
    sounds.playClick();
    socket.emit('game:action', { 
      type: 'INPUT', 
      payload: { row: selectedCell.r, col: selectedCell.c, value: num } 
    });
  };

  return (
    <div className="flex flex-col items-center justify-between w-full max-w-2xl min-h-[500px] p-6 glass-card fade-in relative overflow-hidden">
      {/* Header */}
      <div className="w-full flex flex-col md:flex-row items-center justify-between glass-card-highlight px-6 py-4 rounded-xl mb-6 gap-4">
        <div className="text-center md:text-left">
          <div className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-1">
            Sudoku Co-op - Level {state.level}
          </div>
          <div className="text-xs text-slate-300 font-medium bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700/50">
            Fill the board together!
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest">Mistakes</span>
            <span className="text-xl font-black text-rose-400">{state.mistakes}</span>
          </div>
          <button 
            onClick={handleHint}
            disabled={state.hintsRemaining <= 0 || state.phase !== 'playing'}
            className="flex flex-col items-center disabled:opacity-50 transition active:scale-95"
          >
            <span className="text-[10px] text-amber-400 uppercase tracking-widest flex items-center gap-1">
              <Lightbulb className="w-3 h-3" /> Hints
            </span>
            <span className="text-xl font-black text-amber-400">{state.hintsRemaining}</span>
          </button>
        </div>
      </div>

      {state.phase === 'countdown' && (
        <div className="flex-1 flex flex-col items-center justify-center fade-in">
          <h2 className="text-4xl font-black text-white mb-8 text-center drop-shadow-lg">
            Solve Sudoku!
          </h2>
          <div className="flex gap-4">
            {isHost ? (
              <button
                onClick={handleStart}
                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xl transition transform active:scale-95 shadow-[0_0_20px_rgba(79,70,229,0.4)] border border-indigo-400/30"
              >
                START GAME
              </button>
            ) : (
              <div className="text-xl font-bold text-slate-400 animate-pulse">
                Waiting for host to start...
              </div>
            )}
          </div>
        </div>
      )}

      {state.phase === 'playing' && (
        <div className="flex flex-col items-center w-full fade-in pb-4">
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-2xl p-2 sm:p-3 shadow-[0_0_40px_rgba(0,0,0,0.5)] mb-8 relative">
            
            {/* Ambient Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-transparent to-cyan-500/10 rounded-2xl pointer-events-none" />

            <div className="grid grid-cols-9 gap-[1px] bg-slate-700/50 rounded-xl overflow-hidden relative z-10">
              {state.board.map((row, r) => 
                row.map((cell, c) => {
                  const isInitial = state.initialBoard[r][c];
                  const isSelected = selectedCell?.r === r && selectedCell?.c === c;
                  const isError = !isInitial && cell !== 0 && cell !== state.solution[r][c];
                  
                  // Thicker borders for the 3x3 grids
                  const borderRight = c % 3 === 2 && c !== 8 ? 'border-r-[3px] border-r-slate-800/80' : '';
                  const borderBottom = r % 3 === 2 && r !== 8 ? 'border-b-[3px] border-b-slate-800/80' : '';

                  return (
                    <div
                      key={`${r}-${c}`}
                      onClick={() => handleCellClick(r, c)}
                      className={`
                        w-9 h-9 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center text-xl sm:text-2xl md:text-3xl font-black transition-all duration-200
                        ${borderRight} ${borderBottom}
                        ${isInitial ? 'bg-slate-800/80 text-slate-300 shadow-inner' : 'bg-slate-900/90 text-cyan-400 cursor-pointer hover:bg-slate-800'}
                        ${isSelected ? 'ring-inset ring-4 ring-cyan-400 bg-slate-700 shadow-[inset_0_0_15px_rgba(34,211,238,0.3)] z-10' : ''}
                        ${isError ? 'text-rose-500 bg-rose-950/60 shadow-[inset_0_0_15px_rgba(244,63,94,0.3)]' : ''}
                        ${!isInitial && cell !== 0 && !isError ? 'drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]' : ''}
                      `}
                    >
                      {cell !== 0 ? cell : ''}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Number Pad */}
          <div className="flex flex-col items-center">
            <div className="text-xs text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
              <MousePointerClick className="w-3 h-3" /> Select a cell, then tap a number
            </div>
            <div className="grid grid-cols-5 gap-2 sm:gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <button
                  key={num}
                  onClick={() => handleNumberInput(num)}
                  disabled={!selectedCell}
                  className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:hover:bg-slate-800 border border-slate-600 rounded-lg text-xl font-black text-white shadow-lg transition active:scale-95"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={() => handleNumberInput(0)}
                disabled={!selectedCell}
                className="w-10 h-10 sm:w-12 sm:h-12 bg-rose-900/50 hover:bg-rose-800/50 disabled:opacity-50 disabled:hover:bg-rose-900/50 border border-rose-700/50 rounded-lg text-lg font-bold text-rose-400 shadow-lg transition active:scale-95"
              >
                X
              </button>
            </div>
          </div>
        </div>
      )}

      {state.phase === 'result' && (
        <div className="flex-1 flex flex-col items-center justify-center fade-in">
          <h2 className="text-5xl font-black text-emerald-400 mb-4 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]">
            LEVEL CLEAR!
          </h2>
          <p className="text-xl text-slate-300 font-medium mb-2">
            You solved Level {state.level} in <span className="text-white font-bold">{state.moves}</span> moves!
          </p>
          <p className="text-sm text-slate-400 mb-8">
            Mistakes made: <span className="text-rose-400 font-bold">{state.mistakes}</span>
          </p>
          
          {isHost && (
            <button
              onClick={handleNextLevel}
              className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xl transition active:scale-95 shadow-[0_0_20px_rgba(52,211,153,0.4)]"
            >
              NEXT LEVEL
            </button>
          )}
        </div>
      )}
    </div>
  );
};
