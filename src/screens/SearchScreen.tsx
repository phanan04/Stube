import React, { useState, useEffect, useCallback, memo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator, 
  SafeAreaView, 
  StatusBar, 
  Keyboard,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudio } from '../context/AudioContext';
import { useToast } from '../context/ToastContext';
import { Song } from '../data/mockData';
import { downloadSong } from '../utils/downloadHelper';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RECENT_SEARCHES_KEY = 'RECENT_SEARCHES';
const API_URL = 'http://192.168.1.81:3001';

const SongItem = memo(({ item, onPlay, onDownload, isDownloading, isLoading }: any) => (
  <TouchableOpacity 
    style={styles.resultItem} 
    onPress={() => onPlay(item)}
    activeOpacity={0.7}
  >
    <View style={{ position: 'relative' }}>
      <Image 
        source={{ uri: item.artwork }} 
        style={styles.artwork} 
      />
      {isLoading && (
        <View style={styles.songLoadingOverlay}>
          <ActivityIndicator size="small" color="#1DB954" />
        </View>
      )}
    </View>
    <View style={styles.infoContainer}>
      <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
      <Text style={styles.artist} numberOfLines={1}>{item.artist} • {item.duration}</Text>
    </View>
    <TouchableOpacity 
      style={styles.downloadButton} 
      onPress={() => !isDownloading && onDownload(item)}
      disabled={isDownloading}
    >
      {isDownloading ? (
        <ActivityIndicator size="small" color="#1DB954" />
      ) : (
        <Ionicons name="download-outline" size={24} color="#FFF" />
      )}
    </TouchableOpacity>
  </TouchableOpacity>
));

