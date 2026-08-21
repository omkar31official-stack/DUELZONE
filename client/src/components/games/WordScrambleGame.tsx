import React, { useState, useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { WordScrambleState, Player, RoomSnapshot } from '../../shared/types';
import { sounds } from '../../lib/sound';
import { Send } from 'lucide-react';

interface WordScrambleProps {
  socket: Socket;
  state: WordScrambleState;
  currentPlayer: Player | null;
  room: RoomSnapshot;
}

export const WordScrambleGame: React.FC<WordScrambleProps> = ({
  socket,
  state,
  currentPlayer,
  room,
}) => {
  const [guess, setGuess] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const myGuess = currentPlayer ? state.guesses[currentPlayer.id] : null;

  useEffect(() => {
    if (state.phase === 'playing' && !myGuess) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [state.phase, myGuess]);

  const handleGuess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guess.trim() || state.phase !== 'playing' || myGuess !== null) return;
    
    sounds.playClick();
    socket.emit('game:action', {
      type: 'GUESS',
      payload: { guess: guess.trim() },
    });
    setGuess('');
  };

  const getPlayerScore = (playerId: string) => state.scores[playerId] || 0;

  return (
    <div className="flex flex-col items-center justify-between w-full max-w-2xl min-h-[500px] p-6 glass-card fade-in relative overflow-hidden">
      {/* Header */}
      <div className="w-full flex items-center justify-between glass-card-highlight px-6 py-4 rounded-xl mb-6">
        <div className="text-center">
          <div className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-1">
            Round {state.round} / {state.totalRounds}
          </div>
          <div className="text-xs text-slate-300 font-medium bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700/50">
            Unscramble the word!
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
      <div className="flex flex-col items-center flex-1 w-full justify-center pb-8">
        {state.phase === 'playing' && (
          <div className="flex flex-col items-center w-full max-w-md">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-4">
              Scrambled Word
            </span>
            <div className="text-4xl sm:text-5xl font-black tracking-[0.2em] text-white bg-slate-900/80 px-8 py-6 rounded-2xl border border-slate-700 shadow-xl mb-8 w-full text-center">
              {state.scrambledWord}
            </div>

            <form onSubmit={handleGuess} className="w-full flex flex-col gap-3 relative">
              <input
                ref={inputRef}
                type="text"
                value={guess}
                onChange={(e) => setGuess(e.target.value.toUpperCase())}
                disabled={myGuess !== null}
                placeholder="Type your answer here..."
                className="w-full bg-slate-950/80 border-2 border-slate-700 rounded-xl px-5 py-4 text-center text-xl font-bold text-white uppercase focus:outline-none focus:border-cyan-400 transition placeholder:text-slate-600 placeholder:normal-case placeholder:text-base placeholder:font-medium disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={myGuess !== null || !guess.trim()}
                className="absolute right-2 top-2 bottom-2 aspect-square bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg flex items-center justify-center transition cursor-pointer"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
            
            {myGuess !== null && (
              <div className="mt-4 text-sm font-bold text-slate-400 animate-pulse">
                Waiting for others...
              </div>
            )}
          </div>
        )}

        {state.phase === 'result' && (
          <div className="flex flex-col items-center w-full max-w-md fade-in">
            <span className="text-xs font-bold text-fuchsia-400 uppercase tracking-widest mb-2">
              The Word Was
            </span>
            <div className="text-4xl font-black tracking-widest text-white mb-8">
              {state.originalWord}
            </div>

            <div className="w-full bg-slate-900/80 rounded-2xl border border-slate-700 p-6 shadow-xl">
              <div className="text-center mb-4 pb-4 border-b border-slate-800">
                {state.roundWinner === currentPlayer?.id ? (
                  <span className="text-xl font-black text-emerald-400">🎉 YOU GOT IT FIRST!</span>
                ) : state.roundWinner ? (
                  <span className="text-xl font-black text-amber-400">⚡ {room.players.find(p => p.id === state.roundWinner)?.name} GOT IT!</span>
                ) : (
                  <span className="text-xl font-black text-rose-400">NO ONE GOT IT!</span>
                )}
              </div>
              
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-slate-500 mb-1">Guesses:</span>
                {room.players.map(p => {
                  const pGuess = state.guesses[p.id];
                  const isWinner = p.id === state.roundWinner;
                  return (
                    <div key={p.id} className={`flex items-center justify-between px-4 py-2 rounded-lg ${isWinner ? 'bg-emerald-900/30 border border-emerald-800/50' : 'bg-slate-950 border border-slate-800'}`}>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.accentColor }} />
                        <span className="text-sm font-semibold text-slate-300">{p.name}</span>
                      </div>
                      <span className={`font-bold ${isWinner ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {pGuess || 'No guess'}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
