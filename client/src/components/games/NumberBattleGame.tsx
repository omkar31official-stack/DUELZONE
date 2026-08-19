import React from 'react';
import { Socket } from 'socket.io-client';
import { NumberBattleState, Player } from '../../shared/types';
import { sounds } from '../../lib/sound';

interface NBProps {
  socket: Socket;
  state: NumberBattleState;
  currentPlayer: Player | null;
  opponentPlayer: Player | null;
}

export const NumberBattleGame: React.FC<NBProps> = ({
  socket,
  state,
  currentPlayer,
  opponentPlayer,
}) => {
  const myChoice = currentPlayer ? state.choices[currentPlayer.id] : null;
  const myHand = currentPlayer ? state.playerNumbers[currentPlayer.id] || [] : [];

  const handleChoose = (num: number) => {
    if (myChoice || state.revealed || state.gameWinner) return;
    sounds.playClick();
    socket.emit('game:action', {
      type: 'CHOOSE',
      payload: { number: num },
    });
  };

  const myScore = currentPlayer ? state.scores[currentPlayer.id] || 0 : 0;
  const oppScore = opponentPlayer ? state.scores[opponentPlayer.id] || 0 : 0;

  return (
    <div className="flex flex-col items-center justify-between w-full max-w-lg min-h-[450px] p-6 bg-slate-900/80 rounded-2xl border border-slate-800 shadow-2xl">
      <div className="w-full flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
        <div>
          <span className="text-xs text-slate-400 font-semibold block">{currentPlayer?.name}</span>
          <span className="text-lg font-bold text-purple-400">{myScore} pts</span>
        </div>
        <div className="text-center">
          <span className="text-xs uppercase tracking-wider text-slate-500 font-bold block">
            Round {state.round} / {state.totalRounds}
          </span>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400 font-semibold block">{opponentPlayer?.name}</span>
          <span className="text-lg font-bold text-pink-400">{oppScore} pts</span>
        </div>
      </div>

      {/* Target display */}
      <div className="flex flex-col items-center my-6">
        <span className="text-xs font-extrabold text-amber-400 uppercase tracking-widest mb-1">
          TARGET NUMBER
        </span>
        <div className="text-6xl font-black text-white bg-slate-950 px-8 py-4 rounded-2xl border-2 border-amber-500/50 shadow-2xl animate-pulse">
          {state.target}
        </div>
      </div>

      {/* Choice Hand */}
      {!state.revealed && (
        <div className="w-full flex flex-col items-center gap-3">
          <span className="text-xs text-slate-400 font-semibold">Pick the number closest to the target:</span>
          <div className="flex flex-wrap justify-center gap-3">
            {myHand.map((num) => (
              <button
                key={num}
                onClick={() => handleChoose(num)}
                disabled={myChoice !== null}
                className={`px-4 py-3 rounded-xl font-black text-xl border-2 transition ${
                  myChoice === num
                    ? 'bg-purple-600 border-purple-300 text-white'
                    : myChoice !== null
                    ? 'bg-slate-950 border-slate-800 text-slate-600'
                    : 'bg-slate-800 hover:bg-purple-900 border-slate-700 hover:border-purple-400 text-white cursor-pointer active:scale-95'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      )}

      {state.revealed && (
        <div className="text-center space-y-2">
          <div className="text-xl font-bold text-amber-400">
            {state.roundWinner === currentPlayer?.id
              ? '🎯 YOU WERE CLOSEST!'
              : state.roundWinner === opponentPlayer?.id
              ? `💔 ${opponentPlayer?.name} WAS CLOSEST!`
              : "IT'S A TIE!"}
          </div>
          <div className="text-xs text-slate-400">
            Your pick: {myChoice} vs {opponentPlayer ? state.choices[opponentPlayer.id] : null}
          </div>
        </div>
      )}
    </div>
  );
};
