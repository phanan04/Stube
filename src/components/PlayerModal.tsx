import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  Modal, 
  Dimensions, 
  SafeAreaView,
  Platform,
  Share,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudio } from '../context/AudioContext';
import { useToast } from '../context/ToastContext';
import { useAudioPlayerStatus } from 'expo-audio';

const { width } = Dimensions.get('window');

interface PlayerModalProps {
  visible: boolean;
  onClose: () => void;
}

export const PlayerModal: React.FC<PlayerModalProps> = ({ visible, onClose }) => {
  const { 
    currentSong, togglePlayPause, player, toggleLikeSong, isLiked, 
    playNext, playPrevious, isShuffle, setIsShuffle, repeatMode, setRepeatMode 
  } = useAudio();
  const { showToast } = useToast();
  const status = player ? useAudioPlayerStatus(player) : null;

  if (!currentSong) return null;
  const liked = isLiked(currentSong.id);

  const duration = status?.duration || 0;
  const currentTime = status?.currentTime || 0;
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const toggleRepeat = () => {
    if (repeatMode === 'off') setRepeatMode('all');
    else if (repeatMode === 'all') setRepeatMode('track');
    else setRepeatMode('off');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Đang nghe "${currentSong.title}" của ${currentSong.artist} trên Music App!`,
        url: currentSong.url,
      });
    } catch (error) {
      console.log('Share error', error);
    }
  };

  const showMoreOptions = () => {
    Alert.alert(
      currentSong.title,
      currentSong.artist,
      [
        { text: "Thêm vào Playlist", onPress: () => showToast("Tính năng sắp ra mắt", "info") },
        { text: "Hẹn giờ tắt", onPress: () => showToast("Đã hẹn giờ tắt nhạc", "success") },
        { text: "Xem nghệ sĩ", onPress: () => {} },
        { text: "Đóng", style: "cancel" }
      ]
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="chevron-down" size={30} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerSub}>ĐANG PHÁT</Text>
            <Text style={styles.headerTitle} numberOfLines={1}>{currentSong.title}</Text>
          </View>
          <TouchableOpacity onPress={showMoreOptions}>
            <Ionicons name="ellipsis-horizontal" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Image source={{ uri: currentSong.artwork }} style={styles.artwork} />
          
          <View style={styles.songInfo}>
            <View>
              <Text style={styles.title} numberOfLines={1}>{currentSong.title}</Text>
              <Text style={styles.artist}>{currentSong.artist}</Text>
            </View>
            <TouchableOpacity onPress={() => {
              toggleLikeSong(currentSong);
              showToast(liked ? "Đã xóa khỏi yêu thích" : "Đã thêm vào yêu thích", liked ? "info" : "success");
            }}>
              <Ionicons name={liked ? "heart" : "heart-outline"} size={28} color={liked ? "#1DB954" : "#FFF"} />
            </TouchableOpacity>
          </View>

          <View style={styles.progressContainer}>
            <TouchableOpacity 
              activeOpacity={1}
              style={styles.customProgressBar}
              onPress={(e) => {
                const { locationX } = e.nativeEvent;
                const progressWidth = width - 60;
                const seekTime = (locationX / progressWidth) * duration;
                if (player) player.seekTo(seekTime);
              }}
            >
              <View style={[styles.customProgressIndicator, { width: `${(currentTime/duration) * 100}%` }]} />
              <View style={[styles.customProgressKnob, { left: `${(currentTime/duration) * 100}%` }]} />
            </TouchableOpacity>
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>
          </View>

          <View style={styles.controls}>
            <TouchableOpacity onPress={() => setIsShuffle(!isShuffle)}>
              <Ionicons 
                name={isShuffle ? "shuffle" : "shuffle-outline"} 
                size={30} 
                color={isShuffle ? "#1DB954" : "#FFF"} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={playPrevious}>
              <Ionicons name="play-skip-back" size={35} color="#FFF" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.playButton} onPress={togglePlayPause}>
              <Ionicons name={player?.playing ? "pause" : "play"} size={40} color="#000" />
            </TouchableOpacity>

            <TouchableOpacity onPress={playNext}>
              <Ionicons name="play-skip-forward" size={35} color="#FFF" />
            </TouchableOpacity>

            <TouchableOpacity onPress={toggleRepeat}>
              <Ionicons 
                name={repeatMode === 'track' ? "repeat" : "repeat-outline"} 
                size={30} 
                color={repeatMode !== 'off' ? "#1DB954" : "#FFF"} 
              />
              {repeatMode === 'track' && <Text style={styles.repeatOneText}>1</Text>}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity onPress={handleShare}>
              <Ionicons name="share-social-outline" size={24} color="#A7A7A7" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => showToast("Danh sách chờ sắp ra mắt", "info")}>
              <Ionicons name="list-outline" size={24} color="#A7A7A7" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerTextContainer: {
    alignItems: 'center',
    flex: 1,
  },
  headerSub: {
    color: '#A7A7A7',
    fontSize: 10,
    letterSpacing: 1,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 2,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  artwork: {
    width: width - 60,
    height: width - 60,
    borderRadius: 8,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  songInfo: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    width: width - 120,
  },
  artist: {
    color: '#A7A7A7',
    fontSize: 16,
    marginTop: 4,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 40,
  },
  customProgressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#535353',
    borderRadius: 2,
    position: 'relative',
    marginTop: 20,
    marginBottom: 20,
  },
  customProgressIndicator: {
    height: '100%',
    backgroundColor: '#1DB954',
    borderRadius: 2,
  },
  customProgressKnob: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFF',
    top: -4,
    marginLeft: -6,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 0,
  },
  timeText: {
    color: '#A7A7A7',
    fontSize: 12,
  },
  controls: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  playButton: {
    backgroundColor: '#FFF',
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
  },
  repeatOneText: {
    color: '#1DB954',
    fontSize: 10,
    fontWeight: 'bold',
    position: 'absolute',
    top: 10,
    right: 5,
  },
});
