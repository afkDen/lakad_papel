import React, { useCallback } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DocumentProvider } from '../src/context/DocumentContext';
import { LanguageProvider, useLanguage } from '../src/context/LanguageContext';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import { colors } from '../src/theme';

// Prevent splash screen from auto-hiding before fonts load
SplashScreen.preventAutoHideAsync();

function AppTabsContent({ onLayoutRootView, insets }: { onLayoutRootView: () => void; insets: any }) {
  const { colors: themeColors, isDarkMode } = useTheme();
  const { t } = useLanguage();

  return (
    <View style={[layoutStyles.root, { backgroundColor: themeColors.background }]} onLayout={onLayoutRootView}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: themeColors.primary,
          tabBarInactiveTintColor: isDarkMode ? '#737373' : colors.gray400,
          tabBarLabelStyle: {
            fontFamily: 'Inter_600SemiBold',
            fontSize: 11,
          },
          tabBarStyle: {
            backgroundColor: themeColors.cardBackground,
            borderTopColor: themeColors.border,
            borderTopWidth: 1,
            height: 60 + insets.bottom,
            paddingBottom: 8 + insets.bottom,
            paddingTop: 8,
          },
        }}
      >
        <Tabs.Screen
          name="checklist"
          options={{
            title: t.documents,
            tabBarLabel: t.documents,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="document-text-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="target"
          options={{
            title: t.findId,
            tabBarLabel: t.findId,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="search-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="roadmap"
          options={{
            title: t.roadmap,
            tabBarLabel: t.roadmap,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="map-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="explorer"
          options={{
            title: t.explorer,
            tabBarLabel: t.explorer,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="git-network-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: t.history,
            tabBarLabel: t.history,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="time-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: t.settings,
            tabBarLabel: t.settings,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="settings-outline" size={size} color={color} />
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
  );
}

export default function Layout() {
  const insets = useSafeAreaInsets();
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
        <ActivityIndicator size="large" color={colors.primaryTerracotta} />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <LanguageProvider>
        <ThemeProvider>
          <DocumentProvider>
            <AppTabsContent onLayoutRootView={onLayoutRootView} insets={insets} />
          </DocumentProvider>
        </ThemeProvider>
      </LanguageProvider>
    </ErrorBoundary>
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
