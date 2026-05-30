import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { colors, spacing } from '../theme';

export default function HeaderBar() {
  const { colors: themeColors, isDarkMode } = useTheme();
  const { language } = useLanguage();
  const [active, setActive] = useState(false);

  const handleNotificationPress = () => {
    Alert.alert(
      language === 'en' ? 'Notifications' : 'Mga Paalala',
      language === 'en' 
        ? 'All your documents and offline guides are currently up-to-date and securely synced!'
        : 'Ang lahat ng iyong dokumento at offline na gabay ay napapanahon at ligtas na naka-sync!',
      [{ text: language === 'en' ? 'OK' : 'Sige' }]
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDarkMode ? '#17120E' : '#fff8f5',
          borderBottomColor: themeColors.border,
        },
      ]}
    >
      {/* Invisible spacer to perfectly center the title */}
      <View style={styles.sideSpacer} />

      {/* Brand Title Centered */}
      <Text
        style={[
          styles.title,
          {
            color: isDarkMode ? colors.primaryTerracottaDark : colors.primaryTerracotta,
          },
        ]}
      >
        LakadPapel
      </Text>

      {/* Interactive Bell Icon */}
      <TouchableOpacity
        activeOpacity={0.6}
        onPress={handleNotificationPress}
        style={styles.bellButton}
      >
        <Ionicons
          name="notifications-outline"
          size={20}
          color={isDarkMode ? colors.primaryTerracottaDark : colors.primaryTerracotta}
        />
        {/* Glow indicator dot */}
        <View style={styles.indicatorDot} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    width: '100%',
  },
  sideSpacer: {
    width: 24,
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  bellButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  indicatorDot: {
    position: 'absolute',
    top: 2,
    right: 3,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.tertiaryGreen,
  },
});
