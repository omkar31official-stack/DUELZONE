import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { PatternMasterState, Player, RoomSnapshot } from '../../shared/types';
import { sounds } from '../../lib/sound';

interface PatternMasterProps {
  socket: Socket;
  state: PatternMasterState;
  currentPlayer: Player | null;
  room: RoomSnapshot;
}

const PADS = [
  { id: 0, color: 'bg-rose-500 hover:bg-rose-400 border-rose-300 shadow-rose-900/50', active: 'bg-rose-300 ring-4 ring-rose-100 shadow-[0_0_50px_rgba(244,63,94,1)] scale-105' },
  { id: 1, color: 'bg-blue-500 hover:bg-blue-400 border-blue-300 shadow-blue-900/50', active: 'bg-blue-300 ring-4 ring-blue-100 shadow-[0_0_50px_rgba(59,130,246,1)] scale-105' },
  { id: 2, color: 'bg-emerald-500 hover:bg-emerald-400 border-emerald-300 shadow-emerald-900/50', active: 'bg-emerald-300 ring-4 ring-emerald-100 shadow-[0_0_50px_rgba(16,185,129,1)] scale-105' },
  { id: 3, color: 'bg-amber-500 hover:bg-amber-400 border-amber-300 shadow-amber-900/50', active: 'bg-amber-300 ring-4 ring-amber-100 shadow-[0_0_50px_rgba(245,158,11,1)] scale-105' },
];

export const PatternMasterGame: React.FC<PatternMasterProps> = ({
  socket,
  state,
  currentPlayer,
  room,
}) => {
  const [activePad, setActivePad] = useState<number | null>(null);
  const isMe = (id: string) => id === currentPlayer?.id;
  const isFailed = currentPlayer ? state.failedPlayers.includes(currentPlayer.id) : false;

  // Flash sequence animation during 'showing' phase
  useEffect(() => {
    if (state.phase !== 'showing') return;

    let idx = 0;
    const interval = setInterval(() => {
      if (idx < state.sequence.length) {
        const pad = state.sequence[idx];
        setActivePad(pad);
        sounds.playClick();
        setTimeout(() => setActivePad(null), 450);
        idx++;
      } else {
        clearInterval(interval);
        setActivePad(null);
        if (currentPlayer?.isHost) {
          socket.emit('game:action', { type: 'SHOW_COMPLETE' });
        }
      }
    }, 800);

    return () => clearInterval(interval);
  }, [state.phase, state.sequence, currentPlayer, socket]);

  const handlePadClick = (padIndex: number) => {
    if (state.phase !== 'input' || isFailed) return;
    sounds.playClick();
    setActivePad(padIndex);
    setTimeout(() => setActivePad(null), 250);

    socket.emit('game:action', {
      type: 'INPUT',
      payload: { padIndex },
    });
  };

  return (
    <div className="w-full max-w-4xl flex flex-col items-center gap-6 p-4">
      {/* Round & Leaderboard */}
      <div className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-slate-400 font-extrabold">ROUND {state.round} / {state.totalRounds}</span>
          <h2 className="text-2xl font-black text-fuchsia-400">🧩 PATTERN MASTER</h2>
        </div>

        <div className="flex flex-wrap gap-2">
          {room.players.map(p => (
            <div key={p.id} className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${isMe(p.id) ? 'bg-fuchsia-950 border-fuchsia-400 text-fuchsia-200' : 'bg-slate-950 border-slate-800 text-slate-300'}`}>
              <span>{p.name}</span>
              <span className="bg-slate-800 px-2 py-0.5 rounded-md text-amber-300 font-black">{state.scores[p.id] || 0} pts</span>
            </div>
          ))}
        </div>
      </div>

      {/* Status banner */}
      <div className="text-center font-black text-lg">
        {state.phase === 'showing' && (
          <span className="text-cyan-300 animate-pulse bg-cyan-950/80 border border-cyan-800 px-6 py-2 rounded-full">
            👀 MEMORIZE THE PATTERN...
          </span>
        )}
        {state.phase === 'input' && !isFailed && (
          <span className="text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-6 py-2 rounded-full">
            👇 YOUR TURN! REPEAT THE PATTERN
          </span>
        )}
        {state.phase === 'input' && isFailed && (
          <span className="text-rose-400 bg-rose-950/80 border border-rose-800 px-6 py-2 rounded-full">
            ❌ WRONG PATTERN! YOU ARE OUT THIS ROUND
          </span>
        )}
        {state.phase === 'result' && (
          <span className="text-amber-300 bg-amber-950/80 border border-amber-800 px-6 py-2 rounded-full">
            {state.roundWinner ? `🎉 ${room.players.find(p => p.id === state.roundWinner)?.name} won the round!` : 'ROUND OVER'}
          </span>
        )}
      </div>

      {/* 4 Pad Simon Grid */}
      <div className="grid grid-cols-2 gap-6 w-72 h-72 sm:w-96 sm:h-96 my-4">
        {PADS.map(pad => {
          const isActive = activePad === pad.id;
          return (
            <button
              key={pad.id}
              onClick={() => handlePadClick(pad.id)}
              disabled={state.phase !== 'input' || isFailed}
              className={`rounded-3xl border-4 transition-all transform active:scale-90 ${
                isActive ? pad.active : pad.color
              } ${state.phase !== 'input' || isFailed ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
            />
          );
        })}
      </div>
    </div>
  );
};
