import React, { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { FindMatchRoundState, FindMatchSymbol, Player, GameEvent } from '../../shared/types';
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
  const [localEvent, setLocalEvent] = useState<string | null>(null);

  useEffect(() => {
    const handleEvent = (event: GameEvent) => {
      if (event.type === 'WRONG_CLICK') {
        sounds.playWrong();
        const payload = event.payload as { playerId: string };
        if (payload.playerId === currentPlayer?.id) {
          setLocalEvent('❌ WRONG CLICK! PENALTY: POINT TO OPPONENT');
        } else {
          setLocalEvent('🎉 OPPONENT MISSED! YOU GET A POINT');
        }
      } else if (event.type === 'ROUND_WON') {
        const payload = event.payload as { winner: string };
        if (payload.winner === currentPlayer?.id) {
          sounds.playCorrect();
          setLocalEvent('🎉 YOU FOUND IT! +1 PT');
        } else {
          sounds.playWrong();
          setLocalEvent('⚡ OPPONENT FOUND IT FIRST!');
        }
      }
    };
    
    socket.on('game:event', handleEvent);
    return () => {
      socket.off('game:event', handleEvent);
    };
  }, [socket, currentPlayer]);

  // Clear local event when entering countdown
  useEffect(() => {
    if (state.phase === 'countdown') {
      setLocalEvent(null);
    }
  }, [state.phase]);

  const handleSelect = (symbolId: string) => {
    if (state.phase !== 'playing' || state.winner) return;
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
    <div className="flex flex-col items-center justify-between w-full max-w-4xl min-h-[550px] p-4 glass-card relative overflow-hidden fade-in">
      {/* Header Scorebar */}
      <div className="w-full flex items-center justify-between glass-card-highlight px-6 py-3 mb-6">
        <div className="flex items-center gap-3">
          <div
            className="w-4 h-4 rounded-full player-dot"
            style={{ backgroundColor: currentPlayer?.accentColor || '#22d3ee', color: currentPlayer?.accentColor || '#22d3ee' }}
          />
          <div>
            <div className="font-bold text-sm text-slate-300">{currentPlayer?.name} (You)</div>
            <div className="text-xl font-extrabold text-cyan-400">{myScore} pts</div>
          </div>
        </div>

        <div className="text-center">
          <div className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-1">
            Round {state.round} / {state.totalRounds}
          </div>
          <div className="text-[10px] sm:text-xs text-slate-300 font-medium px-3 py-1 bg-slate-800/50 rounded-full border border-slate-700/50">
            Find the 1 common symbol!
          </div>
        </div>

        <div className="flex items-center gap-3 text-right">
          <div>
            <div className="font-bold text-sm text-slate-300">{opponentPlayer?.name || 'Opponent'}</div>
            <div className="text-xl font-extrabold text-fuchsia-400">{oppScore} pts</div>
          </div>
          <div
            className="w-4 h-4 rounded-full player-dot"
            style={{ backgroundColor: opponentPlayer?.accentColor || '#d946ef', color: opponentPlayer?.accentColor || '#d946ef' }}
          />
        </div>
      </div>

      {/* Countdown overlay */}
      {state.phase === 'countdown' && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center">
          <div className="text-6xl font-black gradient-text countdown-pulse">
            GET READY!
          </div>
          <p className="mt-4 text-slate-300 text-sm font-medium">Symbols are hidden...</p>
        </div>
      )}

      {/* Result notification banner */}
      {state.phase === 'result' && localEvent && (
        <div className="absolute top-24 z-30 bg-slate-900 border border-slate-600 px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 fade-in">
          <span className="text-white font-black text-lg">{localEvent}</span>
        </div>
      )}

      {/* Boards Container */}
      <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center justify-items-center relative">
        {/* My Board */}
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold text-cyan-400 mb-3 uppercase tracking-widest">
            Your Board
          </span>
          <div className="w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] bg-slate-200 rounded-full border-[10px] border-cyan-500/30 game-board-glow relative overflow-hidden flex items-center justify-center">
            {state.phase !== 'countdown' && mySymbols.map((s: FindMatchSymbol, idx: number) => {
              const angle = (idx / mySymbols.length) * 2 * Math.PI;
              const radius = 100;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;

              return (
                <button
                  key={s.id + idx}
                  onClick={() => handleSelect(s.id)}
                  disabled={state.phase !== 'playing'}
                  style={{
                    transform: `translate(${x}px, ${y}px) rotate(${s.rotation}deg) scale(${s.size * 18})`,
                  }}
                  className="absolute p-2 rounded-full hover:bg-black/10 transition-transform cursor-pointer"
                >
                  <SymbolIcon id={s.id} className="w-10 h-10 sm:w-12 sm:h-12 drop-shadow-md" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Opponent Board */}
        <div className="flex flex-col items-center opacity-90">
          <span className="text-xs font-bold text-fuchsia-400 mb-3 uppercase tracking-widest">
            {opponentPlayer?.name || 'Opponent'}'s Board
          </span>
          <div className="w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] bg-slate-300 rounded-full border-[10px] border-fuchsia-500/30 shadow-inner relative overflow-hidden flex items-center justify-center pointer-events-none">
            {state.phase !== 'countdown' && oppSymbols.map((s: FindMatchSymbol, idx: number) => {
              const angle = (idx / oppSymbols.length) * 2 * Math.PI;
              const radius = 100;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;

              return (
                <div
                  key={s.id + idx}
                  style={{
                    transform: `translate(${x}px, ${y}px) rotate(${s.rotation}deg) scale(${s.size * 18})`,
                  }}
                  className="absolute p-2"
                >
                  <SymbolIcon id={s.id} className="w-10 h-10 sm:w-12 sm:h-12 opacity-80 drop-shadow-sm" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
