import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';
import { Song } from '../data/mockData';

const DOWNLOADS_KEY = 'DOWNLOADED_SONGS';

export const getDownloadedSongs = async (): Promise<Song[]> => {
  try {
    const data = await AsyncStorage.getItem(DOWNLOADS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting downloaded songs', error);
    return [];
  }
};

export const downloadSong = async (song: Song, onProgress?: (progress: number) => void): Promise<boolean> => {
  try {
    // Check if already downloaded
    const existingSongs = await getDownloadedSongs();
    if (existingSongs.find(s => s.id === song.id)) {
      Alert.alert('Đã tải', 'Bài hát này đã có trong máy.');
      return true;
    }

    if (Platform.OS === 'web') {
      // On the web, we can trigger a direct browser download by creating an anchor element
      const link = document.createElement('a');
      link.href = `${song.url}&download=1`; 
      link.setAttribute('download', `${song.title}.mp3`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // We also save to AsyncStorage so it appears in the Downloads tab
      const downloadedSong: Song = {
        ...song,
        url: song.url // Just keep the original since we can't save files locally
      };
      await AsyncStorage.setItem(DOWNLOADS_KEY, JSON.stringify([...existingSongs, downloadedSong]));
      Alert.alert('Thành công!', 'Trình duyệt đang tải bài hát xuống.');
      return true;
    }

    // Set up file path based on song ID for Native
    const fileUri = `${FileSystem.documentDirectory}${song.id}.mp3`;
    
    // Download the actual file from the stream URL
    let downloadResumable;
    if (onProgress) {
        downloadResumable = FileSystem.createDownloadResumable(
            song.url,
            fileUri,
            {},
            (downloadProgress) => {
              const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
              onProgress(progress * 100);
            }
          );
    } else {
        downloadResumable = FileSystem.createDownloadResumable(song.url, fileUri);
    }
      
    const res = await downloadResumable.downloadAsync();

    if (res && res.status === 200) {
      // Create new offline song object pointing to local file
      const downloadedSong: Song = {
        ...song,
        url: res.uri, // Use the local file URI instead of the network stream
      };

      // Save to storage
      await AsyncStorage.setItem(DOWNLOADS_KEY, JSON.stringify([...existingSongs, downloadedSong]));
      Alert.alert('Thành công!', 'Bài hát đã được tải xuống.');
      return true;
    }
    
    Alert.alert('Thất bại', `Tải bài hát không thành công. Status code: ${res?.status}`);
    return false;
  } catch (error: any) {
    console.error('Download error:', error);
    Alert.alert('Lỗi Tải xuống', `Mô tả lỗi: ${error.message || JSON.stringify(error)}`);
    return false;
  }
};

export const deleteDownloadedSong = async (songId: string): Promise<boolean> => {
  try {
    const existingSongs = await getDownloadedSongs();
    const filteredSongs = existingSongs.filter(s => s.id !== songId);
    
    // Delete file
    const fileUri = `${FileSystem.documentDirectory}${songId}.mp3`;
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (fileInfo.exists) {
        await FileSystem.deleteAsync(fileUri);
    }
    
    // Update storage
    await AsyncStorage.setItem(DOWNLOADS_KEY, JSON.stringify(filteredSongs));
    return true;
  } catch (error) {
    console.error('Delete error', error);
    return false;
  }
}
