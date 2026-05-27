import React, { useMemo } from 'react';
import { View, Text, SectionList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useDocumentContext } from '../src/hooks/useDocumentContext';
import DocumentCard from '../src/components/DocumentCard';
import CategoryHeader from '../src/components/CategoryHeader';
import { REQUIREMENTS_GRAPH, DOCUMENT_CATEGORIES } from '../src/algorithms/requirementsGraph';
import { DocumentId } from '../src/context/types';
import { colors } from '../src/theme';

export default function TargetScreen() {
  const router = useRouter();
  const { state, dispatch } = useDocumentContext();

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
    <SafeAreaView style={styles.container}>
      {/* Header and Subheader */}
      <View>
        <Text style={styles.screenTitle}>What do you need?</Text>
        <Text style={styles.subtitle}>
          Select the document you want to obtain.
        </Text>

        {/* Notice Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Documents you already have are greyed out and cannot be selected as a target.
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
    fontSize: 14,
    lineHeight: 20,
    color: colors.gray500,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  infoBox: {
    marginHorizontal: 24,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.gray50,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 8,
  },
  infoText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 18,
    color: colors.gray500,
  },
});
