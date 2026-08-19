import React from 'react';
import { Socket } from 'socket.io-client';
import { ChatMessage, Player } from '../shared/types';
import { Send, Smile } from 'lucide-react';
import { sounds } from '../lib/sound';

const CHAT_EMOTES = ['🔥', '😂', '👏', '🎯', '⚡', '💩', 'GG', '👑'];

interface ChatBoxProps {
  socket: Socket;
  messages: ChatMessage[];
  currentPlayer: Player | null;
}

export const ChatBox: React.FC<ChatBoxProps> = ({
  socket,
  messages,
  currentPlayer,
}) => {
  const [text, setText] = React.useState('');
  const [showEmotes, setShowEmotes] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    sounds.playClick();
    socket.emit('chat:send', { text: text.trim() });
    setText('');
  };

  const handleSendEmote = (emote: string) => {
    sounds.playClick();
    socket.emit('chat:send', { emote });
    setShowEmotes(false);
  };

  return (
    <div className="flex flex-col h-[280px] bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg relative">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
          Room Chat & Emotes
        </span>
        <button
          onClick={() => setShowEmotes(!showEmotes)}
          className="p-1 text-slate-400 hover:text-amber-400 transition"
          title="Send Emote"
        >
          <Smile className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Emote Drawer */}
      {showEmotes && (
        <div className="absolute top-12 right-4 z-30 bg-slate-950 border border-slate-700 p-2 rounded-xl grid grid-cols-4 gap-2 shadow-2xl animate-fade-in">
          {CHAT_EMOTES.map((e) => (
            <button
              key={e}
              onClick={() => handleSendEmote(e)}
              className="text-2xl hover:scale-125 transition cursor-pointer p-1"
            >
              {e}
            </button>
          ))}
        </div>
      )}

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
        {messages.map((m) => {
          const isMe = m.senderId === currentPlayer?.id;
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
            >
              <span className="text-[10px] text-slate-500 font-medium">
                {m.senderName}
              </span>
              <div
                className={`max-w-[80%] px-3 py-1.5 rounded-xl font-medium ${
                  isMe
                    ? 'bg-purple-600 text-white rounded-br-none'
                    : 'bg-slate-800 text-slate-200 rounded-bl-none'
                }`}
              >
                {m.emote ? (
                  <span className="text-2xl">{m.emote}</span>
                ) : (
                  <span>{m.text}</span>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <form onSubmit={handleSendText} className="flex gap-2 mt-2 pt-2 border-t border-slate-800">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Send a quick message..."
          maxLength={100}
          className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-medium"
        />
        <button
          type="submit"
          className="p-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
