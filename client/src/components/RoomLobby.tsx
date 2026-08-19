import React, { useState } from 'react';
import { ALL_GAMES } from '../shared/constants.ts';
import { GameId, Player, RoomSnapshot } from '../shared/types';
import { Socket } from 'socket.io-client';
import { Play, Copy, Check, Users } from 'lucide-react';
import { ChatBox } from './ChatBox';
import { sounds } from '../lib/sound';

interface LobbyProps {
  socket: Socket;
  room: RoomSnapshot;
  currentPlayer: Player | null;
  messages: any[];
}

export const RoomLobby: React.FC<LobbyProps> = ({
  socket,
  room,
  currentPlayer,
  messages,
}) => {
  const [copied, setCopied] = useState(false);
  const isHost = currentPlayer?.isHost;
  const opponent = room.players.find((p) => p.id !== currentPlayer?.id);

  const handleSelectGame = (gameId: GameId) => {
    if (!isHost) return;
    sounds.playClick();
    socket.emit('room:selectGame', { gameId });
  };

  const handleStartGame = () => {
    if (!isHost || !room.selectedGame) return;
    sounds.playClick();
    socket.emit('room:startGame');
  };

  const handleCopyCode = () => {
    sounds.playClick();
    const link = `${window.location.origin}?code=${room.code}`;
    navigator.clipboard.writeText(
      `Join my DUELZONE game!\nRoom Code: ${room.code}\n${link}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-5xl flex flex-col gap-6">
      {/* Header Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-slate-400 font-extrabold">ROOM CODE</span>
            <span className="text-xs bg-emerald-500/20 text-emerald-400 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">● Connected</span>
          </div>
          <div className="text-4xl font-black tracking-widest text-purple-400 mt-1">
            {room.code}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-200 transition border border-slate-700 active:scale-95 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied Invite Link!' : 'Copy Code & Link'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Players & Chat Column */}
        <div className="flex flex-col gap-6">
          {/* Players Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <Users className="w-4 h-4" /> Players ({room.players.length}/2)
            </h3>

            <div className="space-y-3">
              {/* Current Player */}
              <div className="flex items-center justify-between p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow"
                    style={{ backgroundColor: currentPlayer?.accentColor || '#8b5cf6' }}
                  >
                    {currentPlayer?.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-100 flex items-center gap-2">
                      {currentPlayer?.name} (You)
                      {currentPlayer?.isHost && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 font-extrabold px-1.5 py-0.5 rounded border border-amber-500/30">HOST</span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400">Score: {currentPlayer?.gamesWon || 0} wins</div>
                  </div>
                </div>
                <span className="text-xs text-emerald-400 font-semibold">Online</span>
              </div>

              {/* Opponent Player */}
              {opponent ? (
                <div className="flex items-center justify-between p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow"
                      style={{ backgroundColor: opponent.accentColor || '#ec4899' }}
                    >
                      {opponent.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-100 flex items-center gap-2">
                        {opponent.name}
                        {opponent.isHost && (
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 font-extrabold px-1.5 py-0.5 rounded border border-amber-500/30">HOST</span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">Score: {opponent.gamesWon || 0} wins</div>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold ${opponent.isConnected ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {opponent.isConnected ? 'Online' : 'Reconnecting...'}
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-center p-6 border-2 border-dashed border-slate-800 rounded-xl text-slate-500 text-xs font-semibold animate-pulse">
                  Waiting for opponent to join...
                </div>
              )}
            </div>
          </div>

          {/* Chat Box */}
          <ChatBox socket={socket} messages={messages} currentPlayer={currentPlayer} />
        </div>

        {/* Game Selector Column */}
        <div className="lg:col-span-2 flex flex-col gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black tracking-wide text-white">SELECT A GAME</h2>
              <p className="text-xs text-slate-400">
                {isHost ? 'Choose a duel to challenge your opponent' : 'Host is choosing a game...'}
              </p>
            </div>

            {isHost && (
              <button
                onClick={handleStartGame}
                disabled={!room.selectedGame || room.players.length < 2}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm uppercase tracking-wider text-white shadow-xl transition ${
                  room.selectedGame && room.players.length >= 2
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 active:scale-95 cursor-pointer'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                <Play className="w-4 h-4 fill-current" /> START GAME
              </button>
            )}
          </div>

          {/* Game Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 overflow-y-auto max-h-[480px] pr-1">
            {ALL_GAMES.map((game) => {
              const isSelected = room.selectedGame === game.id;
              return (
                <div
                  key={game.id}
                  onClick={() => handleSelectGame(game.id)}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-purple-900/40 border-purple-500 shadow-xl ring-2 ring-purple-500/30'
                      : isHost
                      ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40 cursor-pointer'
                      : 'bg-slate-950/40 border-slate-800/60 cursor-default opacity-80'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl p-2 bg-slate-900 rounded-xl border border-slate-800 shadow">
                      {game.icon}
                    </span>
                    <div>
                      <h4 className="font-bold text-sm text-slate-100">{game.name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{game.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800/80 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">{game.category}</span>
                    <span>⏱️ {game.estimatedMinutes}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
