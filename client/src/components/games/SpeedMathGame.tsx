import React from 'react';
import { Socket } from 'socket.io-client';
import { Player, RoomSnapshot, SpeedMathState } from '../../shared/types';
import { sounds } from '../../lib/sound';

interface SpeedMathProps {
  socket: Socket;
  state: SpeedMathState;
  currentPlayer: Player | null;
  room: RoomSnapshot;
}

export const SpeedMathGame: React.FC<SpeedMathProps> = ({
  socket,
  state,
  currentPlayer,
  room,
}) => {
  const isMe = (id: string) => id === currentPlayer?.id;
  const myAnswer = currentPlayer ? state.answers[currentPlayer.id] : null;

  const handleAnswer = (val: number) => {
    if (state.phase !== 'playing' || myAnswer !== null) return;
    sounds.playClick();
    socket.emit('game:action', {
      type: 'ANSWER',
      payload: { chosenVal: val },
    });
  };

  return (
    <div className="w-full max-w-4xl flex flex-col items-center gap-6 p-4">
      {/* Round & Leaderboard Header */}
      <div className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-slate-400 font-extrabold">ROUND {state.round} / {state.totalRounds}</span>
          <h2 className="text-2xl font-black text-amber-300">⚡ SPEED MATH</h2>
        </div>

        {/* Players Score Chips */}
        <div className="flex flex-wrap gap-2">
          {room.players.map(p => (
            <div key={p.id} className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${isMe(p.id) ? 'bg-cyan-950 border-cyan-400 text-cyan-200' : 'bg-slate-950 border-slate-800 text-slate-300'}`}>
              <span>{p.name}</span>
              <span className="bg-slate-800 px-2 py-0.5 rounded-md text-amber-300 font-black">{state.scores[p.id] || 0} pts</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Problem Display Card */}
      <div className="w-full bg-slate-950/80 border border-cyan-500/20 rounded-[2.5rem] p-8 sm:p-12 text-center shadow-[0_0_80px_rgba(34,211,238,0.1)] flex flex-col items-center justify-center gap-6">
        <span className="text-xs font-extrabold tracking-widest uppercase text-cyan-400 bg-cyan-950/80 border border-cyan-800 px-4 py-1 rounded-full">
          SOLVE THE EQUATION
        </span>

        <div className="text-5xl sm:text-7xl font-black tracking-wider text-white font-mono drop-shadow-[0_0_25px_rgba(255,255,255,0.3)]">
          {state.currentProblem.equation}
        </div>

        {state.phase === 'result' && (
          <div className="animate-bounce mt-2 text-lg font-black text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-6 py-2 rounded-2xl shadow-lg">
            {state.roundWinner ? `🎉 ${room.players.find(p => p.id === state.roundWinner)?.name} solved it first!` : '⏳ Time out! No one got it.'}
          </div>
        )}
      </div>

      {/* Multiple Choice Options Grid */}
      <div className="w-full grid grid-cols-2 gap-4">
        {state.currentProblem.options.map((opt, idx) => {
          const isCorrect = opt === state.currentProblem.correctAnswer;
          const isMyChoice = myAnswer === opt;

          let btnStyle = 'bg-slate-900 border-slate-800 text-white hover:border-cyan-400 hover:bg-slate-800 cursor-pointer';
          if (state.phase === 'result') {
            if (isCorrect) btnStyle = 'bg-emerald-600 border-emerald-400 text-white shadow-[0_0_30px_rgba(16,185,129,0.5)]';
            else if (isMyChoice) btnStyle = 'bg-rose-900 border-rose-600 text-rose-200 opacity-60';
            else btnStyle = 'bg-slate-950 border-slate-900 text-slate-600 opacity-40';
          } else if (myAnswer !== null) {
            if (isMyChoice) btnStyle = 'bg-cyan-900 border-cyan-400 text-cyan-200 ring-2 ring-cyan-400';
            else btnStyle = 'bg-slate-950 border-slate-900 text-slate-600 opacity-40 cursor-not-allowed';
          }

          return (
            <button
              key={idx}
              onClick={() => handleAnswer(opt)}
              disabled={state.phase !== 'playing' || myAnswer !== null}
              className={`p-6 sm:p-8 rounded-3xl border-2 text-3xl sm:text-4xl font-black transition-all active:scale-95 flex items-center justify-center font-mono ${btnStyle}`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
};
