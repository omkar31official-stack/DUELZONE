import React, { useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';
import { Player, RoomSnapshot } from '../../shared/types';
import { sounds } from '../../lib/sound';

interface Fruit {
  id: string;
  type: 'apple' | 'banana' | 'watermelon' | 'bomb';
  startX: number;
  vx: number;
  vy: number;
  spawnTime: number;
}

interface FruitNinjaState {
  phase: 'countdown' | 'playing' | 'result';
  scores: Record<string, number>;
  startTime: number | null;
  endTime: number | null;
  winner: string | null;
  fruits: Fruit[];
  slashed: string[];
}

export const FruitNinjaGame: React.FC<{ socket: Socket; state: FruitNinjaState; currentPlayer: Player | null; room: RoomSnapshot }> = ({ socket, state, currentPlayer, room }) => {
  const isHost = currentPlayer?.isHost;
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>();
  const [activeFruits, setActiveFruits] = useState<(Fruit & { x: number, y: number, rotation: number, scale: number })[]>([]);
  const [mousePath, setMousePath] = useState<{x: number, y: number, time: number}[]>([]);
  const isDragging = useRef(false);

  // Constants
  const GRAVITY = 0.003; // pixels per ms^2

  const updatePhysics = () => {
    if (state.phase !== 'playing' || !state.startTime) return;
    const elapsed = Date.now() - state.startTime;
    
    if (containerRef.current) {
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      const visible = state.fruits
        .filter(f => !state.slashed.includes(f.id) && elapsed > f.spawnTime)
        .map(f => {
          const t = elapsed - f.spawnTime;
          // Physics equations
          const x = (f.startX * width) + (f.vx * t);
          const y = height + (f.vy * t) + (0.5 * GRAVITY * t * t);
          const rotation = t * (f.vx > 0 ? 0.2 : -0.2); // Spin based on direction
          return { ...f, x, y, rotation, scale: 1 };
        })
        .filter(f => f.y > -100 && f.y < height + 100 && f.x > -100 && f.x < width + 100);

      setActiveFruits(visible);
    }
    
    requestRef.current = requestAnimationFrame(updatePhysics);
  };

  useEffect(() => {
    if (state.phase === 'playing') {
      requestRef.current = requestAnimationFrame(updatePhysics);
    } else {
      setActiveFruits([]);
    }
    return () => cancelAnimationFrame(requestRef.current!);
  }, [state.phase, state.fruits, state.slashed]);

  useEffect(() => {
    if (state.phase !== 'playing' || !state.endTime) return;
    const timer = window.setTimeout(() => socket.emit('game:action', { type: 'FINISH' }), Math.max(0, state.endTime - Date.now()));
    return () => window.clearTimeout(timer);
  }, [socket, state.endTime, state.phase]);

  const handleStart = () => {
    sounds.playClick();
    socket.emit('game:action', { type: 'START' });
  };

  const checkSlash = (mouseX: number, mouseY: number) => {
    if (!containerRef.current || state.phase !== 'playing') return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = mouseX - rect.left;
    const y = mouseY - rect.top;

    // Check collision with active fruits
    activeFruits.forEach(f => {
      const dx = x - f.x;
      const dy = y - f.y;
      const distance = Math.sqrt(dx*dx + dy*dy);
      
      // Hit radius is ~40px
      if (distance < 40) {
        sounds.playClick(); // Or a custom slash sound
        socket.emit('game:action', { type: 'SLASH', payload: { fruitId: f.id } });
        
        // Visual feedback
        const ele = document.getElementById(f.id);
        if (ele) ele.style.transform = `translate(${f.x}px, ${f.y}px) rotate(${f.rotation}deg) scale(1.5)`;
      }
    });
  };

  // Mouse / Touch handlers for slashing
  const onPointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    setMousePath([{ x: e.clientX, y: e.clientY, time: Date.now() }]);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    
    const newPath = [...mousePath, { x: e.clientX, y: e.clientY, time: Date.now() }];
    // Keep only last 200ms of trail
    const recentPath = newPath.filter(p => Date.now() - p.time < 200);
    setMousePath(recentPath);
    
    checkSlash(e.clientX, e.clientY);
  };

  const onPointerUp = () => {
    isDragging.current = false;
    setMousePath([]);
  };

  const getEmoji = (type: string) => {
    if (type === 'apple') return '🍎';
    if (type === 'banana') return '🍌';
    if (type === 'watermelon') return '🍉';
    return '💣';
  };

  return (
    <div className="w-full max-w-4xl flex flex-col items-center select-none" onPointerUp={onPointerUp} onPointerLeave={onPointerUp}>
      <h2 className="text-4xl font-display text-white mb-6 drop-shadow-[0_0_10px_rgba(124,58,237,0.8)]">FRUIT SLASH</h2>
      
      <div className="flex gap-8 mb-6 w-full justify-center">
        {room.players.map((p) => (
          <div key={p.id} className={`flex flex-col items-center p-4 border-2 ${p.id === currentPlayer?.id ? 'border-brand-accent shadow-[0_0_15px_rgba(244,63,94,0.4)]' : 'border-brand-primary'} bg-brand-card`}>
            <span className="font-display text-xl text-white">{p.name}</span>
            <span className="font-display text-3xl text-brand-primary mt-2">{state.scores?.[p.id] || 0}</span>
          </div>
        ))}
      </div>

      {state.phase === 'countdown' && (
        <div className="mt-10 flex flex-col items-center">
          <p className="text-brand-secondary font-display text-xl mb-6 text-center">Drag across the fruits to slash! Avoid Bombs!</p>
          {isHost ? (
            <button onClick={handleStart} className="px-10 py-4 bg-brand-primary text-white font-display text-2xl shadow-[0_0_20px_rgba(124,58,237,0.6)] hover:bg-brand-primary/80 transition active:scale-95 border border-brand-secondary">
              START SLASHING
            </button>
          ) : (
            <p className="text-xl font-display text-brand-accent animate-pulse">Waiting for host to start...</p>
          )}
        </div>
      )}

      {state.phase === 'playing' && (
        <div 
          ref={containerRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          className="relative w-full h-[500px] bg-slate-900 border-4 border-brand-primary overflow-hidden shadow-[0_0_30px_rgba(124,58,237,0.2)] cursor-crosshair touch-none"
        >
          {/* Fruits */}
          {activeFruits.map(f => (
            <div
              key={f.id}
              id={f.id}
              className="absolute text-5xl transition-transform duration-75 pointer-events-none"
              style={{
                transform: `translate(${f.x - 30}px, ${f.y - 30}px) rotate(${f.rotation}deg)`,
                textShadow: f.type === 'bomb' ? '0 0 20px red' : '0 0 10px white'
              }}
            >
              {getEmoji(f.type)}
            </div>
          ))}

          {/* Slicing Trail Effect (SVG) */}
          <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
            {mousePath.length > 1 && (
              <polyline
                points={mousePath.map(p => {
                  const rect = containerRef.current?.getBoundingClientRect();
                  return rect ? `${p.x - rect.left},${p.y - rect.top}` : '0,0';
                }).join(' ')}
                fill="none"
                stroke="#F43F5E"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="drop-shadow-[0_0_8px_rgba(244,63,94,1)] opacity-80"
              />
            )}
          </svg>
        </div>
      )}
    </div>
  );
};
