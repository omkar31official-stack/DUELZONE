import React, { useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';
import { Player, RoomSnapshot } from '../../shared/types';
import { sounds } from '../../lib/sound';

export const ArcheryGame: React.FC<{ socket: Socket; state: any; currentPlayer: Player | null; room: RoomSnapshot }> = ({ socket, state, currentPlayer, room }) => {
  const isHost = currentPlayer?.isHost;
  const [crosshair, setCrosshair] = useState({ x: 50, y: 50 });
  const [shots, setShots] = useState<{x: number, y: number}[]>([]);
  const requestRef = useRef<number>();

  const updateCrosshair = (time: number) => {
    if (state.phase === 'playing') {
      // Complex drifting math using sine waves to make it hard to aim
      const x = 50 + Math.sin(time * 0.002) * 30 + Math.cos(time * 0.0031) * 15;
      const y = 50 + Math.cos(time * 0.0025) * 30 + Math.sin(time * 0.0017) * 15;
      setCrosshair({ x, y });
    }
    requestRef.current = requestAnimationFrame(updateCrosshair);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(updateCrosshair);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [state.phase]);

  useEffect(() => {
    if (state.phase !== 'playing' || !state.endTime) return;
    const timer = window.setTimeout(() => socket.emit('game:action', { type: 'FINISH' }), Math.max(0, state.endTime - Date.now()));
    return () => window.clearTimeout(timer);
  }, [socket, state.endTime, state.phase]);

  const handleShoot = () => {
    if (state.phase !== 'playing') return;
    sounds.playClick();
    
    // Calculate distance from center (50, 50)
    const dx = crosshair.x - 50;
    const dy = crosshair.y - 50;
    const distance = Math.sqrt(dx*dx + dy*dy);
    
    let points = 0;
    if (distance < 5) points = 50; // Bullseye
    else if (distance < 15) points = 20;
    else if (distance < 30) points = 10;

    setShots(prev => [...prev, crosshair]);
    socket.emit('game:action', { type: 'SHOOT', payload: { points } });
  };

  return (
    <div className="w-full max-w-4xl flex flex-col items-center select-none">
      <h2 className="text-4xl font-display text-white mb-6 drop-shadow-[0_0_10px_rgba(124,58,237,0.8)]">ARCHERY DUEL</h2>
      
      <div className="flex gap-8 mb-6 w-full justify-center">
        {room.players.map((p) => (
          <div key={p.id} className={`flex flex-col items-center p-4 border-2 ${p.id === currentPlayer?.id ? 'border-brand-accent shadow-[0_0_15px_rgba(244,63,94,0.4)]' : 'border-brand-primary'} bg-brand-card`}>
            <span className="font-display text-xl text-white">{p.name}</span>
            <span className="font-display text-3xl text-brand-primary mt-2">{state.scores?.[p.id] || 0} pts</span>
          </div>
        ))}
      </div>

      {state.phase === 'countdown' && (
        <div className="mt-10 flex flex-col items-center">
          <p className="text-brand-secondary font-display text-xl mb-6 text-center">Wait for the drifting crosshair to align with the bullseye, then SHOOT!</p>
          {isHost ? (
            <button onClick={() => { sounds.playClick(); socket.emit('game:action', { type: 'START' }); setShots([]); }} className="px-10 py-4 bg-brand-primary text-white font-display text-2xl shadow-[0_0_20px_rgba(124,58,237,0.6)] hover:bg-brand-primary/80 transition active:scale-95 border border-brand-secondary">
              START
            </button>
          ) : (
            <p className="text-xl font-display text-brand-accent animate-pulse">Waiting for host to start...</p>
          )}
        </div>
      )}

      {state.phase === 'playing' && (
        <div className="flex flex-col items-center gap-8 w-full">
          <div 
            className="relative w-80 h-80 bg-slate-900 border-4 border-brand-primary rounded-xl overflow-hidden cursor-crosshair shadow-[0_0_30px_rgba(124,58,237,0.2)]"
            onClick={handleShoot}
          >
            {/* Target Rings */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 rounded-full border-[15px] border-white bg-red-500 shadow-[0_0_20px_rgba(0,0,0,0.5)_inset]"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full border-[15px] border-white bg-blue-500 shadow-[0_0_20px_rgba(0,0,0,0.5)_inset]"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-yellow-400 shadow-[0_0_20px_rgba(0,0,0,0.5)_inset]"></div>
            
            {/* Previous Shots */}
            {shots.map((shot, idx) => (
              <div 
                key={idx}
                className="absolute w-3 h-3 bg-brand-accent rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[0_0_10px_rgba(244,63,94,1)]"
                style={{ left: `${shot.x}%`, top: `${shot.y}%` }}
              />
            ))}

            {/* Drifting Crosshair */}
            <div 
              className="absolute w-12 h-12 border-2 border-brand-secondary rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-75"
              style={{ left: `${crosshair.x}%`, top: `${crosshair.y}%` }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-brand-secondary rounded-full"></div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-brand-secondary/50"></div>
              <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-px bg-brand-secondary/50"></div>
            </div>
          </div>
          
          <button onClick={handleShoot} className="px-16 py-6 bg-brand-background text-brand-accent font-display text-3xl border-4 border-brand-accent shadow-[0_0_20px_rgba(244,63,94,0.6)] hover:bg-brand-accent hover:text-white transition active:scale-95 uppercase tracking-widest">
            SHOOT!
          </button>
        </div>
      )}
    </div>
  );
};
