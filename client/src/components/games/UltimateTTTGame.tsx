import React from 'react';
import { Socket } from 'socket.io-client';
import { Player, UltimateTTTState } from '../../shared/types';
import { sounds } from '../../lib/sound';

interface UltimateTTTGameProps {
  socket: Socket;
  state: UltimateTTTState;
  currentPlayer: Player | null;
  opponentPlayer: Player | null;
}

export const UltimateTTTGame: React.FC<UltimateTTTGameProps> = ({
  socket,
  state,
  currentPlayer,
  opponentPlayer,
}) => {
  const playerKeys = Object.keys(state.scores || {});
  const isMyTurn = state.currentTurn === currentPlayer?.id;

  const handleCellClick = (boardIndex: number, cellIndex: number) => {
    if (!isMyTurn) return;
    sounds.playClick();
    socket.emit('game:action', { type: 'MOVE', payload: { boardIndex, cellIndex } });
  };

  const boards = state.boards || (state as any).subBoards || [];
  const activeSubBoard = state.activeSubBoard !== undefined ? state.activeSubBoard : (state as any).activeBoardIndex;

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md">
      <div className="flex items-center justify-between w-full px-4 py-2 bg-slate-900/90 border border-slate-800 rounded-2xl">
        <span className="text-xs font-bold text-purple-400">
          {isMyTurn ? 'YOUR TURN' : `${opponentPlayer?.name || 'Opponent'}'S TURN`}
        </span>
        <span className="text-xs font-black uppercase text-slate-400">ULTIMATE TIC TAC TOE</span>
      </div>

      {/* 3x3 Grid of Sub-Boards */}
      <div className="grid grid-cols-3 gap-3 w-full aspect-square bg-slate-950 p-4 border-2 border-slate-800 rounded-3xl shadow-2xl">
        {boards.map((subBoard, bi) => {
          const mainWinner = state.mainBoard?.[bi];
          const isActive = activeSubBoard === null || activeSubBoard === bi;

          return (
            <div
              key={bi}
              className={`relative grid grid-cols-3 gap-1 p-2 rounded-2xl border-2 transition-all ${
                mainWinner
                  ? 'bg-purple-900/40 border-purple-500'
                  : isActive
                  ? 'bg-slate-900 border-purple-500/80 shadow-lg'
                  : 'bg-slate-900/30 border-slate-800 opacity-60'
              }`}
            >
              {mainWinner ? (
                <div className="absolute inset-0 flex items-center justify-center text-4xl font-black text-purple-400 bg-slate-950/80 rounded-xl z-10">
                  {mainWinner === playerKeys[0] ? '❌' : '⭕'}
                </div>
              ) : (
                subBoard.map((cell, ci) => (
                  <button
                    key={ci}
                    onClick={() => handleCellClick(bi, ci)}
                    disabled={!isMyTurn || !isActive || cell !== null}
                    className="w-full h-full aspect-square bg-slate-950 hover:bg-purple-600/30 border border-slate-800 rounded-lg flex items-center justify-center font-bold text-sm text-slate-200 disabled:opacity-50 cursor-pointer active:scale-95"
                  >
                    {cell === playerKeys[0] ? '❌' : cell === playerKeys[1] ? '⭕' : ''}
                  </button>
                ))
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
