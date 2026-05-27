import React, { useMemo } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDocumentContext } from '../src/hooks/useDocumentContext';
import { REQUIREMENTS_GRAPH } from '../src/algorithms/requirementsGraph';
import { CompletedFlow } from '../src/context/types';
import { colors } from '../src/theme';

export default function HistoryScreen() {
  const { state } = useDocumentContext();

  const reversedHistory = useMemo(() => [...state.history].reverse(), [state.history]);

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

  const renderItem = ({ item }: { item: CompletedFlow }) => {
    const docLabel = REQUIREMENTS_GRAPH[item.targetDocumentId]?.label ?? item.targetDocumentId;
    return (
      <View style={styles.historyCard}>
        <Text style={styles.docLabel}>{docLabel}</Text>
        <Text style={styles.dateText}>
          Completed on {formatDate(item.completedAt)}
        </Text>
        <Text style={styles.stepCountText}>
          {item.stepCount} {item.stepCount === 1 ? 'step' : 'steps'} completed
        </Text>
      </View>
    );
  };

  const renderEmptyState = () => {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No completed flows yet.</Text>
        <Text style={styles.emptySubtitle}>
          Complete all steps in a roadmap to see it recorded here.
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.screenTitle}>History</Text>
        <Text style={styles.headerSubtitle}>
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
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={5}
        initialNumToRender={12}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  headerContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 8,
  },
  screenTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    lineHeight: 28,
    color: colors.gray900,
  },
  headerSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 16,
    color: colors.gray500,
    marginTop: 4,
  },
  historyCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 8,
    marginHorizontal: 24,
    marginBottom: 12,
    padding: 16,
  },
  docLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    lineHeight: 24,
    color: colors.gray900,
  },
  dateText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 16,
    color: colors.gray500,
    marginTop: 4,
  },
  stepCountText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 16,
    color: colors.gray400,
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    lineHeight: 24,
    color: colors.gray500,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: colors.gray400,
    textAlign: 'center',
    marginTop: 8,
  },
});
