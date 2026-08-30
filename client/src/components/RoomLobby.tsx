import React, { useState } from 'react';
import { ALL_GAMES, MAX_ROOM_PLAYERS } from '../shared/constants';
import { GameId, Player, RoomSnapshot, MatchMode } from '../shared/types';
import { Socket } from 'socket.io-client';
import { Play, Copy, Check, Users, Crown, Lock, Sparkles, Trophy, Zap } from 'lucide-react';
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
  const selectedGame = ALL_GAMES.find((game) => game.id === room.selectedGame);
  const canStartSelectedGame = !!selectedGame && room.players.length >= selectedGame.minPlayers && room.players.length <= selectedGame.maxPlayers;

  const handleSelectGame = (gameId: GameId) => {
    if (!isHost) return;
    sounds.playClick();
    socket.emit('room:selectGame', { gameId });
  };

  const handleSetMatchMode = (mode: MatchMode) => {
    if (!isHost) return;
    sounds.playClick();
    socket.emit('room:setMatchMode', { mode });
  };

  const handleStartGame = () => {
    if (!isHost || !room.selectedGame) return;
    sounds.playClick();
    socket.emit('room:startGame');
  };

  const handleCopyCode = () => {
    sounds.playClick();
    const link = `${window.location.origin}?code=${room.code}`;
    navigator.clipboard.writeText(`Join my DUELZONE game!\nRoom Code: ${room.code}\nLink: ${link}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const matchModes: { key: MatchMode; label: string }[] = [
    { key: 'free', label: 'Free Play' },
    { key: 'bo3', label: 'Best of 3' },
    { key: 'bo5', label: 'Best of 5' },
    { key: 'bo7', label: 'Best of 7' },
  ];

  return (
    <div className="relative z-10 w-full max-w-7xl flex flex-col gap-6 p-4">
      {/* Lobby Top Header Bar */}
      <div className="relative overflow-hidden bg-slate-900/90 border border-cyan-400/30 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl">
        <div className="relative">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-slate-400 font-extrabold">ROOM CODE</span>
            <span className="text-xs bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
              ● Live Sync
            </span>
          </div>
          <div className="text-5xl font-black tracking-widest text-cyan-300 mt-1 drop-shadow-md">
            {room.code}
          </div>
          <p className="mt-1 text-xs font-semibold text-slate-400">Share room code or invite link with opponent</p>
        </div>

        <div className="relative flex items-center gap-3">
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-5 py-3 rounded-2xl text-sm font-black text-slate-200 transition border border-slate-700 active:scale-95 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
            {copied ? 'Copied Invite Link!' : 'Copy Code & Link'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Players & Chat Column */}
        <div className="flex flex-col gap-6">
          {/* Players List Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" /> Players ({room.players.length}/{MAX_ROOM_PLAYERS})
            </h3>

            <div className="space-y-3">
              {room.players.map((player) => {
                const isSpeaking = activeSpeakers.has(player.id);
                const isMe = player.id === currentPlayer?.id;
                const stream = isMe ? localStream : remoteStreams[player.id];
                const hasVideo = stream && stream.getVideoTracks().length > 0;

                return (
                  <div
                    key={player.id}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                      isSpeaking ? 'bg-emerald-950/40 border-emerald-500/50 shadow-lg' : 'bg-slate-950/80 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center font-black text-white overflow-hidden shadow"
                        style={{ backgroundColor: hasVideo ? '#000' : player.accentColor || '#8b5cf6' }}
                      >
                        {hasVideo ? <VideoPlayer stream={stream!} isLocal={isMe} /> : player.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-100 flex items-center gap-2">
                          {player.name} {isMe && '(You)'}
                          {player.isHost && (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-amber-500/20 text-amber-300 font-black px-1.5 py-0.5 rounded border border-amber-500/30">
                              <Crown className="h-3 w-3" /> HOST
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 font-medium">Wins: {player.gamesWon || 0}🏆</div>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold ${player.isConnected ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {player.isConnected ? 'Ready' : 'Connecting...'}
                    </span>
                  </div>
                );
              })}

              {room.players.length < MAX_ROOM_PLAYERS && (
                <div className="flex items-center justify-center p-4 border-2 border-dashed border-slate-800 rounded-2xl text-slate-500 text-xs font-bold animate-pulse">
                  Waiting for opponent to join...
                </div>
              )}
            </div>
          </div>

          {/* Chat Box */}
          <ChatBox socket={socket} messages={messages} currentPlayer={currentPlayer} />
        </div>

        {/* Game & Series Settings Column */}
        <div className="lg:col-span-2 flex flex-col gap-6 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl">
          {/* Host Match Mode Selector */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-slate-950/80 border border-slate-800 rounded-2xl">
            <div>
              <span className="text-xs font-black uppercase text-purple-400 flex items-center gap-1.5">
                <Trophy className="w-4 h-4" /> MATCH MODE / CUP SERIES
              </span>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Select series length for competitive duels</p>
            </div>

            <div className="flex items-center gap-2">
              {matchModes.map((mm) => {
                const isActive = (room.matchMode || 'free') === mm.key;
                return (
                  <button
                    key={mm.key}
                    onClick={() => handleSetMatchMode(mm.key)}
                    disabled={!isHost}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider border transition ${
                      isActive
                        ? 'bg-purple-600 border-purple-400 text-white shadow'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {mm.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Game Selection Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black tracking-wide text-white">SELECT MINI GAME</h2>
              <p className="text-xs text-slate-400">
                {isHost ? 'Choose a duel to start playing' : 'Host is choosing a game...'}
              </p>
            </div>

            {isHost && (
              <button
                onClick={handleStartGame}
                disabled={!room.selectedGame || !canStartSelectedGame}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-wider text-white shadow-2xl transition ${
                  room.selectedGame && canStartSelectedGame
                    ? 'bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 text-white hover:brightness-110 active:scale-95 cursor-pointer'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                <Play className="w-4 h-4 fill-current" /> START GAME
              </button>
            )}
          </div>

          {/* Game Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto max-h-[480px] pr-1">
            {ALL_GAMES.map((game) => {
              const isSelected = room.selectedGame === game.id;
              const isPlayableNow = room.players.length >= game.minPlayers && room.players.length <= game.maxPlayers;
              return (
                <div
                  key={game.id}
                  onClick={() => isPlayableNow && handleSelectGame(game.id)}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-purple-900/30 border-purple-400 shadow-2xl ring-2 ring-purple-400/40'
                      : isHost && isPlayableNow
                      ? 'bg-slate-950/60 border-slate-800 hover:border-purple-500/60 hover:bg-slate-800/40 cursor-pointer hover:-translate-y-0.5'
                      : 'bg-slate-950/30 border-slate-800/60 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl p-2.5 bg-slate-900 rounded-xl border border-slate-800 shadow">
                      {game.icon}
                    </span>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-100 flex items-center gap-2">
                        {game.name}
                        {!isPlayableNow && <Lock className="h-3.5 w-3.5 text-slate-500" />}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-2 font-medium">{game.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800/80 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
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
