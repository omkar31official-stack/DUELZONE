import React, { useState } from 'react';
import { ALL_GAMES } from '../shared/constants.ts';
import { Swords, Users, Sparkles, ArrowRight } from 'lucide-react';
import { sounds } from '../lib/sound';

interface HomeProps {
  onCreateRoom: (name: string) => void;
  onJoinRoom: (code: string, name: string) => void;
}

export const HomePage: React.FC<HomeProps> = ({ onCreateRoom, onJoinRoom }) => {
  const [playerName, setPlayerName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [mode, setMode] = useState<'home' | 'create' | 'join'>('home');
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
    <div className="w-full max-w-6xl flex flex-col items-center gap-12 py-8">
      {/* Hero Section */}
      <div className="text-center space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-black uppercase tracking-widest">
          <Sparkles className="w-4 h-4" /> Next-Gen 2-Player Arcade
        </div>

        <h1 className="text-6xl sm:text-7xl font-black tracking-tight text-white">
          DUEL<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-amber-400">ZONE</span>
        </h1>

        <p className="text-lg text-slate-300 font-medium">
          Two Players. One Room. Endless Real-Time Duels.
        </p>
      </div>

      {/* Main Action Forms */}
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur">
        {mode === 'home' && (
          <div className="flex flex-col gap-4">
            <button
              onClick={() => { sounds.playClick(); setMode('create'); }}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 font-black text-lg text-white rounded-2xl shadow-xl transition active:scale-95 flex items-center justify-center gap-3 cursor-pointer"
            >
              <Swords className="w-5 h-5" /> CREATE PRIVATE ROOM
            </button>

            <button
              onClick={() => { sounds.playClick(); setMode('join'); }}
              className="w-full py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 font-black text-lg text-slate-200 rounded-2xl transition active:scale-95 flex items-center justify-center gap-3 cursor-pointer"
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
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white font-semibold focus:outline-none focus:border-purple-500"
              />
            </div>

            {error && <p className="text-xs font-bold text-rose-400">{error}</p>}

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => setMode('home')}
                className="px-4 py-3 bg-slate-800 text-slate-300 font-bold rounded-xl text-sm"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 font-black text-white rounded-xl shadow-lg transition active:scale-95 flex items-center justify-center gap-2"
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
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white font-semibold focus:outline-none focus:border-purple-500"
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
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-amber-400 font-mono tracking-widest text-center font-black text-lg focus:outline-none focus:border-purple-500"
              />
            </div>

            {error && <p className="text-xs font-bold text-rose-400">{error}</p>}

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => setMode('home')}
                className="px-4 py-3 bg-slate-800 text-slate-300 font-bold rounded-xl text-sm"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-pink-600 hover:bg-pink-500 font-black text-white rounded-xl shadow-lg transition active:scale-95 flex items-center justify-center gap-2"
              >
                JOIN ROOM <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Game Gallery */}
      <div className="w-full space-y-6">
        <h2 className="text-2xl font-black text-center text-white">MINI-GAME GALLERY</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {ALL_GAMES.map((game) => (
            <div
              key={game.id}
              className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-purple-500/50 transition shadow-lg"
            >
              <div className="space-y-3">
                <span className="text-4xl p-3 bg-slate-950 rounded-2xl border border-slate-800 inline-block">
                  {game.icon}
                </span>
                <h3 className="font-extrabold text-lg text-white">{game.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{game.description}</p>
              </div>

              <div className="flex items-center justify-between mt-6 pt-3 border-t border-slate-800/80 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                <span className="bg-purple-950/80 text-purple-300 border border-purple-800 px-2 py-0.5 rounded">
                  {game.category}
                </span>
                <span>{game.difficulty}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
