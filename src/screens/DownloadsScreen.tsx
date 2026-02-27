import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, SafeAreaView, StatusBar, Alert, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudio } from '../context/AudioContext';
import { useToast } from '../context/ToastContext';
import { Song } from '../data/mockData';
import { getDownloadedSongs, deleteDownloadedSong } from '../utils/downloadHelper';

const { width } = Dimensions.get('window');

export const DownloadsScreen = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const { playSong, shufflePlay } = useAudio();
  const { showToast } = useToast();

  useFocusEffect(
    useCallback(() => {
      const loadSongs = async () => {
        const downloaded = await getDownloadedSongs();
        setSongs(downloaded);
      };
      loadSongs();
    }, [])
  );

  const handleDelete = async (songId: string) => {
    Alert.alert(
      "Xóa bài hát",
      "Bạn có chắc chắn muốn xóa bài hát này khỏi thư viện ngoại tuyến?",
      [
        { text: "Hủy", style: "cancel" },
        { 
          text: "Xóa", 
          style: "destructive",
          onPress: async () => {
            await deleteDownloadedSong(songId);
            setSongs(songs.filter(s => s.id !== songId));
            showToast("Đã xóa khỏi danh sách tải xuống", "success");
          }
        }
      ]
    );
  };

  const renderItem = ({ item }: { item: Song }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => playSong(item, songs)}
      activeOpacity={0.7}
    >
      <View style={styles.cardInner}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.artwork }} style={styles.artwork} />
          <View style={styles.playOverlay}>
            <Ionicons name="play" size={20} color="#FFF" />
          </View>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.artist} numberOfLines={1}>{item.artist}</Text>
          <View style={styles.statusRow}>
             <Ionicons name="checkmark-done-circle" size={14} color="#1DB954" />
             <Text style={styles.statusText}>Sẵn sàng ngoại tuyến</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleDelete(item.id)}
        >
          <Ionicons name="ellipsis-vertical" size={20} color="#B3B3B3" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Tải xuống</Text>
          <Text style={styles.headerSubtitle}>{songs.length} bài hát • Đã kiểm tra</Text>
        </View>
        <TouchableOpacity style={styles.headerIcon}>
           <Ionicons name="download" size={24} color="#1DB954" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={songs}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          songs.length > 0 ? (
            <TouchableOpacity style={styles.shuffleButton} onPress={() => shufflePlay(songs)}>
              <Ionicons name="shuffle" size={20} color="#121212" />
              <Text style={styles.shuffleText}>Phát ngẫu nhiên</Text>
            </TouchableOpacity>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
               <Ionicons name="cloud-download-outline" size={40} color="#1DB954" />
            </View>
            <Text style={styles.emptyTitle}>Chưa có gì ở đây</Text>
            <Text style={styles.emptySub}>Các bài hát bạn tải xuống sẽ xuất hiện tại đây để nghe mà không cần mạng.</Text>
            <TouchableOpacity style={styles.findButton}>
               <Text style={styles.findButtonText}>Tìm nhạc để tải</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F', // Slightly darker
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#B3B3B3',
    fontWeight: '500',
    marginTop: 2,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(29, 185, 84, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 150,
  },
  shuffleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1DB954',
    paddingVertical: 14,
    borderRadius: 30,
    marginBottom: 24,
    shadowColor: '#1DB954',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  shuffleText: {
    color: '#121212',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  card: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  imageContainer: {
    position: 'relative',
  },
  artwork: {
    width: 56,
    height: 56,
    borderRadius: 12,
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  title: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  artist: {
    color: '#B3B3B3',
    fontSize: 13,
    fontWeight: '400',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  statusText: {
    color: '#1DB954',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  actionButton: {
    padding: 10,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(29, 185, 84, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  emptySub: {
    color: '#B3B3B3',
    fontSize: 15,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 22,
  },
  findButton: {
    marginTop: 30,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#333',
  },
  findButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
});
