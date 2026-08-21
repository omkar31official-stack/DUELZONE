import React, { useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { Player, RoomSnapshot } from '../../shared/types';
import { sounds } from '../../lib/sound';

interface HammerState {
  phase: 'countdown' | 'playing' | 'result';
  scores: Record<string, number>;
  activeHoleIndex: number | null;
  endTime: number | null;
  winner: string | null;
}

export const HammerGame: React.FC<{ socket: Socket; state: HammerState; currentPlayer: Player | null; room: RoomSnapshot }> = ({ socket, state, currentPlayer, room }) => {
  const isHost = currentPlayer?.isHost;

  useEffect(() => {
    if (state.phase !== 'playing' || !state.endTime) return;
    const msLeft = Math.max(0, state.endTime - Date.now() + 100);
    const timer = window.setTimeout(() => socket.emit('game:action', { type: 'FINISH' }), msLeft);
    return () => window.clearTimeout(timer);
  }, [socket, state.endTime, state.phase]);

  const handleStart = () => {
    sounds.playClick();
    socket.emit('game:action', { type: 'START' });
  };

  const handleSmash = (index: number) => {
    if (state.phase !== 'playing' || state.activeHoleIndex !== index) return;
    sounds.playClick();
    socket.emit('game:action', { type: 'SMASH', payload: { holeIndex: index } });
  };

  return (
    <div className="w-full max-w-4xl flex flex-col items-center">
      <h2 className="text-4xl font-display text-white mb-6 drop-shadow-[0_0_10px_rgba(124,58,237,0.8)]">HAMMER SMASH</h2>
      
      <div className="flex gap-8 mb-8 w-full justify-center">
        {room.players.map((p) => (
          <div key={p.id} className={`flex flex-col items-center p-4 border-2 ${p.id === currentPlayer?.id ? 'border-brand-accent shadow-[0_0_15px_rgba(244,63,94,0.4)]' : 'border-brand-primary'} bg-brand-card`}>
            <span className="font-display text-xl text-white">{p.name}</span>
            <span className="font-display text-3xl text-brand-primary mt-2">{state.scores?.[p.id] || 0}</span>
          </div>
        ))}
      </div>

      {state.phase === 'countdown' && (
        <div className="mt-10 flex flex-col items-center">
          <p className="text-brand-secondary font-display text-xl mb-6 text-center">Smash the targets as they appear!</p>
          {isHost ? (
            <button
              onClick={handleStart}
              className="px-10 py-4 bg-brand-primary text-white font-display text-2xl shadow-[0_0_20px_rgba(124,58,237,0.6)] hover:bg-brand-primary/80 transition active:scale-95 border border-brand-secondary"
            >
              START SMASHING
            </button>
          ) : (
            <p className="text-xl font-display text-brand-accent animate-pulse">Waiting for host to start...</p>
          )}
        </div>
      )}

      {state.phase === 'playing' && (
        <div className="grid grid-cols-3 gap-4 p-8 bg-brand-card/80 border-2 border-brand-primary shadow-[0_0_30px_rgba(124,58,237,0.2)]">
          {Array.from({ length: 9 }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleSmash(idx)}
              className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 transition-all duration-75 flex items-center justify-center text-4xl
                ${state.activeHoleIndex === idx 
                  ? 'bg-brand-accent border-white scale-110 shadow-[0_0_20px_rgba(244,63,94,0.8)] cursor-pointer' 
                  : 'bg-black/50 border-brand-primary/30 cursor-default'}`}
            >
              {state.activeHoleIndex === idx ? '🎯' : ''}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
