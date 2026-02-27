import React, { useEffect, useState, useCallback, memo } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { mockSongs, Song } from '../data/mockData';
import { useAudio } from '../context/AudioContext';

const { width } = Dimensions.get('window');
const API_URL = 'http://192.168.1.81:3001';

const SongCard = memo(({ song, onPress, isLoading, layout = 'vertical' }: any) => {
  if (layout === 'horizontal') {
    return (
      <TouchableOpacity 
        style={styles.madeForYouItem}
        onPress={() => onPress(song)}
      >
        <View style={{ position: 'relative' }}>
          <Image source={{ uri: song.artwork }} style={styles.madeForYouImage} />
          {isLoading && (
            <View style={styles.songLoadingOverlay}>
              <ActivityIndicator size="small" color="#1DB954" />
            </View>
          )}
        </View>
        <Text style={styles.madeForYouTitle} numberOfLines={1}>{song.title}</Text>
        <Text style={styles.madeForYouArtist} numberOfLines={1}>{song.artist}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      style={styles.recentItem}
      onPress={() => onPress(song)}
    >
      <View style={{ position: 'relative' }}>
        <Image source={{ uri: song.artwork }} style={styles.recentImage} />
        {isLoading && (
          <View style={styles.songLoadingOverlay}>
            <ActivityIndicator size="small" color="#1DB954" />
          </View>
        )}
      </View>
      <Text style={styles.recentText} numberOfLines={2}>{song.title}</Text>
    </TouchableOpacity>
  );
});

export const HomeScreen = () => {
  const { playSong } = useAudio();
  const [trending, setTrending] = useState<any[]>([]);
  const [pop, setPop] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSongId, setLoadingSongId] = useState<string | null>(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const trendRes = await fetch(`${API_URL}/search?q=lofi%20trending`);
        const trendData = await trendRes.json();
        setTrending(trendData.slice(0, 6));

        const popRes = await fetch(`${API_URL}/search?q=top%20hits%202024`);
        const popData = await popRes.json();
        setPop(popData.slice(0, 10));
      } catch (e) {
        console.log('Error fetching home data', e);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const handlePlayYoutubeSong = useCallback(async (video: any, playlist: any[]) => {
    setLoadingSongId(video.id);
    
    const songPlaylist: Song[] = playlist.map(item => ({
      id: item.id,
      title: item.title,
      artist: item.artist,
      artwork: item.artwork,
      url: item.url.includes(`${API_URL}/stream`) 
        ? item.url 
        : `${API_URL}/stream?url=${encodeURIComponent(item.url)}`
    }));

    const currentSongItem = songPlaylist.find(s => s.id === video.id) || songPlaylist[0];

    try {
      // Small timeout to show UI feedback
      setTimeout(() => {
        playSong(currentSongItem, songPlaylist);
        setLoadingSongId(null);
      }, 100);
    } catch (e) {
      setLoadingSongId(null);
    }
  }, [playSong]);

  const renderRecentlyPlayed = () => {
    const data = trending.length > 0 ? trending : mockSongs.slice(0, 6);
    return (
      <View style={styles.recentContainer}>
        {data.map((song) => (
          <SongCard 
            key={song.id}
            song={song}
            onPress={(s: any) => handlePlayYoutubeSong(s, data)}
            isLoading={loadingSongId === song.id}
          />
        ))}
      </View>
    );
  };

  const renderHorizontalList = (data: any[]) => {
    const listData = data.length > 0 ? data : mockSongs;
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
        {listData.map((song) => (
          <SongCard 
            key={`${song.id}-${Math.random()}`}
            song={song}
            onPress={(s: any) => handlePlayYoutubeSong(s, listData)}
            isLoading={loadingSongId === song.id}
            layout="horizontal"
          />
        ))}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Chào buổi tối</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={24} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="time-outline" size={24} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="settings-outline" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Xu hướng hôm nay</Text>
        {loading ? <ActivityIndicator color="#1DB954" style={{marginVertical: 20}} /> : renderRecentlyPlayed()}

        <Text style={styles.sectionTitle}>Dành riêng cho bạn</Text>
        {loading ? <ActivityIndicator color="#1DB954" style={{marginVertical: 20}} /> : renderHorizontalList(pop)}

        <Text style={styles.sectionTitle}>Bảng xếp hạng mới</Text>
        {loading ? <ActivityIndicator color="#1DB954" style={{marginVertical: 20}} /> : renderHorizontalList(trending.reverse())}

        <View style={styles.paddingBottom} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    paddingHorizontal: 16,
    marginBottom: 16,
    marginTop: 10,
  },
  recentContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  recentItem: {
    width: (width - 40) / 2,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    borderRadius: 6,
    marginBottom: 8,
    overflow: 'hidden',
  },
  recentImage: {
    width: 60,
    height: 60,
  },
  recentText: {
    flex: 1,
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 13,
    paddingHorizontal: 8,
  },
  horizontalScroll: {
    paddingLeft: 16,
  },
  madeForYouItem: {
    width: 150,
    marginRight: 16,
  },
  madeForYouImage: {
    width: 150,
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  madeForYouTitle: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
  },
  madeForYouArtist: {
    color: '#A7A7A7',
    fontSize: 13,
  },
  paddingBottom: {
    height: 120, 
  },
  songLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
