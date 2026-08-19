import React from 'react';
import { Socket } from 'socket.io-client';
import { FindMatchRoundState, Player } from '../shared/types';
import { SymbolIcon } from '../SymbolIcon';
import { sounds } from '../../lib/sound';

interface FindMatchProps {
  socket: Socket;
  state: FindMatchRoundState;
  currentPlayer: Player | null;
  opponentPlayer: Player | null;
}

export const FindMatchGame: React.FC<FindMatchProps> = ({
  socket,
  state,
  currentPlayer,
  opponentPlayer,
}) => {
  const handleSelect = (symbolId: string) => {
    if (state.phase !== 'playing' || state.winner) return;
    sounds.playClick();
    socket.emit('game:action', {
      type: 'SELECT_SYMBOL',
      payload: { symbolId },
    });
  };

  const isPlayer1 = currentPlayer?.isHost;
  const mySymbols = isPlayer1 ? state.player1Symbols : state.player2Symbols;
  const oppSymbols = isPlayer1 ? state.player2Symbols : state.player1Symbols;

  const myScore = currentPlayer ? state.scores[currentPlayer.id] || 0 : 0;
  const oppScore = opponentPlayer ? state.scores[opponentPlayer.id] || 0 : 0;

  return (
    <div className="flex flex-col items-center justify-between w-full max-w-4xl min-h-[550px] p-4 bg-slate-900/60 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden">
      {/* Header Scorebar */}
      <div className="w-full flex items-center justify-between bg-slate-950/80 px-6 py-3 rounded-xl border border-slate-800 mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: currentPlayer?.accentColor || '#8b5cf6' }}
          />
          <div>
            <div className="font-bold text-sm">{currentPlayer?.name} (You)</div>
            <div className="text-xl font-extrabold text-purple-400">{myScore} pts</div>
          </div>
        </div>

        <div className="text-center">
          <div className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
            Round {state.round} / {state.totalRounds}
          </div>
          <div className="text-xs text-slate-500 font-medium">Find the 1 common symbol!</div>
        </div>

        <div className="flex items-center gap-3 text-right">
          <div>
            <div className="font-bold text-sm">{opponentPlayer?.name || 'Opponent'}</div>
            <div className="text-xl font-extrabold text-pink-400">{oppScore} pts</div>
          </div>
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: opponentPlayer?.accentColor || '#ec4899' }}
          />
        </div>
      </div>

      {/* Countdown overlay */}
      {state.phase === 'countdown' && (
        <div className="absolute inset-0 bg-slate-950/90 z-20 flex flex-col items-center justify-center">
          <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 animate-bounce">
            GET READY!
          </div>
          <p className="mt-4 text-slate-400 text-sm font-medium">Spot the matching icon first!</p>
        </div>
      )}

      {/* Result notification banner */}
      {state.phase === 'result' && (
        <div className="absolute top-20 z-20 bg-slate-950/90 border border-slate-700 px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-pulse">
          {state.winner === currentPlayer?.id ? (
            <span className="text-emerald-400 font-black text-lg">🎉 YOU FOUND IT! +1 PT</span>
          ) : (
            <span className="text-rose-400 font-black text-lg">⚡ OPPONENT FOUND IT!</span>
          )}
        </div>
      )}

      {/* Boards Container */}
      <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-6 items-center justify-items-center relative">
        {/* My Board */}
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold text-purple-400 mb-2 uppercase tracking-wider">
            Your Board
          </span>
          <div className="w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] bg-slate-100 rounded-full border-8 border-purple-500/40 shadow-inner relative overflow-hidden flex items-center justify-center">
            {mySymbols.map((s, idx) => {
              const angle = (idx / mySymbols.length) * 2 * Math.PI;
              const radius = 95;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;

              return (
                <button
                  key={s.id + idx}
                  onClick={() => handleSelect(s.id)}
                  disabled={state.phase !== 'playing'}
                  style={{
                    transform: `translate(${x}px, ${y}px) rotate(${s.rotation}deg)`,
                  }}
                  className="absolute p-2 rounded-full hover:bg-purple-200/50 active:scale-125 transition-transform cursor-pointer"
                >
                  <SymbolIcon id={s.id} className="w-10 h-10 sm:w-12 sm:h-12 drop-shadow-md" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Opponent Board */}
        <div className="flex flex-col items-center opacity-75">
          <span className="text-xs font-bold text-pink-400 mb-2 uppercase tracking-wider">
            {opponentPlayer?.name || 'Opponent'}'s Board
          </span>
          <div className="w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] bg-slate-200 rounded-full border-8 border-pink-500/30 shadow-inner relative overflow-hidden flex items-center justify-center pointer-events-none">
            {oppSymbols.map((s, idx) => {
              const angle = (idx / oppSymbols.length) * 2 * Math.PI;
              const radius = 95;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;

              return (
                <div
                  key={s.id + idx}
                  style={{
                    transform: `translate(${x}px, ${y}px) rotate(${s.rotation}deg)`,
                  }}
                  className="absolute p-2"
                >
                  <SymbolIcon id={s.id} className="w-10 h-10 sm:w-12 sm:h-12 opacity-80" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
