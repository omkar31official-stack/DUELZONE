import React, { useState } from 'react';
import { Socket } from 'socket.io-client';
import { Player, RoomSnapshot, Math24State } from '../../shared/types';
import { sounds } from '../../lib/sound';
import { Calculator, Play, Delete, ArrowRight, Trophy } from 'lucide-react';

interface Props {
  socket: Socket;
  state: Math24State;
  currentPlayer: Player | null;
  room: RoomSnapshot;
}

export const Math24Game: React.FC<Props> = ({ socket, state, currentPlayer, room }) => {
  const isHost = currentPlayer?.isHost;
  const [expression, setExpression] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleStart = () => {
    sounds.playClick();
    socket.emit('game:action', { type: 'START' });
  };

  const handleNextRound = () => {
    sounds.playClick();
    setExpression('');
    setErrorMsg('');
    socket.emit('game:action', { type: 'NEXT_ROUND' });
  };

  const handleInput = (val: string) => {
    if (state.phase !== 'playing') return;
    sounds.playClick();
    setExpression(prev => prev + val);
    setErrorMsg('');
  };

  const handleDelete = () => {
    if (state.phase !== 'playing') return;
    sounds.playClick();
    setExpression(prev => prev.slice(0, -1));
    setErrorMsg('');
  };

  const handleSubmit = () => {
    if (state.phase !== 'playing') return;
    if (!expression) return;
    
    // Client-side quick validation to give immediate feedback
    const matches = expression.match(/\d+/g);
    const exprNums = matches ? matches.map(Number).sort((a, b) => a - b) : [];
    const targetNums = [...state.numbers].sort((a, b) => a - b);
    
    let validNums = exprNums.length === 4;
    for (let i = 0; i < 4; i++) {
      if (exprNums[i] !== targetNums[i]) validNums = false;
    }

    if (!validNums) {
      sounds.playClick();
      setErrorMsg('You must use exactly the 4 given numbers!');
      return;
    }

    // Attempt eval
    try {
      // eslint-disable-next-line no-new-func
      const result = new Function(`return ${expression}`)();
      if (Math.abs(result - 24) >= 0.0001) {
        sounds.playClick();
        setErrorMsg(`Result is ${result}, not 24!`);
        return;
      }
    } catch (e) {
      sounds.playClick();
      setErrorMsg('Invalid expression format!');
      return;
    }

    sounds.playClick();
    socket.emit('game:action', { type: 'SUBMIT', payload: { expression } });
  };

  return (
    <div className="flex flex-col items-center justify-between w-full max-w-xl min-h-[500px] p-6 glass-card fade-in relative overflow-hidden">
      {/* Header */}
      <div className="w-full flex items-center justify-between glass-card-highlight px-6 py-4 rounded-xl mb-6">
        <div>
          <h2 className="text-3xl font-black text-white drop-shadow-md">Math 24</h2>
          <div className="text-xs text-slate-400 font-semibold tracking-widest uppercase mt-1">
            Round {state.round} / {state.totalRounds}
          </div>
        </div>
        
        <div className="flex gap-2">
          {room.players.map(p => (
            <div key={p.id} className="flex flex-col items-center">
              <div 
                className="w-8 h-8 rounded-full border-2 border-slate-800 flex items-center justify-center font-bold text-xs shadow-lg"
                style={{ backgroundColor: p.accentColor }}
                title={p.name}
              >
                {p.name[0].toUpperCase()}
              </div>
              <span className="text-xs font-bold mt-1 text-slate-300">{state.scores[p.id] || 0}</span>
            </div>
          ))}
        </div>
      </div>

      {state.phase === 'countdown' && (
        <div className="flex-1 flex flex-col items-center justify-center fade-in">
          <h2 className="text-4xl font-black text-white mb-8 text-center drop-shadow-lg">
            Make 24!
          </h2>
          <div className="text-slate-400 text-center max-w-sm mb-8 leading-relaxed">
            Use the four numbers and basic math operators (+, -, *, /, parentheses) to reach exactly 24. First to submit a valid expression wins the round!
          </div>
          <div className="flex gap-4">
            {isHost ? (
              <button
                onClick={handleStart}
                className="flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xl transition transform active:scale-95 shadow-[0_0_20px_rgba(37,99,235,0.4)] border border-blue-400/30"
              >
                <Play className="w-6 h-6" /> START GAME
              </button>
            ) : (
              <div className="text-xl font-bold text-slate-400 animate-pulse">
                Waiting for host to start...
              </div>
            )}
          </div>
        </div>
      )}

      {state.phase === 'playing' && (
        <div className="flex flex-col items-center w-full fade-in pb-4">
          
          <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Calculator className="w-4 h-4" /> Use these numbers
          </div>
          
          {/* Numbers Display */}
          <div className="flex gap-4 mb-8">
            {state.numbers.map((n, i) => (
              <button
                key={i}
                onClick={() => handleInput(n.toString())}
                className="w-16 h-16 bg-slate-800 hover:bg-slate-700 active:scale-95 border-2 border-blue-500/50 rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-[0_0_15px_rgba(59,130,246,0.2)] transition"
              >
                {n}
              </button>
            ))}
          </div>

          {/* Expression Input Area */}
          <div className="w-full max-w-md bg-slate-900 border-2 border-slate-700 rounded-xl p-4 min-h-[80px] flex items-center justify-center mb-2 shadow-inner overflow-hidden">
            <span className="text-3xl font-mono text-cyan-400 font-bold break-all text-center">
              {expression || <span className="opacity-30">Your equation...</span>}
            </span>
          </div>
          
          {errorMsg ? (
            <div className="text-rose-400 text-sm font-bold h-6 mb-4 animate-pulse">{errorMsg}</div>
          ) : (
            <div className="h-6 mb-4" />
          )}

          {/* Operators Pad */}
          <div className="grid grid-cols-4 gap-3 w-full max-w-md mb-6">
            {['+', '-', '*', '/'].map(op => (
              <button
                key={op}
                onClick={() => handleInput(op)}
                className="h-14 bg-indigo-900/40 hover:bg-indigo-800/60 active:scale-95 rounded-xl text-2xl font-black text-indigo-300 border border-indigo-500/30 transition shadow-lg"
              >
                {op}
              </button>
            ))}
            {['(', ')'].map(op => (
              <button
                key={op}
                onClick={() => handleInput(op)}
                className="h-14 bg-slate-800 hover:bg-slate-700 active:scale-95 rounded-xl text-2xl font-black text-slate-300 border border-slate-600 transition shadow-lg"
              >
                {op}
              </button>
            ))}
            <button
              onClick={handleDelete}
              className="h-14 bg-rose-900/40 hover:bg-rose-800/60 active:scale-95 rounded-xl flex items-center justify-center text-rose-300 border border-rose-500/30 transition shadow-lg"
            >
              <Delete className="w-6 h-6" />
            </button>
            <button
              onClick={handleSubmit}
              className="h-14 bg-emerald-600 hover:bg-emerald-500 active:scale-95 rounded-xl flex items-center justify-center text-white font-bold border border-emerald-400/50 transition shadow-[0_0_15px_rgba(5,150,105,0.4)]"
            >
              <ArrowRight className="w-8 h-8" />
            </button>
          </div>
        </div>
      )}

      {state.phase === 'result' && (
        <div className="flex-1 flex flex-col items-center justify-center fade-in">
          {state.gameWinner ? (
            <>
              <Trophy className="w-24 h-24 text-amber-400 mb-6 drop-shadow-[0_0_30px_rgba(251,191,36,0.6)] animate-bounce" />
              <h2 className="text-4xl font-black text-white mb-2 text-center drop-shadow-lg">
                {room.players.find(p => p.id === state.gameWinner)?.name} WINS!
              </h2>
              <div className="text-2xl font-bold text-amber-400 mb-8">
                Final Score: {state.scores[state.gameWinner]}
              </div>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-black text-white mb-2 text-center drop-shadow-lg">
                {room.players.find(p => p.id === state.roundWinner)?.name} got 24!
              </h2>
              <div className="text-2xl font-mono font-bold text-emerald-400 bg-emerald-950/50 px-6 py-3 rounded-2xl border border-emerald-900/50 shadow-[0_0_20px_rgba(52,211,153,0.3)] mb-8">
                {state.winningExpression} = 24
              </div>
              
              {isHost && (
                <button
                  onClick={handleNextRound}
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xl transition active:scale-95 shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                >
                  NEXT ROUND
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
