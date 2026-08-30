import React, { useState } from 'react';
import { useMusic } from '../../music/MusicContext';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Shuffle,
  Volume2,
  VolumeX,
  X,
  SlidersHorizontal,
  Disc,
  Sparkles,
} from 'lucide-react';
import { sounds } from '../../lib/sound';

export const MusicWidget: React.FC = () => {
  const {
    playlist,
    currentTrack,
    isPlaying,
    isMuted,
    volume,
    sfxVolume,
    progress,
    currentTime,
    duration,
    shuffle,
    widgetOpen,
    audioData,
    togglePlay,
    playTrack,
    nextTrack,
    prevTrack,
    setVolume,
    setSfxVolume,
    toggleMute,
    toggleShuffle,
    seek,
    setWidgetOpen,
  } = useMusic();

  const [showSettings, setShowSettings] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);

  if (!widgetOpen || !currentTrack) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[92vw] max-w-sm bg-slate-950/90 border border-purple-500/40 rounded-3xl p-4 shadow-[0_10px_35px_rgba(168,85,247,0.25)] backdrop-blur-xl text-white transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-purple-500/20">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            {isPlaying && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isPlaying ? 'bg-cyan-400' : 'bg-slate-500'}`} />
          </span>
          <span className="text-[10px] font-black uppercase tracking-widest text-purple-300">
            DUELZONE PARTY MUSIC
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              sounds.playClick();
              setShowSettings((prev) => !prev);
              setShowPlaylist(false);
            }}
            className={`p-1.5 rounded-lg border transition ${
              showSettings
                ? 'bg-purple-600/40 border-purple-400 text-purple-200'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Audio Settings"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setShowPlaylist((prev) => !prev);
              setShowSettings(false);
            }}
            className={`p-1.5 rounded-lg border transition ${
              showPlaylist
                ? 'bg-purple-600/40 border-purple-400 text-purple-200'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Playlist Tracks"
          >
            <Disc className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setWidgetOpen(false)}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Playlist Selector Dropdown */}
      {showPlaylist && (
        <div className="mb-3 max-h-48 overflow-y-auto bg-slate-900/90 border border-purple-500/30 rounded-2xl p-2 space-y-1">
          <div className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase">Party Playlist ({playlist.length})</div>
          {playlist.map((track) => (
            <button
              key={track.id}
              onClick={() => {
                playTrack(track);
                setShowPlaylist(false);
              }}
              className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between transition ${
                currentTrack.id === track.id
                  ? 'bg-purple-600/30 text-purple-200 font-bold border border-purple-500/40'
                  : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <span>{track.icon}</span>
                <span className="truncate">{track.title}</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">{track.genre}</span>
            </button>
          ))}
        </div>
      )}

      {/* Settings Modal Dropdown */}
      {showSettings && (
        <div className="mb-3 bg-slate-900/90 border border-purple-500/30 rounded-2xl p-3 space-y-3">
          <div className="text-xs font-black uppercase text-purple-300 tracking-wider">Audio Settings</div>
          
          {/* Music Volume */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-300 font-semibold">
              <span>🎵 Music Volume</span>
              <span className="font-mono text-cyan-400">{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
            />
          </div>

          {/* SFX Volume */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-300 font-semibold">
              <span>🔊 Effects Volume</span>
              <span className="font-mono text-amber-400">{Math.round(sfxVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={sfxVolume}
              onChange={(e) => setSfxVolume(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
          </div>
        </div>
      )}

      {/* Main Track Display Body */}
      <div className="flex items-center gap-3">
        {/* Album Artwork Visual */}
        <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${currentTrack.coverGradient} flex items-center justify-center shadow-lg border border-white/20 flex-shrink-0 overflow-hidden`}>
          <span className={`text-2xl filter drop-shadow-md transition-transform duration-700 ${isPlaying ? 'scale-110 rotate-6 animate-pulse' : ''}`}>
            {currentTrack.icon}
          </span>

          {/* Equalizer overlay */}
          {isPlaying && (
            <div className="absolute inset-0 bg-black/20 flex items-end justify-center gap-0.5 p-1">
              {Array.from(audioData.slice(0, 5)).map((val, idx) => (
                <span
                  key={idx}
                  className="w-1 bg-cyan-300/80 rounded-t transition-all duration-75"
                  style={{ height: `${Math.max(15, (val / 255) * 100)}%` }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Track Title & Artist Info */}
        <div className="flex-grow min-w-0">
          <h4 className="font-black text-sm text-white truncate drop-shadow">
            {currentTrack.title}
          </h4>
          <p className="text-xs text-purple-300/90 truncate font-medium">
            {currentTrack.artist}
          </p>
          <span className="inline-block mt-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-400 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
            {currentTrack.genre}
          </span>
        </div>
      </div>

      {/* Progress Bar (━━━━━━━━━━) */}
      <div className="mt-3 space-y-1">
        <div
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const percent = (clickX / rect.width) * 100;
            seek(percent);
          }}
          className="relative w-full h-2 bg-slate-900 rounded-full cursor-pointer overflow-hidden border border-slate-800 group"
        >
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full transition-all duration-150 relative"
            style={{ width: `${progress}%` }}
          >
            <span className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        <div className="flex justify-between text-[10px] text-slate-400 font-mono px-0.5">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Control Buttons Bar (◀  ❚❚  🔀  🔊) */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-purple-500/20">
        {/* Shuffle Toggle */}
        <button
          onClick={toggleShuffle}
          className={`p-2 rounded-xl transition ${
            shuffle
              ? 'bg-purple-600/40 text-purple-300 border border-purple-400/50'
              : 'text-slate-500 hover:text-slate-300'
          }`}
          title={shuffle ? 'Shuffle ON (Non-repeating)' : 'Shuffle OFF'}
        >
          <Shuffle className="w-4 h-4" />
        </button>

        {/* Previous Track */}
        <button
          onClick={() => {
            sounds.playClick();
            prevTrack();
          }}
          className="p-2 text-slate-300 hover:text-white transition active:scale-90"
          title="Previous Track"
        >
          <SkipBack className="w-4 h-4 fill-current" />
        </button>

        {/* Play / Pause Main Button */}
        <button
          onClick={togglePlay}
          className="p-3 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:scale-105 active:scale-95 transition shadow-lg shadow-purple-500/30 flex items-center justify-center"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5" />
          )}
        </button>

        {/* Next Track */}
        <button
          onClick={() => {
            sounds.playClick();
            nextTrack();
          }}
          className="p-2 text-slate-300 hover:text-white transition active:scale-90"
          title="Next Track"
        >
          <SkipForward className="w-4 h-4 fill-current" />
        </button>

        {/* Mute / Unmute Button */}
        <button
          onClick={toggleMute}
          className={`p-2 rounded-xl transition ${
            isMuted ? 'text-rose-400 bg-rose-950/40 border border-rose-800' : 'text-slate-300 hover:text-white'
          }`}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
