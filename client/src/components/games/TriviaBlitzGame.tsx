import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { TriviaBlitzState, Player, RoomSnapshot } from '../../shared/types';
import { sounds } from '../../lib/sound';
import { Check, X } from 'lucide-react';

interface TriviaBlitzProps {
  socket: Socket;
  state: TriviaBlitzState;
  currentPlayer: Player | null;
  room: RoomSnapshot;
}

export const TriviaBlitzGame: React.FC<TriviaBlitzProps> = ({
  socket,
  state,
  currentPlayer,
  room,
}) => {
  const myAnswerIndex = currentPlayer ? state.answers[currentPlayer.id] : null;

  const handleAnswer = (index: number) => {
    if (state.phase !== 'playing' || myAnswerIndex !== null) return;
    
    sounds.playClick();
    socket.emit('game:action', {
      type: 'ANSWER',
      payload: { answerIndex: index },
    });
  };

  useEffect(() => {
    if (state.phase === 'result') {
      if (state.roundWinner === currentPlayer?.id) {
        sounds.playCorrect();
      } else {
        sounds.playWrong();
      }
    }
  }, [state.phase, state.roundWinner, currentPlayer]);

  const getPlayerScore = (playerId: string) => state.scores[playerId] || 0;

  return (
    <div className="flex flex-col items-center justify-between w-full max-w-2xl min-h-[550px] p-6 glass-card fade-in relative overflow-hidden">
      {/* Header */}
      <div className="w-full flex items-center justify-between glass-card-highlight px-6 py-4 rounded-xl mb-6">
        <div className="text-center">
          <div className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-1">
            Round {state.round} / {state.totalRounds}
          </div>
          <div className="text-xs text-slate-300 font-medium bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700/50">
            Select the correct answer!
          </div>
        </div>

        {/* Players & Scores */}
        <div className="flex items-center gap-4 overflow-x-auto pb-1 max-w-[60%]">
          {room.players.map((p) => (
            <div key={p.id} className="flex flex-col items-center min-w-[60px]">
              <div 
                className="w-8 h-8 rounded-full mb-1 flex items-center justify-center font-bold text-slate-900 text-xs"
                style={{ backgroundColor: p.accentColor || '#a855f7' }}
              >
                {p.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-[10px] text-slate-400 truncate w-full text-center">{p.name}</span>
              <span className="text-sm font-black text-white">{getPlayerScore(p.id)} pts</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex flex-col items-center flex-1 w-full justify-center pb-4">
        
        {/* Question Area */}
        <div className="w-full max-w-xl text-center mb-8">
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-3 block">
            Question
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
            {state.currentQuestion.question}
          </h2>
        </div>

        {/* Options Grid */}
        <div className="w-full max-w-xl grid grid-cols-1 sm:grid-cols-2 gap-4">
          {state.currentQuestion.options.map((option, idx) => {
            const isMyChoice = myAnswerIndex === idx;
            const isCorrect = state.phase === 'result' && idx === state.currentQuestion.correctIndex;
            const isWrongChoice = state.phase === 'result' && isMyChoice && !isCorrect;

            let buttonClass = "px-6 py-5 rounded-2xl font-bold text-lg transition-all border-2 flex items-center justify-between ";
            let disabled = myAnswerIndex !== null || state.phase !== 'playing';

            if (state.phase === 'playing') {
              if (isMyChoice) {
                buttonClass += "bg-cyan-600 border-cyan-400 text-white shadow-lg";
              } else if (myAnswerIndex !== null) {
                buttonClass += "bg-slate-900 border-slate-800 text-slate-500 opacity-50";
              } else {
                buttonClass += "bg-slate-800/80 hover:bg-slate-700 border-slate-600 hover:border-cyan-500/50 text-slate-200 cursor-pointer hover:shadow-[0_0_20px_rgba(34,211,238,0.2)]";
              }
            } else {
              // Result phase
              if (isCorrect) {
                buttonClass += "bg-emerald-600 border-emerald-400 text-white shadow-[0_0_30px_rgba(16,185,129,0.3)] correct-flash";
              } else if (isWrongChoice) {
                buttonClass += "bg-rose-900/80 border-rose-700 text-rose-200 opacity-80 wrong-shake";
              } else {
                buttonClass += "bg-slate-950 border-slate-800 text-slate-600 opacity-40";
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                disabled={disabled}
                className={buttonClass}
              >
                <span>{option}</span>
                {state.phase === 'result' && isCorrect && <Check className="w-5 h-5 text-emerald-200" />}
                {state.phase === 'result' && isWrongChoice && <X className="w-5 h-5 text-rose-400" />}
              </button>
            );
          })}
        </div>

        {/* Result summary banner */}
        {state.phase === 'result' && (
          <div className="mt-8 bg-slate-900 border border-slate-700 px-6 py-3 rounded-full fade-in shadow-xl text-center">
            {myAnswerIndex === state.currentQuestion.correctIndex ? (
              <span className="text-emerald-400 font-black flex items-center gap-2">
                <Check className="w-5 h-5" /> CORRECT!
              </span>
            ) : (
              <span className="text-rose-400 font-bold flex items-center gap-2">
                <X className="w-5 h-5" /> INCORRECT
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
