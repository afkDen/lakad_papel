import React, { useState } from 'react';
import { SafeAreaView, View, Text, TextInput, SectionList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useDocumentContext } from '../src/hooks/useDocumentContext';
import DocumentCard from '../src/components/DocumentCard';
import CategoryHeader from '../src/components/CategoryHeader';
import { REQUIREMENTS_GRAPH, DOCUMENT_CATEGORIES } from '../src/algorithms/requirementsGraph';

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
    <SafeAreaView className="flex-1 bg-white">
      {/* Header & Search Bar */}
      <View>
        <Text className="text-2xl font-bold text-gray-900 px-6 pt-6 pb-2">
          My Documents
        </Text>
        <Text className="text-xs text-gray-500 px-6 pb-4">
          Check off the documents you already possess to personalize your roadmaps.
        </Text>
        <TextInput
          className="mx-6 mb-4 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-base text-gray-900"
          placeholder="Search documents..."
          placeholderTextColor="#9ca3af"
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
      <View className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white px-6 py-4">
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/target')}
          className="bg-blue-600 rounded-lg py-4 items-center justify-center min-h-[48px]"
        >
          <Text className="text-white text-base font-semibold">
            What do I need?
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
