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
    background: isDarkMode ? '#121212' : '#FFFFFF',
    cardBackground: isDarkMode ? '#1E1E1E' : '#FFFFFF',
    text: isDarkMode ? '#F5F5F5' : '#171717',
    subText: isDarkMode ? '#A3A3A3' : '#737373',
    border: isDarkMode ? '#262626' : '#E5E5E5',
    primary: '#2563eb', // primary blue
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
