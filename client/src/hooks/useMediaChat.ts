import { useEffect, useRef, useState, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { RoomSnapshot } from '../shared/types';

export function useMediaChat(socket: Socket, room: RoomSnapshot | null, currentPlayerId: string | undefined) {
  const [micEnabled, setMicEnabled] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [activeSpeakers, setActiveSpeakers] = useState<Set<string>>(new Set());
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  const [localStream, setLocalStreamState] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const localStreamRef = useRef<MediaStream | null>(null);
  const peers = useRef<Map<string, RTCPeerConnection>>(new Map());
  const audioContext = useRef<AudioContext | null>(null);
  const analyserNodes = useRef<Map<string, AnalyserNode>>(new Map());
  const animationFrame = useRef<number | null>(null);

  const updateRemoteStreams = () => {
    const streams: Record<string, MediaStream> = {};
    peers.current.forEach((pc, id) => {
      const receivers = pc.getReceivers();
      const tracks = receivers.map(r => r.track).filter(t => t);
      if (tracks.length > 0) {
        const ms = new MediaStream();
        tracks.forEach(t => ms.addTrack(t));
        streams[id] = ms;
      }
    });
    setRemoteStreams(streams);
  };

  const cleanupPeer = useCallback((peerId: string) => {
    const pc = peers.current.get(peerId);
    if (pc) {
      pc.close();
      peers.current.delete(peerId);
    }
    analyserNodes.current.delete(peerId);
    
    setActiveSpeakers(prev => {
      const next = new Set(prev);
      next.delete(peerId);
      return next;
    });
    updateRemoteStreams();
  }, []);

  useEffect(() => {
    if (!room) {
      peers.current.forEach((_, id) => cleanupPeer(id));
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
        localStreamRef.current = null;
        setLocalStreamState(null);
      }
      setMicEnabled(false);
      setCameraEnabled(false);
    }
  }, [room, cleanupPeer]);

  useEffect(() => {
    const checkAudioActivity = () => {
      let changed = false;
      const newActive = new Set<string>();

      analyserNodes.current.forEach((analyser, peerId) => {
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        
        if (average > 10) {
          newActive.add(peerId);
        }
      });

      setActiveSpeakers(prev => {
        if (prev.size !== newActive.size) changed = true;
        else {
          for (const item of newActive) {
            if (!prev.has(item)) { changed = true; break; }
          }
        }
        return changed ? newActive : prev;
      });

      animationFrame.current = requestAnimationFrame(checkAudioActivity);
    };

    if (micEnabled || cameraEnabled) {
      if (!audioContext.current) {
        audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (audioContext.current.state === 'suspended') {
        audioContext.current.resume();
      }
      checkAudioActivity();
    }

    return () => {
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
    };
  }, [micEnabled, cameraEnabled]);

  const createPeerConnection = useCallback((targetId: string) => {
    if (peers.current.has(targetId)) return peers.current.get(targetId)!;

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:global.stun.twilio.com:3478' }
      ]
    });

    pc.onnegotiationneeded = async () => {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('webrtc:offer', { targetId, offer });
      } catch (err) {
        console.error(err);
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('webrtc:ice-candidate', { targetId, candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      updateRemoteStreams();

      event.track.onunmute = () => updateRemoteStreams();
      event.track.onmute = () => updateRemoteStreams();

      if (event.track.kind === 'audio' && audioContext.current) {
        try {
          // Check if already connected
          if (!analyserNodes.current.has(targetId)) {
            const stream = new MediaStream([event.track]);
            const source = audioContext.current.createMediaStreamSource(stream);
            const analyser = audioContext.current.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);
            analyserNodes.current.set(targetId, analyser);
          }
        } catch (e) {
          console.error('Error setting up audio analysis:', e);
        }
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        cleanupPeer(targetId);
      }
    };

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    peers.current.set(targetId, pc);
    return pc;
  }, [socket, cleanupPeer]);

  useEffect(() => {
    if (!currentPlayerId) return;

    const handleOffer = async ({ senderId, offer }: any) => {
      const pc = createPeerConnection(senderId);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('webrtc:answer', { targetId: senderId, answer });
    };

    const handleAnswer = async ({ senderId, answer }: any) => {
      const pc = peers.current.get(senderId);
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    };

    const handleIceCandidate = async ({ senderId, candidate }: any) => {
      const pc = peers.current.get(senderId);
      if (pc) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    };

    socket.on('webrtc:offer', handleOffer);
    socket.on('webrtc:answer', handleAnswer);
    socket.on('webrtc:ice-candidate', handleIceCandidate);

    return () => {
      socket.off('webrtc:offer', handleOffer);
      socket.off('webrtc:answer', handleAnswer);
      socket.off('webrtc:ice-candidate', handleIceCandidate);
    };
  }, [socket, currentPlayerId, createPeerConnection]);

  const connectToPeers = useCallback(async () => {
    if (!room || !currentPlayerId) return;
    for (const player of room.players) {
      if (player.id !== currentPlayerId && player.isConnected) {
        createPeerConnection(player.id);
      }
    }
  }, [room, currentPlayerId, createPeerConnection]);

  const updateLocalStream = async (audio: boolean, video: boolean) => {
    if (!audio && !video) {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
        localStreamRef.current = null;
        setLocalStreamState(null);
      }
      peers.current.forEach(pc => {
        pc.getSenders().forEach(s => pc.removeTrack(s));
      });
      return;
    }

    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio, video });
      
      // Stop old tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
      }
      localStreamRef.current = stream;
      setLocalStreamState(stream);

      if (!audioContext.current) {
        audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      // Update peer connections
      peers.current.forEach(pc => {
        const senders = pc.getSenders();
        // Remove old tracks
        senders.forEach(s => pc.removeTrack(s));
        // Add new tracks
        stream.getTracks().forEach(t => pc.addTrack(t, stream));
      });

      // Ensure we are connected
      setTimeout(connectToPeers, 100);
    } catch (err) {
      console.error("Failed to get media access", err);
      setError("Media access denied or unavailable.");
      // Rollback state if failed
      if (audio && !localStreamRef.current?.getAudioTracks().length) setMicEnabled(false);
      if (video && !localStreamRef.current?.getVideoTracks().length) setCameraEnabled(false);
    }
  };

  const toggleMic = () => {
    const newMic = !micEnabled;
    setMicEnabled(newMic);
    updateLocalStream(newMic, cameraEnabled);
  };

  const toggleCamera = () => {
    const newCam = !cameraEnabled;
    setCameraEnabled(newCam);
    updateLocalStream(micEnabled, newCam);
  };

  return { micEnabled, cameraEnabled, toggleMic, toggleCamera, activeSpeakers, remoteStreams, localStream, mediaError: error };
}
