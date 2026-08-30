import React, { useState } from 'react';
import { Socket } from 'socket.io-client';
import { Player, MiniGolfState } from '../../shared/types';
import { Flag, Target } from 'lucide-react';

interface MiniGolfGameProps {
  socket: Socket;
  state: MiniGolfState;
  currentPlayer: Player | null;
  opponentPlayer: Player | null;
}

export const MiniGolfGame: React.FC<MiniGolfGameProps> = ({
  socket,
  state,
  currentPlayer,
  opponentPlayer,
}) => {
  const [power, setPower] = useState(50);
  const [angle, setAngle] = useState(0);
  const isMyTurn = state.currentTurn === currentPlayer?.id;

  const handleShoot = () => {
    if (!isMyTurn) return;
    socket.emit('game:action', {
      type: 'PULL_SHOT',
      payload: { power: power / 100, angle: (angle * Math.PI) / 180 },
    });
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md">
      <div className="flex items-center justify-between w-full px-4 py-2 bg-slate-900/90 border border-slate-800 rounded-2xl">
        <span className="text-xs font-black text-slate-400">HOLE #{(state as any).holeNumber || 1}</span>
        <span className="text-xs font-bold text-purple-400">
          {isMyTurn ? 'YOUR TURN TO SHOOT' : `${opponentPlayer?.name || 'Opponent'}'S TURN`}
        </span>
      </div>

      <div className="relative w-full aspect-[4/3] bg-emerald-800 border-4 border-amber-900/60 rounded-3xl shadow-2xl overflow-hidden flex items-center justify-center">
        {/* Obstacle */}
        {((state as any).obstacles || (state.obstacle ? [state.obstacle] : [])).map((obs: any, idx: number) => (
          <div
            key={idx}
            className="absolute bg-slate-900 border-2 border-slate-700 rounded-xl"
            style={{
              left: `${(obs.x || 0) * 100}%`,
              top: `${(obs.y || 0) * 100}%`,
              width: `${(obs.width || obs.w || 0.2) * 100}%`,
              height: `${(obs.height || obs.h || 0.2) * 100}%`,
            }}
          />
        ))}

        {/* Hole */}
        <div
          className="absolute w-8 h-8 rounded-full bg-slate-950 border-2 border-slate-700 flex items-center justify-center"
          style={{ left: `${(state.hole?.x || 0.8) * 100}%`, top: `${(state.hole?.y || 0.2) * 100}%` }}
        >
          <Flag className="w-5 h-5 text-red-500 animate-bounce" />
        </div>

        {/* Golf Ball */}
        <div
          className="absolute w-6 h-6 rounded-full bg-white border-2 border-slate-300 shadow-lg"
          style={{
            left: `${(state.ball?.x || (state as any).ballPositions?.[currentPlayer?.id || '']?.x || 0.15) * 100}%`,
            top: `${(state.ball?.y || (state as any).ballPositions?.[currentPlayer?.id || '']?.y || 0.8) * 100}%`,
          }}
        />
      </div>

      {/* Angle & Power Controls */}
      <div className="flex flex-col gap-3 w-full bg-slate-900 p-4 border border-slate-800 rounded-2xl">
        <div className="flex items-center justify-between text-xs font-bold text-slate-300">
          <span>ANGLE: {angle}°</span>
          <input
            type="range"
            min="-90"
            max="90"
            value={angle}
            onChange={(e) => setAngle(Number(e.target.value))}
            className="w-48 accent-purple-500"
          />
        </div>

        <div className="flex items-center justify-between text-xs font-bold text-slate-300">
          <span>POWER: {power}%</span>
          <input
            type="range"
            min="10"
            max="100"
            value={power}
            onChange={(e) => setPower(Number(e.target.value))}
            className="w-48 accent-emerald-500"
          />
        </div>

        <button
          onClick={handleShoot}
          disabled={!isMyTurn}
          className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 disabled:opacity-40 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-xl shadow-lg transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
        >
          <Target className="w-4 h-4" /> STRIKE BALL
        </button>
      </div>
    </div>
  );
};
