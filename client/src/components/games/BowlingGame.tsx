import React, { useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';
import { Player, RoomSnapshot } from '../../shared/types';
import { sounds } from '../../lib/sound';

export const BowlingGame: React.FC<{ socket: Socket; state: any; currentPlayer: Player | null; room: RoomSnapshot }> = ({ socket, state, currentPlayer, room }) => {
  const isHost = currentPlayer?.isHost;
  const laneRef = useRef<HTMLDivElement>(null);
  const [startX, setStartX] = useState(0); // -1 to 1
  const [dragStart, setDragStart] = useState<{x: number, y: number, time: number} | null>(null);
  
  // Animation state
  const [animatingBall, setAnimatingBall] = useState<{ active: boolean, x: number, y: number } | null>(null);
  const [fallenAnimPins, setFallenAnimPins] = useState<number[]>([]);
  
  const allPlayers = Object.keys(state.scores || {});
  const currentTurnPlayerId = allPlayers[state.currentTurnIndex];
  const isMyTurn = currentTurnPlayerId === currentPlayer?.id && state.phase === 'playing';

  // React to new rolls from the server
  useEffect(() => {
    if (state.lastRoll && state.phase === 'playing') {
      // Trigger animation!
      setAnimatingBall({ active: true, x: state.lastRoll.startX, y: 1 }); // y: 1 is bottom
      
      // Animate ball moving up the lane
      setTimeout(() => {
        const endX = state.lastRoll.startX + state.lastRoll.angle * 2;
        setAnimatingBall({ active: true, x: endX, y: 0 }); // y: 0 is top
        sounds.playClick(); // Whoosh sound
      }, 50);

      // Show pins falling when ball reaches them
      setTimeout(() => {
        if (state.lastRoll.fallenPins.length > 0) {
          sounds.playClick(); // Crash sound
          setFallenAnimPins(state.lastRoll.fallenPins);
        }
        setAnimatingBall(null);
      }, 600);

      // Clear falling pin animation before next roll
      setTimeout(() => {
        setFallenAnimPins([]);
      }, 1500);
    }
  }, [state.lastRoll]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (!isMyTurn || animatingBall) return;
    setDragStart({ x: e.clientX, y: e.clientY, time: Date.now() });
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isMyTurn || animatingBall) return;
    if (!dragStart && laneRef.current) {
      // Allow moving starting position horizontally before dragging
      const rect = laneRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      setStartX(Math.max(-0.9, Math.min(0.9, x)));
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!isMyTurn || !dragStart || animatingBall) return;
    const dy = dragStart.y - e.clientY;
    const dx = e.clientX - dragStart.x;
    const dt = Date.now() - dragStart.time;
    
    if (dy > 50 && dt > 0) {
      // Valid forward swipe!
      const power = Math.min(1, Math.max(0.2, (dy / dt) * 0.5)); // 0.2 to 1.0
      const angle = (dx / dy); // approx -1 to 1 based on swipe slant
      
      socket.emit('game:action', { 
        type: 'ROLL', 
        payload: { startX, angle, power } 
      });
    }
    
    setDragStart(null);
  };

  // Pin triangle positions (0 to 9)
  const pinPositions = [
    { x: 0, y: 0.1 }, // Head pin (0)
    { x: -0.15, y: 0.05 }, { x: 0.15, y: 0.05 }, // Row 2 (1, 2)
    { x: -0.3, y: 0 }, { x: 0, y: 0 }, { x: 0.3, y: 0 }, // Row 3 (3, 4, 5)
    { x: -0.45, y: -0.05 }, { x: -0.15, y: -0.05 }, { x: 0.15, y: -0.05 }, { x: 0.45, y: -0.05 } // Row 4 (6, 7, 8, 9)
  ];

  return (
    <div className="w-full max-w-4xl flex flex-col items-center select-none overflow-hidden" onPointerUp={onPointerUp} onPointerLeave={onPointerUp}>
      <h2 className="text-4xl font-display text-white mb-4 drop-shadow-[0_0_10px_rgba(124,58,237,0.8)]">PRO BOWLING</h2>
      
      {state.phase === 'countdown' && (
        <div className="mt-4 flex flex-col items-center">
          <p className="text-brand-secondary font-display text-xl mb-4 text-center">Drag left/right to position. Swipe UP fast to throw!</p>
          {isHost ? (
            <button onClick={() => socket.emit('game:action', { type: 'START' })} className="px-10 py-4 bg-brand-primary text-white font-display text-2xl border border-brand-secondary">
              START GAME
            </button>
          ) : (
            <p className="text-xl font-display text-brand-accent animate-pulse">Waiting for host...</p>
          )}
        </div>
      )}

      {state.phase === 'playing' && (
        <div className="flex flex-col md:flex-row gap-8 w-full items-center justify-center">
          
          {/* Scoreboard Left */}
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
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bowling Lane */}
          <div 
            ref={laneRef}
            className={`relative w-[300px] h-[500px] bg-gradient-to-t from-orange-900 to-orange-200 border-x-8 border-slate-800 shadow-[0_0_30px_rgba(0,0,0,0.8)_inset] ${isMyTurn ? 'cursor-grab active:cursor-grabbing' : 'cursor-not-allowed opacity-80'}`}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
          >
            {/* Gutters */}
            <div className="absolute top-0 left-0 w-[10%] h-full bg-slate-900 shadow-inner border-r border-black/50"></div>
            <div className="absolute top-0 right-0 w-[10%] h-full bg-slate-900 shadow-inner border-l border-black/50"></div>

            {/* Pins */}
            <div className="absolute top-20 left-1/2 -translate-x-1/2 w-40 h-40">
              {pinPositions.map((pos, idx) => {
                const isActive = state.activePins?.includes(idx);
                const isFalling = fallenAnimPins.includes(idx);
                
                if (!isActive && !isFalling) return null; // already fallen

                return (
                  <div 
                    key={idx}
                    className={`absolute w-6 h-6 bg-white rounded-full border-2 border-red-500 shadow-md flex items-center justify-center transition-all duration-500 ease-out`}
                    style={{
                      left: `calc(50% + ${pos.x * 100}px)`,
                      top: `calc(50% - ${pos.y * 100}px)`,
                      transform: isFalling ? `translate(${pos.x * 200}px, -100px) rotate(180deg) scale(0.5)` : 'translate(-50%, -50%)',
                      opacity: isFalling ? 0 : 1
                    }}
                  >
                    <div className="w-2 h-2 bg-red-500 rounded-full opacity-30"></div>
                  </div>
                );
              })}
            </div>

            {/* Target Arrows (Visual only) */}
            <div className="absolute top-1/2 w-full flex justify-center gap-8 opacity-50">
              <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-transparent border-b-black"></div>
              <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-transparent border-b-black translate-y-4"></div>
              <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-transparent border-b-black"></div>
            </div>

            {/* The Bowling Ball */}
            {animatingBall ? (
              // Animating roll
              <div 
                className="absolute w-12 h-12 bg-blue-900 rounded-full shadow-xl border-2 border-blue-950 transition-all ease-linear"
                style={{ 
                  left: `calc(50% + ${animatingBall.x * 120}px)`, 
                  top: `calc(${animatingBall.y * 80}%)`,
                  transform: 'translate(-50%, -50%)',
                  transitionDuration: '500ms'
                }}
              >
                {/* Finger holes */}
                <div className="absolute top-2 left-3 w-2 h-2 bg-black rounded-full"></div>
                <div className="absolute top-4 left-2 w-2 h-2 bg-black rounded-full"></div>
                <div className="absolute top-4 left-6 w-2 h-2 bg-black rounded-full"></div>
              </div>
            ) : (
              // Aiming mode (my turn only)
              isMyTurn && (
                <div 
                  className="absolute bottom-10 w-12 h-12 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.8)] border-2 border-blue-400"
                  style={{ 
                    left: `calc(50% + ${startX * 120}px)`, 
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
