import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { colors } from '../theme';

export default function HeaderBar() {
  const { colors: themeColors, isDarkMode } = useTheme();
  const { language } = useLanguage();

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
      {/* Invisible spacer to perfectly center the logo */}
      <View style={styles.sideSpacer} />

      {/* Brand Logo Image — Centered, overflow clips the image whitespace */}
      <View style={styles.logoWrapper}>
        <Image
          source={require('../../assets/Untitled design (8).png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>

      {/* Interactive Bell Icon */}
      <TouchableOpacity
        activeOpacity={0.6}
        onPress={handleNotificationPress}
        style={styles.bellButton}
      >
        <Ionicons
          name="notifications-outline"
          size={22}
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
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    width: '100%',
  },
  sideSpacer: {
    width: 28,
  },
  logoWrapper: {
    height: 44,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    height: 130,
    width: 280,
  },
  bellButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  indicatorDot: {
    position: 'absolute',
    top: 2,
    right: 3,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.tertiaryGreen,
  },
});
