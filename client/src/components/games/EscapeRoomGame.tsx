import React, { useState } from 'react';
import { Socket } from 'socket.io-client';
import { Player, EscapeRoomState } from '../../shared/types';
import { Keypad, ShieldAlert, Terminal, Lock } from 'lucide-react';
import { sounds } from '../../lib/sound';

interface EscapeRoomGameProps {
  socket: Socket;
  state: EscapeRoomState;
  currentPlayer: Player | null;
  opponentPlayer: Player | null;
}

export const EscapeRoomGame: React.FC<EscapeRoomGameProps> = ({
  socket,
  state,
  currentPlayer,
  opponentPlayer,
}) => {
  const [codeInput, setCodeInput] = useState('');
  const myStage = state.unlockedStages?.[currentPlayer?.id || ''] || 1;

  const handleSubmitCode = () => {
    if (!codeInput) return;
    sounds.playClick();
    socket.emit('game:action', { type: 'SUBMIT_CODE', payload: { code: codeInput } });
    setCodeInput('');
  };

  const handleCutWire = (color: string) => {
    sounds.playClick();
    socket.emit('game:action', { type: 'CUT_WIRE', payload: { color } });
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md">
      {/* Top Header */}
      <div className="flex items-center justify-between w-full px-4 py-2 bg-slate-900/90 border border-slate-800 rounded-2xl">
        <span className="text-xs font-black text-purple-400">STAGE {myStage} / {state.maxStages}</span>
        <span className="text-xs font-black uppercase text-slate-400">ESCAPE ROOM DUEL</span>
      </div>

      {/* Terminal Screen */}
      <div className="relative w-full aspect-[4/3] bg-slate-950 p-4 border-2 border-slate-800 rounded-3xl shadow-2xl flex flex-col justify-between overflow-hidden">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-xs font-mono text-emerald-400">
          <Terminal className="w-4 h-4" /> CYBER_TERMINAL_V2.0
        </div>

        {/* Terminal Log Output */}
        <div className="flex-grow my-2 font-mono text-xs text-slate-300 overflow-y-auto space-y-1">
          {state.terminalOutput?.map((line, idx) => (
            <p key={idx} className="text-emerald-400/90">
              &gt; {line}
            </p>
          ))}
          {state.clues?.map((clue, idx) => (
            <p key={idx} className="text-amber-400 font-bold">
              💡 {clue}
            </p>
          ))}
        </div>

        {/* Action Controls for Current Stage */}
        {myStage === 1 && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
            <input
              type="text"
              maxLength={6}
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              placeholder="Enter 4-digit code..."
              className="flex-grow px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
            <button
              onClick={handleSubmitCode}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl text-xs active:scale-95 cursor-pointer"
            >
              UNLOCK
            </button>
          </div>
        )}

        {myStage === 2 && (
          <div className="flex items-center justify-around gap-2 pt-2 border-t border-slate-800">
            <button
              onClick={() => handleCutWire('RED')}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs active:scale-95 cursor-pointer"
            >
              ✂️ CUT RED
            </button>
            <button
              onClick={() => handleCutWire('BLUE')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs active:scale-95 cursor-pointer"
            >
              ✂️ CUT BLUE
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
