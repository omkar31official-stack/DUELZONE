import React, { useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';
import { Player, RoomSnapshot } from '../../shared/types';
import { sounds } from '../../lib/sound';

export const PingBallGame: React.FC<{ socket: Socket; state: any; currentPlayer: Player | null; room: RoomSnapshot }> = ({ socket, state, currentPlayer, room }) => {
  const isHost = currentPlayer?.isHost;
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>();
  
  // Game physics state
  const [ball, setBall] = useState({ x: 50, y: 10, vx: 0.8, vy: 0.8 });
  const [paddleX, setPaddleX] = useState(50);
  const [isDead, setIsDead] = useState(false);
  const ballRef = useRef(ball);
  
  // Update ref so animation loop has fresh data without closing over stale state
  useEffect(() => { ballRef.current = ball; }, [ball]);

  const updatePhysics = () => {
    if (state.phase === 'playing' && !isDead) {
      let { x, y, vx, vy } = ballRef.current;
      
      // Move ball
      x += vx;
      y += vy;
      
      // Bounce off walls (percentages)
      if (x <= 2 || x >= 98) vx = -vx;
      if (y <= 2) vy = -vy;
      
      // Paddle collision (paddle is at y=90, width=20)
      if (y >= 88 && y <= 92 && vy > 0) {
        if (x >= paddleX - 12 && x <= paddleX + 12) {
          vy = -vy;
          // Add spin based on where it hit the paddle
          vx += (x - paddleX) * 0.1;
          sounds.playClick();
          socket.emit('game:action', { type: 'BOUNCE' });
        }
      }
      
      // Missed the paddle
      if (y > 100) {
        setIsDead(true);
      } else {
        setBall({ x, y, vx, vy });
      }
    }
    requestRef.current = requestAnimationFrame(updatePhysics);
  };

  useEffect(() => {
    if (state.phase === 'playing') {
      setIsDead(false);
      setBall({ x: 50, y: 10, vx: 0.8, vy: 0.8 });
      requestRef.current = requestAnimationFrame(updatePhysics);
    }
    return () => cancelAnimationFrame(requestRef.current!);
  }, [state.phase]);

  useEffect(() => {
    if (state.phase !== 'playing' || !state.endTime) return;
    const timer = window.setTimeout(() => socket.emit('game:action', { type: 'FINISH' }), Math.max(0, state.endTime - Date.now()));
    return () => window.clearTimeout(timer);
  }, [socket, state.endTime, state.phase]);

  const onPointerMove = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    setPaddleX(Math.max(10, Math.min(90, x)));
  };

  return (
    <div className="w-full max-w-4xl flex flex-col items-center select-none" onPointerMove={onPointerMove}>
      <h2 className="text-4xl font-display text-white mb-6 drop-shadow-[0_0_10px_rgba(124,58,237,0.8)]">PING BALL</h2>
      
      <div className="flex gap-8 mb-6 w-full justify-center">
        {room.players.map((p) => (
          <div key={p.id} className={`flex flex-col items-center p-4 border-2 ${p.id === currentPlayer?.id ? 'border-brand-accent shadow-[0_0_15px_rgba(244,63,94,0.4)]' : 'border-brand-primary'} bg-brand-card`}>
            <span className="font-display text-xl text-white">{p.name}</span>
            <span className="font-display text-3xl text-brand-primary mt-2">{state.scores?.[p.id] || 0} hits</span>
          </div>
        ))}
      </div>

      {state.phase === 'countdown' && (
        <div className="mt-10 flex flex-col items-center">
          <p className="text-brand-secondary font-display text-xl mb-6 text-center">Move your mouse to control the paddle. Keep the ball bouncing!</p>
          {isHost ? (
            <button onClick={() => { sounds.playClick(); socket.emit('game:action', { type: 'START' }); }} className="px-10 py-4 bg-brand-primary text-white font-display text-2xl shadow-[0_0_20px_rgba(124,58,237,0.6)] hover:bg-brand-primary/80 transition active:scale-95 border border-brand-secondary">
              START
            </button>
          ) : (
            <p className="text-xl font-display text-brand-accent animate-pulse">Waiting for host to start...</p>
          )}
        </div>
      )}

      {state.phase === 'playing' && (
        <div 
          ref={containerRef}
          className={`relative w-full max-w-2xl h-[500px] bg-slate-900 border-4 ${isDead ? 'border-brand-accent shadow-[0_0_30px_rgba(244,63,94,0.5)]' : 'border-brand-primary shadow-[0_0_30px_rgba(124,58,237,0.2)]'} overflow-hidden cursor-none touch-none`}
        >
          {/* Background Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(124,58,237,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(124,58,237,0.1)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

          {/* Paddle */}
          <div 
            className="absolute bottom-10 h-4 bg-brand-accent rounded-full shadow-[0_0_15px_rgba(244,63,94,1)] -translate-x-1/2"
            style={{ left: `${paddleX}%`, width: '20%' }}
          />

          {/* Ball */}
          {!isDead && (
            <div 
              className="absolute w-6 h-6 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[0_0_15px_rgba(255,255,255,0.8)]"
              style={{ left: `${ball.x}%`, top: `${ball.y}%` }}
            />
          )}

          {isDead && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <span className="font-display text-5xl text-brand-accent drop-shadow-[0_0_10px_rgba(244,63,94,1)]">GAME OVER</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
