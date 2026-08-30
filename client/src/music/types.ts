export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  audioUrl: string;
  coverGradient: string;
  icon: string;
  genre: string;
}

export interface MusicSettings {
  isMuted: boolean;
  volume: number;       // 0.0 to 1.0
  sfxVolume: number;    // 0.0 to 1.0
  isPlaying: boolean;
  currentTrackId: string;
  shuffle: boolean;
}
