import React from 'react';
import { Socket } from 'socket.io-client';
import { Player, RoomSnapshot, TargetRushState } from '../../shared/types';
import { sounds } from '../../lib/sound';

interface TargetRushProps {
  socket: Socket;
  state: TargetRushState;
  currentPlayer: Player | null;
  room: RoomSnapshot;
}

export const TargetRushGame: React.FC<TargetRushProps> = ({ socket, state, currentPlayer, room }) => {
  const myChoice = currentPlayer ? state.choices[currentPlayer.id] : null;
  const myHand = currentPlayer ? state.playerNumbers[currentPlayer.id] || [] : [];
  const leaderboard = [...room.players]
    .filter(player => player.id in state.scores)
    .sort((a, b) => (state.scores[b.id] || 0) - (state.scores[a.id] || 0));

  const handleChoose = (number: number) => {
    if (myChoice !== null || state.revealed || state.gameWinner) return;
    sounds.playClick();
    socket.emit('game:action', { type: 'CHOOSE', payload: { number } });
  };

  return (
    <div className="w-full max-w-5xl grid gap-6 lg:grid-cols-[1fr_340px]">
      <section className="rounded-[2rem] border border-amber-300/30 bg-slate-950/85 p-6 shadow-[0_0_70px_rgba(245,158,11,.14)]">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.35em] text-amber-300">Target Rush</p>
            <h1 className="mt-1 text-2xl font-black text-white">Round {state.round} / {state.totalRounds}</h1>
          </div>
          <div className="rounded-2xl border border-amber-300/40 bg-amber-300/10 px-5 py-3 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-200">Target</p>
            <p className="text-5xl font-black text-white">{state.target}</p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm font-semibold text-slate-300">Pick the card closest to the target number.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            {myHand.map(number => (
              <button
                key={number}
                onClick={() => handleChoose(number)}
                disabled={myChoice !== null || state.revealed || !!state.gameWinner}
                className={`h-24 w-20 rounded-2xl border-2 text-3xl font-black shadow-xl transition focus-visible:outline focus-visible:outline-4 focus-visible:outline-cyan-300 active:scale-95 ${
                  myChoice === number
                    ? 'border-cyan-200 bg-cyan-300 text-slate-950'
                    : myChoice !== null || state.revealed || state.gameWinner
                    ? 'border-slate-800 bg-slate-900 text-slate-600'
                    : 'border-amber-300/40 bg-gradient-to-b from-slate-800 to-slate-950 text-white hover:-translate-y-1 hover:border-amber-200'
                }`}
              >
                {number}
              </button>
            ))}
          </div>
        </div>

        {state.revealed && (
          <div className="mt-8 rounded-3xl border border-cyan-300/30 bg-cyan-300/10 p-5 text-center">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-200">Round reveal</p>
            <h2 className="mt-2 text-2xl font-black text-white">
              {state.roundWinner === currentPlayer?.id
                ? 'You were closest 🎯'
                : state.roundWinner
                ? `${room.players.find(p => p.id === state.roundWinner)?.name || 'A player'} scores this round`
                : 'Tie round — no point'}
            </h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {room.players.filter(player => player.id in state.choices).map(player => (
                <div key={player.id} className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm font-bold text-slate-300">
                  {player.name}: <span className="text-white">{state.choices[player.id] ?? '—'}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <aside className="rounded-[2rem] border border-slate-700/80 bg-slate-900/85 p-5 shadow-2xl">
        <h3 className="text-sm font-black uppercase tracking-[0.28em] text-slate-400">Scoreboard</h3>
        <div className="mt-5 space-y-3">
          {leaderboard.map((player, index) => (
            <div key={player.id} className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/75 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-black text-white" style={{ backgroundColor: player.accentColor }}>
                  {index + 1}
                </div>
                <div>
                  <p className="text-sm font-black text-white">{player.name}</p>
                  <p className="text-xs text-slate-500">{state.choices[player.id] === null ? 'Choosing…' : 'Locked in'}</p>
                </div>
              </div>
              <span className="text-xl font-black text-amber-300">{state.scores[player.id] || 0}</span>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
};