export const SearchScreen = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { playSong } = useAudio();
  const { showToast } = useToast();

  const [downloadingItems, setDownloadingItems] = useState<Set<string>>(new Set());
  const [loadingSongId, setLoadingSongId] = useState<string | null>(null);

  useEffect(() => {
    loadRecentSearches();
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      // Only fetch suggestions if query is long enough and we aren't showing results
      if (query.trim().length > 1 && results.length === 0) {
        try {
          const res = await fetch(`${API_URL}/suggestions?q=${encodeURIComponent(query)}`);
          if (res.ok) {
            const data = await res.json();
            setSuggestions(data);
          }
        } catch (e) {
          console.log('Suggestions fetch error', e);
        }
      } else {
        setSuggestions([]);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [query, results.length]);

  const loadRecentSearches = async () => {
    try {
      const stored = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) setRecentSearches(JSON.parse(stored));
    } catch (e) {
      console.log('Error loading recent searches', e);
    }
  };

  const saveRecentSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    const filtered = recentSearches.filter(s => s !== searchTerm);
    const updated = [searchTerm, ...filtered].slice(0, 10);
    setRecentSearches(updated);
    await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  };

  const clearRecentSearches = async () => {
    setRecentSearches([]);
    await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
  };

  const performSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    setResults([]); 
    saveRecentSearch(searchTerm);
    try {
      const response = await fetch(`${API_URL}/search?q=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) throw new Error("Server error");
      const data = await response.json();
      setResults(data);
    } catch (error: any) {
      showToast("Lỗi kết nối máy chủ", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (searchTerm: string) => {
     setSuggestions([]);
     setQuery(searchTerm);
     performSearch(searchTerm);
     Keyboard.dismiss();
  };

  const handlePlayYoutubeSong = useCallback(async (video: any) => {
    // Dismiss keyboard first to avoid UI flickering or blockage
    Keyboard.dismiss();
    setLoadingSongId(video.id);
    
    const songPlaylist: Song[] = results.map(item => ({
      id: item.id,
      title: item.title,
      artist: item.artist,
      artwork: item.artwork,
      url: `${API_URL}/stream?url=${encodeURIComponent(item.url)}`
    }));

    const currentSongItem = songPlaylist.find(s => s.id === video.id) || songPlaylist[0];

    try {
      // Small timeout to allow UI to update (show loading indicator)
      setTimeout(() => {
        playSong(currentSongItem, songPlaylist);
        setLoadingSongId(null);
      }, 100);
    } catch (e) {
      showToast("Lỗi phát nhạc", "error");
      setLoadingSongId(null);
    }
  }, [playSong, results]);

  const handleDownload = useCallback(async (item: any) => {
    setDownloadingItems(prev => new Set(prev).add(item.id));
    const songToDownload: Song = {
      id: item.id,
      title: item.title,
      artist: item.artist,
      artwork: item.artwork,
      url: `${API_URL}/stream?url=${encodeURIComponent(item.url)}`
    };
    try {
      await downloadSong(songToDownload);
      showToast(`Đã tải xong: ${item.title.substring(0, 20)}...`, "success");
    } catch (error: any) {
      showToast("Lỗi tải bài hát", "error");
    } finally {
      setDownloadingItems(prev => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  }, []);

  const renderItem = ({ item }: { item: any }) => (
    <SongItem 
      item={item} 
      onPlay={handlePlayYoutubeSong} 
      onDownload={handleDownload} 
      isDownloading={downloadingItems.has(item.id)}
      isLoading={loadingSongId === item.id}
    />
  );

  const renderRecentSearch = ({ item, isSuggestion = false }: { item: string, isSuggestion?: boolean }) => (
    <TouchableOpacity 
      style={styles.recentItem} 
      onPress={() => handleSearchSubmit(item)}
    >
      <Ionicons name={isSuggestion ? "search-outline" : "time-outline"} size={20} color="#A7A7A7" style={{ marginRight: 12 }} />
      <Text style={styles.recentText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tìm kiếm</Text>
      </View>
      
      <View style={styles.searchBarContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#FFF" style={styles.searchIcon} />
          <TextInput
            style={styles.input}
            placeholder="Bạn muốn nghe gì?"
            placeholderTextColor="#A7A7A7"
            value={query}
            onChangeText={(text) => {
              setQuery(text);
              if (text.length === 0) {
                setResults([]);
                setSuggestions([]);
              }
            }}
            onSubmitEditing={() => handleSearchSubmit(query)}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); setResults([]); }} style={styles.clearIcon}>
              <Ionicons name="close-circle" size={20} color="#A7A7A7" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#1DB954" />
        </View>
      ) : results.length > 0 ? (
        <FlatList
          data={results}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      ) : suggestions.length > 0 ? (
        <View style={styles.recentContainer}>
           <FlatList
              data={suggestions}
              renderItem={({ item }) => renderRecentSearch({ item, isSuggestion: true })}
              keyExtractor={(item, index) => `suggest-${index}`}
              keyboardShouldPersistTaps="handled"
           />
        </View>
      ) : (
        <View style={styles.recentContainer}>
          {recentSearches.length > 0 && (
            <>
              <View style={styles.recentHeader}>
                <Text style={styles.recentTitle}>Tìm kiếm gần đây</Text>
                <TouchableOpacity onPress={clearRecentSearches}>
                  <Text style={styles.clearText}>Xóa tất cả</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={recentSearches}
                renderItem={renderRecentSearch}
                keyExtractor={(item, index) => `recent-${index}`}
                keyboardShouldPersistTaps="handled"
              />
            </>
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
  },
  searchBarContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    height: '100%',
  },
  clearIcon: {
    padding: 4,
  },
  recentContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  recentTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  clearText: {
    color: '#1DB954',
    fontSize: 14,
    fontWeight: '600',
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  recentText: {
    color: '#FFF',
    fontSize: 16,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 150, 
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 10,
  },
  artwork: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  title: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  artist: {
    color: '#B3B3B3',
    fontSize: 13,
  },
  downloadButton: {
    padding: 10,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  songLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
});
