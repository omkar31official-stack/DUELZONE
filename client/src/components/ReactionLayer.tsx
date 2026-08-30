import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { InGameReaction, ChatMessage } from '../shared/types';
import { REACTION_EMOTES } from '../shared/constants';
import { sounds } from '../lib/sound';

interface FloatingReaction extends InGameReaction {
  x: number;
}

interface FloatingChat {
  id: string;
  senderName: string;
  text?: string;
  emote?: string;
  x: number;
}

interface ReactionLayerProps {
  socket: Socket;
}

export const ReactionLayer: React.FC<ReactionLayerProps> = ({ socket }) => {
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);
  const [floatingChats, setFloatingChats] = useState<FloatingChat[]>([]);
  const [cooldown, setCooldown] = useState(false);

  useEffect(() => {
    const handleReaction = (reaction: InGameReaction) => {
      sounds.playClick();
      const x = Math.floor(Math.random() * 60) + 20; // 20% to 80% width
      const newFloating: FloatingReaction = { ...reaction, x };
      setFloatingReactions((prev) => [...prev.slice(-15), newFloating]);

      setTimeout(() => {
        setFloatingReactions((prev) => prev.filter((r) => r.id !== reaction.id));
      }, 2500);
    };

    const handleChatMessage = (msg: ChatMessage) => {
      sounds.playClick();
      const x = Math.floor(Math.random() * 50) + 25; // 25% to 75% width
      const newChat: FloatingChat = {
        id: msg.id || `${Date.now()}_${Math.random()}`,
        senderName: msg.senderName,
        text: msg.text,
        emote: msg.emote,
        x,
      };
      setFloatingChats((prev) => [...prev.slice(-10), newChat]);

      setTimeout(() => {
        setFloatingChats((prev) => prev.filter((c) => c.id !== newChat.id));
      }, 3500);
    };

    socket.on('reaction:received', handleReaction);
    socket.on('chat:message', handleChatMessage);

    return () => {
      socket.off('reaction:received', handleReaction);
      socket.off('chat:message', handleChatMessage);
    };
  }, [socket]);

  const sendReaction = (emote: string) => {
    if (cooldown) return;
    setCooldown(true);
    socket.emit('reaction:send', { emote });
    setTimeout(() => setCooldown(false), 600);
  };

  return (
    <>
      {/* Floating Reactions & Floating Chat Container */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {/* Floating Reactions */}
        {floatingReactions.map((r) => (
          <div
            key={r.id}
            className="absolute bottom-24 flex flex-col items-center animate-float-up pointer-events-none transition-transform"
            style={{ left: `${r.x}%` }}
          >
            <span className="text-4xl filter drop-shadow-lg scale-125 animate-bounce">
              {r.emote}
            </span>
            <span className="text-[10px] font-extrabold bg-slate-900/90 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700 shadow-md mt-1">
              {r.senderName}
            </span>
          </div>
        ))}

        {/* Floating Chat Bubbles */}
        {floatingChats.map((c) => (
          <div
            key={c.id}
            className="absolute bottom-28 animate-float-up pointer-events-none transition-transform"
            style={{ left: `${c.x}%` }}
          >
            <div className="bg-slate-900/95 backdrop-blur-md border-2 border-cyan-500/60 text-white px-4 py-2 rounded-2xl shadow-[0_0_20px_rgba(34,211,238,0.4)] flex items-center gap-2 max-w-xs animate-pulse">
              <span className="text-xs font-black text-cyan-400">{c.senderName}:</span>
              {c.emote && <span className="text-xl">{c.emote}</span>}
              {c.text && <span className="text-sm font-semibold text-slate-100">{c.text}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Floating Quick Reaction Toolbar at the bottom of the screen */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-slate-900/90 backdrop-blur-xl border border-slate-800 p-2 rounded-full shadow-2xl flex items-center gap-1 max-w-[95vw] overflow-x-auto no-scrollbar">
        {REACTION_EMOTES.map((emote) => (
          <button
            key={emote}
            onClick={() => sendReaction(emote)}
            disabled={cooldown}
            className="p-2 text-xl hover:scale-125 hover:-translate-y-1 transition active:scale-95 disabled:opacity-40 cursor-pointer rounded-full hover:bg-slate-800/60"
            title={`Send ${emote}`}
          >
            {emote}
          </button>
        ))}
      </div>
    </>
  );
};
