import React from 'react';
import { GameMetadata } from '../shared/types';
import { Play, Sparkles, Shuffle, Flame, Users, Trophy } from 'lucide-react';
import { sounds } from '../lib/sound';

interface HeroStageProps {
  featuredGame: GameMetadata;
  onSelectGame: (gameId: string) => void;
  onRandomGame: () => void;
  onQuickPlay: () => void;
}

export const HeroStage: React.FC<HeroStageProps> = ({
  featuredGame,
  onSelectGame,
  onRandomGame,
  onQuickPlay,
}) => {
  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-2xl shadow-2xl p-6 md:p-10 mb-8">
      {/* Ambient Radial Background Glow */}
      <div className="absolute -right-20 -top-20 w-96 h-96 bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-gradient-to-tr from-pink-500/20 via-indigo-500/20 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
        {/* Left Column: Hero Text & Actions */}
        <div className="flex flex-col gap-4 max-w-xl text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-400 text-xs font-black uppercase tracking-wider self-center lg:self-start shadow-md">
            <Flame className="w-4 h-4 fill-cyan-400" /> FEATURED ARENA DUEL
          </div>

          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-none">
            {featuredGame.title}
          </h1>

          <p className="text-sm md:text-base text-slate-300 font-medium leading-relaxed">
            {featuredGame.description}
          </p>

          {/* Quick Details Badges */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 my-1">
            <span className="px-3 py-1 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-cyan-400" /> {featuredGame.playerCount || '2 Players'}
            </span>
            <span className="px-3 py-1 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400" /> {featuredGame.difficulty || 'MEDIUM'}
            </span>
            <span className="px-3 py-1 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-bold text-slate-300">
              ⚡ {featuredGame.duration || '2-3m'}
            </span>
          </div>

          {/* Hero Action Buttons */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mt-2">
            <button
              onClick={() => {
                sounds.playClick();
                onSelectGame(featuredGame.id);
              }}
              className="btn-primary flex items-center gap-2.5 text-base px-6 py-3.5 shadow-cyan-500/20 active:scale-95 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-slate-950 text-slate-950" /> LAUNCH ARENA
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                onRandomGame();
              }}
              className="btn-secondary flex items-center gap-2 text-sm px-5 py-3.5 active:scale-95 cursor-pointer"
            >
              <Shuffle className="w-4 h-4 text-purple-400" /> RANDOM DUEL
            </button>
          </div>
        </div>

        {/* Right Column: Interactive Featured Card Preview */}
        <div className="relative w-full max-w-sm aspect-[4/3] rounded-2xl overflow-hidden border-2 border-slate-700/60 bg-slate-950 shadow-2xl group cursor-pointer transition-transform hover:scale-[1.02]">
          {/* Card Thumbnail / Icon Representation */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/60 via-purple-900/40 to-slate-950 flex flex-col items-center justify-center p-6 text-center">
            <span className="text-7xl mb-3 filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] transition-transform group-hover:scale-110">
              {featuredGame.thumbnail || '⚔️'}
            </span>
            <span className="font-black text-xl text-white tracking-wide group-hover:text-cyan-300 transition-colors">
              {featuredGame.title}
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">
              {featuredGame.category}
            </span>
          </div>

          {/* Hover Overlay Button */}
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              onClick={() => {
                sounds.playClick();
                onSelectGame(featuredGame.id);
              }}
              className="px-6 py-3 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black rounded-xl shadow-xl flex items-center gap-2 transition transform scale-90 group-hover:scale-100 cursor-pointer"
            >
              <Sparkles className="w-5 h-5" /> ENTER BATTLE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
