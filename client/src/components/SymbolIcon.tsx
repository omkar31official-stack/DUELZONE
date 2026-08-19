import React from 'react';

interface SymbolProps {
  id: string;
  size?: number | string;
  className?: string;
  onClick?: () => void;
}

export const SymbolIcon: React.FC<SymbolProps> = ({ id, className = "w-8 h-8", onClick }) => {
  const props = { className, onClick };
  switch (id) {
    case 'dice':
      return <span {...props} className={`${className} flex items-center justify-center text-red-400 font-extrabold`}>🎲</span>;
    case 'ball':
      return <span {...props} className={`${className} flex items-center justify-center text-blue-400 font-extrabold`}>⚽</span>;
    case 'star':
      return <span {...props} className={`${className} flex items-center justify-center text-yellow-400 font-extrabold`}>⭐</span>;
    case 'hammer':
      return <span {...props} className={`${className} flex items-center justify-center text-gray-400 font-extrabold`}>🔨</span>;
    case 'chest':
      return <span {...props} className={`${className} flex items-center justify-center text-amber-600 font-extrabold`}>📦</span>;
    case 'horseshoe':
      return <span {...props} className={`${className} flex items-center justify-center text-amber-400 font-extrabold`}>🧲</span>;
    case 'gem':
      return <span {...props} className={`${className} flex items-center justify-center text-cyan-400 font-extrabold`}>💎</span>;
    case 'hourglass':
      return <span {...props} className={`${className} flex items-center justify-center text-purple-400 font-extrabold`}>⏳</span>;
    case 'camera':
      return <span {...props} className={`${className} flex items-center justify-center text-slate-300 font-extrabold`}>📷</span>;
    case 'drop':
      return <span {...props} className={`${className} flex items-center justify-center text-blue-500 font-extrabold`}>💧</span>;
    case 'lock':
      return <span {...props} className={`${className} flex items-center justify-center text-yellow-600 font-extrabold`}>🔒</span>;
    case 'key':
      return <span {...props} className={`${className} flex items-center justify-center text-yellow-300 font-extrabold`}>🔑</span>;
    case 'shield':
      return <span {...props} className={`${className} flex items-center justify-center text-indigo-400 font-extrabold`}>🛡️</span>;
    case 'feather':
      return <span {...props} className={`${className} flex items-center justify-center text-teal-300 font-extrabold`}>🪶</span>;
    case 'mushroom':
      return <span {...props} className={`${className} flex items-center justify-center text-red-500 font-extrabold`}>🍄</span>;
    case 'lightning':
      return <span {...props} className={`${className} flex items-center justify-center text-yellow-400 font-extrabold`}>⚡</span>;
    case 'heart':
      return <span {...props} className={`${className} flex items-center justify-center text-rose-500 font-extrabold`}>❤️</span>;
    case 'crown':
      return <span {...props} className={`${className} flex items-center justify-center text-amber-300 font-extrabold`}>👑</span>;
    case 'anchor':
      return <span {...props} className={`${className} flex items-center justify-center text-slate-400 font-extrabold`}>⚓</span>;
    case 'bell':
      return <span {...props} className={`${className} flex items-center justify-center text-amber-400 font-extrabold`}>🔔</span>;
    case 'bomb':
      return <span {...props} className={`${className} flex items-center justify-center text-neutral-800 font-extrabold`}>💣</span>;
    case 'compass':
      return <span {...props} className={`${className} flex items-center justify-center text-emerald-400 font-extrabold`}>🧩</span>;
    case 'crystal':
      return <span {...props} className={`${className} flex items-center justify-center text-purple-300 font-extrabold`}>🔮</span>;
    case 'flame':
      return <span {...props} className={`${className} flex items-center justify-center text-orange-500 font-extrabold`}>🔥</span>;
    case 'flower':
      return <span {...props} className={`${className} flex items-center justify-center text-pink-400 font-extrabold`}>🌸</span>;
    case 'ghost':
      return <span {...props} className={`${className} flex items-center justify-center text-gray-200 font-extrabold`}>👻</span>;
    case 'globe':
      return <span {...props} className={`${className} flex items-center justify-center text-blue-300 font-extrabold`}>🌐</span>;
    case 'leaf':
      return <span {...props} className={`${className} flex items-center justify-center text-green-400 font-extrabold`}>🍃</span>;
    case 'moon':
      return <span {...props} className={`${className} flex items-center justify-center text-indigo-200 font-extrabold`}>🌙</span>;
    case 'ring':
      return <span {...props} className={`${className} flex items-center justify-center text-yellow-500 font-extrabold`}>💍</span>;
    case 'rocket':
      return <span {...props} className={`${className} flex items-center justify-center text-red-500 font-extrabold`}>🚀</span>;
    case 'scroll':
      return <span {...props} className={`${className} flex items-center justify-center text-amber-200 font-extrabold`}>📜</span>;
    case 'snowflake':
      return <span {...props} className={`${className} flex items-center justify-center text-cyan-200 font-extrabold`}>❄️</span>;
    case 'sword':
      return <span {...props} className={`${className} flex items-center justify-center text-slate-300 font-extrabold`}>⚔️</span>;
    case 'trophy':
      return <span {...props} className={`${className} flex items-center justify-center text-amber-400 font-extrabold`}>🏆</span>;
    case 'apple':
      return <span {...props} className={`${className} flex items-center justify-center text-red-600 font-extrabold`}>🍎</span>;
    case 'bone':
      return <span {...props} className={`${className} flex items-center justify-center text-neutral-300 font-extrabold`}>🦴</span>;
    case 'boot':
      return <span {...props} className={`${className} flex items-center justify-center text-amber-800 font-extrabold`}>🥾</span>;
    case 'bottle':
      return <span {...props} className={`${className} flex items-center justify-center text-emerald-300 font-extrabold`}>🍾</span>;
    case 'bow':
      return <span {...props} className={`${className} flex items-center justify-center text-amber-700 font-extrabold`}>🏹</span>;
    case 'bug':
      return <span {...props} className={`${className} flex items-center justify-center text-emerald-500 font-extrabold`}>🐛</span>;
    case 'candle':
      return <span {...props} className={`${className} flex items-center justify-center text-amber-300 font-extrabold`}>🕯️</span>;
    case 'clover':
      return <span {...props} className={`${className} flex items-center justify-center text-green-500 font-extrabold`}>🍀</span>;
    case 'crab':
      return <span {...props} className={`${className} flex items-center justify-center text-rose-600 font-extrabold`}>🦀</span>;
    case 'diamond':
      return <span {...props} className={`${className} flex items-center justify-center text-blue-400 font-extrabold`}>🔷</span>;
    case 'egg':
      return <span {...props} className={`${className} flex items-center justify-center text-yellow-100 font-extrabold`}>🥚</span>;
    case 'fan':
      return <span {...props} className={`${className} flex items-center justify-center text-indigo-300 font-extrabold`}>🪭</span>;
    case 'fish':
      return <span {...props} className={`${className} flex items-center justify-center text-sky-400 font-extrabold`}>🐟</span>;
    case 'fist':
      return <span {...props} className={`${className} flex items-center justify-center text-amber-600 font-extrabold`}>✊</span>;
    case 'flag':
      return <span {...props} className={`${className} flex items-center justify-center text-red-500 font-extrabold`}>🚩</span>;
    case 'guitar':
      return <span {...props} className={`${className} flex items-center justify-center text-orange-600 font-extrabold`}>🎸</span>;
    case 'hat':
      return <span {...props} className={`${className} flex items-center justify-center text-slate-800 font-extrabold`}>🎩</span>;
    case 'headphone':
      return <span {...props} className={`${className} flex items-center justify-center text-purple-400 font-extrabold`}>🎧</span>;
    case 'icecream':
      return <span {...props} className={`${className} flex items-center justify-center text-pink-300 font-extrabold`}>🍦</span>;
    case 'lantern':
      return <span {...props} className={`${className} flex items-center justify-center text-red-500 font-extrabold`}>🏮</span>;
    case 'lollipop':
      return <span {...props} className={`${className} flex items-center justify-center text-pink-500 font-extrabold`}>🍭</span>;
    case 'map':
      return <span {...props} className={`${className} flex items-center justify-center text-amber-200 font-extrabold`}>🗺️</span>;
    case 'mask':
      return <span {...props} className={`${className} flex items-center justify-center text-purple-400 font-extrabold`}>🎭</span>;
    case 'medal':
      return <span {...props} className={`${className} flex items-center justify-center text-yellow-400 font-extrabold`}>🥇</span>;
    case 'mirror':
      return <span {...props} className={`${className} flex items-center justify-center text-cyan-200 font-extrabold`}>🪞</span>;
    default:
      return <span {...props} className={`${className} flex items-center justify-center text-gray-300 font-extrabold`}>❓</span>;
  }
};
