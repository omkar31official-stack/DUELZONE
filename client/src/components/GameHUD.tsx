import React, { useState } from 'react';
import { Socket } from 'socket.io-client';
import { RoomSnapshot, Player, ChatMessage } from '../shared/types';
import { ALL_GAMES } from '../shared/constants';
import { Volume2, VolumeX, LogOut, ShieldAlert } from 'lucide-react';
import { sounds } from '../lib/sound';
import { ReactionLayer } from './ReactionLayer';
import { InGameChatDrawer } from './InGameChatDrawer';

interface GameHUDProps {
  socket: Socket;
  room: RoomSnapshot;
  currentPlayer: Player | null;
  messages: ChatMessage[];
  children: React.ReactNode;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  socket,
  room,
  currentPlayer,
  messages,
  children,
}) => {
  const [muted, setMuted] = useState(!sounds.enabled);
  const currentGame = ALL_GAMES.find((g) => g.id === room.selectedGame);

  const toggleSound = () => {
    sounds.enabled = !sounds.enabled;
    setMuted(!sounds.enabled);
    localStorage.setItem('duelzone_muted', String(!sounds.enabled));
  };

  const handleLeaveGame = () => {
    sounds.playClick();
    if (window.confirm('Return to room lobby?')) {
      socket.emit('room:returnToLobby');
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-between p-4 arcade-bg select-none">
      {/* Top Header Navigation & Score Dashboard */}
      <header className="w-full max-w-4xl flex items-center justify-between gap-4 p-3 bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl z-30">
        {/* Game Info */}
        <div className="flex items-center gap-3">
          <span className="text-2xl p-2 bg-slate-800 rounded-xl border border-slate-700">
            {currentGame?.icon || '🎮'}
          </span>
          <div className="flex flex-col">
            <h1 className="text-sm font-black text-slate-100 uppercase tracking-wide">
              {currentGame?.name || 'MINI GAME'}
            </h1>
            <span className="text-[10px] font-bold text-cyan-400 tracking-wider">
              {room.matchMode ? `SERIES: ${room.matchMode.toUpperCase()}` : 'FREE PLAY'}
            </span>
          </div>
        </div>

        {/* Players Score Tracker */}
        <div className="flex items-center gap-4 px-4 py-1.5 bg-slate-950/80 border border-slate-800 rounded-xl">
          {room.players.map((p, idx) => (
            <div key={p.id} className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${p.id === currentPlayer?.id ? 'bg-cyan-400 animate-pulse' : 'bg-pink-400'}`} />
              <span className="text-xs font-bold text-slate-300 max-w-[80px] truncate">{p.name}</span>
              <span className="text-xs font-black text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30">
                {p.gamesWon}🏆
              </span>
              {idx < room.players.length - 1 && <span className="text-slate-700 text-xs">|</span>}
            </div>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSound}
            className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-xl transition cursor-pointer"
            title={muted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {muted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={handleLeaveGame}
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-xl transition cursor-pointer"
            title="Return to Lobby"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Game Arena Render Area */}
      <main className="w-full flex-1 flex items-center justify-center py-6 z-20 overflow-auto">
        {children}
      </main>

      {/* Universal Reaction Layer */}
      <ReactionLayer socket={socket} />

      {/* Floating In-Game Chat Drawer */}
      <InGameChatDrawer socket={socket} messages={messages} currentPlayer={currentPlayer} />
    </div>
  );
};
