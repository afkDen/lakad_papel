import React, { useCallback } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import Ionicons from '@expo/vector-icons/Ionicons';
import { DocumentProvider } from '../src/context/DocumentContext';
import { colors } from '../src/theme';

// Prevent splash screen from auto-hiding before fonts load
SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return (
      <View style={layoutStyles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.blue600} />
      </View>
    );
  }

  return (
    <DocumentProvider>
      <View style={layoutStyles.root} onLayout={onLayoutRootView}>
        <StatusBar style="dark" />
        <Tabs
          screenOptions={{
            headerShown: true,
            headerStyle: {
              backgroundColor: colors.white,
              borderBottomWidth: 1,
              borderBottomColor: colors.gray200,
              elevation: 0,
              shadowOpacity: 0,
            },
            headerTitleStyle: {
              fontFamily: 'Inter_700Bold',
              fontWeight: 'bold',
              color: colors.gray900,
            },
            tabBarActiveTintColor: colors.blue600,
            tabBarInactiveTintColor: colors.gray400,
            tabBarLabelStyle: {
              fontFamily: 'Inter_600SemiBold',
              fontSize: 11,
            },
            tabBarStyle: {
              backgroundColor: colors.white,
              borderTopColor: colors.gray200,
              borderTopWidth: 1,
              height: 60,
              paddingBottom: 8,
              paddingTop: 8,
            },
          }}
        >
          <Tabs.Screen
            name="checklist"
            options={{
              title: 'My Documents',
              tabBarLabel: 'Documents',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="document-text-outline" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="target"
            options={{
              title: 'What do I need?',
              tabBarLabel: 'What do I need?',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="search-outline" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="roadmap"
            options={{
              title: 'Roadmap',
              tabBarLabel: 'Roadmap',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="map-outline" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="history"
            options={{
              title: 'History',
              tabBarLabel: 'History',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="time-outline" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="index"
            options={{
              href: null, // Hide index from tab bar
            }}
          />
        </Tabs>
      </View>
    </DocumentProvider>
  );
}

const layoutStyles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
