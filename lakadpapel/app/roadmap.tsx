import React, { useState, useEffect, useMemo } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, FlatList, ScrollView, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useDocumentContext } from '../src/hooks/useDocumentContext';
import { useLocation } from '../src/hooks/useLocation';
import { useTheme } from '../src/context/ThemeContext';
import { useLanguage } from '../src/context/LanguageContext';
import StepCard from '../src/components/StepCard';
import DependencyGraph from '../src/components/DependencyGraph';
import AlgorithmTrace from '../src/components/AlgorithmTrace';
import LinearTimeline from '../src/components/LinearTimeline';
import HeaderBar from '../src/components/HeaderBar';
import { REQUIREMENTS_GRAPH } from '../src/algorithms/requirementsGraph';
import { buildSubgraph, topologicalSort, topologicalSortWithTrace, TraceStep } from '../src/algorithms/topologicalSort';
import { buildLocationGraph, bfsNearestBranch } from '../src/algorithms/bfsLocator';
import { AGENCY_BRANCHES } from '../src/data/agencyLocations';
import { colors, spacing, radii, typography, shadows } from '../src/theme';

// Module level cached branch location graph
const locationGraph = buildLocationGraph(AGENCY_BRANCHES, 5);

export default function RoadmapScreen() {
  const router = useRouter();
  const { state, dispatch } = useDocumentContext();
  const { latitude, longitude } = useLocation();
  const [showGraph, setShowGraph] = useState(false);
  const [showTrace, setShowTrace] = useState(false);
  const [viewMode, setViewMode] = useState<'remaining' | 'full'>('remaining');
  const { colors: themeColors, isDarkMode } = useTheme();
  const { t, language } = useLanguage();

  const isSimple = state.userMode === 'simple';

  // Location Re-trigger: regenerate roadmap when GPS updates
  useEffect(() => {
    if (state.targetDocument && latitude !== null && longitude !== null) {
      dispatch({ type: 'SET_TARGET', payload: state.targetDocument });
    }
  }, [latitude, longitude]);

  // Compute values for DependencyGraph and trace
  const { subgraph, nextAttainable, trace } = useMemo(() => {
    let subgraph = {};
    const nextAttainable = new Set<string>();
    let trace: TraceStep[] = [];

    if (state.targetDocument) {
      try {
        const activeSubgraph = buildSubgraph(
          REQUIREMENTS_GRAPH,
          viewMode === 'remaining' ? state.possessedDocuments : new Set(),
          state.targetDocument
        );
        subgraph = activeSubgraph;

        // Identify available (in-degree 0 in active subgraph)
        for (const [id, node] of Object.entries(activeSubgraph)) {
          const prereqList = node.prerequisites.filter((pId) => activeSubgraph[pId] !== undefined);
          if (prereqList.length === 0) {
            nextAttainable.add(id);
          }
        }

        // Generate Kahn's algorithm trace steps
        const traceResult = topologicalSortWithTrace(activeSubgraph);
        trace = traceResult.trace;
      } catch (err) {
        console.error('Error tracing algorithm:', err);
      }
    }
    return { subgraph, nextAttainable, trace };
  }, [state.targetDocument, state.possessedDocuments, viewMode]);

  // Generate steps list based on current viewMode
  const getRoadmapSteps = () => {
    if (!state.targetDocument) return [];

    const lat = latitude ?? 14.5841; // Fallback SM Megamall coordinates
    const lon = longitude ?? 121.0573;

    if (isSimple || viewMode === 'remaining') {
      return state.roadmap.filter((step) => !step.isDone);
    } else {
      // Full Path (Advanced Mode only): build subgraph ignoring possessed documents
      try {
        const fullSubgraph = buildSubgraph(REQUIREMENTS_GRAPH, new Set(), state.targetDocument);
        const sortedIds = topologicalSort(fullSubgraph);

        return sortedIds.map((id) => {
          const node = REQUIREMENTS_GRAPH[id];
          const nearestBranch = bfsNearestBranch(lat, lon, node.agency, locationGraph);
          return {
            document: node,
            nearestBranch,
            isDone: state.possessedDocuments.has(id),
          };
        });
      } catch (err) {
        console.error('Error building full path roadmap:', err);
        return [];
      }
    }
  };

  const stepsToRender = getRoadmapSteps();
  const remainingCount = state.roadmap.filter((step) => !step.isDone).length;

  // Stats derivation
  const totalNodes = Object.keys(REQUIREMENTS_GRAPH).length;
  
  const totalEdges = Object.values(REQUIREMENTS_GRAPH).reduce(
    (sum, n) => sum + n.prerequisites.length,
    0
  );

  const ownedCount = state.possessedDocuments.size;

  const estDays = stepsToRender.reduce((sum, step) => {
    if (step.isDone) return sum;
    const daysStr = step.document.typicalDays.toLowerCase();
    if (daysStr.includes('same day')) return sum + 0.5;
    const match = daysStr.match(/(\d+)/);
    return sum + (match ? parseInt(match[1]) : 1);
  }, 0);

  const estCost = stepsToRender.reduce((sum, step) => {
    if (step.isDone) return sum;
    const feesStr = step.document.fees.toLowerCase();
    if (feesStr.includes('free')) return sum;
    const match = feesStr.replace(/,/g, '').match(/(\d+)/);
    return sum + (match ? parseInt(match[1]) : 0);
  }, 0);

  const renderHeader = () => {
    if (!state.targetDocument) return null;
    const targetLabel = REQUIREMENTS_GRAPH[state.targetDocument]?.label ?? state.targetDocument;

    return (
      <View style={styles.headerContainer}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerSubtitle, { color: themeColors.subText }]}>
              {isSimple ? t.journeyToGetSimple : t.activeRoadmapAdvanced}
            </Text>
            <Text style={[styles.targetLabel, { color: themeColors.text }]}>{targetLabel}</Text>
          </View>
        </View>

        {/* Minimum vs Full Path Toggle (Advanced Mode Only) */}
        {!isSimple && (
          <View style={[styles.segmentedControl, { backgroundColor: isDarkMode ? '#1E1E1E' : colors.borderSubtle }]}>
            <TouchableOpacity
              style={[
                styles.segmentBtn,
                viewMode === 'remaining' && [styles.segmentBtnActive, { backgroundColor: isDarkMode ? '#262626' : colors.white }]
              ]}
              onPress={() => setViewMode('remaining')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.segmentText,
                  { color: themeColors.subText },
                  viewMode === 'remaining' && { color: themeColors.text }
                ]}
              >
                {t.remainingSteps} ({remainingCount})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.segmentBtn,
                viewMode === 'full' && [styles.segmentBtnActive, { backgroundColor: isDarkMode ? '#262626' : colors.white }]
              ]}
              onPress={() => setViewMode('full')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.segmentText,
                  { color: themeColors.subText },
                  viewMode === 'full' && { color: themeColors.text }
                ]}
              >
                {t.fullPath}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderStatsBar = () => {
    if (!state.targetDocument) return null;

    const capsuleBg = isDarkMode ? 'rgba(141, 75, 0, 0.2)' : colors.primaryFixed;
    const capsuleText = isDarkMode ? colors.primaryTerracottaDark : colors.onPrimaryFixed;

    return (
      <View style={styles.statsBarWrapper}>
        <View style={[styles.statCapsule, { backgroundColor: capsuleBg }]}>
          <Ionicons name="git-branch-outline" size={16} color={capsuleText} />
          <Text style={[styles.statCapsuleText, { color: capsuleText }]}>
            {remainingCount} {language === 'en' ? (remainingCount === 1 ? 'Step' : 'Steps') : 'Hakbang'}
          </Text>
        </View>
        <View style={[styles.statCapsule, { backgroundColor: capsuleBg }]}>
          <Ionicons name="card-outline" size={16} color={capsuleText} />
          <Text style={[styles.statCapsuleText, { color: capsuleText }]}>
            ₱{estCost.toLocaleString()}
          </Text>
        </View>
        <View style={[styles.statCapsule, { backgroundColor: capsuleBg }]}>
          <Ionicons name="time-outline" size={16} color={capsuleText} />
          <Text style={[styles.statCapsuleText, { color: capsuleText }]}>
            ~{estDays} {language === 'en' ? (estDays === 1 ? 'Day' : 'Days') : 'Araw'}
          </Text>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => {
    if (!state.targetDocument) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="map-outline" size={48} color={isDarkMode ? '#404040' : colors.gray400} style={styles.emptyIcon} />
          <Text style={[styles.emptyText, { color: themeColors.subText }]}>
            {isSimple
              ? t.noActiveJourney
              : t.emptyRoadmap}
          </Text>
          <TouchableOpacity
            style={[
              styles.emptyCtaButton,
              { 
                borderColor: themeColors.primary,
                backgroundColor: isDarkMode ? '#1E1E1E' : '#eff6ff',
              }
            ]}
            onPress={() => router.push('/target')}
            activeOpacity={0.7}
          >
            <Text style={[styles.emptyCtaText, { color: themeColors.primary }]}>
              {language === 'en' ? '[ Find ID ]' : '[ Maghanap ng ID ]'}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
    if (stepsToRender.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="checkmark-circle-outline" size={48} color={colors.tertiaryGreen} style={styles.emptyIcon} />
          <Text style={[styles.emptyText, { color: themeColors.subText }]}>
            {t.allStepsDone}
          </Text>
        </View>
      );
    }
    return null;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <HeaderBar />
      <FlatList
        data={stepsToRender}
        keyExtractor={(item) => item.document.id}
        renderItem={({ item, index }) => (
          <StepCard
            step={item}
            stepNumber={index + 1}
            onMarkDone={() =>
              dispatch({ type: 'MARK_DONE', payload: item.document.id })
            }
          />
        )}
        ListHeaderComponent={
          <>
            {renderHeader()}
            {renderStatsBar()}
            {renderEmptyState()}
            {isSimple && state.targetDocument && stepsToRender.length > 0 && (
              <LinearTimeline roadmap={stepsToRender} />
            )}
            {stepsToRender.length > 0 && <View style={{ height: 8 }} />}
          </>
        }
        ListFooterComponent={
          !isSimple && state.targetDocument ? (
            <View>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setShowGraph(!showGraph)}
                style={[styles.toggleButton, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}
              >
                <Ionicons
                  name={showGraph ? "chevron-up-outline" : "chevron-down-outline"}
                  size={16}
                  color={themeColors.primary}
                  style={styles.toggleIcon}
                />
                <Text style={[styles.toggleButtonText, { color: themeColors.primary }]}>
                  {showGraph
                    ? (language === 'en' ? 'Hide Dependency Map' : 'Itago ang Mapa ng Dependency')
                    : (language === 'en' ? 'View Dependency Map' : 'Tingnan ang Mapa ng Dependency')}
                </Text>
              </TouchableOpacity>

              {showGraph && (
                <DependencyGraph
                  subgraph={subgraph}
                  possessed={state.possessedDocuments}
                  nextAttainable={nextAttainable}
                />
              )}

              {/* Kahn's Algorithm Trace panel */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setShowTrace(!showTrace)}
                style={[styles.toggleButton, { marginTop: 0, backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}
              >
                <Ionicons
                  name={showTrace ? "chevron-up-outline" : "chevron-down-outline"}
                  size={16}
                  color={themeColors.primary}
                  style={styles.toggleIcon}
                />
                <Text style={[styles.toggleButtonText, { color: themeColors.primary }]}>
                  {showTrace
                    ? (language === 'en' ? "Hide Algorithm Trace" : "Itago ang Algorithm Trace")
                    : (language === 'en' ? "View Algorithm Trace" : "Tingnan ang Algorithm Trace")}
                </Text>
              </TouchableOpacity>

              {showTrace && (
                <AlgorithmTrace trace={trace} subgraphEmpty={!state.targetDocument} />
              )}
            </View>
          ) : null
        }
        contentContainerStyle={{ paddingBottom: 40 }}
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
    paddingTop: 20,
    paddingBottom: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 8,
  },
  headerSubtitle: {
    ...typography.caption,
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1,
    color: colors.gray500,
  },
  targetLabel: {
    ...typography.screenTitle,
    fontSize: 22,
    lineHeight: 28,
  },
  modeToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: radii.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 2,
  },
  modeToggleBtnActive: {
    backgroundColor: colors.primaryTerracotta,
    borderColor: colors.primaryTerracotta,
  },
  modeToggleText: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    color: colors.secondaryTeal,
  },
  modeToggleTextActive: {
    color: colors.white,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: colors.borderSubtle,
    borderRadius: radii.md,
    padding: 3,
    marginTop: 16,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sm,
  },
  segmentBtnActive: {
    backgroundColor: colors.white,
    ...shadows.sm,
  },
  segmentText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: colors.gray500,
  },
  segmentTextActive: {
    color: colors.gray900,
  },
  simpleStatsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
    borderWidth: 1,
    borderRadius: radii.md,
    padding: 12,
    marginHorizontal: 24,
    marginBottom: 16,
    marginTop: 8,
  },
  simpleStatsText: {
    ...typography.body,
    fontSize: 13,
    lineHeight: 18,
    color: '#1e40af',
    flex: 1,
  },
  statsBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 20,
    marginTop: 4,
  },
  statCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radii.full,
    gap: spacing.xs,
  },
  statCapsuleText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 24,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: colors.gray500,
    textAlign: 'center',
  },
  emptyCtaButton: {
    marginTop: 14,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCtaText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    lineHeight: 20,
  },
  stepsContainer: {
    paddingTop: 8,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 24,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 8,
    paddingVertical: 12,
    backgroundColor: colors.white,
  },
  toggleIcon: {
    marginRight: 6,
  },
  toggleButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    lineHeight: 20,
    color: colors.primaryTerracotta,
  },
});
