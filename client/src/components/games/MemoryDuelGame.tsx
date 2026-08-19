import React from 'react';
import { Socket } from 'socket.io-client';
import { MemoryDuelState, Player } from '../../shared/types';
import { sounds } from '../../lib/sound';

interface MemoryProps {
  socket: Socket;
  state: MemoryDuelState;
  currentPlayer: Player | null;
  opponentPlayer: Player | null;
}

export const MemoryDuelGame: React.FC<MemoryProps> = ({
  socket,
  state,
  currentPlayer,
  opponentPlayer,
}) => {
  const isMyTurn = state.currentTurn === currentPlayer?.id;

  const handleFlip = (cardId: number) => {
    if (!isMyTurn || state.isDone) return;
    sounds.playClick();
    socket.emit('game:action', {
      type: 'FLIP',
      payload: { cardId },
    });
  };

  const myScore = currentPlayer ? state.scores[currentPlayer.id] || 0 : 0;
  const oppScore = opponentPlayer ? state.scores[opponentPlayer.id] || 0 : 0;

  return (
    <div className="flex flex-col items-center justify-between w-full max-w-lg p-6 bg-slate-900/80 rounded-2xl border border-slate-800 shadow-2xl">
      <div className="w-full flex items-center justify-between mb-4 bg-slate-950 p-3 rounded-xl border border-slate-800">
        <div>
          <span className="text-xs text-slate-400 font-semibold block">{currentPlayer?.name}</span>
          <span className="text-lg font-bold text-purple-400">{myScore} pairs</span>
        </div>
        <div className="text-center">
          <span className={`text-xs font-bold ${isMyTurn ? 'text-emerald-400' : 'text-slate-400'}`}>
            {state.isDone ? 'Game Over' : isMyTurn ? 'Your Turn' : "Opponent's Turn"}
          </span>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400 font-semibold block">{opponentPlayer?.name}</span>
          <span className="text-lg font-bold text-pink-400">{oppScore} pairs</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 my-4">
        {state.cards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleFlip(card.id)}
            disabled={!isMyTurn || card.flipped || card.matched}
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl text-3xl font-bold border-2 transition-all flex items-center justify-center ${
              card.matched
                ? 'bg-slate-950 border-slate-800 opacity-40 cursor-default'
                : card.flipped
                ? 'bg-purple-900/80 border-purple-400 text-white'
                : isMyTurn
                ? 'bg-slate-800 hover:bg-slate-700 border-slate-600 cursor-pointer'
                : 'bg-slate-950 border-slate-800 cursor-not-allowed'
            }`}
          >
            {card.flipped || card.matched ? card.symbol : '❓'}
          </button>
        ))}
      </div>

      {state.isDone && (
        <div className="text-center font-black text-xl text-amber-400 mt-2">
          {state.winner === currentPlayer?.id
            ? '🎉 YOU MATCHED THEM ALL!'
            : state.winner === opponentPlayer?.id
            ? `💔 ${opponentPlayer?.name} WON!`
            : "IT'S A DRAW!"}
        </div>
      )}
    </div>
  );
};
