import React, { useRef, useEffect, useState } from 'react';
import { Player } from '../shared/types';
import { Video, Minimize2, Maximize2 } from 'lucide-react';

interface VideoPanelProps {
  players: Player[];
  currentPlayerId: string | undefined;
  localStream: MediaStream | null;
  remoteStreams: Record<string, MediaStream>;
  activeSpeakers: Set<string>;
}

const MiniVideo: React.FC<{
  stream: MediaStream;
  isLocal?: boolean;
  label: string;
  color: string;
  isSpeaking: boolean;
}> = ({ stream, isLocal, label, color, isSpeaking }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const hasVideoTrack = stream.getVideoTracks().length > 0;

  return (
    <div
      className={`relative flex-shrink-0 transition-all duration-300 ${
        isSpeaking
          ? 'ring-2 ring-emerald-400 shadow-[0_0_16px_rgba(16,185,129,.35)]'
          : 'ring-1 ring-slate-700'
      } rounded-2xl overflow-hidden`}
      style={{ width: 120, height: 90 }}
    >
      {hasVideoTrack ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className="w-full h-full object-cover"
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center text-white font-black text-xl"
          style={{ backgroundColor: color }}
        >
          {label.slice(0, 2).toUpperCase()}
        </div>
      )}

      {/* Name tag */}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent px-2 py-1">
        <span className="text-[10px] font-bold text-white drop-shadow flex items-center gap-1">
          {isLocal ? '🔴 You' : label}
          {isSpeaking && (
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          )}
        </span>
      </div>
    </div>
  );
};

export const VideoPanel: React.FC<VideoPanelProps> = ({
  players,
  currentPlayerId,
  localStream,
  remoteStreams,
  activeSpeakers,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  // Only show panel if at least one stream has video tracks
  const hasAnyVideo =
    (localStream && localStream.getVideoTracks().length > 0) ||
    Object.values(remoteStreams).some(s => s.getVideoTracks().length > 0);

  if (!hasAnyVideo) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${
        collapsed ? 'w-10 h-10' : ''
      }`}
    >
      {collapsed ? (
        <button
          onClick={() => setCollapsed(false)}
          className="w-10 h-10 rounded-full bg-fuchsia-600 hover:bg-fuchsia-500 text-white flex items-center justify-center shadow-lg shadow-fuchsia-900/40 transition active:scale-90 cursor-pointer"
          title="Show video panel"
        >
          <Video className="w-5 h-5" />
        </button>
      ) : (
        <div className="bg-slate-950/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-3 shadow-2xl shadow-fuchsia-900/20">
          {/* Header */}
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-fuchsia-400 flex items-center gap-1.5">
              <Video className="w-3 h-3" /> LIVE VIDEO
            </span>
            <button
              onClick={() => setCollapsed(true)}
              className="text-slate-500 hover:text-white transition cursor-pointer"
              title="Collapse"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Video Grid */}
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ maxWidth: '520px' }}>
            {/* Local video first */}
            {localStream && localStream.getVideoTracks().length > 0 && (
              <MiniVideo
                stream={localStream}
                isLocal
                label="You"
                color="#8b5cf6"
                isSpeaking={false}
              />
            )}

            {/* Remote videos */}
            {players
              .filter(p => p.id !== currentPlayerId && remoteStreams[p.id])
              .map(player => {
                const stream = remoteStreams[player.id];
                return (
                  <MiniVideo
                    key={player.id}
                    stream={stream}
                    label={player.name}
                    color={player.accentColor || '#6366f1'}
                    isSpeaking={activeSpeakers.has(player.id)}
                  />
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};
