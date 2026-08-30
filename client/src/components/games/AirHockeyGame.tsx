import React, { useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { Player, AirHockeyState } from '../../shared/types';

interface AirHockeyGameProps {
  socket: Socket;
  state: AirHockeyState;
  currentPlayer: Player | null;
  opponentPlayer: Player | null;
}

export const AirHockeyGame: React.FC<AirHockeyGameProps> = ({
  socket,
  state,
  currentPlayer,
  opponentPlayer,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playerKeys = Object.keys(state.scores);
  const isTopPlayer = currentPlayer?.id === playerKeys[0];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Ice rink background
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Center line
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    // Center Circle
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 50, 0, Math.PI * 2);
    ctx.stroke();

    // Goals (Top & Bottom)
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(canvas.width / 2 - 60, 0, 120, 12);
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(canvas.width / 2 - 60, canvas.height - 12, 120, 12);

    // Mallets
    const m1 = state.mallets[playerKeys[0]] || { x: 0.5, y: 0.15 };
    const m2 = state.mallets[playerKeys[1]] || { x: 0.5, y: 0.85 };

    // Mallet 1 (Top / Cyan)
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(m1.x * canvas.width, m1.y * canvas.height, 24, 0, Math.PI * 2);
    ctx.fill();

    // Mallet 2 (Bottom / Rose)
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(m2.x * canvas.width, m2.y * canvas.height, 24, 0, Math.PI * 2);
    ctx.fill();

    // Puck
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(state.puck.x * canvas.width, state.puck.y * canvas.height, 16, 0, Math.PI * 2);
    ctx.fill();
  }, [state]);

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || state.winner) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    socket.emit('game:action', { type: 'MOVE_MALLET', payload: { x, y } });
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md">
      <div className="flex items-center justify-between w-full px-4 py-2 bg-slate-900/90 border border-slate-800 rounded-2xl">
        <span className="font-bold text-sky-400">{state.scores[playerKeys[0]] || 0}</span>
        <span className="text-xs font-black uppercase text-slate-400">AIR HOCKEY BLITZ</span>
        <span className="font-bold text-rose-400">{state.scores[playerKeys[1]] || 0}</span>
      </div>

      <canvas
        ref={canvasRef}
        width={400}
        height={600}
        onPointerMove={handlePointerMove}
        className="w-full h-auto aspect-[2/3] border-2 border-slate-800 rounded-3xl shadow-2xl touch-none cursor-pointer bg-slate-950"
      />
    </div>
  );
};
