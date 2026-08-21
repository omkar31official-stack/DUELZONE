import React, { useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { Player, RoomSnapshot, TapRoyaleState } from '../../shared/types';
import { sounds } from '../../lib/sound';

interface TapRoyaleProps {
  socket: Socket;
  state: TapRoyaleState;
  currentPlayer: Player | null;
  room: RoomSnapshot;
}

export const TapRoyaleGame: React.FC<TapRoyaleProps> = ({ socket, state, currentPlayer, room }) => {
  const isHost = currentPlayer?.isHost;
  const myTaps = currentPlayer ? state.tapCounts[currentPlayer.id] || 0 : 0;
  const leaderboard = [...room.players]
    .filter(player => player.id in state.tapCounts)
    .sort((a, b) => (state.tapCounts[b.id] || 0) - (state.tapCounts[a.id] || 0));

  useEffect(() => {
    if (state.phase !== 'playing' || !state.endTime) return;
    const msLeft = Math.max(0, state.endTime - Date.now() + 80);
    const timer = window.setTimeout(() => socket.emit('game:action', { type: 'FINISH' }), msLeft);
    return () => window.clearTimeout(timer);
  }, [socket, state.endTime, state.phase]);

  const handleStart = () => {
    sounds.playClick();
    socket.emit('game:action', { type: 'START' });
  };

  const handleTap = () => {
    if (state.phase !== 'playing') return;
    sounds.playClick();
    socket.emit('game:action', { type: 'TAP' });
  };

  return (
    <div className="w-full max-w-5xl grid gap-6 lg:grid-cols-[1fr_360px]">
      <section className="relative overflow-hidden rounded-[2rem] border border-fuchsia-400/30 bg-slate-950/85 p-6 shadow-[0_0_60px_rgba(217,70,239,.16)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(236,72,153,.24),transparent_35%),radial-gradient(circle_at_10%_90%,rgba(34,211,238,.18),transparent_30%)]" />
        <div className="relative flex min-h-[520px] flex-col items-center justify-center text-center">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.35em] text-cyan-300">Party arena · 2-5 players</p>
          <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl">Tap Royale</h1>
          <p className="mt-3 max-w-lg text-sm font-semibold leading-6 text-slate-300">
            Ten seconds. No mercy. Every player smashes the same glowing core and the highest score owns the room.
          </p>

          {state.phase === 'countdown' && (
            <div className="mt-10">
              {isHost ? (
                <button
                  onClick={handleStart}
                  className="rounded-2xl bg-gradient-to-r from-fuchsia-500 via-pink-500 to-amber-400 px-8 py-4 text-lg font-black uppercase tracking-wider text-slate-950 shadow-2xl shadow-pink-500/30 transition hover:scale-[1.02] focus-visible:outline focus-visible:outline-4 focus-visible:outline-cyan-300 active:scale-95"
                >
                  Start Royale
                </button>
              ) : (
                <div className="rounded-2xl border border-slate-700 bg-slate-900/80 px-6 py-4 text-sm font-bold text-slate-300">
                  Waiting for host to start…
                </div>
              )}
            </div>
          )}

          {state.phase === 'playing' && (
            <button
              onClick={handleTap}
              className="mt-10 flex h-64 w-64 flex-col items-center justify-center rounded-full border-[10px] border-cyan-200 bg-gradient-to-br from-cyan-300 via-fuchsia-500 to-amber-300 text-slate-950 shadow-[0_0_90px_rgba(34,211,238,.45)] transition hover:scale-[1.01] focus-visible:outline focus-visible:outline-4 focus-visible:outline-white active:scale-90"
            >
              <span className="text-5xl font-black">TAP</span>
              <span className="mt-1 text-3xl font-black">{myTaps}</span>
            </button>
          )}

          {state.phase === 'result' && (
            <div className="mt-10 rounded-3xl border border-amber-300/40 bg-amber-300/10 px-8 py-6">
              <p className="text-sm font-black uppercase tracking-[0.3em] text-amber-200">Final result</p>
              <h2 className="mt-2 text-3xl font-black text-white">
                {state.winner === currentPlayer?.id
                  ? 'You ruled the arena 👑'
                  : state.winner
                  ? `${room.players.find(p => p.id === state.winner)?.name || 'A player'} wins 👑`
                  : 'It ended in a tie'}
              </h2>
            </div>
          )}
        </div>
      </section>

      <aside className="rounded-[2rem] border border-slate-700/80 bg-slate-900/85 p-5 shadow-2xl">
        <h3 className="text-sm font-black uppercase tracking-[0.28em] text-slate-400">Live board</h3>
        <div className="mt-5 space-y-3">
          {leaderboard.map((player, index) => (
            <div key={player.id} className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/75 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-black text-white" style={{ backgroundColor: player.accentColor }}>
                  {index + 1}
                </div>
                <div>
                  <p className="text-sm font-black text-white">{player.name}</p>
                  <p className="text-xs text-slate-500">{player.id === currentPlayer?.id ? 'You' : 'Rival'}</p>
                </div>
              </div>
              <span className="text-xl font-black text-cyan-300">{state.tapCounts[player.id] || 0}</span>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
};
