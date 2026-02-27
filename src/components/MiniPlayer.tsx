import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayerStatus } from 'expo-audio';
import { useAudio } from '../context/AudioContext';
import { useToast } from '../context/ToastContext';
import { PlayerModal } from './PlayerModal';

export const MiniPlayer = () => {
  const { currentSong, togglePlayPause, player, toggleLikeSong, isLiked } = useAudio();
  const { showToast } = useToast();
  const [modalVisible, setModalVisible] = React.useState(false);
  const status = player ? useAudioPlayerStatus(player) : null;

  if (!currentSong) return null;
  const liked = isLiked(currentSong.id);

  const isPlaying = status ? status.playing : false;
  const progressPercent = status && status.duration > 0 
    ? (status.currentTime / status.duration) * 100 
    : 0;

  return (
    <>
      <TouchableOpacity 
        style={styles.container} 
        activeOpacity={0.9}
        onPress={() => setModalVisible(true)}
      >
        <Image source={{ uri: currentSong.artwork }} style={styles.artwork} />
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {currentSong.title}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {currentSong.artist}
          </Text>
        </View>
        <TouchableOpacity style={styles.iconButton} onPress={() => {
          toggleLikeSong(currentSong);
          showToast(liked ? "Đã xóa khỏi yêu thích" : "Đã thêm vào yêu thích", liked ? "info" : "success");
        }}>
          <Ionicons name={liked ? "heart" : "heart-outline"} size={22} color={liked ? "#1DB954" : "#B3B3B3"} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={togglePlayPause}>
          <Ionicons 
            name={isPlaying ? "pause" : "play"} 
            size={28} 
            color="#FFF" 
          />
        </TouchableOpacity>
      </TouchableOpacity>
      {/* Real Progress Bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressIndicator, { width: `${progressPercent}%` }]} />
      </View>
      
      <PlayerModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 64,
    backgroundColor: '#1E1E1E',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginHorizontal: 8,
    borderRadius: 8,
    borderBottomWidth: 0,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  artwork: {
    width: 44,
    height: 44,
    borderRadius: 4,
  },
  info: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  title: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  artist: {
    color: '#B3B3B3',
    fontSize: 12,
  },
  iconButton: {
    padding: 8,
    marginLeft: 4,
  },
  progressBar: {
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 12,
    marginTop: -2,
    borderRadius: 1,
    overflow: 'hidden',
    zIndex: 11,
  },
  progressIndicator: {
    height: '100%',
    backgroundColor: '#1DB954',
  },
});
