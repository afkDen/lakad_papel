import React from 'react';
import { SafeAreaView, View, Text, SectionList } from 'react-native';
import { useRouter } from 'expo-router';
import { useDocumentContext } from '../src/hooks/useDocumentContext';
import DocumentCard from '../src/components/DocumentCard';
import CategoryHeader from '../src/components/CategoryHeader';
import { REQUIREMENTS_GRAPH, DOCUMENT_CATEGORIES } from '../src/algorithms/requirementsGraph';
import { DocumentId } from '../src/context/types';

export default function TargetScreen() {
  const router = useRouter();
  const { state, dispatch } = useDocumentContext();

  const sections = Object.keys(DOCUMENT_CATEGORIES).map((categoryName) => {
    const docIds = DOCUMENT_CATEGORIES[categoryName];
    const categoryDocs = docIds
      .map((id) => REQUIREMENTS_GRAPH[id])
      .filter((doc) => doc !== undefined);

    return {
      title: categoryName,
      data: categoryDocs,
    };
  });

  const handleSelectTarget = (documentId: DocumentId) => {
    if (state.possessedDocuments.has(documentId)) {
      return; // disabled
    }
    dispatch({ type: 'SET_TARGET', payload: documentId });
    router.push('/roadmap');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header and Subheader */}
      <View>
        <Text className="text-2xl font-bold text-gray-900 px-6 pt-6 pb-2">
          What do you need?
        </Text>
        <Text className="text-sm text-gray-500 px-6 pb-4">
          Select the document you want to obtain.
        </Text>

        {/* Notice Info Box */}
        <View className="mx-6 mb-4 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
          <Text className="text-xs text-gray-500 leading-normal">
            Documents you already have are greyed out and cannot be selected as a target.
          </Text>
        </View>
      </View>

      {/* List of Target Choices */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
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
