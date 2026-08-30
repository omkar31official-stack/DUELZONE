import React from 'react';
import { useMusic } from '../../music/MusicContext';
import { Music, Volume2, VolumeX, Sparkles } from 'lucide-react';

export const MusicButton: React.FC = () => {
  const { currentTrack, isPlaying, isMuted, playRandomTrack, toggleWidget, widgetOpen } = useMusic();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isPlaying && !widgetOpen) {
      // First click: select random track and open player widget
      playRandomTrack();
      toggleWidget();
    } else {
      // Subsequent clicks: toggle widget view or pick next random track if double clicked
      toggleWidget();
    }
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={handleClick}
        className={`relative group px-3.5 py-2 rounded-2xl border transition-all duration-300 flex items-center gap-2 cursor-pointer font-extrabold text-xs tracking-wider backdrop-blur-md shadow-lg ${
          isPlaying
            ? 'bg-gradient-to-r from-purple-900/90 to-indigo-900/90 border-purple-400/50 text-purple-200 shadow-purple-500/20 scale-105'
            : 'bg-slate-900/80 hover:bg-slate-800 border-slate-700/80 text-slate-300 hover:text-white hover:border-slate-600'
        }`}
        title="Toggle DUELZONE Party Music"
      >
        {/* Animated Equalizer or Pulsing Music Note */}
        {isPlaying ? (
          <div className="flex items-end gap-0.5 h-3.5 w-3.5">
            <span className="w-1 bg-cyan-400 rounded-full animate-bounce [animation-delay:0ms] h-full" />
            <span className="w-1 bg-purple-400 rounded-full animate-bounce [animation-delay:150ms] h-3/4" />
            <span className="w-1 bg-pink-400 rounded-full animate-bounce [animation-delay:300ms] h-full" />
          </div>
        ) : (
          <Music className="w-4 h-4 text-purple-400 group-hover:rotate-12 transition-transform" />
        )}

        <span className="truncate max-w-[90px] md:max-w-[120px]">
          {isPlaying && currentTrack ? currentTrack.title : '🎵 Music'}
        </span>

        {/* Mute status badge */}
        {isMuted && (
          <VolumeX className="w-3.5 h-3.5 text-rose-400" />
        )}

        {/* Pulse ring when playing */}
        {isPlaying && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500" />
          </span>
        )}
      </button>
    </div>
  );
};
