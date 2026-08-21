import React, { useEffect } from 'react'; import { Socket } from 'socket.io-client'; import { Player, RoomSnapshot } from '../../shared/types'; import { sounds } from '../../lib/sound';
export const AnimalBalanceGame: React.FC<{ socket: Socket; state: any; currentPlayer: Player | null; room: RoomSnapshot }> = ({ socket, state, currentPlayer, room }) => {
  const isHost = currentPlayer?.isHost;
  useEffect(() => {
    if (state.phase !== 'playing' || !state.endTime) return;
    const timer = window.setTimeout(() => socket.emit('game:action', { type: 'FINISH' }), Math.max(0, state.endTime - Date.now()));
    return () => window.clearTimeout(timer);
  }, [socket, state.endTime, state.phase]);
  return (
    <div className="w-full max-w-4xl flex flex-col items-center">
      <h2 className="text-4xl font-display text-white mb-6 drop-shadow-[0_0_10px_rgba(124,58,237,0.8)]">ANIMAL BALANCE</h2>
      <div className="flex gap-8 mb-8 w-full justify-center">
        {room.players.map((p) => (
          <div key={p.id} className="flex flex-col items-center p-4 border-2 border-brand-primary bg-brand-card">
            <span className="font-display text-xl text-white">{p.name}</span>
            <span className="font-display text-3xl text-brand-primary mt-2">{state.scores?.[p.id] || 0}</span>
          </div>
        ))}
      </div>
      {state.phase === 'countdown' && (
        <div className="mt-10 flex flex-col items-center">
          {isHost ? <button onClick={() => { sounds.playClick(); socket.emit('game:action', { type: 'START' }); }} className="px-10 py-4 bg-brand-primary text-white font-display text-2xl shadow-[0_0_20px_rgba(124,58,237,0.6)] hover:bg-brand-primary/80 transition active:scale-95 border border-brand-secondary">START</button> : <p className="text-xl font-display text-brand-accent animate-pulse">Waiting for host...</p>}
        </div>
      )}
      {state.phase === 'playing' && (
        <button onClick={() => { sounds.playClick(); socket.emit('game:action', { type: 'DROP', payload: { success: true } }); }} className="w-48 h-48 rounded-full bg-brand-background border-4 border-brand-accent text-brand-accent font-display text-4xl shadow-[0_0_30px_rgba(244,63,94,0.5)] active:scale-95 active:bg-brand-accent active:text-white transition-all flex items-center justify-center cursor-pointer">
          DROP!
        </button>
      )}
    </div>
  );
};
