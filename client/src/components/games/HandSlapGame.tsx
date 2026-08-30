import React from 'react';
import { Socket } from 'socket.io-client';
import { Player, HandSlapState } from '../../shared/types';
import { Shield, Zap } from 'lucide-react';
import { sounds } from '../../lib/sound';

interface HandSlapGameProps {
  socket: Socket;
  state: HandSlapState;
  currentPlayer: Player | null;
  opponentPlayer: Player | null;
}

export const HandSlapGame: React.FC<HandSlapGameProps> = ({
  socket,
  state,
  currentPlayer,
  opponentPlayer,
}) => {
  const isAttacker = currentPlayer?.id === state.attackerId;

  const handleAction = (type: 'SLAP' | 'DODGE') => {
    sounds.playClick();
    socket.emit('game:action', { type });
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md">
      <div className="flex items-center justify-between w-full px-4 py-2 bg-slate-900/90 border border-slate-800 rounded-2xl">
        <span className="text-xs font-black uppercase text-purple-400">
          ROLE: {isAttacker ? 'ATTACKER (SLAP)' : 'DEFENDER (DODGE)'}
        </span>
        <span className="text-xs font-bold text-slate-400">ROUND {(state as any).round || 1}</span>
      </div>

      <div className="flex flex-col items-center justify-center gap-8 w-full h-64 bg-slate-950 border-2 border-slate-800 rounded-3xl p-6 shadow-2xl relative">
        <span className="text-6xl animate-pulse">
          {state.phase === 'slapped' ? '💥 SLAP HIT!' : state.phase === 'dodged' ? '🛡️ DODGED!' : '✋ 🖐️'}
        </span>

        {isAttacker ? (
          <button
            onClick={() => handleAction('SLAP')}
            className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-black text-xl rounded-2xl shadow-lg transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <Zap className="w-6 h-6" /> SLAP!
          </button>
        ) : (
          <button
            onClick={() => handleAction('DODGE')}
            className="w-full py-4 bg-sky-600 hover:bg-sky-500 text-white font-black text-xl rounded-2xl shadow-lg transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <Shield className="w-6 h-6" /> DODGE!
          </button>
        )}
      </div>
    </div>
  );
};
