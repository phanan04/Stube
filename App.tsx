import React from 'react';
import { StyleSheet, View, SafeAreaView } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { AudioProvider } from './src/context/AudioContext';
import { ToastProvider } from './src/context/ToastContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { SearchScreen } from './src/screens/SearchScreen';
import { DownloadsScreen } from './src/screens/DownloadsScreen';
import { LibraryScreen } from './src/screens/LibraryScreen';
import { LikedSongsScreen } from './src/screens/LikedSongsScreen';
import { MiniPlayer } from './src/components/MiniPlayer';

const Tab = createBottomTabNavigator();

export default function App() {
  const MyTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: '#121212',
      card: 'rgba(18, 18, 18, 0.95)',
      text: '#FFFFFF',
      border: 'transparent',
    },
  };

  return (
    <AudioProvider>
      <ToastProvider>
        <SafeAreaView style={styles.container}>
          <View style={styles.mainWrapper}>
            <NavigationContainer theme={MyTheme}>
              <Tab.Navigator
                screenOptions={({ route }) => ({
                  headerShown: false,
                  tabBarIcon: ({ focused, color }) => {
                    let iconName: keyof typeof Ionicons.glyphMap = 'home';
                    if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
                    else if (route.name === 'Search') iconName = focused ? 'search' : 'search-outline';
                    else if (route.name === 'Library') iconName = focused ? 'library' : 'library-outline';
                    else if (route.name === 'Downloads') iconName = focused ? 'download' : 'download-outline';
                    return <Ionicons name={iconName} size={24} color={color} />;
                  },
                  tabBarActiveTintColor: '#FFF',
                  tabBarInactiveTintColor: '#888',
                  tabBarStyle: styles.tabBar,
                  tabBarLabelStyle: styles.tabLabel,
                })}
              >
                <Tab.Screen name="Home" component={HomeScreen} />
                <Tab.Screen name="Search" component={SearchScreen} />
                <Tab.Screen name="Library" component={LibraryScreen} />
                <Tab.Screen name="Downloads" component={DownloadsScreen} />
                <Tab.Screen 
                  name="LikedSongs" 
                  component={LikedSongsScreen} 
                  options={{ 
                    tabBarButton: () => null,
                    tabBarItemStyle: { display: 'none' }
                  }} 
                />
              </Tab.Navigator>
            </NavigationContainer>
          </View>
          
          {/* MiniPlayer and TabBar are now part of a natural flow */}
          <View style={styles.bottomSection}>
             <MiniPlayer />
          </View>
        </SafeAreaView>
      </ToastProvider>
    </AudioProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  mainWrapper: {
    flex: 1,
  },
  bottomSection: {
    backgroundColor: '#121212',
    borderTopWidth: 0.5,
    borderTopColor: '#333',
  },
  tabBar: {
    backgroundColor: '#121212',
    borderTopWidth: 0,
    height: 60,
    paddingBottom: 8,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
});
