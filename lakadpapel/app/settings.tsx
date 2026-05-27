import React from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '../src/context/ThemeContext';
import { useLanguage } from '../src/context/LanguageContext';
import { useDocumentContext } from '../src/hooks/useDocumentContext';
import { colors as defaultColors } from '../src/theme';

export default function SettingsScreen() {
  const { colors: themeColors, isDarkMode, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { state, dispatch } = useDocumentContext();

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
});
