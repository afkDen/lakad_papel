import React, { useMemo } from 'react';
import { View, Text, SectionList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useDocumentContext } from '../src/hooks/useDocumentContext';
import { useTheme } from '../src/context/ThemeContext';
import { useLanguage } from '../src/context/LanguageContext';
import DocumentCard from '../src/components/DocumentCard';
import CategoryHeader from '../src/components/CategoryHeader';
import { REQUIREMENTS_GRAPH, DOCUMENT_CATEGORIES } from '../src/algorithms/requirementsGraph';
import { DocumentId } from '../src/context/types';
import { colors } from '../src/theme';

export default function TargetScreen() {
  const router = useRouter();
  const { state, dispatch } = useDocumentContext();
  const { colors: themeColors, isDarkMode } = useTheme();
  const { t } = useLanguage();

  const sections = useMemo(() => {
    return Object.keys(DOCUMENT_CATEGORIES).map((categoryName) => {
      const docIds = DOCUMENT_CATEGORIES[categoryName];
      const categoryDocs = docIds
        .map((id) => REQUIREMENTS_GRAPH[id])
        .filter((doc) => doc !== undefined);

      return {
        title: categoryName,
        data: categoryDocs,
      };
    });
  }, []);

  const handleSelectTarget = (documentId: DocumentId) => {
    if (state.possessedDocuments.has(documentId)) {
      return; // disabled
    }
    dispatch({ type: 'SET_TARGET', payload: documentId });
    router.push('/roadmap');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Header and Subheader */}
      <View>
        <Text style={[styles.screenTitle, { color: themeColors.text }]}>{t.targetTitle}</Text>
        <Text style={[styles.subtitle, { color: themeColors.subText }]}>
          {t.targetSubtitle}
        </Text>

        {/* Notice Info Box */}
        <View style={[styles.infoBox, { backgroundColor: isDarkMode ? '#1E1E1E' : colors.gray50, borderColor: themeColors.border }]}>
          <Text style={[styles.infoText, { color: themeColors.subText }]}>
            {t.targetInfo}
          </Text>
        </View>
      </View>

      {/* List of Target Choices */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={5}
        initialNumToRender={12}
        getItemLayout={(_, index) => ({
          length: 64,
          offset: 64 * index,
          index
        })}
        renderSectionHeader={({ section: { title } }) => (
          <CategoryHeader title={title} />
        )}
        renderItem={({ item }) => (
          <DocumentCard
            document={item}
            isChecked={false}
            isDisabled={state.possessedDocuments.has(item.id)}
            onToggle={() => handleSelectTarget(item.id)}
          />
        )}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screenTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    lineHeight: 28,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 8,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  infoBox: {
    marginHorizontal: 24,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  infoText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 18,
  },
});
