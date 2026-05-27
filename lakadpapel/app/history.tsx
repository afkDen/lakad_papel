import React, { useMemo } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDocumentContext } from '../src/hooks/useDocumentContext';
import { REQUIREMENTS_GRAPH } from '../src/algorithms/requirementsGraph';
import { CompletedFlow } from '../src/context/types';
import { useTheme } from '../src/context/ThemeContext';
import { useLanguage } from '../src/context/LanguageContext';
import { colors as defaultColors } from '../src/theme';

export default function HistoryScreen() {
  const { state } = useDocumentContext();
  const { colors: themeColors, isDarkMode } = useTheme();
  const { language, t } = useLanguage();

  const reversedHistory = useMemo(() => [...state.history].reverse(), [state.history]);

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(language === 'en' ? 'en-US' : 'tl-PH', {
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
      <View style={[styles.historyCard, { backgroundColor: themeColors.background, borderColor: themeColors.border }]}>
        <Text style={[styles.docLabel, { color: themeColors.text }]}>{docLabel}</Text>
        <Text style={[styles.dateText, { color: themeColors.subText }]}>
          {t.completedOn} {formatDate(item.completedAt)}
        </Text>
        <Text style={[styles.stepCountText, { color: themeColors.subText }]}>
          {item.stepCount} {item.stepCount === 1 ? t.step : t.steps} {t.completed}
        </Text>
      </View>
    );
  };

  const renderEmptyState = () => {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyTitle, { color: themeColors.subText }]}>{t.historyEmptyState}</Text>
        <Text style={[styles.emptySubtitle, { color: themeColors.subText }]}>
          {t.historyEmptyStateSubtitle}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.headerContainer}>
        <Text style={[styles.screenTitle, { color: themeColors.text }]}>{t.history}</Text>
        <Text style={[styles.headerSubtitle, { color: themeColors.subText }]}>
          {t.historySubtitle}
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
  },
  headerSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
  },
  historyCard: {
    borderWidth: 1,
    borderRadius: 8,
    marginHorizontal: 24,
    marginBottom: 12,
    padding: 16,
  },
  docLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    lineHeight: 24,
  },
  dateText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
  },
  stepCountText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 16,
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
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 8,
  },
});
