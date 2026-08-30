import React from 'react';
import { Player } from '../shared/types';
import { Crown, Shield, Zap, CheckCircle2, Clock } from 'lucide-react';

interface PlayerIdentityProps {
  player: Player | null;
  isCurrentPlayer?: boolean;
  score?: number;
  isReady?: boolean;
  size?: 'sm' | 'md' | 'lg';
  compact?: boolean;
  align?: 'left' | 'right' | 'center';
}

const AVATAR_EMOJIS = ['⚡', '🔥', '👑', '🎯', '👾', '🚀', '🔮', '⚔️'];

export const PlayerIdentity: React.FC<PlayerIdentityProps> = ({
  player,
  isCurrentPlayer = false,
  score = 0,
  isReady = false,
  size = 'md',
  compact = false,
  align = 'left',
}) => {
  if (!player) {
    return (
      <div
        className={`flex items-center gap-3 p-3 rounded-2xl border-2 border-dashed border-slate-800 bg-slate-900/40 text-slate-500 ${
          align === 'right' ? 'flex-row-reverse' : ''
        }`}
      >
        <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-xl animate-pulse">
          👤
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-500">Waiting for player...</span>
          <span className="text-[10px] text-slate-600">Share room code to invite</span>
        </div>
      </div>
    );
  }

  // Derive avatar emoji from player ID string
  const charCodeSum = player.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const avatarEmoji = AVATAR_EMOJIS[charCodeSum % AVATAR_EMOJIS.length];

  const sizeClasses = {
    sm: 'w-10 h-10 text-base',
    md: 'w-14 h-14 text-2xl',
    lg: 'w-20 h-20 text-4xl',
  }[size];

  return (
    <div
      className={`flex items-center gap-3.5 p-3.5 rounded-2xl border transition-all duration-300 ${
        isCurrentPlayer
          ? 'bg-slate-900/90 border-cyan-500/50 shadow-[0_0_20px_rgba(34,211,238,0.15)]'
          : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
      } ${align === 'right' ? 'flex-row-reverse text-right' : ''}`}
    >
      {/* Avatar Container with Glow & Badge */}
      <div className="relative">
        <div
          className={`${sizeClasses} rounded-2xl bg-gradient-to-br ${
            isCurrentPlayer ? 'from-cyan-600 to-indigo-600' : 'from-purple-600 to-pink-600'
          } p-0.5 shadow-lg flex items-center justify-center transition-transform hover:scale-105`}
        >
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <span>{avatarEmoji}</span>
          </div>
        </div>

        {player.isHost && (
          <div
            className="absolute -top-2 -right-2 p-1 bg-amber-500 text-slate-950 rounded-full shadow-md border border-amber-300"
            title="Room Host"
          >
            <Crown className="w-3.5 h-3.5 stroke-[3]" />
          </div>
        )}
      </div>

      {/* Player Details */}
      {!compact && (
        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm text-slate-100 truncate max-w-[120px]">
              {player.name}
            </span>
            {isCurrentPlayer && (
              <span className="text-[10px] font-black uppercase text-cyan-400 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-800">
                YOU
              </span>
            )}
          </div>

          {/* Status or Score */}
          <div className="flex items-center gap-2">
            {score !== undefined && (
              <span className="text-xs font-black text-amber-400 flex items-center gap-1">
                <Zap className="w-3 h-3 fill-amber-400" /> {score} PTS
              </span>
            )}
            {isReady !== undefined && (
              <span
                className={`text-[10px] font-bold flex items-center gap-1 px-2 py-0.5 rounded-full border ${
                  isReady
                    ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
                    : 'bg-slate-800/80 text-slate-400 border-slate-700'
                }`}
              >
                {isReady ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                {isReady ? 'READY' : 'NOT READY'}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
