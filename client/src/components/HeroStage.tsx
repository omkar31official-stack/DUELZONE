import React from 'react';
import { GameDefinitionMeta } from '../shared/types';
import { Play, Sparkles, Shuffle, Flame, Users, Trophy } from 'lucide-react';
import { sounds } from '../lib/sound';

interface HeroStageProps {
  featuredGame: GameDefinitionMeta;
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
    <div className="relative w-full rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/80 border border-slate-800 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden shadow-2xl">
      {/* Glow Effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full filter blur-3xl pointer-events-none" />

      {/* Hero Info */}
      <div className="relative z-10 flex flex-col gap-3 max-w-xl text-center md:text-left">
        <div className="flex items-center justify-center md:justify-start gap-2">
          <span className="px-3 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/30 text-cyan-300 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 fill-cyan-400 text-cyan-400" /> SPOTLIGHT DUEL
          </span>
          <span className="px-3 py-1 rounded-full bg-indigo-400/10 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
            {featuredGame.category}
          </span>
        </div>

        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white drop-shadow-md">
          {featuredGame.name}
        </h1>

        <p className="text-slate-300 text-sm md:text-base leading-relaxed line-clamp-2">
          {featuredGame.description}
        </p>

        {/* Stats Row */}
        <div className="flex items-center justify-center md:justify-start gap-4 text-xs font-semibold text-slate-300 pt-2">
          <span className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
            <Users className="w-3.5 h-3.5 text-cyan-400" /> {featuredGame.minPlayers}-{featuredGame.maxPlayers} Players
          </span>
          <span className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
            <Trophy className="w-3.5 h-3.5 text-amber-400" /> Arcade Match
          </span>
          <span className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800 text-amber-300">
            ⚡ {featuredGame.estimatedMinutes || '2-3m'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4">
          <button
            onClick={() => {
              sounds.playClick();
              onSelectGame(featuredGame.id);
            }}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center gap-2 hover:scale-105 active:scale-95 transition shadow-lg shadow-cyan-500/20 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" /> PLAY SPOTLIGHT
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onRandomGame();
            }}
            className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm flex items-center gap-2 transition active:scale-95 cursor-pointer border border-slate-700"
          >
            <Shuffle className="w-4 h-4 text-slate-400" /> RANDOM DUEL
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onQuickPlay();
            }}
            className="px-5 py-3 rounded-2xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 font-bold text-sm flex items-center gap-2 transition active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" /> QUICK MATCH
          </button>
        </div>
      </div>

      {/* Hero Visual Card */}
      <div className="relative z-10 flex-shrink-0 w-48 h-48 md:w-64 md:h-64 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col items-center justify-center p-6 shadow-2xl group hover:border-cyan-500/50 transition duration-500">
        <span className="text-8xl filter drop-shadow-2xl transform group-hover:scale-110 transition-transform duration-500">
          {featuredGame.icon || '⚔️'}
        </span>
        <span className="mt-3 text-xs font-black uppercase text-cyan-400 tracking-wider">
          {featuredGame.name}
        </span>
      </div>
    </div>
  );
};
