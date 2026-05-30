import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  colors: {
    background: string;
    cardBackground: string;
    text: string;
    subText: string;
    border: string;
    primary: string;
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    async function loadTheme() {
      try {
        const saved = await AsyncStorage.getItem('@lakadpapel/theme');
        if (saved !== null) {
          setIsDarkMode(saved === 'dark');
        }
      } catch (err) {
        console.warn('Failed to load theme:', err);
      }
    }
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    try {
      const nextMode = !isDarkMode;
      setIsDarkMode(nextMode);
      await AsyncStorage.setItem('@lakadpapel/theme', nextMode ? 'dark' : 'light');
    } catch (err) {
      console.warn('Failed to save theme:', err);
    }
  };

  const themeColors = {
    background: isDarkMode ? '#120E0A' : '#fff8f5',
    cardBackground: isDarkMode ? '#1E1610' : '#FFFFFF',
    text: isDarkMode ? '#FBF8F6' : '#1f1b17',
    subText: isDarkMode ? '#B6ABA1' : '#554336',
    border: isDarkMode ? '#2E231B' : '#E8E0D5',
    primary: isDarkMode ? '#ffb77d' : '#8d4b00', // Terracotta brown
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, colors: themeColors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
}
