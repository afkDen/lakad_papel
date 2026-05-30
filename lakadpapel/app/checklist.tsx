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
          </View>
          <View style={styles.searchWrapper}>
            <Ionicons
              name="search-sharp"
              size={18}
              color={isDarkMode ? '#B6ABA1' : '#554336'}
              style={styles.searchIcon}
            />
            <TextInput
              style={[
                styles.searchInput,
                isSimple && styles.searchInputLarge,
                {
                  backgroundColor: isDarkMode ? '#1E1610' : '#F1EDE8',
                  color: themeColors.text,
                }
              ]}
              placeholder={t.searchPlaceholder}
              placeholderTextColor={isDarkMode ? '#71645B' : 'rgba(85, 67, 54, 0.6)'}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>
 
        {/* Grouped Checklist */}
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={5}
          initialNumToRender={12}
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
 
        {/* Floating Sticky Bottom CTA Button - Match Stitch's exact mockup */}
        <View style={styles.floatingContainer} pointerEvents="box-none">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/target')}
            style={[
              styles.ctaButton,
              isSimple && styles.ctaButtonLarge,
              {
                backgroundColor: isDarkMode ? colors.primaryTerracottaDark : colors.primaryTerracotta,
              }
            ]}
          >
            <Ionicons
              name="document-text"
              size={16}
              color={isDarkMode ? colors.onPrimaryFixed : colors.white}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.ctaButtonText,
                {
                  color: isDarkMode ? colors.onPrimaryFixed : colors.white,
                }
              ]}
            >
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
  searchWrapper: {
    position: 'relative',
    width: '100%',
    marginTop: spacing.sm,
  },
  searchIcon: {
    position: 'absolute',
    left: 16,
    top: '50%',
    marginTop: -9, // Offset half of the icon height (18px)
    zIndex: 10,
  },
  searchInput: {
    paddingLeft: 44,
    paddingRight: 16,
    paddingVertical: 12,
    borderWidth: 0,
    borderRadius: radii.md,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 22,
  },
  searchInputLarge: {
    fontSize: 16,
    paddingVertical: 14,
  },
  floatingContainer: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.full,
    paddingVertical: 14,
    paddingHorizontal: 28,
    ...shadows.md,
  },
  ctaButtonLarge: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  ctaButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
});
