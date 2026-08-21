import React, { useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';
import { Player, RoomSnapshot } from '../../shared/types';
import { sounds } from '../../lib/sound';

const PIN_RADIUS = 0.08;
const BALL_RADIUS = 0.12;
const INITIAL_PINS = [
  { id: 0, x: 0, y: 0.1 },
  { id: 1, x: -0.15, y: 0.00 }, { id: 2, x: 0.15, y: 0.00 },
  { id: 3, x: -0.3, y: -0.10 }, { id: 4, x: 0, y: -0.10 }, { id: 5, x: 0.3, y: -0.10 },
  { id: 6, x: -0.45, y: -0.20 }, { id: 7, x: -0.15, y: -0.20 }, { id: 8, x: 0.15, y: -0.20 }, { id: 9, x: 0.45, y: -0.20 }
];

export const BowlingGame: React.FC<{ socket: Socket; state: any; currentPlayer: Player | null; room: RoomSnapshot }> = ({ socket, state, currentPlayer, room }) => {
  const isHost = currentPlayer?.isHost;
  const laneRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>();
  
  const [startX, setStartX] = useState(0); 
  const [dragStart, setDragStart] = useState<{x: number, y: number, time: number} | null>(null);
  const [physicsState, setPhysicsState] = useState<{ ball: {x: number, y: number}, pins: {id: number, x: number, y: number, vx: number, vy: number}[] } | null>(null);
  
  const allPlayers = Object.keys(state.scores || {});
  const currentTurnPlayerId = allPlayers[state.currentTurnIndex];
  const isMyTurn = currentTurnPlayerId === currentPlayer?.id && state.phase === 'playing';

  // React to new rolls from the server by running the exact same deterministic physics engine for visualization!
  useEffect(() => {
    if (state.lastRoll && state.phase === 'playing') {
      const { startX: rx, angle, power, fallenPins } = state.lastRoll;
      
      let ball = { x: rx, y: 1.5, vx: angle * power * 0.06, vy: -power * 0.08 };
      
      // We want to simulate the pins that were standing before this roll.
      // activePins currently has the pins AFTER the roll.
      const standingBeforeRoll = [...state.activePins, ...fallenPins];
      let pins = INITIAL_PINS.map(p => ({ ...p, vx: 0, vy: 0, isStanding: standingBeforeRoll.includes(p.id) }));
      
      let frameCount = 0;

      const runFrame = () => {
        if (frameCount++ > 150) {
           setPhysicsState(null);
           return;
        }

        ball.x += ball.vx;
        ball.y += ball.vy;
        
        if (ball.x < -1 || ball.x > 1) {
          ball.x = -100; ball.vx = 0; ball.vy = 0;
        }

        for (let p of pins) {
          if (!p.isStanding) continue;
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.95;
          p.vy *= 0.95;
        }

        // Ball -> Pin collisions
        for (let p of pins) {
          if (!p.isStanding) continue;
          const dx = p.x - ball.x;
          const dy = p.y - ball.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < BALL_RADIUS + PIN_RADIUS) {
            const nx = dx / dist; const ny = dy / dist;
            const force = 0.08 * power;
            p.vx += nx * force; p.vy += ny * force;
            ball.vx *= 0.85; ball.vy *= 0.85;
            if (frameCount % 5 === 0) sounds.playClick();
          }
        }

        // Pin -> Pin collisions
        for (let i = 0; i < pins.length; i++) {
          if (!pins[i].isStanding) continue;
          for (let j = i + 1; j < pins.length; j++) {
            if (!pins[j].isStanding) continue;
            const dx = pins[j].x - pins[i].x; const dy = pins[j].y - pins[i].y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < PIN_RADIUS * 2) {
              const nx = dx / dist; const ny = dy / dist;
              const relVx = pins[i].vx - pins[j].vx; const relVy = pins[i].vy - pins[j].vy;
              const transfer = (relVx * nx + relVy * ny) * 0.8;
              if (transfer > 0) {
                pins[i].vx -= nx * transfer; pins[i].vy -= ny * transfer;
                pins[j].vx += nx * transfer; pins[j].vy += ny * transfer;
              }
            }
          }
        }

        setPhysicsState({ ball: { ...ball }, pins: pins.map(p => ({ ...p })) });
        requestRef.current = requestAnimationFrame(runFrame);
      };

      sounds.playClick(); // throw sound
      requestRef.current = requestAnimationFrame(runFrame);
    }
    
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [state.lastRoll]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (!isMyTurn || physicsState) return;
    setDragStart({ x: e.clientX, y: e.clientY, time: Date.now() });
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isMyTurn || physicsState) return;
    if (!dragStart && laneRef.current) {
      const rect = laneRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      setStartX(Math.max(-0.9, Math.min(0.9, x)));
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!isMyTurn || !dragStart || physicsState) return;
    const dy = dragStart.y - e.clientY;
    const dx = e.clientX - dragStart.x;
    const dt = Date.now() - dragStart.time;
    
    if (dy > 20 && dt > 0) {
      const power = Math.min(1, Math.max(0.4, (dy / dt) * 0.8));
      const angle = (dx / dy); 
      
      socket.emit('game:action', { 
        type: 'ROLL', 
        payload: { startX, angle, power } 
      });
    }
    setDragStart(null);
  };

  return (
    <div className="w-full max-w-4xl flex flex-col items-center select-none overflow-hidden" onPointerUp={onPointerUp} onPointerLeave={onPointerUp}>
      <h2 className="text-4xl font-display text-white mb-4 drop-shadow-[0_0_10px_rgba(124,58,237,0.8)]">PRO BOWLING</h2>
      
      {state.phase === 'countdown' && (
        <div className="mt-4 flex flex-col items-center">
          <p className="text-brand-secondary font-display text-xl mb-4 text-center">Drag left/right to position. Swipe UP fast to throw!</p>
          {isHost ? (
            <button onClick={() => socket.emit('game:action', { type: 'START' })} className="px-10 py-4 bg-brand-primary text-white font-display text-2xl border border-brand-secondary hover:bg-brand-primary/80 transition active:scale-95">
              START GAME
            </button>
          ) : (
            <p className="text-xl font-display text-brand-accent animate-pulse">Waiting for host...</p>
          )}
        </div>
      )}

      {state.phase === 'playing' && (
        <div className="flex flex-col md:flex-row gap-8 w-full items-center justify-center">
          
          <div className="flex flex-col gap-4">
            <h3 className="font-display text-2xl text-brand-accent mb-2">Scoreboard (Frame {state.currentFrame + 1}/10)</h3>
            {room.players.map((p) => {
              const frames = state.frames?.[p.id] || [];
              const isTurn = p.id === currentTurnPlayerId;
              return (
                <div key={p.id} className={`p-4 border-2 ${isTurn ? 'border-brand-accent shadow-[0_0_15px_rgba(244,63,94,0.4)]' : 'border-brand-primary'} bg-brand-card w-64`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-display text-lg text-white">{p.name} {isTurn ? '🎳' : ''}</span>
                    <span className="font-display text-2xl text-brand-primary">{state.scores?.[p.id] || 0}</span>
                  </div>
                  <div className="flex gap-1">
                    {frames.map((f: any, idx: number) => (
                      <div key={idx} className="flex-1 border border-brand-secondary/30 h-6 flex items-center justify-center text-xs text-white">
                        {f.rolls[0] === 10 ? 'X' : (f.rolls[0] !== undefined ? f.rolls[0] : '')}
                        {f.rolls[1] !== undefined && (f.rolls[0] + f.rolls[1] === 10 ? '/' : f.rolls[1])}
                        {f.rolls[2] !== undefined && f.rolls[2]}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div 
            ref={laneRef}
            className={`relative w-[300px] h-[500px] bg-gradient-to-t from-orange-900 to-orange-200 border-x-8 border-slate-800 shadow-[0_0_30px_rgba(0,0,0,0.8)_inset] ${isMyTurn ? 'cursor-grab active:cursor-grabbing' : 'cursor-not-allowed opacity-80'}`}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
          >
            <div className="absolute top-0 left-0 w-[10%] h-full bg-slate-900 shadow-inner border-r border-black/50"></div>
            <div className="absolute top-0 right-0 w-[10%] h-full bg-slate-900 shadow-inner border-l border-black/50"></div>

            {/* Target Arrows */}
            <div className="absolute top-1/2 w-full flex justify-center gap-8 opacity-50">
              <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-transparent border-b-black"></div>
              <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-transparent border-b-black translate-y-4"></div>
              <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-transparent border-b-black"></div>
            </div>

            {/* Render Pins (Idle or Animating) */}
            <div className="absolute top-20 left-1/2 -translate-x-1/2 w-40 h-40">
              {(physicsState ? physicsState.pins : INITIAL_PINS).map((p) => {
                // If not animating, only show active pins
                if (!physicsState && !state.activePins?.includes(p.id)) return null;
                // If animating, only show pins that were standing
                if (physicsState && !(p as any).isStanding) return null;

                const orig = INITIAL_PINS[p.id];
                const dx = p.x - orig.x;
                const dy = p.y - orig.y;
                // Simple tilt based on velocity for visual realism
                const tilt = physicsState ? ((p as any).vx * 200) : 0;

                return (
                  <div 
                    key={p.id}
                    className="absolute w-6 h-6 bg-white rounded-full border-2 border-red-500 shadow-md flex items-center justify-center will-change-transform"
                    style={{
                      left: `calc(50% + ${orig.x * 150}px)`,
                      top: `calc(50% - ${orig.y * 150}px)`,
                      transform: `translate(calc(-50% + ${dx * 150}px), calc(-50% + ${dy * 150}px)) rotate(${tilt}deg)`,
                    }}
                  >
                    <div className="w-2 h-2 bg-red-500 rounded-full opacity-30"></div>
                  </div>
                );
              })}
            </div>

            {/* Render Ball (Idle or Animating) */}
            {physicsState ? (
              <div 
                className="absolute w-10 h-10 bg-blue-900 rounded-full shadow-xl border-2 border-blue-950 will-change-transform"
                style={{ 
                  left: '50%', top: '20%', // base position matches pin deck center
                  transform: `translate(calc(-50% + ${physicsState.ball.x * 150}px), calc(-50% + ${physicsState.ball.y * 150}px)) rotate(${physicsState.ball.x * 300}deg)`
                }}
              >
                <div className="absolute top-2 left-3 w-2 h-2 bg-black rounded-full"></div>
                <div className="absolute top-4 left-2 w-2 h-2 bg-black rounded-full"></div>
                <div className="absolute top-4 left-6 w-2 h-2 bg-black rounded-full"></div>
              </div>
            ) : (
              isMyTurn && (
                <div 
                  className="absolute bottom-10 w-10 h-10 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.8)] border-2 border-blue-400"
                  style={{ 
                    left: `calc(50% + ${startX * 135}px)`, 
                    transform: 'translate(-50%, 0)'
                  }}
                >
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-px h-8 bg-white/50 border-dashed"></div>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};
