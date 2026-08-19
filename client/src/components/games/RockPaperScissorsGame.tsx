import React from 'react';
import { Socket } from 'socket.io-client';
import { RPSState, RPSChoice, Player } from '../../shared/types';
import { sounds } from '../../lib/sound';

interface RPSProps {
  socket: Socket;
  state: RPSState;
  currentPlayer: Player | null;
  opponentPlayer: Player | null;
}

const HANDS: Record<RPSChoice, string> = {
  rock: '✊',
  paper: '✋',
  scissors: '✌️',
};

export const RockPaperScissorsGame: React.FC<RPSProps> = ({
  socket,
  state,
  currentPlayer,
  opponentPlayer,
}) => {
  const myChoice = currentPlayer ? state.choices[currentPlayer.id] : null;
  const oppChoice = opponentPlayer ? state.choices[opponentPlayer.id] : null;

  const handleChoose = (choice: RPSChoice) => {
    if (myChoice || state.gameWinner) return;
    sounds.playClick();
    socket.emit('game:action', {
      type: 'CHOOSE',
      payload: { choice },
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
          <span className="text-xs uppercase tracking-wider text-slate-500 font-bold block">First to 5</span>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400 font-semibold block">{opponentPlayer?.name}</span>
          <span className="text-lg font-bold text-pink-400">{oppScore} pts</span>
        </div>
      </div>

      {/* Duel Arena */}
      <div className="flex-1 w-full flex items-center justify-around my-6">
        {/* My Hand */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs text-slate-400 font-bold">YOU</span>
          <div className="w-24 h-24 bg-slate-950 rounded-2xl border-2 border-purple-500/50 flex items-center justify-center text-5xl">
            {myChoice ? HANDS[myChoice] : '❓'}
          </div>
        </div>

        <span className="text-2xl font-black text-slate-600">VS</span>

        {/* Opponent Hand */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs text-slate-400 font-bold">{opponentPlayer?.name}</span>
          <div className="w-24 h-24 bg-slate-950 rounded-2xl border-2 border-pink-500/50 flex items-center justify-center text-5xl">
            {state.revealed && oppChoice ? HANDS[oppChoice] : oppChoice ? '🔒' : '❓'}
          </div>
        </div>
      </div>

      {/* Selection Buttons */}
      {!myChoice && !state.gameWinner && (
        <div className="flex gap-4 w-full justify-center">
          {(['rock', 'paper', 'scissors'] as RPSChoice[]).map((choice) => (
            <button
              key={choice}
              onClick={() => handleChoose(choice)}
              className="flex-1 max-w-[100px] py-4 bg-slate-800 hover:bg-purple-600 border-2 border-slate-700 hover:border-purple-400 rounded-xl text-3xl transition active:scale-95 flex flex-col items-center gap-1 cursor-pointer"
            >
              <span>{HANDS[choice]}</span>
              <span className="text-[10px] font-bold uppercase text-slate-300">{choice}</span>
            </button>
          ))}
        </div>
      )}

      {myChoice && !state.revealed && (
        <p className="text-amber-400 text-sm font-semibold animate-pulse">Waiting for opponent choice...</p>
      )}

      {state.revealed && (
        <div className="text-center font-extrabold text-lg text-purple-400">
          {state.roundWinner === currentPlayer?.id
            ? '🎉 You Won This Round!'
            : state.roundWinner === opponentPlayer?.id
            ? `💔 ${opponentPlayer?.name} Won!`
            : "It's a Tie!"}
        </div>
      )}
    </div>
  );
};
