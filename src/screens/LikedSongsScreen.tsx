import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, SafeAreaView, StatusBar, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudio } from '../context/AudioContext';
import { Song } from '../data/mockData';
import { useNavigation } from '@react-navigation/native';

export const LikedSongsScreen = () => {
  const { likedSongs, playSong, shufflePlay } = useAudio();
  const navigation = useNavigation();

  const renderItem = ({ item }: { item: Song }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => playSong(item, likedSongs)}
      activeOpacity={0.7}
    >
      <View style={styles.cardInner}>
        <Image source={{ uri: item.artwork }} style={styles.artwork} />
        <View style={styles.infoContainer}>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.artist} numberOfLines={1}>{item.artist}</Text>
        </View>
        <Ionicons name="heart" size={20} color="#ec4899" style={{ padding: 10 }} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
           <Ionicons name="chevron-back" size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bài hát đã thích</Text>
      </View>

      <FlatList
        data={likedSongs}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          likedSongs.length > 0 ? (
            <TouchableOpacity style={styles.shuffleButton} onPress={() => shufflePlay(likedSongs)}>
              <Ionicons name="shuffle" size={20} color="#121212" />
              <Text style={styles.shuffleText}>Phát ngẫu nhiên</Text>
            </TouchableOpacity>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
               <Ionicons name="heart-outline" size={40} color="#ec4899" />
            </View>
            <Text style={styles.emptyTitle}>Chưa có bài hát nào</Text>
            <Text style={styles.emptySub}>Hãy nhấn vào icon trái tim khi nghe nhạc để lưu vào đây nhé.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: 30,
    paddingBottom: 20,
  },
  backButton: {
    padding: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFF',
    marginLeft: 10,
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
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  artwork: {
    width: 56,
    height: 56,
    borderRadius: 12,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 14,
  },
  title: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  artist: {
    color: '#B3B3B3',
    fontSize: 13,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(236, 72, 153, 0.1)',
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
});
