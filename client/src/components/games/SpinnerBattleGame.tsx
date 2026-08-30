import React, { useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { Player, SpinnerBattleState } from '../../shared/types';
import { Zap } from 'lucide-react';

interface SpinnerBattleGameProps {
  socket: Socket;
  state: SpinnerBattleState;
  currentPlayer: Player | null;
  opponentPlayer: Player | null;
}

export const SpinnerBattleGame: React.FC<SpinnerBattleGameProps> = ({
  socket,
  state,
  currentPlayer,
  opponentPlayer,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playerKeys = Object.keys(state.scores);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Arena Outer
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Arena Ring (Circle)
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 180, 0, Math.PI * 2);
    ctx.stroke();

    // Draw Spinners
    const colors = ['#06b6d4', '#ec4899'];
    playerKeys.forEach((pId, idx) => {
      const sp = state.spinners[pId];
      if (!sp) return;

      const px = sp.x * canvas.width;
      const py = sp.y * canvas.height;

      ctx.fillStyle = colors[idx % 2];
      ctx.beginPath();
      ctx.arc(px, py, sp.radius * canvas.width, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();
    });
  }, [state]);

  const handleBoost = (angle: number) => {
    socket.emit('game:action', { type: 'BOOST', payload: { angle, power: 0.03 } });
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md">
      <div className="flex items-center justify-between w-full px-4 py-2 bg-slate-900/90 border border-slate-800 rounded-2xl">
        <span className="font-bold text-cyan-400">{state.scores[playerKeys[0]] || 0} WINS</span>
        <span className="text-xs font-black uppercase text-slate-400">SUMO SPINNER</span>
        <span className="font-bold text-pink-400">{state.scores[playerKeys[1]] || 0} WINS</span>
      </div>

      <canvas
        ref={canvasRef}
        width={450}
        height={450}
        className="w-full h-auto aspect-square border-2 border-slate-800 rounded-full shadow-2xl bg-slate-950"
      />

      <div className="grid grid-cols-3 gap-2 w-48">
        <div />
        <button
          onClick={() => handleBoost(-Math.PI / 2)}
          className="p-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold text-white flex justify-center active:scale-95 cursor-pointer"
        >
          ▲
        </button>
        <div />
        <button
          onClick={() => handleBoost(Math.PI)}
          className="p-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold text-white flex justify-center active:scale-95 cursor-pointer"
        >
          ◀
        </button>
        <button
          onClick={() => handleBoost(Math.PI / 2)}
          className="p-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold text-white flex justify-center active:scale-95 cursor-pointer"
        >
          ▼
        </button>
        <button
          onClick={() => handleBoost(0)}
          className="p-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold text-white flex justify-center active:scale-95 cursor-pointer"
        >
          ▶
        </button>
      </div>
    </div>
  );
};
