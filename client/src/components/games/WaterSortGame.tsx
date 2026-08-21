import React from 'react';
import { Socket } from 'socket.io-client';
import { Player, RoomSnapshot, WaterSortState } from '../../shared/types';
import { sounds } from '../../lib/sound';

interface Props {
  socket: Socket;
  state: WaterSortState;
  currentPlayer: Player | null;
  room: RoomSnapshot;
}

export const WaterSortGame: React.FC<Props> = ({ socket, state, currentPlayer, room }) => {
  const isHost = currentPlayer?.isHost;

  const handleStart = () => {
    sounds.playClick();
    socket.emit('game:action', { type: 'START' });
  };

  const handleTubeClick = (index: number) => {
    if (state.phase !== 'playing') return;
    
    // Play a click sound
    sounds.playClick();
    
    socket.emit('game:action', { type: 'SELECT', payload: { index } });
  };

  return (
    <div className="flex flex-col items-center justify-between w-full max-w-4xl min-h-[500px] p-6 glass-card fade-in relative overflow-hidden">
      {/* Header */}
      <div className="w-full flex flex-col md:flex-row items-center justify-between glass-card-highlight px-6 py-4 rounded-xl mb-6 gap-4">
        <div className="text-center md:text-left">
          <div className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-1">
            Water Sort
          </div>
          <div className="text-xs text-slate-300 font-medium bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700/50">
            Sort the colored liquids!
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest">Moves</span>
            <span className="text-2xl font-black text-fuchsia-400">{state.moves}</span>
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
            Sort Together!
          </h2>
          <div className="flex gap-4">
            {isHost ? (
              <button
                onClick={handleStart}
                className="px-8 py-4 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-xl font-bold text-xl transition transform active:scale-95 shadow-[0_0_20px_rgba(192,38,211,0.4)] border border-fuchsia-400/30"
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
        <div className="flex-1 flex flex-col items-center justify-center w-full fade-in pb-8">
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8 max-w-3xl">
            {state.tubes.map((tube, index) => {
              const isSelected = state.selectedTubeIndex === index;
              // Ensure we draw exactly `tubeCapacity` slots so empty space is visible
              const slots = Array.from({ length: state.tubeCapacity }).map((_, i) => tube[i] || null);

              return (
                <div
                  key={index}
                  onClick={() => handleTubeClick(index)}
                  className={`
                    relative flex flex-col-reverse justify-start items-center
                    w-12 sm:w-16 h-48 sm:h-64 
                    border-4 border-t-0 border-white/20 
                    rounded-b-full cursor-pointer
                    transition-all duration-300
                    bg-white/5 backdrop-blur-sm
                    overflow-hidden shadow-xl
                    ${isSelected ? '-translate-y-4 ring-4 ring-fuchsia-400 shadow-[0_10px_30px_rgba(192,38,211,0.5)]' : 'hover:bg-white/10'}
                  `}
                >
                  {slots.map((color, colorIdx) => (
                    <div
                      key={colorIdx}
                      className="w-full transition-all duration-300 ease-in-out"
                      style={{
                        height: `${100 / state.tubeCapacity}%`,
                        backgroundColor: color || 'transparent',
                        opacity: color ? 0.9 : 0
                      }}
                    />
                  ))}
                  
                  {/* Tube Reflection Highlight */}
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/20 to-transparent pointer-events-none w-1/3 left-0" />
                </div>
              );
            })}
          </div>
          
          {state.selectedTubeIndex !== null && (
            <div className="mt-12 text-sm font-bold text-fuchsia-400 animate-pulse bg-fuchsia-950/50 px-4 py-2 rounded-full border border-fuchsia-900">
              {state.selectedByPlayer === currentPlayer?.id ? 'Select a target tube to pour into!' : 'Someone is pouring!'}
            </div>
          )}
        </div>
      )}

      {state.phase === 'result' && (
        <div className="flex-1 flex flex-col items-center justify-center fade-in">
          <h2 className="text-5xl font-black text-emerald-400 mb-4 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]">
            SORTED!
          </h2>
          <p className="text-xl text-slate-300 font-medium mb-8">
            You completed the sort in <span className="text-white font-bold">{state.moves}</span> moves!
          </p>
          
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
