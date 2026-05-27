import React, { useState } from 'react';
import { SafeAreaView, View, Text, TextInput, SectionList, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useDocumentContext } from '../src/hooks/useDocumentContext';
import DocumentCard from '../src/components/DocumentCard';
import CategoryHeader from '../src/components/CategoryHeader';
import { REQUIREMENTS_GRAPH, DOCUMENT_CATEGORIES } from '../src/algorithms/requirementsGraph';
import { colors } from '../src/theme';

export default function ChecklistScreen() {
  const router = useRouter();
  const { state, dispatch } = useDocumentContext();
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Transform and filter sections based on search query
  const sections = Object.keys(DOCUMENT_CATEGORIES)
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header & Search Bar */}
      <View>
        <Text style={styles.screenTitle}>My Documents</Text>
        <Text style={styles.subtitle}>
          Check off the documents you already possess to personalize your roadmaps.
        </Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search documents..."
          placeholderTextColor={colors.gray400}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Grouped Checklist */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section: { title } }) => (
          <CategoryHeader title={title} />
        )}
        renderItem={({ item }) => (
          <DocumentCard
            document={item}
            isChecked={state.possessedDocuments.has(item.id)}
            onToggle={() => dispatch({ type: 'TOGGLE_DOCUMENT', payload: item.id })}
          />
        )}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Sticky Bottom Navigation Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/target')}
          style={styles.ctaButton}
        >
          <Text style={styles.ctaButtonText}>What do I need?</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  screenTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    lineHeight: 28,
    color: colors.gray900,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 8,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 16,
    color: colors.gray500,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  searchInput: {
    marginHorizontal: 24,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.gray50,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 8,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 24,
    color: colors.gray900,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    backgroundColor: colors.white,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  ctaButton: {
    backgroundColor: colors.blue600,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  ctaButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    lineHeight: 24,
    color: colors.white,
  },
});
