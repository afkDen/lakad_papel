import React from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet, Alert, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '../src/context/ThemeContext';
import { useLanguage } from '../src/context/LanguageContext';
import { useDocumentContext } from '../src/hooks/useDocumentContext';
import { useLocation } from '../src/hooks/useLocation';
import { colors as defaultColors } from '../src/theme';

export default function SettingsScreen() {
  const { colors: themeColors, isDarkMode, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { state, dispatch } = useDocumentContext();
  const { permissionGranted, requestPermission } = useLocation();

  const handleLocationPress = async () => {
    if (permissionGranted) {
      Alert.alert(
        language === 'en' ? 'Location Access Active' : 'Aktibo ang Lokasyon',
        language === 'en'
          ? 'Location access is already granted and active. If you wish to disable or modify it, you can do so in your device settings.'
          : 'Pinayagan na ang access sa lokasyon. Kung nais mo itong baguhin o i-disable, maaari mo itong gawin sa settings ng iyong device.',
        [
          { text: t.cancel, style: 'cancel' },
          { text: language === 'en' ? 'Open Settings' : 'Buksan ang Settings', onPress: () => Linking.openSettings() }
        ]
      );
    } else {
      // First try to request foreground permission
      await requestPermission();
      
      // Let's do a quick post-request status check
      // If still denied, it means they might have permanently disabled it, so show instructions to open Settings
      setTimeout(async () => {
        const { status } = await require('expo-location').getForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            language === 'en' ? 'Enable Location Access' : 'Paganahin ang Lokasyon',
            language === 'en'
              ? 'To locate the nearest government branches, please enable Location Services for LakadPapel in your device settings.'
              : 'Upang mahanap ang pinakamalapit na sangay, mangyaring paganahin ang Serbisyo sa Lokasyon para sa LakadPapel sa settings ng iyong device.',
            [
              { text: t.cancel, style: 'cancel' },
              { text: language === 'en' ? 'Open Settings' : 'Buksan ang Settings', onPress: () => Linking.openSettings() }
            ]
          );
        }
      }, 500);
    }
  };

  const handleClearCache = () => {
    Alert.alert(
      language === 'en' ? 'Reset Progress' : 'I-reset ang Progress',
      t.clearChecklistConfirm,
      [
        {
          text: t.cancel,
          style: 'cancel',
        },
        {
          text: t.yes,
          style: 'destructive',
          onPress: async () => {
            try {
              // Wipe cache state cleanly
              await AsyncStorage.removeItem('@lakadpapel/possessed_documents');
              
              // Dispatch to state context
              dispatch({
                type: 'HYDRATE',
                payload: {
                  possessedDocuments: [],
                  history: state.history,
                  userMode: state.userMode,
                },
              });

              Alert.alert(
                language === 'en' ? 'Success' : 'Tagumpay',
                t.clearChecklistSuccess
              );
            } catch (err) {
              console.warn('Failed to clear possessed documents:', err);
              Alert.alert(
                language === 'en' ? 'Error' : 'Error',
                language === 'en' ? 'Failed to clear progress.' : 'Bigo sa pagbura ng progress.'
              );
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={[styles.headerTitle, { color: themeColors.text }]}>
            {t.settings}
          </Text>
        </View>

        {/* Settings List */}
        <View style={[styles.settingsContainer, { backgroundColor: themeColors.background }]}>
          {/* Appearance Theme Row */}
          <View style={[styles.settingRow, { borderBottomColor: themeColors.border }]}>
            <View style={styles.rowLabelGroup}>
              <Ionicons
                name="moon-outline"
                size={20}
                color={themeColors.text}
                style={{ marginRight: 10 }}
              />
              <Text style={[styles.settingLabel, { color: themeColors.text }]}>
                {t.darkMode}
              </Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: defaultColors.gray300, true: themeColors.primary }}
              thumbColor={isDarkMode ? '#ffffff' : '#f4f3f4'}
            />
          </View>

          {/* Language Preference Selector Row */}
          <View style={[styles.settingRow, { borderBottomColor: themeColors.border }]}>
            <View style={styles.rowLabelGroup}>
              <Ionicons
                name="language-outline"
                size={20}
                color={themeColors.text}
                style={{ marginRight: 10 }}
              />
              <Text style={[styles.settingLabel, { color: themeColors.text }]}>
                {language === 'en' ? 'Language' : 'Wika'}
              </Text>
            </View>
            <View style={styles.langSelector}>
              <TouchableOpacity
                style={[
                  styles.langBtn,
                  language === 'en' && { backgroundColor: themeColors.primary },
                  language !== 'en' && { backgroundColor: isDarkMode ? '#262626' : '#F3F4F6' }
                ]}
                onPress={() => setLanguage('en')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.langBtnText,
                    { color: language === 'en' ? '#FFFFFF' : themeColors.text }
                  ]}
                >
                  English
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.langBtn,
                  language === 'tl' && { backgroundColor: themeColors.primary },
                  language !== 'tl' && { backgroundColor: isDarkMode ? '#262626' : '#F3F4F6' }
                ]}
                onPress={() => setLanguage('tl')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.langBtnText,
                    { color: language === 'tl' ? '#FFFFFF' : themeColors.text }
                  ]}
                >
                  Tagalog
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Location Services Row */}
          <View style={[styles.settingRow, { borderBottomColor: themeColors.border }]}>
            <View style={styles.rowLabelGroup}>
              <Ionicons
                name="location-outline"
                size={20}
                color={themeColors.text}
                style={{ marginRight: 10 }}
              />
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={[styles.settingLabel, { color: themeColors.text }]}>
                  {t.locationServices}
                </Text>
                <Text style={{ color: themeColors.subText, fontSize: 11, marginTop: 2, fontFamily: 'Inter_400Regular', lineHeight: 15 }}>
                  {t.locationSettingsDesc}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleLocationPress}
              style={[
                styles.permissionBadge,
                {
                  backgroundColor: permissionGranted
                    ? (isDarkMode ? 'rgba(22, 163, 74, 0.2)' : 'rgba(22, 163, 74, 0.1)')
                    : (isDarkMode ? '#27272A' : '#F3F4F6')
                }
              ]}
            >
              <Text
                style={[
                  styles.permissionBadgeText,
                  {
                    color: permissionGranted
                      ? defaultColors.green600
                      : themeColors.subText
                  }
                ]}
              >
                {permissionGranted ? t.permissionGranted : t.permissionDenied}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Engine Diagnostics Row */}
          <View style={[styles.settingRow, { borderBottomColor: themeColors.border }]}>
            <View style={styles.rowLabelGroup}>
              <Ionicons
                name="server-outline"
                size={20}
                color={themeColors.text}
                style={{ marginRight: 10 }}
              />
              <Text style={[styles.settingLabel, { color: themeColors.text }]}>
                Database Version
              </Text>
            </View>
            <Text style={[styles.diagnosticValue, { color: themeColors.subText }]}>
              v2.1 (114 Verified)
            </Text>
          </View>

          {/* Danger Cache Wiping Button Row */}
          <TouchableOpacity
            style={[styles.settingRow, styles.dangerRow, { borderBottomColor: themeColors.border }]}
            onPress={handleClearCache}
            activeOpacity={0.7}
          >
            <View style={styles.rowLabelGroup}>
              <Ionicons
                name="trash-outline"
                size={20}
                color={defaultColors.red500}
                style={{ marginRight: 10 }}
              />
              <Text style={[styles.settingLabel, { color: defaultColors.red500, fontFamily: 'Inter_600SemiBold' }]}>
                {t.clearChecklist}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={defaultColors.red500} />
          </TouchableOpacity>
        </View>

        {/* Database Diagnostic Footer */}
        <Text style={[styles.versionText, { color: themeColors.subText }]}>
          {t.dbVersion}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  headerContainer: {
    marginBottom: 24,
  },
  headerTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    lineHeight: 28,
  },
  settingsContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Dark mode handled dynamically
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5', // Set a default light border
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5', // Dark mode handled dynamically
  },
  dangerRow: {
    borderBottomWidth: 0,
  },
  rowLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    color: '#171717', // Dark mode handled dynamically
    fontFamily: 'Inter_600SemiBold',
  },
  diagnosticValue: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
  },
  langSelector: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    padding: 2,
  },
  langBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 4,
  },
  langBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
  },
  versionText: {
    fontSize: 12,
    color: '#737373',
    marginTop: 24,
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
  },
  permissionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  permissionBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
  },
});
