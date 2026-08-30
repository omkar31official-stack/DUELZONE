import React, { useState } from 'react';
import { Socket } from 'socket.io-client';
import { Player, CodeBreakerState } from '../../shared/types';
import { ShieldCheck, Send } from 'lucide-react';
import { sounds } from '../../lib/sound';

interface CodeBreakerGameProps {
  socket: Socket;
  state: CodeBreakerState;
  currentPlayer: Player | null;
  opponentPlayer: Player | null;
}

const COLOR_PALETTE = ['🔴', '🔵', '🟢', '🟡', '🟣', '🟠'];

export const CodeBreakerGame: React.FC<CodeBreakerGameProps> = ({
  socket,
  state,
  currentPlayer,
  opponentPlayer,
}) => {
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const isMyTurn = state.currentTurn === currentPlayer?.id;
  const myGuesses = state.guesses?.[currentPlayer?.id || ''] || [];

  const handleAddColor = (color: string) => {
    if (selectedColors.length < 4) {
      setSelectedColors((prev) => [...prev, color]);
    }
  };

  const handleClear = () => {
    setSelectedColors([]);
  };

  const handleSubmit = () => {
    if (selectedColors.length !== 4 || !isMyTurn) return;
    sounds.playClick();
    socket.emit('game:action', { type: 'SUBMIT_GUESS', payload: { colors: selectedColors } });
    setSelectedColors([]);
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md">
      {/* Header */}
      <div className="flex items-center justify-between w-full px-4 py-2 bg-slate-900/90 border border-slate-800 rounded-2xl">
        <span className="text-xs font-bold text-cyan-400">
          {isMyTurn ? 'YOUR TURN TO GUESS' : `${opponentPlayer?.name || 'Opponent'}'S TURN`}
        </span>
        <span className="text-xs font-black uppercase text-slate-400">CODE BREAKER</span>
      </div>

      {/* Main Board */}
      <div className="w-full bg-slate-950 p-4 border-2 border-slate-800 rounded-3xl shadow-2xl flex flex-col gap-4">
        {/* Past Guesses */}
        <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
          {myGuesses.map((g, idx) => (
            <div key={idx} className="flex items-center justify-between bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                {g.colors.map((c: string, i: number) => (
                  <span key={i} className="text-2xl">{c}</span>
                ))}
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <span>⚫ {g.blackPegs}</span>
                <span>⚪ {g.whitePegs}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Current Selected Guess Row */}
        <div className="flex items-center justify-center gap-3 p-3 bg-slate-900/60 rounded-2xl border border-dashed border-slate-700 min-h-[56px]">
          {selectedColors.map((c, i) => (
            <span key={i} className="text-3xl animate-bounce">{c}</span>
          ))}
          {Array.from({ length: 4 - selectedColors.length }).map((_, i) => (
            <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-700 bg-slate-950" />
          ))}
        </div>

        {/* Palette Buttons */}
        <div className="flex items-center justify-center gap-2">
          {COLOR_PALETTE.map((color, idx) => (
            <button
              key={idx}
              onClick={() => handleAddColor(color)}
              className="p-2 text-2xl hover:scale-125 transition active:scale-95 cursor-pointer rounded-xl bg-slate-900 border border-slate-800"
            >
              {color}
            </button>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleClear}
            className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
          >
            CLEAR
          </button>
          <button
            onClick={handleSubmit}
            disabled={selectedColors.length !== 4 || !isMyTurn}
            className="flex-2 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs rounded-xl shadow-lg disabled:opacity-40 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Send className="w-4 h-4" /> SUBMIT CODE
          </button>
        </div>
      </div>
    </div>
  );
};
