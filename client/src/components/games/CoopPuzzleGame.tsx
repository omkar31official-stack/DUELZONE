import React from 'react';
import { Socket } from 'socket.io-client';
import { Player, RoomSnapshot, CoopPuzzleState } from '../../shared/types';
import { sounds } from '../../lib/sound';

interface Props {
  socket: Socket;
  state: CoopPuzzleState;
  currentPlayer: Player | null;
  room: RoomSnapshot;
}

export const CoopPuzzleGame: React.FC<Props> = ({ socket, state, currentPlayer, room }) => {
  const isHost = currentPlayer?.isHost;

  const handleStart = () => {
    sounds.playClick();
    socket.emit('game:action', { type: 'START' });
  };

  const handlePieceClick = (index: number) => {
    if (state.phase !== 'playing') return;
    sounds.playClick();
    socket.emit('game:action', { type: 'SELECT', payload: { index } });
  };

  // Helper to calculate background position for a 3x3 grid
  // Grid size is 3, meaning background-size is 300% 300%.
  // 3 pieces means offsets are 0%, 50%, 100%
  const getBgPosition = (pieceId: number) => {
    const col = pieceId % state.gridSize;
    const row = Math.floor(pieceId / state.gridSize);
    
    // For 3 items (0, 1, 2), the percentages are 0%, 50%, 100%
    // The formula is (index / (gridSize - 1)) * 100
    const x = (col / (state.gridSize - 1)) * 100;
    const y = (row / (state.gridSize - 1)) * 100;
    
    return `${x}% ${y}%`;
  };

  return (
    <div className="flex flex-col items-center justify-between w-full max-w-2xl min-h-[500px] p-6 glass-card fade-in relative overflow-hidden">
      {/* Header */}
      <div className="w-full flex flex-col md:flex-row items-center justify-between glass-card-highlight px-6 py-4 rounded-xl mb-6 gap-4">
        <div className="text-center md:text-left">
          <div className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-1">
            Coop Puzzle
          </div>
          <div className="text-xs text-slate-300 font-medium bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700/50">
            Work together to fix the image!
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest">Moves</span>
            <span className="text-2xl font-black text-cyan-400">{state.moves}</span>
          </div>
          <div className="flex items-center gap-2">
            {room.players.map(p => (
              <div 
                key={p.id}
                className="w-8 h-8 rounded-full border-2 border-slate-800 flex items-center justify-center font-bold text-xs"
                style={{ backgroundColor: p.accentColor }}
                title={p.name}
              >
                {p.name[0].toUpperCase()}
              </div>
            ))}
          </div>
        </div>
      </div>

      {state.phase === 'countdown' && (
        <div className="flex-1 flex flex-col items-center justify-center fade-in">
          <h2 className="text-4xl font-black text-white mb-8 text-center drop-shadow-lg">
            Solve Together!
          </h2>
          <div className="flex gap-4">
            {isHost ? (
              <button
                onClick={handleStart}
                className="px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold text-xl transition transform active:scale-95 shadow-[0_0_20px_rgba(8,145,178,0.4)] border border-cyan-400/30"
              >
                START PUZZLE
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
        <div className="flex-1 flex flex-col items-center justify-center w-full fade-in pb-8">
          <div 
            className="grid gap-1 p-2 bg-slate-900 rounded-xl shadow-2xl border-4 border-slate-800"
            style={{ 
              gridTemplateColumns: `repeat(${state.gridSize}, 1fr)`,
              width: 'min(90vw, 400px)',
              height: 'min(90vw, 400px)'
            }}
          >
            {state.pieces.map((pieceId, index) => {
              const isSelected = state.selectedPieceIndex === index;
              return (
                <div
                  key={`${index}-${pieceId}`}
                  onClick={() => handlePieceClick(index)}
                  className={`
                    w-full h-full cursor-pointer transition-all duration-200
                    ${isSelected ? 'ring-4 ring-cyan-400 scale-95 z-10 rounded-lg shadow-[0_0_15px_rgba(34,211,238,0.8)]' : 'hover:opacity-90'}
                  `}
                  style={{
                    backgroundImage: `url(${state.imageUrl})`,
                    backgroundSize: `${state.gridSize * 100}% ${state.gridSize * 100}%`,
                    backgroundPosition: getBgPosition(pieceId),
                    borderRadius: '4px'
                  }}
                />
              )
            })}
          </div>
          {state.selectedPieceIndex !== null && (
            <div className="mt-6 text-sm font-bold text-cyan-400 animate-pulse bg-cyan-950/50 px-4 py-2 rounded-full border border-cyan-900">
              {state.selectedByPlayer === currentPlayer?.id ? 'You selected a piece. Click another to swap!' : 'Someone selected a piece!'}
            </div>
          )}
        </div>
      )}

      {state.phase === 'result' && (
        <div className="flex-1 flex flex-col items-center justify-center fade-in">
          <h2 className="text-5xl font-black text-emerald-400 mb-4 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]">
            SOLVED!
          </h2>
          <p className="text-xl text-slate-300 font-medium mb-8">
            You completed the puzzle in <span className="text-white font-bold">{state.moves}</span> moves!
          </p>
          <div 
            className="w-64 h-64 rounded-2xl shadow-2xl border-4 border-emerald-500/50 mb-8"
            style={{
              backgroundImage: `url(${state.imageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
          {isHost && (
            <button
              onClick={handleStart}
              className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-lg transition active:scale-95"
            >
              PLAY AGAIN
            </button>
          )}
        </div>
      )}
    </div>
  );
};
