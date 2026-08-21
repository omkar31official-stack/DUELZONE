import React, { useMemo, useState } from 'react';
import { ALL_GAMES } from '../shared/constants.ts';
import { Swords, Users, Sparkles, ArrowRight, Gamepad2, Crown, Zap } from 'lucide-react';
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

  return (
    <div className="relative z-10 w-full max-w-7xl flex flex-col items-center gap-12 py-8">
      {/* Hero Section */}
      <div className="relative w-full overflow-hidden rounded-[2rem] border border-cyan-300/20 bg-slate-950/75 px-6 py-10 text-center shadow-[0_0_80px_rgba(34,211,238,.12)] sm:px-10 sm:py-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(217,70,239,.28),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(34,211,238,.22),transparent_30%),linear-gradient(135deg,rgba(251,191,36,.08),transparent_40%)]" />
        <div className="relative mx-auto max-w-4xl space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.3em] text-cyan-200">
            <Sparkles className="w-4 h-4" /> 16 real-time games · 2-5 players
          </div>

          <h1 className="text-6xl font-black tracking-tighter text-white sm:text-8xl lg:text-9xl">
            DUEL<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-fuchsia-400 to-amber-300">ZONE</span>
          </h1>

          <p className="mx-auto max-w-2xl text-base font-semibold leading-7 text-slate-300 sm:text-xl">
            Create a private room, invite friends, and jump between polished arcade duels and party games built for up to five players.
          </p>

          <div className="grid gap-3 pt-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-700/80 bg-slate-900/70 p-4">
              <Gamepad2 className="mx-auto mb-2 h-6 w-6 text-cyan-300" />
              <p className="text-2xl font-black text-white">16</p>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Mini games</p>
            </div>
            <div className="rounded-2xl border border-slate-700/80 bg-slate-900/70 p-4">
              <Users className="mx-auto mb-2 h-6 w-6 text-fuchsia-300" />
              <p className="text-2xl font-black text-white">2-5</p>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Players/room</p>
            </div>
            <div className="rounded-2xl border border-slate-700/80 bg-slate-900/70 p-4">
              <Zap className="mx-auto mb-2 h-6 w-6 text-amber-300" />
              <p className="text-2xl font-black text-white">Live</p>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Socket rooms</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Action Forms */}
      <div className="w-full max-w-md rounded-[2rem] border border-slate-700/80 bg-slate-900/90 p-8 shadow-2xl shadow-fuchsia-950/20 backdrop-blur">
        {mode === 'home' && (
          <div className="flex flex-col gap-4">
            <button
              onClick={() => { sounds.playClick(); setMode('create'); }}
              className="w-full py-4 bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-amber-300 hover:brightness-110 font-black text-lg text-slate-950 rounded-2xl shadow-xl transition active:scale-95 flex items-center justify-center gap-3 cursor-pointer focus-visible:outline focus-visible:outline-4 focus-visible:outline-cyan-300"
            >
              <Swords className="w-5 h-5" /> CREATE PRIVATE ROOM
            </button>

            <button
              onClick={() => { sounds.playClick(); setMode('join'); }}
              className="w-full py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 font-black text-lg text-slate-200 rounded-2xl transition active:scale-95 flex items-center justify-center gap-3 cursor-pointer focus-visible:outline focus-visible:outline-4 focus-visible:outline-fuchsia-300"
            >
              <Users className="w-5 h-5" /> JOIN ROOM WITH CODE
            </button>
          </div>
        )}

        {mode === 'create' && (
          <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4">
            <h3 className="text-xl font-black text-white">CREATE ROOM</h3>
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
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white font-semibold focus:outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/15"
              />
            </div>

            {error && <p className="text-xs font-bold text-rose-400">{error}</p>}

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => setMode('home')}
                className="px-4 py-3 bg-slate-800 text-slate-300 font-bold rounded-xl text-sm hover:bg-slate-700"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-cyan-400 hover:bg-cyan-300 font-black text-slate-950 rounded-xl shadow-lg transition active:scale-95 flex items-center justify-center gap-2"
              >
                CREATE ROOM <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {mode === 'join' && (
          <form onSubmit={handleJoinSubmit} className="flex flex-col gap-4">
            <h3 className="text-xl font-black text-white">JOIN ROOM</h3>
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
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white font-semibold focus:outline-none focus:border-fuchsia-400 focus:ring-4 focus:ring-fuchsia-400/15"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Room Code (6 Characters)
              </label>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => { setJoinCode(e.target.value.toUpperCase()); setError(''); }}
                placeholder="e.g. AB7K9Q"
                maxLength={6}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-amber-300 font-mono tracking-widest text-center font-black text-lg focus:outline-none focus:border-fuchsia-400 focus:ring-4 focus:ring-fuchsia-400/15"
              />
            </div>

            {error && <p className="text-xs font-bold text-rose-400">{error}</p>}

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => setMode('home')}
                className="px-4 py-3 bg-slate-800 text-slate-300 font-bold rounded-xl text-sm hover:bg-slate-700"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-fuchsia-500 hover:bg-fuchsia-400 font-black text-white rounded-xl shadow-lg transition active:scale-95 flex items-center justify-center gap-2"
              >
                JOIN ROOM <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Game Gallery */}
      <div className="w-full space-y-6">
        <h2 className="text-2xl font-black text-center text-white">ARCADE GAME WALL</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {ALL_GAMES.map((game) => (
            <div
              key={game.id}
              className="bg-slate-900/70 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between hover:border-cyan-300/50 hover:-translate-y-1 transition shadow-lg"
            >
              <div className="space-y-3">
                <span className="text-4xl p-3 bg-slate-950 rounded-2xl border border-slate-800 inline-block shadow-inner">
                  {game.icon}
                </span>
                <h3 className="font-extrabold text-lg text-white">{game.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{game.description}</p>
              </div>

              <div className="flex items-center justify-between mt-6 pt-3 border-t border-slate-800/80 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                <span className="bg-cyan-950/80 text-cyan-200 border border-cyan-800 px-2 py-0.5 rounded">
                  {game.category}
                </span>
                <span className="inline-flex items-center gap-1"><Crown className="h-3 w-3" /> {game.minPlayers}-{game.maxPlayers}P</span>
                <span>{game.difficulty}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
