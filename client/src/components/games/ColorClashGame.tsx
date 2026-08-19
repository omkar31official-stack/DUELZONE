import React from 'react';
import { Socket } from 'socket.io-client';
import { ColorClashState, Player } from '../../shared/types';
import { sounds } from '../../lib/sound';

const COLOR_CLASH_COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];

interface CCProps {
  socket: Socket;
  state: ColorClashState;
  currentPlayer: Player | null;
  opponentPlayer: Player | null;
}

export const ColorClashGame: React.FC<CCProps> = ({
  socket,
  state,
  currentPlayer,
  opponentPlayer,
}) => {
  const myChoice = currentPlayer ? state.choices[currentPlayer.id] : null;

  const handleChooseColor = (color: string) => {
    if (myChoice || state.phase !== 'playing') return;
    sounds.playClick();
    socket.emit('game:action', {
      type: 'CHOOSE_COLOR',
      payload: { color },
    });
  };

  const myScore = currentPlayer ? state.scores[currentPlayer.id] || 0 : 0;
  const oppScore = opponentPlayer ? state.scores[opponentPlayer.id] || 0 : 0;

  return (
    <div className="flex flex-col items-center justify-between w-full max-w-lg min-h-[450px] p-6 bg-slate-900/80 rounded-2xl border border-slate-800 shadow-2xl">
      <div className="w-full flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
        <div>
          <span className="text-xs text-slate-400 font-semibold block">{currentPlayer?.name}</span>
          <span className="text-lg font-bold text-purple-400">{myScore} pts</span>
        </div>
        <div className="text-center">
          <span className="text-xs uppercase tracking-wider text-slate-500 font-bold block">
            Round {state.round} / {state.totalRounds}
          </span>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400 font-semibold block">{opponentPlayer?.name}</span>
          <span className="text-lg font-bold text-pink-400">{oppScore} pts</span>
        </div>
      </div>

      <div className="flex flex-col items-center my-6">
        <span className="text-xs font-extrabold text-amber-400 uppercase tracking-widest mb-2">
          PICK THE INK COLOR! (IGNORE THE WORD)
        </span>
        <div
          className="text-6xl font-black px-8 py-4 bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl uppercase"
          style={{ color: state.inkColor }}
        >
          {state.word}
        </div>
      </div>

      {state.phase === 'playing' && (
        <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
          {COLOR_CLASH_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => handleChooseColor(color)}
              disabled={myChoice !== null}
              className="py-3 rounded-xl font-bold uppercase text-xs border border-slate-700 transition active:scale-95 cursor-pointer shadow"
              style={{ backgroundColor: color, color: '#ffffff' }}
            >
              {color}
            </button>
          ))}
        </div>
      )}

      {state.phase === 'result' && (
        <div className="text-center font-bold text-lg text-amber-400">
          {state.roundWinner === currentPlayer?.id
            ? '🎉 YOU WERE RIGHT!'
            : state.roundWinner === opponentPlayer?.id
            ? `💔 ${opponentPlayer?.name} GOT IT!`
            : 'NO POINT AWARDED!'}
        </div>
      )}
    </div>
  );
};
