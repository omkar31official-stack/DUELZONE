import React, { useEffect } from 'react'; import { Socket } from 'socket.io-client'; import { Player, RoomSnapshot } from '../../shared/types'; import { sounds } from '../../lib/sound';
export const FruitNinjaGame: React.FC<{ socket: Socket; state: any; currentPlayer: Player | null; room: RoomSnapshot }> = ({ socket, state, currentPlayer, room }) => {
  const isHost = currentPlayer?.isHost;
  useEffect(() => {
    if (state.phase !== 'playing' || !state.endTime) return;
    const timer = window.setTimeout(() => socket.emit('game:action', { type: 'FINISH' }), Math.max(0, state.endTime - Date.now()));
    return () => window.clearTimeout(timer);
  }, [socket, state.endTime, state.phase]);
  return (
    <div className="w-full max-w-4xl flex flex-col items-center">
      <h2 className="text-4xl font-display text-white mb-6 drop-shadow-[0_0_10px_rgba(124,58,237,0.8)]">FRUIT SLASH</h2>
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
        <div className="grid grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, idx) => (
            <button key={idx} onClick={() => { sounds.playClick(); socket.emit('game:action', { type: 'SLASH', payload: { fruitId: idx } }); }} className={`w-24 h-24 rounded-full border-4 flex items-center justify-center text-4xl ${state.activeFruit === idx ? 'bg-brand-accent border-white cursor-pointer' : 'bg-black border-brand-primary/30'}`}>
              {state.activeFruit === idx ? '🍉' : ''}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
