import React from 'react';
import { SafeAreaView, View, Text, FlatList } from 'react-native';
import { useDocumentContext } from '../src/hooks/useDocumentContext';
import { REQUIREMENTS_GRAPH } from '../src/algorithms/requirementsGraph';

export default function HistoryScreen() {
  const { state } = useDocumentContext();

  const reversedHistory = [...state.history].reverse();

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const docLabel = REQUIREMENTS_GRAPH[item.targetDocumentId]?.label ?? item.targetDocumentId;
    return (
      <View className="bg-white border border-gray-200 rounded-lg mx-6 mb-3 p-4">
        <Text className="text-base font-semibold text-gray-900">{docLabel}</Text>
        <Text className="text-xs text-gray-500 mt-1">
          Completed on {formatDate(item.completedAt)}
        </Text>
        <Text className="text-xs text-gray-400 mt-0.5">
          {item.stepCount} {item.stepCount === 1 ? 'step' : 'steps'} completed
        </Text>
      </View>
    );
  };

  const renderEmptyState = () => {
    return (
      <View className="flex-1 items-center justify-center py-20 px-6">
        <Text className="text-base text-gray-500 text-center font-medium">
          No completed flows yet.
        </Text>
        <Text className="text-sm text-gray-400 text-center mt-2 leading-normal">
          Complete all steps in a roadmap to see it recorded here.
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 pt-6 pb-2">
        <Text className="text-2xl font-bold text-gray-900">History</Text>
        <Text className="text-xs text-gray-500 mt-1">
          A log of all document acquisition roadmaps you have successfully completed.
        </Text>
      </View>

      <FlatList
        data={reversedHistory}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderItem}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={{ paddingBottom: 40, paddingTop: 16 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
