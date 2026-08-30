import React from 'react';
import { Socket } from 'socket.io-client';
import { Player, RiddleDuelState } from '../../shared/types';
import { HelpCircle, CheckCircle2 } from 'lucide-react';
import { sounds } from '../../lib/sound';

interface RiddleDuelGameProps {
  socket: Socket;
  state: RiddleDuelState;
  currentPlayer: Player | null;
  opponentPlayer: Player | null;
}

export const RiddleDuelGame: React.FC<RiddleDuelGameProps> = ({
  socket,
  state,
  currentPlayer,
  opponentPlayer,
}) => {
  const currentRiddle = state.riddles?.[state.currentRiddleIndex || 0];
  const myAnswer = state.answers?.[currentPlayer?.id || ''];

  const handleSelectOption = (optionIndex: number) => {
    if (myAnswer !== undefined) return;
    sounds.playClick();
    socket.emit('game:action', { type: 'ANSWER_RIDDLE', payload: { optionIndex } });
  };

  if (!currentRiddle) {
    return <div className="text-white text-center">Loading Riddles...</div>;
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md">
      {/* Top Bar */}
      <div className="flex items-center justify-between w-full px-4 py-2 bg-slate-900/90 border border-slate-800 rounded-2xl">
        <span className="text-xs font-black text-amber-400">
          RIDDLE {(state.currentRiddleIndex || 0) + 1} / {state.riddles?.length || 5}
        </span>
        <span className="text-xs font-black uppercase text-slate-400">RIDDLE SHOWDOWN</span>
      </div>

      {/* Question Box */}
      <div className="w-full bg-slate-950 p-6 border-2 border-slate-800 rounded-3xl shadow-2xl flex flex-col items-center text-center gap-4">
        <span className="text-6xl animate-bounce">{currentRiddle.emojiHint}</span>
        <h2 className="text-lg font-black text-white leading-snug">{currentRiddle.question}</h2>

        {/* Options Grid */}
        <div className="grid grid-cols-2 gap-3 w-full mt-2">
          {currentRiddle.options.map((opt: string, idx: number) => (
            <button
              key={idx}
              onClick={() => handleSelectOption(idx)}
              disabled={myAnswer !== undefined}
              className={`p-4 rounded-2xl font-extrabold text-sm border transition active:scale-95 cursor-pointer ${
                myAnswer === idx
                  ? 'bg-purple-600 border-purple-400 text-white shadow-lg'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-200 disabled:opacity-50'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
