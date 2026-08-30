import React, { useMemo, useState, useEffect } from 'react';
import { ALL_GAMES } from '../shared/constants';
import { GameCategory, GameDefinitionMeta } from '../shared/types';
import {
  Swords, Users, Sparkles, ArrowRight, Gamepad2, Zap, Search, Heart, Shuffle, Play
} from 'lucide-react';
import { sounds } from '../lib/sound';

interface HomeProps {
  onCreateRoom: (name: string) => void;
  onJoinRoom: (code: string, name: string) => void;
}

export const HomePage: React.FC<HomeProps> = ({ onCreateRoom, onJoinRoom }) => {
  const [playerName, setPlayerName] = useState('');
  const inviteCode = useMemo(() => new URLSearchParams(window.location.search).get('code')?.toUpperCase() || '', []);
  const [joinCode, setJoinCode] = useState(inviteCode);
  const [mode, setMode] = useState<'home' | 'create' | 'join'>(inviteCode ? 'join' : 'home');
  const [error, setError] = useState('');

  // GamingSphere Gallery Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('duelzone_favorites') || '[]');
    } catch {
      return [];
    }
  });

  const toggleFavorite = (gameId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playClick();
    const updated = favorites.includes(gameId)
      ? favorites.filter((id) => id !== gameId)
      : [...favorites, gameId];
    setFavorites(updated);
    localStorage.setItem('duelzone_favorites', JSON.stringify(updated));
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) {
      setError('Please enter a player name!');
      return;
    }
    sounds.playClick();
    onCreateRoom(playerName.trim());
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) {
      setError('Please enter a player name!');
      return;
    }
    if (!joinCode.trim() || joinCode.trim().length !== 6) {
      setError('Enter a valid 6-character room code!');
      return;
    }
    sounds.playClick();
    onJoinRoom(joinCode.trim().toUpperCase(), playerName.trim());
  };

  const categories: { key: string; label: string; icon: string }[] = [
    { key: 'ALL', label: 'All Games', icon: '🎮' },
    { key: 'FEATURED', label: 'Featured', icon: '🔥' },
    { key: 'POPULAR', label: 'Popular', icon: '👑' },
    { key: 'NEW', label: 'New', icon: '✨' },
    { key: 'FAVORITES', label: 'Favorites', icon: '❤️' },
    { key: 'ESCAPE', label: 'Escape Room', icon: '🔐' },
    { key: 'RIDDLES', label: 'Riddles', icon: '❓' },
    { key: 'BRAIN', label: 'Brain & Logic', icon: '🧠' },
    { key: 'BOARD', label: 'Board Games', icon: '🎲' },
    { key: 'ARCADE', label: 'Arcade', icon: '🕹️' },
    { key: 'ACTION', label: 'Action', icon: '⚔️' },
    { key: 'SPORTS', label: 'Sports', icon: '⚽' },
    { key: 'REFLEX', label: 'Reflex', icon: '⚡' },
    { key: 'STRATEGY', label: 'Strategy', icon: '♟️' },
    { key: 'MIND', label: 'Mind & Puzzle', icon: '🧩' },
  ];

  const filteredGames = useMemo(() => {
    return ALL_GAMES.filter((game) => {
      // Category filter
      if (selectedCategory === 'FEATURED' && !game.featured) return false;
      if (selectedCategory === 'POPULAR' && !game.popular) return false;
      if (selectedCategory === 'NEW' && !game.isNew) return false;
      if (selectedCategory === 'FAVORITES' && !favorites.includes(game.id)) return false;
      if (
        !['ALL', 'FEATURED', 'POPULAR', 'NEW', 'FAVORITES'].includes(selectedCategory) &&
        game.category !== selectedCategory
      ) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          game.name.toLowerCase().includes(q) ||
          game.description.toLowerCase().includes(q) ||
          game.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [selectedCategory, searchQuery, favorites]);

  const handleRandomPick = () => {
    sounds.playClick();
    if (filteredGames.length > 0) {
      const randomIndex = Math.floor(Math.random() * filteredGames.length);
      const game = filteredGames[randomIndex];
      alert(`🎲 Random Pick: ${game.name}!\nCreate a room to play this game.`);
    }
  };

  return (
    <div className="relative z-10 w-full max-w-7xl flex flex-col items-center gap-10 py-8 px-4">
      {/* GamingSphere Hero Banner */}
      <div className="relative w-full overflow-hidden rounded-3xl border border-cyan-400/30 bg-slate-950/80 px-6 py-12 text-center shadow-[0_0_90px_rgba(34,211,238,0.15)] sm:px-12 sm:py-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(217,70,239,0.3),transparent_40%),radial-gradient(circle_at_80%_10%,rgba(34,211,238,0.25),transparent_40%),linear-gradient(135deg,rgba(251,191,36,0.1),transparent_50%)]" />
        
        <div className="relative mx-auto max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-4 py-2 text-xs font-black uppercase tracking-[0.3em] text-cyan-200">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" /> 40+ Real-Time Multiplayer Mini-Games
          </div>

          <h1 className="text-6xl font-black tracking-wider text-white sm:text-8xl lg:text-9xl drop-shadow-[0_0_20px_rgba(168,85,247,0.8)]">
            DUEL<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500">ZONE</span>
          </h1>

          <p className="mx-auto max-w-2xl text-base font-semibold leading-relaxed text-slate-300 sm:text-xl">
            The ultimate 2-player & multi-player online gaming arena. Create private rooms, challenge friends, and experience instant arcade battles!
          </p>

          {/* Quick Stats Grid */}
          <div className="grid gap-4 pt-4 grid-cols-2 sm:grid-cols-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg">
              <Gamepad2 className="mx-auto mb-1 h-6 w-6 text-cyan-400" />
              <p className="text-2xl font-black text-white">{ALL_GAMES.length}</p>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">MINI GAMES</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg">
              <Users className="mx-auto mb-1 h-6 w-6 text-pink-400" />
              <p className="text-2xl font-black text-white">2 - 5</p>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">PLAYERS / ROOM</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg">
              <Zap className="mx-auto mb-1 h-6 w-6 text-amber-400" />
              <p className="text-2xl font-black text-white">Instant</p>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">SERIES MATCHES</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg">
              <Sparkles className="mx-auto mb-1 h-6 w-6 text-emerald-400" />
              <p className="text-2xl font-black text-white">100%</p>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">FREE & SYNCED</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Room Action Card */}
      <div className="w-full max-w-lg glass-card-highlight p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500" />

        {mode === 'home' && (
          <div className="flex flex-col gap-4">
            <button
              onClick={() => { sounds.playClick(); setMode('create'); }}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-600 hover:from-cyan-400 hover:to-pink-500 font-black tracking-widest text-base text-white rounded-2xl shadow-xl transition active:scale-95 flex items-center justify-center gap-3 cursor-pointer"
            >
              <Swords className="w-5 h-5" /> CREATE PRIVATE ROOM
            </button>

            <button
              onClick={() => { sounds.playClick(); setMode('join'); }}
              className="w-full py-4 bg-slate-900 hover:bg-slate-800 border-2 border-purple-500/50 font-black tracking-widest text-base text-purple-300 rounded-2xl transition active:scale-95 flex items-center justify-center gap-3 cursor-pointer"
            >
              <Users className="w-5 h-5" /> JOIN ROOM WITH CODE
            </button>
          </div>
        )}

        {mode === 'create' && (
          <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4">
            <h3 className="text-xl font-black text-white text-center">CREATE A PRIVATE ROOM</h3>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Your Player Name
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => { setPlayerName(e.target.value); setError(''); }}
                placeholder="e.g. Omkar, Shadow, Tiger"
                maxLength={16}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:border-cyan-400 transition"
              />
            </div>

            {error && <p className="text-xs font-bold text-rose-400">{error}</p>}

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => setMode('home')}
                className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-sm transition"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 font-black text-white rounded-xl shadow-lg transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                CREATE ROOM <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {mode === 'join' && (
          <form onSubmit={handleJoinSubmit} className="flex flex-col gap-4">
            <h3 className="text-xl font-black text-white text-center">JOIN ROOM</h3>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Your Player Name
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => { setPlayerName(e.target.value); setError(''); }}
                placeholder="e.g. Rahul, Viper"
                maxLength={16}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:border-purple-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Room Code (6 Digits)
              </label>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => { setJoinCode(e.target.value.toUpperCase()); setError(''); }}
                placeholder="e.g. 849201"
                maxLength={6}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-purple-400 font-black tracking-[0.3em] text-center text-lg focus:outline-none focus:border-purple-500 transition uppercase"
              />
            </div>

            {error && <p className="text-xs font-bold text-rose-400">{error}</p>}

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => setMode('home')}
                className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-sm transition"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 font-black text-white rounded-xl shadow-lg transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                JOIN ROOM <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>

      {/* GamingSphere Interactive Game Wall & Filter Bar */}
      <div className="w-full space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-3xl font-black text-white flex items-center gap-3">
              <span>EXPLORE GAME ARENA</span>
              <span className="text-xs font-extrabold px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full">
                {filteredGames.length} GAMES
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Select any game to preview features or challenge friends in room lobby
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search Bar */}
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search games..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 font-medium"
              />
            </div>

            {/* Random Pick Button */}
            <button
              onClick={handleRandomPick}
              className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-purple-400 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shrink-0"
              title="Pick Random Game"
            >
              <Shuffle className="w-4 h-4" /> <span className="hidden sm:inline">RANDOM</span>
            </button>
          </div>
        </div>

        {/* Category Pills Navigation Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => { sounds.playClick(); setSelectedCategory(cat.key); }}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 whitespace-nowrap transition cursor-pointer border ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white border-cyan-400 shadow-lg scale-105'
                    : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredGames.map((game) => {
            const isFav = favorites.includes(game.id);

            return (
              <div
                key={game.id}
                className="group relative bg-slate-900/80 border border-slate-800/90 rounded-3xl p-5 flex flex-col justify-between hover:border-cyan-400/50 hover:-translate-y-1.5 transition duration-300 shadow-xl overflow-hidden cursor-pointer"
                onClick={() => {
                  sounds.playClick();
                  setMode('create');
                }}
              >
                {/* Glowing hover accent */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 to-pink-500 opacity-0 group-hover:opacity-100 transition" />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-4xl p-3.5 bg-slate-950 rounded-2xl border border-slate-800/80 shadow-inner group-hover:scale-110 transition">
                      {game.icon}
                    </span>

                    <button
                      onClick={(e) => toggleFavorite(game.id, e)}
                      className={`p-2 rounded-full border transition ${
                        isFav
                          ? 'bg-rose-500/20 border-rose-500/40 text-rose-500'
                          : 'bg-slate-950 border-slate-800 text-slate-600 hover:text-rose-400'
                      }`}
                      title={isFav ? 'Remove Favorite' : 'Add Favorite'}
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500' : ''}`} />
                    </button>
                  </div>

                  <div>
                    <h3 className="font-black text-lg text-white group-hover:text-cyan-300 transition">
                      {game.name}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed mt-1 line-clamp-2 font-medium">
                      {game.description}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  <span className="px-2.5 py-1 rounded-lg bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
                    {game.category}
                  </span>
                  <span className="text-slate-400 font-bold">{game.difficulty}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
