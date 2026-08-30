import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { MusicTrack, MusicSettings } from './types';
import { INITIAL_PLAYLIST } from './playlist';
import { sounds } from '../lib/sound';

interface MusicContextType {
  playlist: MusicTrack[];
  currentTrack: MusicTrack | null;
  isPlaying: boolean;
  isMuted: boolean;
  volume: number; // 0..1
  sfxVolume: number; // 0..1
  progress: number; // 0..100
  currentTime: number;
  duration: number;
  shuffle: boolean;
  widgetOpen: boolean;
  audioData: Uint8Array;
  togglePlay: () => void;
  playTrack: (track: MusicTrack) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  playRandomTrack: () => void;
  setVolume: (vol: number) => void;
  setSfxVolume: (vol: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  seek: (percent: number) => void;
  setWidgetOpen: (open: boolean) => void;
  toggleWidget: () => void;
}

const STORAGE_KEY = 'duelzone_music_settings';

const MusicContext = createContext<MusicContextType | null>(null);

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [playlist] = useState<MusicTrack[]>(INITIAL_PLAYLIST);
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(INITIAL_PLAYLIST[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolumeState] = useState(0.6); // Default 60%
  const [sfxVolume, setSfxVolumeState] = useState(0.8); // Default 80%
  const [shuffle, setShuffle] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(180); // Default 3 min placeholder
  const [widgetOpen, setWidgetOpen] = useState(false);
  const [audioData, setAudioData] = useState<Uint8Array>(new Uint8Array(16));

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const historyRef = useRef<string[]>([]);
  const synthTimerRef = useRef<NodeJS.Timeout | null>(null);
  const synthCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const isSynthModeRef = useRef<boolean>(false);

  // Load saved preferences from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: Partial<MusicSettings> = JSON.parse(saved);
        if (typeof parsed.volume === 'number') setVolumeState(parsed.volume);
        if (typeof parsed.sfxVolume === 'number') {
          setSfxVolumeState(parsed.sfxVolume);
          sounds.setSfxVolume(parsed.sfxVolume);
        }
        if (typeof parsed.isMuted === 'boolean') setIsMuted(parsed.isMuted);
        if (typeof parsed.shuffle === 'boolean') setShuffle(parsed.shuffle);
        if (parsed.currentTrackId) {
          const found = INITIAL_PLAYLIST.find((t) => t.id === parsed.currentTrackId);
          if (found) setCurrentTrack(found);
        }
      }
    } catch (e) {
      console.warn('Failed to load music settings:', e);
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = useCallback((newSettings: Partial<MusicSettings>) => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const current: MusicSettings = saved
        ? JSON.parse(saved)
        : {
            isMuted: false,
            volume: 0.6,
            sfxVolume: 0.8,
            isPlaying: false,
            currentTrackId: INITIAL_PLAYLIST[0].id,
            shuffle: true,
          };
      const updated = { ...current, ...newSettings };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {}
  }, []);

  // Initialize HTML5 Audio element
  useEffect(() => {
    const audio = new Audio();
    audio.loop = false;
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setCurrentTime(audio.currentTime);
        setDuration(audio.duration);
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleEnded = () => {
      nextTrack();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, []);

  // Web Audio Procedural Synth Fallback for immediate out-of-the-box party playback
  const startSynthBeat = useCallback((trackId: string) => {
    stopSynthBeat();
    isSynthModeRef.current = true;

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      synthCtxRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 32;
      analyserRef.current = analyser;

      const masterGain = ctx.createGain();
      const effVol = isMuted ? 0 : volume;
      masterGain.gain.setValueAtTime(effVol * 0.25, ctx.currentTime);
      masterGain.connect(analyser);
      analyser.connect(ctx.destination);

      let step = 0;
      // Define rhythmic frequencies for party vibe
      const freqs = [130.81, 164.81, 196.00, 220.00, 261.63, 329.63, 392.00]; // C, E, G, A, C, E, G
      const bpm = 124;
      const stepTime = 60 / bpm / 2; // 16th note feel

      let synthTime = 0;
      const synthDuration = 180; // 3 mins placeholder
      setDuration(synthDuration);

      const interval = setInterval(() => {
        if (!synthCtxRef.current || synthCtxRef.current.state === 'closed') return;
        const now = synthCtxRef.current.currentTime;

        // Kick Drum / Bass Synth
        const osc = synthCtxRef.current.createOscillator();
        const gain = synthCtxRef.current.createGain();
        osc.type = step % 4 === 0 ? 'sine' : 'triangle';
        const freqIndex = (step + trackId.length) % freqs.length;
        const baseFreq = freqs[freqIndex] * (step % 2 === 0 ? 1 : 1.5);
        osc.frequency.setValueAtTime(baseFreq, now);

        if (step % 4 === 0) {
          osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);
        }

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.16);

        step = (step + 1) % 16;
        synthTime += stepTime;
        if (synthTime > synthDuration) synthTime = 0;

        setCurrentTime(synthTime);
        setProgress((synthTime / synthDuration) * 100);
      }, stepTime * 1000);

      synthTimerRef.current = interval;
    } catch (e) {
      console.warn('Synth playback failed:', e);
    }
  }, [isMuted, volume]);

  const stopSynthBeat = useCallback(() => {
    if (synthTimerRef.current) {
      clearInterval(synthTimerRef.current);
      synthTimerRef.current = null;
    }
    if (synthCtxRef.current) {
      try {
        synthCtxRef.current.close();
      } catch (e) {}
      synthCtxRef.current = null;
    }
    isSynthModeRef.current = false;
  }, []);

  // Equalizer visualizer animation frame loop
  useEffect(() => {
    const updateVisualizer = () => {
      if (isPlaying) {
        if (analyserRef.current) {
          const buffer = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(buffer);
          setAudioData(buffer);
        } else {
          // Animated pseudo spectrum for smooth visualizer bar feedback
          const fakeData = new Uint8Array(12);
          for (let i = 0; i < 12; i++) {
            fakeData[i] = Math.floor(Math.random() * 180) + 70;
          }
          setAudioData(fakeData);
        }
      } else {
        setAudioData(new Uint8Array(12));
      }
      animFrameRef.current = requestAnimationFrame(updateVisualizer);
    };

    animFrameRef.current = requestAnimationFrame(updateVisualizer);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying]);

  // Update audio volume & mute state
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
    if (synthCtxRef.current && isSynthModeRef.current) {
      // Re-trigger synth gain update
    }
  }, [volume, isMuted]);

  // Play track implementation with error fallback
  const playTrack = useCallback(
    (track: MusicTrack) => {
      sounds.playClick();
      setCurrentTrack(track);
      saveSettings({ currentTrackId: track.id });

      // Record track in history to avoid immediate repeat in shuffle
      historyRef.current = [track.id, ...historyRef.current.filter((id) => id !== track.id)].slice(0, 4);

      if (audioRef.current) {
        stopSynthBeat();
        audioRef.current.src = track.audioUrl;
        audioRef.current.volume = isMuted ? 0 : volume;

        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
            })
            .catch(() => {
              // Local MP3 file not found or browser autoplay blocked -> start procedural party synth!
              startSynthBeat(track.id);
              setIsPlaying(true);
            });
        }
      }
    },
    [isMuted, volume, saveSettings, startSynthBeat, stopSynthBeat]
  );

  const togglePlay = useCallback(() => {
    sounds.playClick();
    if (!currentTrack) {
      if (playlist.length > 0) playTrack(playlist[0]);
      return;
    }

    if (isPlaying) {
      if (audioRef.current && !isSynthModeRef.current) {
        audioRef.current.pause();
      }
      if (isSynthModeRef.current) {
        stopSynthBeat();
      }
      setIsPlaying(false);
    } else {
      if (isSynthModeRef.current) {
        startSynthBeat(currentTrack.id);
        setIsPlaying(true);
      } else if (audioRef.current) {
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => {
            startSynthBeat(currentTrack.id);
            setIsPlaying(true);
          });
      }
    }
  }, [currentTrack, isPlaying, playlist, playTrack, startSynthBeat, stopSynthBeat]);

  // Non-repeating Shuffle Selection
  const getRandomTrack = useCallback((): MusicTrack => {
    if (playlist.length <= 1) return playlist[0];

    // Filter out current track and recently played tracks
    const candidates = playlist.filter((t) => !historyRef.current.slice(0, 3).includes(t.id));
    const pool = candidates.length > 0 ? candidates : playlist.filter((t) => t.id !== currentTrack?.id);
    const randomIndex = Math.floor(Math.random() * pool.length);
    return pool[randomIndex];
  }, [currentTrack, playlist]);

  const playRandomTrack = useCallback(() => {
    const next = getRandomTrack();
    playTrack(next);
  }, [getRandomTrack, playTrack]);

  const nextTrack = useCallback(() => {
    if (shuffle) {
      playRandomTrack();
    } else {
      const currIdx = playlist.findIndex((t) => t.id === currentTrack?.id);
      const nextIdx = (currIdx + 1) % playlist.length;
      playTrack(playlist[nextIdx]);
    }
  }, [shuffle, currentTrack, playlist, playRandomTrack, playTrack]);

  const prevTrack = useCallback(() => {
    const currIdx = playlist.findIndex((t) => t.id === currentTrack?.id);
    const prevIdx = (currIdx - 1 + playlist.length) % playlist.length;
    playTrack(playlist[prevIdx]);
  }, [currentTrack, playlist, playTrack]);

  const handleSetVolume = useCallback(
    (vol: number) => {
      const clamped = Math.max(0, Math.min(1, vol));
      setVolumeState(clamped);
      saveSettings({ volume: clamped });
    },
    [saveSettings]
  );

  const handleSetSfxVolume = useCallback(
    (vol: number) => {
      const clamped = Math.max(0, Math.min(1, vol));
      setSfxVolumeState(clamped);
      sounds.setSfxVolume(clamped);
      saveSettings({ sfxVolume: clamped });
    },
    [saveSettings]
  );

  const toggleMute = useCallback(() => {
    sounds.playClick();
    setIsMuted((prev) => {
      const next = !prev;
      saveSettings({ isMuted: next });
      return next;
    });
  }, [saveSettings]);

  const toggleShuffle = useCallback(() => {
    sounds.playClick();
    setShuffle((prev) => {
      const next = !prev;
      saveSettings({ shuffle: next });
      return next;
    });
  }, [saveSettings]);

  const seek = useCallback((percent: number) => {
    sounds.playClick();
    const clamped = Math.max(0, Math.min(100, percent));
    setProgress(clamped);
    if (audioRef.current && audioRef.current.duration) {
      audioRef.current.currentTime = (clamped / 100) * audioRef.current.duration;
    }
  }, []);

  const toggleWidget = useCallback(() => {
    sounds.playClick();
    setWidgetOpen((prev) => !prev);
  }, []);

  return (
    <MusicContext.Provider
      value={{
        playlist,
        currentTrack,
        isPlaying,
        isMuted,
        volume,
        sfxVolume,
        progress,
        currentTime,
        duration,
        shuffle,
        widgetOpen,
        audioData,
        togglePlay,
        playTrack,
        nextTrack,
        prevTrack,
        playRandomTrack,
        setVolume: handleSetVolume,
        setSfxVolume: handleSetSfxVolume,
        toggleMute,
        toggleShuffle,
        seek,
        setWidgetOpen,
        toggleWidget,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};
