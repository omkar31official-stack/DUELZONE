import React, { useState } from 'react';
import { ALL_GAMES, MAX_ROOM_PLAYERS } from '../shared/constants.ts';
import { GameId, Player, RoomSnapshot } from '../shared/types';
import { Socket } from 'socket.io-client';
import { Play, Copy, Check, Users, Crown, Lock, Sparkles } from 'lucide-react';
import { ChatBox } from './ChatBox';
import { sounds } from '../lib/sound';

interface LobbyProps {
  socket: Socket;
  room: RoomSnapshot;
  currentPlayer: Player | null;
  messages: any[];
  activeSpeakers: Set<string>;
  remoteStreams: Record<string, MediaStream>;
  localStream: MediaStream | null;
}

const VideoPlayer: React.FC<{ stream: MediaStream; isLocal?: boolean }> = ({ stream, isLocal }) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  
  React.useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted={isLocal}
      className="w-full h-full object-cover rounded-full"
    />
  );
};

export const RoomLobby: React.FC<LobbyProps> = ({
  socket,
  room,
  currentPlayer,
  messages,
  activeSpeakers,
  remoteStreams,
  localStream,
}) => {
  const [copied, setCopied] = useState(false);
  const isHost = currentPlayer?.isHost;
  const selectedGame = ALL_GAMES.find(game => game.id === room.selectedGame);
  const canStartSelectedGame = !!selectedGame && room.players.length >= selectedGame.minPlayers && room.players.length <= selectedGame.maxPlayers;

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
    <div className="relative z-10 w-full max-w-7xl flex flex-col gap-6">
      {/* Header Bar */}
      <div className="relative overflow-hidden bg-slate-900/90 border border-cyan-300/20 rounded-[2rem] p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0_0_60px_rgba(34,211,238,.10)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(34,211,238,.16),transparent_28%),radial-gradient(circle_at_90%_0%,rgba(217,70,239,.18),transparent_30%)]" />
        <div className="relative">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-slate-400 font-extrabold">ROOM CODE</span>
            <span className="text-xs bg-emerald-500/20 text-emerald-400 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">● Connected</span>
          </div>
          <div className="text-5xl font-black tracking-widest text-cyan-200 mt-1 drop-shadow-[0_0_18px_rgba(34,211,238,.35)]">
            {room.code}
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-400">Invite up to {MAX_ROOM_PLAYERS} players. Host chooses the game.</p>
        </div>

        <div className="relative flex gap-3">
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-200 transition border border-slate-700 active:scale-95 cursor-pointer focus-visible:outline focus-visible:outline-4 focus-visible:outline-cyan-300"
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
          <div className="bg-slate-900/80 border border-slate-800 rounded-[2rem] p-5 shadow-lg">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <Users className="w-4 h-4" /> Players ({room.players.length}/{MAX_ROOM_PLAYERS})
            </h3>

            <div className="space-y-3">
              {room.players.map((player) => {
                const isSpeaking = activeSpeakers.has(player.id);
                const isMe = player.id === currentPlayer?.id;
                const stream = isMe ? localStream : remoteStreams[player.id];
                const hasVideo = stream && stream.getVideoTracks().length > 0;
                
                return (
                <div key={player.id} className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${isSpeaking ? 'bg-emerald-950/40 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-slate-950/80 border-slate-800'}`}>
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white transition-all overflow-hidden ${isSpeaking ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-950' : 'shadow'}`}
                      style={{ backgroundColor: hasVideo ? '#000' : (player.accentColor || '#8b5cf6') }}
                    >
                      {hasVideo ? (
                        <VideoPlayer stream={stream!} isLocal={isMe} />
                      ) : (
                        player.name.slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-100 flex items-center gap-2">
                        {player.name}{isMe ? ' (You)' : ''}
                        {player.isHost && (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-amber-500/20 text-amber-300 font-extrabold px-1.5 py-0.5 rounded border border-amber-500/30"><Crown className="h-3 w-3" /> HOST</span>
                        )}
                        {isSpeaking && <span className="inline-flex w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-1" title="Speaking" />}
                      </div>
                      <div className="text-xs text-slate-400">Score: {player.gamesWon || 0} wins</div>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold ${player.isConnected ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {player.isConnected ? 'Online' : 'Reconnecting...'}
                  </span>
                </div>
              )})}

              {room.players.length < MAX_ROOM_PLAYERS && (
                <div className="flex items-center justify-center p-6 border-2 border-dashed border-slate-800 rounded-2xl text-slate-500 text-xs font-semibold animate-pulse">
                  Waiting for more players… room supports {MAX_ROOM_PLAYERS}.
                </div>
              )}
            </div>
          </div>

          {/* Chat Box */}
          <ChatBox socket={socket} messages={messages} currentPlayer={currentPlayer} />
        </div>

        {/* Game Selector Column */}
        <div className="lg:col-span-2 flex flex-col gap-4 bg-slate-900/80 border border-slate-800 rounded-[2rem] p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black tracking-wide text-white">SELECT A GAME</h2>
              <p className="text-xs text-slate-400">
                {isHost ? 'Choose a duel or party game that matches the room size' : 'Host is choosing a game...'}
              </p>
            </div>

            {isHost && (
              <button
                onClick={handleStartGame}
                disabled={!room.selectedGame || !canStartSelectedGame}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm uppercase tracking-wider text-white shadow-xl transition ${
                  room.selectedGame && canStartSelectedGame
                    ? 'bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-amber-300 text-slate-950 hover:brightness-110 active:scale-95 cursor-pointer'
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
              const isPlayableNow = room.players.length >= game.minPlayers && room.players.length <= game.maxPlayers;
              return (
                <div
                  key={game.id}
                  onClick={() => isPlayableNow && handleSelectGame(game.id)}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-cyan-900/30 border-cyan-300 shadow-xl ring-2 ring-cyan-300/30'
                      : isHost && isPlayableNow
                      ? 'bg-slate-950/60 border-slate-800 hover:border-cyan-400/60 hover:bg-slate-800/40 cursor-pointer hover:-translate-y-0.5'
                      : isHost
                      ? 'bg-slate-950/40 border-slate-800/60 cursor-not-allowed opacity-50'
                      : 'bg-slate-950/40 border-slate-800/60 cursor-default opacity-80'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl p-2 bg-slate-900 rounded-xl border border-slate-800 shadow">
                      {game.icon}
                    </span>
                    <div>
                      <h4 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                        {game.name}
                        {!isPlayableNow && <Lock className="h-3.5 w-3.5 text-slate-500" />}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{game.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800/80 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 flex items-center gap-1">
                      {game.category === 'PARTY' && <Sparkles className="h-3 w-3 text-amber-300" />}
                      {game.category}
                    </span>
                    <span>{game.minPlayers === game.maxPlayers ? `${game.minPlayers}P` : `${game.minPlayers}-${game.maxPlayers}P`}</span>
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
