import React from 'react';
import { Socket } from 'socket.io-client';
import { TicTacToeState, Player } from '../../shared/types';
import { sounds } from '../../lib/sound';

interface TTTProps {
  socket: Socket;
  state: TicTacToeState;
  currentPlayer: Player | null;
  opponentPlayer: Player | null;
}

export const TicTacToeGame: React.FC<TTTProps> = ({
  socket,
  state,
  currentPlayer,
  opponentPlayer,
}) => {
  const isMyTurn = state.currentTurn === currentPlayer?.id;
  const isHost = currentPlayer?.isHost;

  const handleCellClick = (index: number) => {
    if (!isMyTurn || state.board[index] !== null || state.winner || state.isDraw) return;
    sounds.playClick();
    socket.emit('game:action', {
      type: 'MOVE',
      payload: { cell: index },
    });
  };

  const handleReset = () => {
    socket.emit('game:action', { type: 'RESET' });
  };

  const p1Id = Object.keys(state.scores)[0];
  const mySymbol = currentPlayer?.id === p1Id ? '❌' : '⭕';

  return (
    <div className="flex flex-col items-center justify-between w-full max-w-md p-6 bg-slate-900/80 rounded-2xl border border-slate-800 shadow-2xl">
      <div className="w-full flex items-center justify-between mb-6 bg-slate-950 p-3 rounded-xl border border-slate-800">
        <div>
          <span className="text-xs text-slate-400 font-semibold block">You ({mySymbol})</span>
          <span className="text-lg font-bold text-purple-400">{state.scores[currentPlayer?.id || ''] || 0} pts</span>
        </div>
        <div className="text-center">
          <span className="text-xs uppercase tracking-wider text-slate-500 font-bold block">Round {state.round}</span>
          <span className={`text-xs font-bold ${isMyTurn ? 'text-emerald-400' : 'text-slate-400'}`}>
            {state.winner ? 'Game Over' : isMyTurn ? 'Your Turn!' : "Opponent's Turn"}
          </span>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400 font-semibold block">{opponentPlayer?.name}</span>
          <span className="text-lg font-bold text-pink-400">{state.scores[opponentPlayer?.id || ''] || 0} pts</span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-3 w-64 h-64 mb-6">
        {state.board.map((cell, idx) => {
          const isCellP1 = cell === p1Id;
          const display = cell ? (isCellP1 ? '❌' : '⭕') : null;
          return (
            <button
              key={idx}
              onClick={() => handleCellClick(idx)}
              disabled={!isMyTurn || cell !== null || !!state.winner}
              className={`flex items-center justify-center text-3xl font-black rounded-xl border-2 transition-all ${
                cell === null && isMyTurn
                  ? 'bg-slate-800/80 border-purple-500/50 hover:bg-purple-900/40 cursor-pointer'
                  : cell === null
                  ? 'bg-slate-950 border-slate-800 cursor-not-allowed'
                  : 'bg-slate-800 border-slate-700'
              }`}
            >
              {display}
            </button>
          );
        })}
      </div>

      {/* Status / Reset */}
      {(state.winner || state.isDraw) && (
        <div className="flex flex-col items-center gap-3">
          <div className="text-lg font-bold text-amber-400">
            {state.isDraw
              ? "It's a Draw!"
              : state.winner === currentPlayer?.id
              ? '🎉 You Won This Round!'
              : `💔 ${opponentPlayer?.name} Won!`}
          </div>
          {isHost && (
            <button
              onClick={handleReset}
              className="px-5 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 font-bold rounded-lg text-sm text-white shadow-lg transition active:scale-95"
            >
              Next Round
            </button>
          )}
        </div>
      )}
    </div>
  );
};
