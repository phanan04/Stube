import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { AudioProvider } from './src/context/AudioContext';
import { ToastProvider } from './src/context/ToastContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { SearchScreen } from './src/screens/SearchScreen';
import { DownloadsScreen } from './src/screens/DownloadsScreen';
import { LibraryScreen } from './src/screens/LibraryScreen';
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
        <View style={styles.container}>
          <NavigationContainer theme={MyTheme}>
            <Tab.Navigator
              screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                  let iconName: keyof typeof Ionicons.glyphMap = 'home';

                  if (route.name === 'Home') {
                    iconName = focused ? 'home' : 'home-outline';
                  } else if (route.name === 'Search') {
                    iconName = focused ? 'search' : 'search-outline';
                  } else if (route.name === 'Library') {
                    iconName = focused ? 'library' : 'library-outline';
                  } else if (route.name === 'Downloads') {
                    iconName = focused ? 'download' : 'download-outline';
                  }

                  return <Ionicons name={iconName} size={26} color={color} />;
                },
                tabBarActiveTintColor: '#FFFFFF',
                tabBarInactiveTintColor: '#B3B3B3',
                tabBarStyle: styles.tabBar,
                tabBarLabelStyle: styles.tabLabel,
              })}
            >
              <Tab.Screen name="Home" component={HomeScreen} />
              <Tab.Screen name="Search" component={SearchScreen} />
              <Tab.Screen name="Library" component={LibraryScreen} />
              <Tab.Screen name="Downloads" component={DownloadsScreen} />
            </Tab.Navigator>
          </NavigationContainer>

          <View style={styles.playerWrapper}>
            <MiniPlayer />
          </View>
        </View>
      </ToastProvider>
    </AudioProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    position: 'relative',
  },
  playerWrapper: {
    position: 'absolute',
    bottom: 58,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  tabBar: {
    backgroundColor: 'rgba(18, 18, 18, 0.95)',
    borderTopWidth: 0,
    position: 'absolute',
    height: 60,
    paddingBottom: 5,
    elevation: 0,
    bottom: 0,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: -4,
  },
});
