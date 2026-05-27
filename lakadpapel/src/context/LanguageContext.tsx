import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations } from '../utils/languages';

export type Language = 'en' | 'tl';

export type TranslationSchema = {
  [K in keyof typeof translations['en']]: string;
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationSchema;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    async function loadLanguage() {
      try {
        const saved = await AsyncStorage.getItem('@lakadpapel/language');
        if (saved === 'en' || saved === 'tl') {
          setLanguageState(saved);
        }
      } catch (err) {
        console.warn('Failed to load language:', err);
      }
    }
    loadLanguage();
  }, []);

  const setLanguage = async (lang: Language) => {
    try {
      setLanguageState(lang);
      await AsyncStorage.setItem('@lakadpapel/language', lang);
    } catch (err) {
      console.warn('Failed to save language:', err);
    }
  };

  const currentTranslations = translations[language] || translations['en'];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: currentTranslations }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
}
