import React from 'react';
import { Socket } from 'socket.io-client';
import { Player, LudoState } from '../../shared/types';
import { Dices, Trophy, Star } from 'lucide-react';
import { sounds } from '../../lib/sound';

interface LudoGameProps {
  socket: Socket;
  state: LudoState;
  currentPlayer: Player | null;
  opponentPlayer: Player | null;
}

export const LudoGame: React.FC<LudoGameProps> = ({
  socket,
  state,
  currentPlayer,
  opponentPlayer,
}) => {
  const playerKeys = Object.keys(state.tokens || {});
  const isMyTurn = state.currentTurn === currentPlayer?.id;
  const myTokens = state.tokens?.[currentPlayer?.id || ''] || [];

  const handleRollDice = () => {
    if (!isMyTurn || state.hasRolled) return;
    sounds.playClick();
    socket.emit('game:action', { type: 'ROLL_DICE' });
  };

  const handleSelectToken = (tokenId: number) => {
    if (!isMyTurn || !state.hasRolled) return;
    sounds.playClick();
    socket.emit('game:action', { type: 'MOVE_TOKEN', payload: { tokenId } });
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md">
      {/* Top Turn & Dice Status Bar */}
      <div className="flex items-center justify-between w-full px-4 py-2 bg-slate-900/90 border border-slate-800 rounded-2xl">
        <span className="text-xs font-bold text-cyan-400">
          {isMyTurn ? '🎲 YOUR TURN TO ROLL/MOVE' : `${opponentPlayer?.name || 'Opponent'}'S TURN`}
        </span>
        <span className="text-xs font-black uppercase text-slate-400">LUDO DUEL</span>
      </div>

      {/* Ludo Board View */}
      <div className="relative w-full aspect-square bg-slate-950 p-4 border-4 border-slate-800 rounded-3xl shadow-2xl flex flex-col items-center justify-between overflow-hidden">
        {/* Main Board Track Grid Representation */}
        <div className="grid grid-cols-[1fr_auto_1fr] grid-rows-[1fr_auto_1fr] gap-2 w-full h-full">
          {/* Base Top Left (Cyan) */}
          <div className="bg-cyan-950/60 border-2 border-cyan-800 rounded-2xl p-2 flex items-center justify-center gap-2">
            <span className="text-3xl">🔵</span>
          </div>

          {/* Center Path */}
          <div className="flex flex-col items-center justify-center p-2 text-slate-500 font-bold text-xs">
            <span>TRACK</span>
          </div>

          {/* Base Top Right (Rose) */}
          <div className="bg-rose-950/60 border-2 border-rose-800 rounded-2xl p-2 flex items-center justify-center gap-2">
            <span className="text-3xl">🔴</span>
          </div>
        </div>

        {/* Center Dice Roll Area */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="pointer-events-auto bg-slate-900/95 backdrop-blur-md p-4 rounded-3xl border-2 border-cyan-500/60 shadow-2xl flex flex-col items-center gap-3">
            <div className="text-5xl animate-bounce">
              {state.diceValue ? `🎲 ${state.diceValue}` : '🎲'}
            </div>

            <button
              onClick={handleRollDice}
              disabled={!isMyTurn || state.hasRolled}
              className="px-6 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black rounded-xl shadow-lg transition active:scale-95 disabled:opacity-40 cursor-pointer flex items-center gap-2"
            >
              <Dices className="w-5 h-5" /> ROLL DICE
            </button>
          </div>
        </div>
      </div>

      {/* Player Token Selector Controls */}
      <div className="flex items-center justify-around w-full bg-slate-900 p-4 border border-slate-800 rounded-2xl">
        <span className="text-xs font-bold text-slate-300">SELECT TOKEN:</span>
        {myTokens.map((t) => (
          <button
            key={t.id}
            onClick={() => handleSelectToken(t.id)}
            disabled={!isMyTurn || !state.hasRolled || t.isFinished}
            className={`px-4 py-2 rounded-xl font-black text-xs transition border cursor-pointer ${
              t.isFinished
                ? 'bg-emerald-950 text-emerald-400 border-emerald-800 opacity-60'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white border-cyan-400 active:scale-95 disabled:opacity-30'
            }`}
          >
            Token #{t.id + 1} {t.pos === -1 ? '(Base)' : t.isFinished ? '(Home)' : `(Pos ${t.pos})`}
          </button>
        ))}
      </div>
    </div>
  );
};
