import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, StatusBar, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAudio } from '../context/AudioContext';
import { getDownloadedSongs } from '../utils/downloadHelper';
import { useToast } from '../context/ToastContext';

const { width } = Dimensions.get('window');

const LibraryItem = ({ icon, title, subtitle, color, onPress }: any) => (
  <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.iconContainer, { backgroundColor: color || 'rgba(255,255,255,0.05)' }]}>
      <Ionicons name={icon} size={24} color={color ? '#FFF' : '#B3B3B3'} />
    </View>
    <View style={styles.itemInfo}>
      <Text style={styles.itemTitle}>{title}</Text>
      <Text style={styles.itemSubtitle}>{subtitle}</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color="#333" />
  </TouchableOpacity>
);

export const LibraryScreen = () => {
  const navigation = useNavigation<any>();
  const { likedSongs } = useAudio();
  const { showToast } = useToast();
  const [downloadCount, setDownloadCount] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      const loadCounts = async () => {
        const downloaded = await getDownloadedSongs();
        setDownloadCount(downloaded.length);
      };
      loadCounts();
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
           <Text style={styles.headerTitle}>Thư viện</Text>
           <View style={styles.headerRight}>
              <TouchableOpacity 
                style={styles.headerBtn} 
                onPress={() => showToast("Tính năng này đang được phát triển!", "info")}
              >
                 <Ionicons name="add" size={28} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.profileButton} onPress={() => showToast("Bạn đang dùng tài khoản Guest", "info")}>
                 <View style={styles.profileImage}>
                    <Text style={styles.profileInitial}>G</Text>
                 </View>
              </TouchableOpacity>
           </View>
        </View>

        <View style={styles.section}>
          <LibraryItem 
            icon="heart" 
            title="Bài hát đã thích" 
            subtitle={`${likedSongs.length} bài hát đã lưu`} 
            color="#ec4899"
            onPress={() => {
                navigation.navigate('LikedSongs');
            }}
          />
          <View style={styles.divider} />
          <LibraryItem 
            icon="download-outline" 
            title="Đã tải xuống" 
            subtitle={`${downloadCount} bài hát offline`} 
            color="#1DB954"
            onPress={() => navigation.navigate('Downloads')}
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  scrollContent: {
    paddingBottom: 150,
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
    letterSpacing: -1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBtn: {
    marginRight: 12,
    padding: 4,
  },
  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1DB954',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  section: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginLeft: 64,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  itemSubtitle: {
    color: '#B3B3B3',
    fontSize: 13,
    marginTop: 2,
  },
  tipContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(29, 185, 84, 0.1)',
    marginHorizontal: 20,
    marginTop: 30,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  tipText: {
    color: '#B3B3B3',
    fontSize: 13,
    marginLeft: 12,
    flex: 1,
    lineHeight: 18,
  },
});
