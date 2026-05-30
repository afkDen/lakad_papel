import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type FontSizePreference = 'small' | 'medium' | 'large';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  fontSize: FontSizePreference;
  setFontSize: (size: FontSizePreference) => void;
  fontScale: number;
  colors: {
    background: string;
    cardBackground: string;
    text: string;
    subText: string;
    border: string;
    primary: string;
  };
}

// Module-level scale export so that the global Text patch can read it instantly during render cycles
export let currentFontScale = 1.0;

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [fontSize, setFontSizeState] = useState<FontSizePreference>('medium');

  // Hydrate theme and font scale on mount
  useEffect(() => {
    async function loadThemeAndAccessibility() {
      try {
        const savedTheme = await AsyncStorage.getItem('@lakadpapel/theme');
        if (savedTheme !== null) {
          setIsDarkMode(savedTheme === 'dark');
        }
        
        const savedFontSize = await AsyncStorage.getItem('@lakadpapel/font_size');
        if (savedFontSize !== null) {
          const validSizes: FontSizePreference[] = ['small', 'medium', 'large'];
          if (validSizes.includes(savedFontSize as FontSizePreference)) {
            const size = savedFontSize as FontSizePreference;
            setFontSizeState(size);
            currentFontScale = size === 'small' ? 0.85 : size === 'large' ? 1.25 : 1.0;
          }
        }
      } catch (err) {
        console.warn('Failed to load theme/font settings:', err);
      }
    }
    loadThemeAndAccessibility();
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

  const setFontSize = async (size: FontSizePreference) => {
    try {
      setFontSizeState(size);
      currentFontScale = size === 'small' ? 0.85 : size === 'large' ? 1.25 : 1.0;
      await AsyncStorage.setItem('@lakadpapel/font_size', size);
    } catch (err) {
      console.warn('Failed to save font size setting:', err);
    }
  };

  const fontScale = fontSize === 'small' ? 0.85 : fontSize === 'large' ? 1.25 : 1.0;

  const themeColors = {
    background: isDarkMode ? '#120E0A' : '#fff8f5',
    cardBackground: isDarkMode ? '#1E1610' : '#FFFFFF',
    text: isDarkMode ? '#FBF8F6' : '#1f1b17',
    subText: isDarkMode ? '#B6ABA1' : '#554336',
    border: isDarkMode ? '#2E231B' : '#E8E0D5',
    primary: isDarkMode ? '#ffb77d' : '#8d4b00', // Terracotta brown
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, fontSize, setFontSize, fontScale, colors: themeColors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
}
