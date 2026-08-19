import React from 'react';
import { Socket } from 'socket.io-client';
import { DotsAndBoxesState, Player } from '../../shared/types';
import { sounds } from '../../lib/sound';

interface DABProps {
  socket: Socket;
  state: DotsAndBoxesState;
  currentPlayer: Player | null;
  opponentPlayer: Player | null;
}

export const DotsAndBoxesGame: React.FC<DABProps> = ({
  socket,
  state,
  currentPlayer,
  opponentPlayer,
}) => {
  const isMyTurn = state.currentTurn === currentPlayer?.id;
  const p1Id = Object.keys(state.scores)[0];

  const handleDrawH = (r: number, c: number) => {
    if (!isMyTurn || state.winner || state.horizontalEdges[r][c] !== null) return;
    sounds.playClick();
    socket.emit('game:action', {
      type: 'DRAW_EDGE',
      payload: { type: 'h', row: r, col: c },
    });
  };

  const handleDrawV = (r: number, c: number) => {
    if (!isMyTurn || state.winner || state.verticalEdges[r][c] !== null) return;
    sounds.playClick();
    socket.emit('game:action', {
      type: 'DRAW_EDGE',
      payload: { type: 'v', row: r, col: c },
    });
  };

  const myScore = currentPlayer ? state.scores[currentPlayer.id] || 0 : 0;
  const oppScore = opponentPlayer ? state.scores[opponentPlayer.id] || 0 : 0;

  return (
    <div className="flex flex-col items-center justify-between w-full max-w-md p-6 bg-slate-900/80 rounded-2xl border border-slate-800 shadow-2xl">
      <div className="w-full flex items-center justify-between mb-4 bg-slate-950 p-3 rounded-xl border border-slate-800">
        <div>
          <span className="text-xs text-slate-400 font-semibold block">{currentPlayer?.name}</span>
          <span className="text-lg font-bold text-purple-400">{myScore} boxes</span>
        </div>
        <div className="text-center">
          <span className={`text-xs font-bold ${isMyTurn ? 'text-emerald-400' : 'text-slate-400'}`}>
            {state.isDone ? 'Game Over' : isMyTurn ? 'Your Turn' : "Opponent's Turn"}
          </span>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400 font-semibold block">{opponentPlayer?.name}</span>
          <span className="text-lg font-bold text-pink-400">{oppScore} boxes</span>
        </div>
      </div>

      <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col gap-2 my-2">
        {Array.from({ length: state.gridSize }).map((_, r) => (
          <React.Fragment key={r}>
            {/* Horizontal Line Row */}
            <div className="flex items-center gap-2">
              {Array.from({ length: state.gridSize }).map((_, c) => (
                <React.Fragment key={c}>
                  <div className="w-4 h-4 rounded-full bg-slate-400 shadow" />
                  <button
                    onClick={() => handleDrawH(r, c)}
                    disabled={!isMyTurn || state.horizontalEdges[r][c] !== null}
                    className={`h-3 w-12 rounded transition-all ${
                      state.horizontalEdges[r][c] === p1Id
                        ? 'bg-purple-500'
                        : state.horizontalEdges[r][c] !== null
                        ? 'bg-pink-500'
                        : isMyTurn
                        ? 'bg-slate-800 hover:bg-slate-700 cursor-pointer'
                        : 'bg-slate-900 cursor-not-allowed'
                    }`}
                  />
                </React.Fragment>
              ))}
              <div className="w-4 h-4 rounded-full bg-slate-400 shadow" />
            </div>

            {/* Vertical Line Row + Boxes */}
            <div className="flex items-center gap-2">
              {Array.from({ length: state.gridSize }).map((_, c) => (
                <React.Fragment key={c}>
                  <button
                    onClick={() => handleDrawV(r, c)}
                    disabled={!isMyTurn || state.verticalEdges[r][c] !== null}
                    className={`w-3 h-12 rounded transition-all ${
                      state.verticalEdges[r][c] === p1Id
                        ? 'bg-purple-500'
                        : state.verticalEdges[r][c] !== null
                        ? 'bg-pink-500'
                        : isMyTurn
                        ? 'bg-slate-800 hover:bg-slate-700 cursor-pointer'
                        : 'bg-slate-900 cursor-not-allowed'
                    }`}
                  />
                  <div
                    className={`w-12 h-12 rounded flex items-center justify-center font-bold text-sm ${
                      state.boxes[r][c] === p1Id
                        ? 'bg-purple-900/50 text-purple-300'
                        : state.boxes[r][c] !== null
                        ? 'bg-pink-900/50 text-pink-300'
                        : 'bg-slate-900/40'
                    }`}
                  >
                    {state.boxes[r][c] ? (state.boxes[r][c] === p1Id ? 'P1' : 'P2') : ''}
                  </div>
                </React.Fragment>
              ))}
              <button
                onClick={() => handleDrawV(r, state.gridSize)}
                disabled={!isMyTurn || state.verticalEdges[r][state.gridSize] !== null}
                className={`w-3 h-12 rounded transition-all ${
                  state.verticalEdges[r][state.gridSize] === p1Id
                    ? 'bg-purple-500'
                    : state.verticalEdges[r][state.gridSize] !== null
                    ? 'bg-pink-500'
                    : isMyTurn
                    ? 'bg-slate-800 hover:bg-slate-700 cursor-pointer'
                    : 'bg-slate-900 cursor-not-allowed'
                }`}
              />
            </div>
          </React.Fragment>
        ))}

        {/* Bottommost Horizontal Row */}
        <div className="flex items-center gap-2">
          {Array.from({ length: state.gridSize }).map((_, c) => (
            <React.Fragment key={c}>
              <div className="w-4 h-4 rounded-full bg-slate-400 shadow" />
              <button
                onClick={() => handleDrawH(state.gridSize, c)}
                disabled={!isMyTurn || state.horizontalEdges[state.gridSize][c] !== null}
                className={`h-3 w-12 rounded transition-all ${
                  state.horizontalEdges[state.gridSize][c] === p1Id
                    ? 'bg-purple-500'
                    : state.horizontalEdges[state.gridSize][c] !== null
                    ? 'bg-pink-500'
                    : isMyTurn
                    ? 'bg-slate-800 hover:bg-slate-700 cursor-pointer'
                    : 'bg-slate-900 cursor-not-allowed'
                }`}
              />
            </React.Fragment>
          ))}
          <div className="w-4 h-4 rounded-full bg-slate-400 shadow" />
        </div>
      </div>

      {state.isDone && (
        <div className="text-center font-bold text-lg text-amber-400 mt-2">
          {state.winner === currentPlayer?.id
            ? '🎉 YOU CONQUERED THE BOXES!'
            : state.winner === opponentPlayer?.id
            ? `💔 ${opponentPlayer?.name} WON!`
            : "IT'S A DRAW!"}
        </div>
      )}
    </div>
  );
};
