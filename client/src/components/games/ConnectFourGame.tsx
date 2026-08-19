import React from 'react';
import { Socket } from 'socket.io-client';
import { ConnectFourState, Player } from '../../shared/types';
import { sounds } from '../../lib/sound';

interface C4Props {
  socket: Socket;
  state: ConnectFourState;
  currentPlayer: Player | null;
  opponentPlayer: Player | null;
}

export const ConnectFourGame: React.FC<C4Props> = ({
  socket,
  state,
  currentPlayer,
  opponentPlayer,
}) => {
  const isMyTurn = state.currentTurn === currentPlayer?.id;
  const isHost = currentPlayer?.isHost;
  const p1Id = Object.keys(state.scores)[0];

  const handleDrop = (colIndex: number) => {
    if (!isMyTurn || state.winner || state.isDraw) return;
    sounds.playClick();
    socket.emit('game:action', {
      type: 'DROP',
      payload: { col: colIndex },
    });
  };

  const handleReset = () => {
    socket.emit('game:action', { type: 'RESET' });
  };

  const myColorClass = currentPlayer?.id === p1Id ? 'bg-amber-400' : 'bg-rose-500';
  const oppColorClass = currentPlayer?.id === p1Id ? 'bg-rose-500' : 'bg-amber-400';

  return (
    <div className="flex flex-col items-center justify-between w-full max-w-lg p-6 bg-slate-900/80 rounded-2xl border border-slate-800 shadow-2xl">
      <div className="w-full flex items-center justify-between mb-4 bg-slate-950 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2">
          <div className={`w-4 h-4 rounded-full ${myColorClass}`} />
          <span className="text-sm font-bold">{currentPlayer?.name}</span>
        </div>
        <div className="text-center">
          <span className={`text-xs font-bold ${isMyTurn ? 'text-emerald-400' : 'text-slate-400'}`}>
            {state.winner ? 'Game Over' : isMyTurn ? 'Your Turn' : "Opponent's Turn"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold">{opponentPlayer?.name}</span>
          <div className={`w-4 h-4 rounded-full ${oppColorClass}`} />
        </div>
      </div>

      {/* Connect Four Grid */}
      <div className="bg-blue-600 p-3 rounded-2xl border-4 border-blue-700 shadow-inner flex flex-col gap-2">
        {state.board.map((row, rIdx) => (
          <div key={rIdx} className="flex gap-2">
            {row.map((cell, cIdx) => {
              const isWinning = state.winningCells.some(([r, c]) => r === rIdx && c === cIdx);
              const cellColor =
                cell === null
                  ? 'bg-slate-950'
                  : cell === p1Id
                  ? 'bg-amber-400'
                  : 'bg-rose-500';

              return (
                <button
                  key={cIdx}
                  onClick={() => handleDrop(cIdx)}
                  disabled={!isMyTurn || !!state.winner}
                  className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full border-2 border-blue-800 transition-all ${cellColor} ${
                    isWinning ? 'ring-4 ring-yellow-300 animate-pulse' : ''
                  } ${isMyTurn && cell === null ? 'hover:brightness-125 cursor-pointer' : ''}`}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Reset */}
      {(state.winner || state.isDraw) && (
        <div className="mt-4 flex flex-col items-center gap-2">
          <span className="font-extrabold text-amber-400 text-lg">
            {state.isDraw
              ? 'Draw Game!'
              : state.winner === currentPlayer?.id
              ? '🎉 You Connected Four!'
              : `💔 ${opponentPlayer?.name} Won!`}
          </span>
          {isHost && (
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 font-bold rounded-lg text-white text-xs transition"
            >
              Play Again
            </button>
          )}
        </div>
      )}
    </div>
  );
};
