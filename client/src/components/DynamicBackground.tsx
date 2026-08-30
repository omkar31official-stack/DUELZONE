import React from 'react';

export type BackgroundContext = 'home' | 'lobby' | 'selecting' | 'playing' | 'winner' | 'waiting';

interface DynamicBackgroundProps {
  context: BackgroundContext;
  gameCategory?: string;
}

export const DynamicBackground: React.FC<DynamicBackgroundProps> = ({ context, gameCategory }) => {
  // Theme gradients based on current context and category
  const getThemeGradients = () => {
    switch (context) {
      case 'winner':
        return 'from-amber-900/40 via-yellow-900/20 to-purple-950/60';
      case 'lobby':
      case 'waiting':
        return 'from-indigo-950/60 via-slate-950 to-purple-950/50';
      case 'playing':
        if (gameCategory === 'SPORTS') return 'from-emerald-950/50 via-slate-950 to-teal-950/40';
        if (gameCategory === 'BRAIN' || gameCategory === 'PUZZLE' || gameCategory === 'ESCAPE') return 'from-purple-950/50 via-slate-950 to-indigo-950/50';
        if (gameCategory === 'ARCADE' || gameCategory === 'REFLEX') return 'from-cyan-950/50 via-slate-950 to-rose-950/40';
        if (gameCategory === 'STRATEGY' || gameCategory === 'BOARD') return 'from-blue-950/50 via-slate-950 to-slate-900';
        return 'from-slate-950 via-slate-900 to-purple-950/40';
      case 'selecting':
        return 'from-cyan-950/30 via-slate-950 to-pink-950/30';
      case 'home':
      default:
        return 'from-slate-950 via-indigo-950/30 to-slate-950';
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden transition-colors duration-1000">
      {/* Base Gradient Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getThemeGradients()} transition-all duration-1000`} />

      {/* Cyber Grid Plane */}
      <div className="absolute inset-0 opacity-20 scanlines" />
      <div className="arcade-bg opacity-40 inset-0 absolute" />

      {/* Dynamic Ambient Light Orbs */}
      <div
        className={`absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl transition-all duration-1000 ${
          context === 'winner'
            ? 'bg-amber-500/20 animate-pulse'
            : context === 'playing'
            ? 'bg-cyan-500/15 animate-pulse'
            : 'bg-purple-500/15'
        }`}
      />
      <div
        className={`absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-3xl transition-all duration-1000 ${
          context === 'winner'
            ? 'bg-yellow-500/20 animate-pulse'
            : context === 'playing'
            ? 'bg-fuchsia-500/15 animate-pulse'
            : 'bg-indigo-500/15'
        }`}
      />

      {/* Subtle Motion Particles / Ambient Glow Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(5,8,22,0.8)_100%)]" />
    </div>
  );
};
