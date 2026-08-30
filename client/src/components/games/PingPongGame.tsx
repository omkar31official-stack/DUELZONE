import React, { useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { Player, PingPongState } from '../../shared/types';

interface PingPongGameProps {
  socket: Socket;
  state: PingPongState;
  currentPlayer: Player | null;
  opponentPlayer: Player | null;
}

export const PingPongGame: React.FC<PingPongGameProps> = ({
  socket,
  state,
  currentPlayer,
  opponentPlayer,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playerKeys = Object.keys(state.scores);
  const isPlayer1 = currentPlayer?.id === playerKeys[0];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Table background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Center line
    ctx.strokeStyle = '#334155';
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Paddles
    const p1Y = (state.paddles[playerKeys[0]] ?? 0.5) * canvas.height;
    const p2Y = (state.paddles[playerKeys[1]] ?? 0.5) * canvas.height;

    // P1 Paddle (Cyan)
    ctx.fillStyle = '#22d3ee';
    ctx.fillRect(20, p1Y - 40, 14, 80);

    // P2 Paddle (Fuchsia)
    ctx.fillStyle = '#e879f9';
    ctx.fillRect(canvas.width - 34, p2Y - 40, 14, 80);

    // Ball
    ctx.fillStyle = '#fbbf24';
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(state.ball.x * canvas.width, state.ball.y * canvas.height, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }, [state]);

  // Tick loop driven by client/host
  useEffect(() => {
    if (!currentPlayer?.isHost || state.winner) return;
    const interval = setInterval(() => {
      socket.emit('game:action', { type: 'TICK' });
    }, 30);
    return () => clearInterval(interval);
  }, [currentPlayer, state.winner, socket]);

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || state.winner) return;
    const rect = canvas.getBoundingClientRect();
    const yRelative = (e.clientY - rect.top) / rect.height;
    socket.emit('game:action', { type: 'MOVE_PADDLE', payload: { y: yRelative } });
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-2xl">
      <div className="flex items-center justify-between w-full px-4 py-2 bg-slate-900/90 border border-slate-800 rounded-2xl">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-cyan-400" />
          <span className="font-bold text-slate-200">{isPlayer1 ? 'You' : opponentPlayer?.name || 'Player 1'}</span>
          <span className="text-xl font-black text-cyan-300 ml-2">{state.scores[playerKeys[0]] || 0}</span>
        </div>
        <span className="text-xs font-black uppercase text-slate-400 tracking-widest">FIRST TO {state.targetScore}</span>
        <div className="flex items-center gap-2">
          <span className="text-xl font-black text-fuchsia-300 mr-2">{state.scores[playerKeys[1]] || 0}</span>
          <span className="font-bold text-slate-200">{!isPlayer1 ? 'You' : opponentPlayer?.name || 'Player 2'}</span>
          <span className="w-3 h-3 rounded-full bg-fuchsia-400" />
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={700}
        height={400}
        onPointerMove={handlePointerMove}
        className="w-full h-auto aspect-[7/4] border-2 border-slate-800 rounded-3xl shadow-2xl touch-none cursor-pointer bg-slate-950"
      />
      <p className="text-xs text-slate-400 font-semibold">Drag finger or mouse up & down on canvas to move paddle!</p>
    </div>
  );
};
