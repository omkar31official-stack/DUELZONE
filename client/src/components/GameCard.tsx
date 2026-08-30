import React, { useState } from 'react';
import { GameMetadata } from '../shared/types';
import { Play, Star, Users, Clock, Info } from 'lucide-react';
import { sounds } from '../lib/sound';

interface GameCardProps {
  game: GameMetadata;
  isSelected?: boolean;
  isFavorite?: boolean;
  onSelect: (gameId: string) => void;
  onToggleFavorite?: (gameId: string) => void;
}

export const GameCard: React.FC<GameCardProps> = ({
  game,
  isSelected = false,
  isFavorite = false,
  onSelect,
  onToggleFavorite,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div
      className={`relative group rounded-3xl transition-all duration-300 flex flex-col justify-between overflow-hidden border cursor-pointer ${
        isSelected
          ? 'bg-slate-900/90 border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.2)] scale-[1.02]'
          : 'bg-slate-900/60 hover:bg-slate-900/90 border-slate-800/80 hover:border-slate-700 hover:shadow-2xl hover:-translate-y-1'
      }`}
    >
      {/* Top Banner & Thumbnail */}
      <div className="relative w-full h-36 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/60 flex items-center justify-center p-4 overflow-hidden">
        {/* Subtle Background Icon Pattern */}
        <span className="absolute text-9xl opacity-10 select-none pointer-events-none transform -rotate-12 group-hover:scale-125 transition-transform duration-500">
          {game.thumbnail || '🎮'}
        </span>

        {/* Center Thumbnail */}
        <span className="relative text-6xl filter drop-shadow-lg transform group-hover:scale-110 transition-transform duration-300">
          {game.thumbnail || '🎮'}
        </span>

        {/* Favorite Button (Top Right) */}
        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              sounds.playClick();
              onToggleFavorite(game.id);
            }}
            className="absolute top-3 right-3 p-2 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-slate-400 hover:text-amber-400 active:scale-90 transition cursor-pointer"
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
          </button>
        )}

        {/* Category Badge (Top Left) */}
        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md border border-slate-800 text-[10px] font-black uppercase text-cyan-400 tracking-wider">
          {game.category}
        </span>
      </div>

      {/* Card Body */}
      <div className="p-4 flex flex-col gap-2 flex-grow justify-between">
        <div>
          <h3 className="font-extrabold text-lg text-white group-hover:text-cyan-300 transition-colors truncate">
            {game.title}
          </h3>
          <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
            {game.description}
          </p>
        </div>

        {/* Metadata Strip */}
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 pt-2 border-t border-slate-800/60 mt-2">
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-slate-500" /> {game.playerCount || '2 Players'}
          </span>
          <span className="flex items-center gap-1 text-amber-400/90">
            <Clock className="w-3.5 h-3.5" /> {game.duration || '2m'}
          </span>
        </div>

        {/* Play Action Button */}
        <button
          onClick={() => {
            sounds.playClick();
            onSelect(game.id);
          }}
          className={`w-full py-2.5 mt-2 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer ${
            isSelected
              ? 'bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-400/20'
              : 'bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-200 shadow-md'
          }`}
        >
          <Play className="w-3.5 h-3.5 fill-current" /> {isSelected ? 'READY TO PLAY' : 'SELECT GAME'}
        </button>
      </div>
    </div>
  );
};
