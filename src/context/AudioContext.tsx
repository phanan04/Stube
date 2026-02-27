import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useAudioPlayer, AudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Song } from '../data/mockData';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LIKED_SONGS_KEY = 'LIKED_SONGS';

interface AudioContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  playSong: (song: Song, playlist?: Song[]) => void;
  togglePlayPause: () => void;
  player: AudioPlayer | null;
  likedSongs: Song[];
  toggleLikeSong: (song: Song) => void;
  isLiked: (songId: string) => boolean;
  shufflePlay: (playlist: Song[]) => void;
  playNext: () => void;
  playPrevious: () => void;
  queue: Song[];
  repeatMode: 'off' | 'track' | 'all';
  setRepeatMode: (mode: 'off' | 'track' | 'all') => void;
  isShuffle: boolean;
  setIsShuffle: (val: boolean) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [likedSongs, setLikedSongs] = useState<Song[]>([]);
  const [queue, setQueue] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [repeatMode, setRepeatMode] = useState<'off' | 'track' | 'all'>('off');
  const [isShuffle, setIsShuffle] = useState(false);
  
  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);
  const isPlaying = player?.playing ?? false;

  useEffect(() => {
    loadLikedSongs();
  }, []);

  // Listen for playback finished to play next song
  useEffect(() => {
    if (status.playbackState === 'finished') {
      if (repeatMode === 'track') {
        player.seekTo(0);
        player.play();
      } else {
        handleAutoNext();
      }
    }
  }, [status.playbackState, repeatMode]);

  const handleAutoNext = () => {
    if (queue.length === 0) return;
    
    let nextIndex = currentIndex + 1;
    if (nextIndex >= queue.length) {
      if (repeatMode === 'all') {
        nextIndex = 0;
      } else {
        return; // Stop at end of queue
      }
    }
    
    const nextSong = queue[nextIndex];
    player.replace(nextSong.url);
    player.play();
    setCurrentSong(nextSong);
    setCurrentIndex(nextIndex);
  };

  const loadLikedSongs = async () => {
    try {
      const stored = await AsyncStorage.getItem(LIKED_SONGS_KEY);
      if (stored) setLikedSongs(JSON.parse(stored));
    } catch (e) {
      console.log('Error loading liked songs', e);
    }
  };

  const playSong = (song: Song, playlist?: Song[]) => {
    try {
      player.replace(song.url);
      player.play();
      setCurrentSong(song);
      
      if (playlist) {
        setQueue(playlist);
        const index = playlist.findIndex(s => s.id === song.id);
        setCurrentIndex(index);
      } else {
        // Find in current queue if exists
        const index = queue.findIndex(s => s.id === song.id);
        if (index !== -1) {
          setCurrentIndex(index);
        } else {
          setQueue([song]);
          setCurrentIndex(0);
        }
      }
    } catch (error: any) {
      console.log('Error playing sound:', error);
      Alert.alert("Lỗi phát nhạc", "Không thể phát bài nhạc này.");
    }
  };

  const playNext = () => {
    if (queue.length === 0) return;
    let nextIndex = currentIndex + 1;
    if (nextIndex >= queue.length) {
      nextIndex = 0; // Loop to start when manually skipping
    }
    playSong(queue[nextIndex]);
  };

  const playPrevious = () => {
    if (queue.length === 0) return;
    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) {
      prevIndex = queue.length - 1;
    }
    playSong(queue[prevIndex]);
  };

  const togglePlayPause = () => {
    if (!player) return;
    player.playing ? player.pause() : player.play();
  };

  const toggleLikeSong = async (song: Song) => {
    try {
      let newLiked;
      if (likedSongs.some(s => s.id === song.id)) {
        newLiked = likedSongs.filter(s => s.id !== song.id);
      } else {
        newLiked = [...likedSongs, song];
      }
      setLikedSongs(newLiked);
      await AsyncStorage.setItem(LIKED_SONGS_KEY, JSON.stringify(newLiked));
    } catch (e) {
      console.log('Error saving like state', e);
    }
  };

  const isLiked = (songId: string) => likedSongs.some(s => s.id === songId);

  const shufflePlay = (playlist: Song[]) => {
    if (playlist.length === 0) return;
    const randomIndex = Math.floor(Math.random() * playlist.length);
    playSong(playlist[randomIndex], playlist);
    setIsShuffle(true);
  };

  return (
    <AudioContext.Provider value={{ 
      currentSong, isPlaying, playSong, togglePlayPause, player, 
      likedSongs, toggleLikeSong, isLiked, shufflePlay,
      playNext, playPrevious, queue, repeatMode, setRepeatMode,
      isShuffle, setIsShuffle
    }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
