import React from 'react';
import { Socket } from 'socket.io-client';
import { ReactionDuelState, Player } from '../../shared/types';
import { sounds } from '../../lib/sound';

interface RDProps {
  socket: Socket;
  state: ReactionDuelState;
  currentPlayer: Player | null;
  opponentPlayer: Player | null;
}

export const ReactionDuelGame: React.FC<RDProps> = ({
  socket,
  state,
  currentPlayer,
  opponentPlayer,
}) => {
  const isHost = currentPlayer?.isHost;
  const myReaction = currentPlayer ? state.reactions[currentPlayer.id] : null;
  const oppReaction = opponentPlayer ? state.reactions[opponentPlayer.id] : null;

  const handleStartRound = () => {
    socket.emit('game:action', { type: 'START_ROUND' });
  };

  const handleReact = () => {
    sounds.playClick();
    socket.emit('game:action', { type: 'REACT' });
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

      {/* Center Action Box */}
      <div className="flex-1 w-full flex flex-col items-center justify-center my-6">
        {state.phase === 'waiting' && (
          <div className="text-center space-y-4">
            <p className="text-slate-400 text-sm">Wait for host to trigger the round!</p>
            {isHost && (
              <button
                onClick={handleStartRound}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 font-black rounded-xl text-white shadow-xl transition active:scale-95 text-lg"
              >
                START ROUND
              </button>
            )}
          </div>
        )}

        {state.phase === 'ready' && (
          <button
            onClick={handleReact}
            className="w-full h-48 bg-amber-500/20 border-4 border-amber-500/50 rounded-2xl flex flex-col items-center justify-center cursor-pointer active:scale-95 transition"
          >
            <span className="text-4xl font-black text-amber-400 animate-pulse">WAIT...</span>
            <span className="text-xs text-amber-300/80 mt-2 font-semibold">Don't tap yet or FALSE START!</span>
          </button>
        )}

        {state.phase === 'go' && (
          <button
            onClick={handleReact}
            disabled={myReaction !== null}
            className={`w-full h-48 rounded-2xl flex flex-col items-center justify-center cursor-pointer active:scale-95 transition ${
              myReaction !== null
                ? 'bg-slate-800 border-4 border-slate-700 opacity-60'
                : 'bg-emerald-500 hover:bg-emerald-400 border-4 border-emerald-300 shadow-2xl animate-bounce'
            }`}
          >
            <span className="text-6xl font-black text-white">TAP NOW!</span>
          </button>
        )}

        {state.phase === 'result' && (
          <div className="text-center space-y-3">
            <div className="text-2xl font-black text-amber-400">
              {state.roundWinner === currentPlayer?.id
                ? '⚡ YOU WERE FASTER!'
                : state.roundWinner === opponentPlayer?.id
                ? `⚡ ${opponentPlayer?.name} WAS FASTER!`
                : "IT'S A TIE!"}
            </div>

            <div className="flex justify-center gap-8 text-sm">
              <div className="bg-slate-950 px-4 py-2 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-500 block">Your Time</span>
                <span className="font-bold text-purple-400">
                  {myReaction === 'false-start' ? 'FALSE START' : `${myReaction} ms`}
                </span>
              </div>
              <div className="bg-slate-950 px-4 py-2 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-500 block">{opponentPlayer?.name}'s Time</span>
                <span className="font-bold text-pink-400">
                  {oppReaction === 'false-start' ? 'FALSE START' : `${oppReaction} ms`}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
