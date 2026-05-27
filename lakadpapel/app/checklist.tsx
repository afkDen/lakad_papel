import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, SectionList, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useDocumentContext } from '../src/hooks/useDocumentContext';
import { useTheme } from '../src/context/ThemeContext';
import { useLanguage } from '../src/context/LanguageContext';
import DocumentCard from '../src/components/DocumentCard';
import CategoryHeader from '../src/components/CategoryHeader';
import { REQUIREMENTS_GRAPH, DOCUMENT_CATEGORIES } from '../src/algorithms/requirementsGraph';
import { colors, spacing, radii, typography, shadows } from '../src/theme';

export default function ChecklistScreen() {
  const router = useRouter();
  const { state, dispatch } = useDocumentContext();
  const [searchQuery, setSearchQuery] = useState('');
  const { colors: themeColors, isDarkMode } = useTheme();
  const { t } = useLanguage();

  const isSimple = state.userMode === 'simple';

  // 1. Transform and filter sections based on search query
  const sections = useMemo(() => {
    return Object.keys(DOCUMENT_CATEGORIES)
      .map((categoryName) => {
        const docIds = DOCUMENT_CATEGORIES[categoryName];
        const categoryDocs = docIds
          .map((id) => REQUIREMENTS_GRAPH[id])
          .filter((doc) => doc !== undefined)
          .filter((doc) => doc.label.toLowerCase().includes(searchQuery.toLowerCase()));

        return {
          title: categoryName,
          data: categoryDocs,
        };
      })
      .filter((section) => section.data.length > 0);
  }, [searchQuery]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Header & Search Bar */}
        <View style={styles.headerContainer}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.screenTitle, { color: themeColors.text }]}>{t.documents}</Text>
              <Text style={[styles.subtitle, { color: themeColors.subText }]}>
                {isSimple
                  ? t.checklistSubtitleSimple
                  : t.checklistSubtitleAdvanced}
              </Text>
            </View>
            
            {/* Senior Accessibility Mode Switcher */}
            <TouchableOpacity
              style={[
                styles.modeToggleBtn,
                isSimple && { backgroundColor: isDarkMode ? '#262626' : '#eff6ff', borderColor: isDarkMode ? '#404040' : '#bfdbfe' },
                !isSimple && { backgroundColor: themeColors.primary, borderColor: themeColors.primary }
              ]}
              onPress={() => dispatch({ type: 'TOGGLE_USER_MODE' })}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isSimple ? "accessibility-sharp" : "git-network-sharp"}
                size={12}
                color={isSimple ? (isDarkMode ? themeColors.subText : colors.teal600) : colors.white}
                style={{ marginRight: 4 }}
              />
              <Text
                style={[
                  styles.modeToggleText,
                  isSimple && { color: isDarkMode ? themeColors.subText : colors.teal600 },
                  !isSimple && { color: colors.white }
                ]}
              >
                {isSimple ? 'Simple' : 'Advanced'}
              </Text>
            </TouchableOpacity>
          </View>
 
          <TextInput
            style={[
              styles.searchInput,
              isSimple && styles.searchInputLarge,
              {
                backgroundColor: isDarkMode ? '#1E1E1E' : colors.gray50,
                color: themeColors.text,
                borderColor: themeColors.border,
              }
            ]}
            placeholder={t.searchPlaceholder}
            placeholderTextColor={isDarkMode ? '#737373' : colors.gray400}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
 
        {/* Grouped Checklist */}
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 110 }}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={5}
          initialNumToRender={12}
          getItemLayout={(_, index) => ({
            length: 64,
            offset: 64 * index,
            index
          })}
          renderItem={({ item }) => (
            <DocumentCard
              document={item}
              isChecked={state.possessedDocuments.has(item.id)}
              onToggle={() => dispatch({ type: 'TOGGLE_DOCUMENT', payload: item.id })}
            />
          )}
          renderSectionHeader={({ section: { title } }) => (
            <CategoryHeader title={title} />
          )}
        />
 
        {/* Sticky Bottom Call-to-Action */}
        <View style={[styles.bottomBar, { backgroundColor: themeColors.cardBackground, borderTopColor: themeColors.border }]}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/target')}
            style={[styles.ctaButton, isSimple && styles.ctaButtonLarge, { backgroundColor: themeColors.primary }]}
          >
            <Text style={styles.ctaButtonText}>
              {isSimple ? t.findDocumentSimple : t.searchIds}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  screenTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    lineHeight: 28,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  modeToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radii.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 2,
  },
  modeToggleText: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
  },
  searchInput: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: radii.md,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 24,
  },
  searchInputLarge: {
    fontSize: 17,
    paddingVertical: 14,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  ctaButton: {
    borderRadius: radii.md,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    ...shadows.sm,
  },
  ctaButtonLarge: {
    paddingVertical: 18,
  },
  ctaButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    lineHeight: 24,
    color: colors.white,
  },
});
