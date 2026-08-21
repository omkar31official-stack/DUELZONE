import React, { useEffect, useState, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { Player, RoomSnapshot } from '../../shared/types';
import { sounds } from '../../lib/sound';

interface KnifeThrowerState {
  phase: 'countdown' | 'playing' | 'result';
  scores: Record<string, number>;
  winner: string | null;
}

export const KnifeThrowerGame: React.FC<{ socket: Socket; state: KnifeThrowerState; currentPlayer: Player | null; room: RoomSnapshot }> = ({ socket, state, currentPlayer, room }) => {
  const isHost = currentPlayer?.isHost;
  const [cursorPos, setCursorPos] = useState(0);
  const [shake, setShake] = useState(false);
  const requestRef = useRef<number>();
  
  const myScore = state.scores?.[currentPlayer?.id || ''] || 0;
  // Target shrinks as score increases
  const targetWidth = Math.max(5, 30 - (myScore * 2));
  const targetStart = 50 - (targetWidth / 2);
  const targetEnd = 50 + (targetWidth / 2);
  
  // Speed increases as score increases
  const speed = 0.05 + (myScore * 0.005);

  const updateCursor = (time: number) => {
    if (state.phase === 'playing') {
      // Sine wave between 0 and 100
      const pos = (Math.sin(time * speed) + 1) * 50;
      setCursorPos(pos);
    }
    requestRef.current = requestAnimationFrame(updateCursor);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(updateCursor);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [state.phase, myScore]);

  const handleStart = () => {
    sounds.playClick();
    socket.emit('game:action', { type: 'START' });
  };

  const handleThrow = () => {
    if (state.phase !== 'playing') return;
    
    if (cursorPos >= targetStart && cursorPos <= targetEnd) {
      sounds.playClick();
      socket.emit('game:action', { type: 'THROW', payload: { hit: true } });
    } else {
      // Miss
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div className={`w-full max-w-4xl flex flex-col items-center ${shake ? 'animate-[bounce_0.2s_ease-in-out_infinite]' : ''}`}>
      <h2 className="text-4xl font-display text-white mb-6 drop-shadow-[0_0_10px_rgba(124,58,237,0.8)]">KNIFE THROWER</h2>
      
      <div className="flex gap-8 mb-12 w-full justify-center">
        {room.players.map((p) => (
          <div key={p.id} className={`flex flex-col items-center p-4 border-2 ${p.id === currentPlayer?.id ? 'border-brand-accent shadow-[0_0_15px_rgba(244,63,94,0.4)]' : 'border-brand-primary'} bg-brand-card`}>
            <span className="font-display text-xl text-white">{p.name}</span>
            <span className="font-display text-3xl text-brand-primary mt-2">{state.scores?.[p.id] || 0} / 10</span>
          </div>
        ))}
      </div>

      {state.phase === 'countdown' && (
        <div className="mt-4 flex flex-col items-center">
          <p className="text-brand-secondary font-display text-xl mb-6 text-center">Throw the knife when the cursor is in the green zone!</p>
          {isHost ? (
            <button
              onClick={handleStart}
              className="px-10 py-4 bg-brand-primary text-white font-display text-2xl shadow-[0_0_20px_rgba(124,58,237,0.6)] hover:bg-brand-primary/80 transition active:scale-95 border border-brand-secondary"
            >
              START
            </button>
          ) : (
            <p className="text-xl font-display text-brand-accent animate-pulse">Waiting for host to start...</p>
          )}
        </div>
      )}

      {state.phase === 'playing' && (
        <div className="w-full flex flex-col items-center gap-12 mt-8">
          <div className="relative w-full max-w-2xl h-12 bg-slate-900 border-2 border-brand-secondary overflow-hidden">
            {/* Target Area */}
            <div 
              className="absolute h-full bg-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.8)] border-x-2 border-white"
              style={{ left: `${targetStart}%`, width: `${targetWidth}%` }}
            />
            {/* Moving Cursor */}
            <div 
              className="absolute h-[150%] w-2 bg-brand-accent top-1/2 -translate-y-1/2 -translate-x-1/2 shadow-[0_0_10px_rgba(244,63,94,1)] z-10"
              style={{ left: `${cursorPos}%` }}
            />
          </div>

          <button
            onClick={handleThrow}
            className="w-48 h-48 rounded-full bg-brand-background border-4 border-brand-accent text-brand-accent font-display text-4xl shadow-[0_0_30px_rgba(244,63,94,0.5)] active:scale-95 active:bg-brand-accent active:text-white transition-all flex items-center justify-center cursor-pointer"
          >
            THROW
          </button>
        </div>
      )}
    </div>
  );
};
