import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { ChatMessage, Player } from '../shared/types';
import { MessageSquare, X } from 'lucide-react';
import { ChatBox } from './ChatBox';
import { sounds } from '../lib/sound';

interface InGameChatDrawerProps {
  socket: Socket;
  messages: ChatMessage[];
  currentPlayer: Player | null;
}

export const InGameChatDrawer: React.FC<InGameChatDrawerProps> = ({
  socket,
  messages,
  currentPlayer,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isOpen && messages.length > 0) {
      setUnreadCount((prev) => prev + 1);
    }
  }, [messages]);

  const toggleOpen = () => {
    sounds.playClick();
    if (!isOpen) setUnreadCount(0);
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col items-end">
      {/* Floating Toggle Button */}
      <button
        onClick={toggleOpen}
        className="relative p-3.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-full shadow-2xl transition active:scale-95 cursor-pointer flex items-center justify-center border-2 border-white/20"
        title="Open Room Chat"
      >
        {isOpen ? <X className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}

        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-slate-950 font-black text-[10px] rounded-full flex items-center justify-center border-2 border-slate-900 animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Floating Drawer Container */}
      {isOpen && (
        <div className="mt-3 w-80 max-w-[90vw] shadow-2xl animate-fade-in">
          <ChatBox socket={socket} messages={messages} currentPlayer={currentPlayer} />
        </div>
      )}
    </div>
  );
};
