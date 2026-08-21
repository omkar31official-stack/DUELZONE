import React, { useState } from 'react';
import { Socket } from 'socket.io-client';
import { PicComboState, Player, RoomSnapshot } from '../../shared/types';
import { sounds } from '../../lib/sound';
import { Send } from 'lucide-react';

interface PicComboProps {
  socket: Socket;
  state: PicComboState;
  currentPlayer: Player | null;
  room: RoomSnapshot;
}

export const PicComboGame: React.FC<PicComboProps> = ({
  socket,
  state,
  currentPlayer,
  room,
}) => {
  const [inputVal, setInputVal] = useState('');
  const isMe = (id: string) => id === currentPlayer?.id;
  const myGuess = currentPlayer ? state.guesses[currentPlayer.id] : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (state.phase !== 'playing' || myGuess !== null || !inputVal.trim()) return;
    sounds.playClick();
    socket.emit('game:action', {
      type: 'GUESS',
      payload: { guess: inputVal.trim() },
    });
    setInputVal('');
  };

  const currentQ = state.currentQuestion;

  return (
    <div className="w-full max-w-4xl flex flex-col items-center gap-6 p-4">
      {/* Header Bar */}
      <div className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-slate-400 font-extrabold">ROUND {state.round} / {state.totalRounds}</span>
          <h2 className="text-2xl font-black text-amber-300">🖼️ PIC COMBO (2 PICS 1 WORD)</h2>
        </div>

        {/* Player scores */}
        <div className="flex flex-wrap gap-2">
          {room.players.map(p => (
            <div key={p.id} className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${isMe(p.id) ? 'bg-amber-950 border-amber-400 text-amber-200' : 'bg-slate-950 border-slate-800 text-slate-300'}`}>
              <span>{p.name}</span>
              <span className="bg-slate-800 px-2 py-0.5 rounded-md text-amber-300 font-black">{state.scores[p.id] || 0} pts</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main 2-Pic Combo Card */}
      <div className="w-full bg-slate-950/90 border border-amber-500/20 rounded-[2.5rem] p-8 sm:p-12 text-center shadow-[0_0_80px_rgba(245,158,11,0.1)] flex flex-col items-center justify-center gap-8">
        <span className="text-xs font-extrabold tracking-widest uppercase text-amber-400 bg-amber-950/80 border border-amber-800 px-4 py-1.5 rounded-full">
          COMBINE THE 2 IMAGES TO GUESS THE WORD
        </span>

        {/* 2 Images Display */}
        <div className="flex items-center justify-center gap-4 sm:gap-8">
          <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-slate-900 border-2 border-amber-400/40 flex items-center justify-center text-6xl sm:text-7xl shadow-2xl hover:scale-105 transition transform">
            {currentQ.img1}
          </div>
          <span className="text-4xl font-black text-amber-400">+</span>
          <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-slate-900 border-2 border-amber-400/40 flex items-center justify-center text-6xl sm:text-7xl shadow-2xl hover:scale-105 transition transform">
            {currentQ.img2}
          </div>
        </div>

        {/* Category Hint Removed */}
        <div className="text-xs font-bold text-slate-400 bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800">
          ({currentQ.answer.length} letters)
        </div>

        {/* Round result banner */}
        {state.phase === 'result' && (
          <div className="animate-bounce text-lg font-black text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-6 py-3 rounded-2xl shadow-lg">
            {state.roundWinner
              ? `🎉 ${room.players.find(p => p.id === state.roundWinner)?.name} guessed correctly: "${currentQ.answer}"!`
              : `⏳ Round over! The answer was "${currentQ.answer}".`}
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-lg flex gap-3">
        <input
          type="text"
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          disabled={state.phase !== 'playing' || myGuess !== null}
          placeholder={myGuess ? `Your guess: "${myGuess}"` : "Type the combined word..."}
          className="flex-1 bg-slate-950 border-2 border-slate-700 focus:border-amber-400 rounded-2xl px-5 py-4 text-white font-mono uppercase tracking-widest text-lg font-black focus:outline-none focus:ring-4 focus:ring-amber-400/20 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={state.phase !== 'playing' || myGuess !== null || !inputVal.trim()}
          className="px-6 py-4 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black rounded-2xl shadow-lg hover:brightness-110 active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
        >
          SUBMIT <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
