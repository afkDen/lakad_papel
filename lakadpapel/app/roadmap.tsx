import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useDocumentContext } from '../src/hooks/useDocumentContext';
import { useLocation } from '../src/hooks/useLocation';
import StepCard from '../src/components/StepCard';
import DependencyGraph from '../src/components/DependencyGraph';
import AlgorithmTrace from '../src/components/AlgorithmTrace';
import LinearTimeline from '../src/components/LinearTimeline';
import { REQUIREMENTS_GRAPH } from '../src/algorithms/requirementsGraph';
import { buildSubgraph, topologicalSort, topologicalSortWithTrace, TraceStep } from '../src/algorithms/topologicalSort';
import { buildLocationGraph, bfsNearestBranch } from '../src/algorithms/bfsLocator';
import { AGENCY_BRANCHES } from '../src/data/agencyLocations';
import { colors, spacing, radii, typography, shadows } from '../src/theme';

// Module level cached branch location graph
const locationGraph = buildLocationGraph(AGENCY_BRANCHES, 5);

export default function RoadmapScreen() {
  const { state, dispatch } = useDocumentContext();
  const { latitude, longitude } = useLocation();
  const [showGraph, setShowGraph] = useState(false);
  const [showTrace, setShowTrace] = useState(false);
  const [viewMode, setViewMode] = useState<'remaining' | 'full'>('remaining');

  const isSimple = state.userMode === 'simple';

  // Location Re-trigger: regenerate roadmap when GPS updates
  useEffect(() => {
    if (state.targetDocument && latitude !== null && longitude !== null) {
      dispatch({ type: 'SET_TARGET', payload: state.targetDocument });
    }
  }, [latitude, longitude]);

  // Compute values for DependencyGraph and trace
  let subgraph = {};
  const nextAttainable = new Set<string>();
  let trace: TraceStep[] = [];

  if (state.targetDocument) {
    try {
      const activeSubgraph = buildSubgraph(REQUIREMENTS_GRAPH, state.possessedDocuments, state.targetDocument);
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
            <Text style={styles.headerSubtitle}>
              {isSimple ? 'YOUR JOURNEY TO GET' : 'ACTIVE ROADMAP'}
            </Text>
            <Text style={styles.targetLabel}>{targetLabel}</Text>
          </View>

          {/* Mode Switcher Toggle */}
          <TouchableOpacity
            style={[styles.modeToggleBtn, !isSimple && styles.modeToggleBtnActive]}
            onPress={() => dispatch({ type: 'TOGGLE_USER_MODE' })}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isSimple ? "accessibility-sharp" : "git-network-sharp"}
              size={12}
              color={isSimple ? colors.teal600 : colors.white}
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.modeToggleText, !isSimple && styles.modeToggleTextActive]}>
              {isSimple ? 'Simple' : 'Advanced'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Minimum vs Full Path Toggle (Advanced Mode Only) */}
        {!isSimple && (
          <View style={styles.segmentedControl}>
            <TouchableOpacity
              style={[styles.segmentBtn, viewMode === 'remaining' && styles.segmentBtnActive]}
              onPress={() => setViewMode('remaining')}
              activeOpacity={0.8}
            >
              <Text style={[styles.segmentText, viewMode === 'remaining' && styles.segmentTextActive]}>
                Remaining ({remainingCount})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.segmentBtn, viewMode === 'full' && styles.segmentBtnActive]}
              onPress={() => setViewMode('full')}
              activeOpacity={0.8}
            >
              <Text style={[styles.segmentText, viewMode === 'full' && styles.segmentTextActive]}>
                Full Path
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderStatsBar = () => {
    if (!state.targetDocument) return null;

    if (isSimple) {
      // Clean, senior-friendly simple stats card
      return (
        <View style={styles.simpleStatsCard}>
          <Ionicons name="information-circle" size={18} color={colors.blue600} style={{ marginRight: 8 }} />
          <Text style={styles.simpleStatsText}>
            You have <Text style={{ fontFamily: 'Inter_700Bold' }}>{remainingCount}</Text> steps left • approx.{' '}
            <Text style={{ fontFamily: 'Inter_700Bold' }}>{estDays}</Text> days • est. cost ₱{estCost}
          </Text>
        </View>
      );
    }

    // Advanced Stats Bar
    return (
      <View style={styles.statsBarContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsScroll}
        >
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{totalNodes}</Text>
            <Text style={styles.statLabel}>Total Nodes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{totalEdges}</Text>
            <Text style={styles.statLabel}>Edges</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNum, { color: colors.green600 }]}>{ownedCount}</Text>
            <Text style={styles.statLabel}>Owned</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNum, { color: colors.blue600 }]}>{remainingCount}</Text>
            <Text style={styles.statLabel}>Remaining</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{estDays}d</Text>
            <Text style={styles.statLabel}>Est. Days</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>₱{estCost}</Text>
            <Text style={styles.statLabel}>Est. Cost</Text>
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderEmptyState = () => {
    if (!state.targetDocument) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="map-outline" size={48} color={colors.gray400} style={styles.emptyIcon} />
          <Text style={styles.emptyText}>
            {isSimple
              ? "Select a document you want to get in the 'Find' tab to start."
              : "Select a document from 'What do I need?' to generate your roadmap."}
          </Text>
        </View>
      );
    }
    if (stepsToRender.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="checkmark-circle-outline" size={48} color={colors.green600} style={styles.emptyIcon} />
          <Text style={styles.emptyText}>
            All steps complete! Check your History tab.
          </Text>
        </View>
      );
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {renderHeader()}
        {renderStatsBar()}
        {renderEmptyState()}

        {/* 1. RENDER LINEAR TIMELINE (Simple Mode Only) */}
        {isSimple && state.targetDocument && stepsToRender.length > 0 && (
          <LinearTimeline roadmap={stepsToRender} />
        )}

        {/* Roadmap Steps */}
        {stepsToRender.length > 0 && (
          <View style={styles.stepsContainer}>
            {stepsToRender.map((step, idx) => (
              <StepCard
                key={step.document.id}
                step={step}
                stepNumber={idx + 1}
                onMarkDone={() =>
                  dispatch({ type: 'MARK_DONE', payload: step.document.id })
                }
              />
            ))}
          </View>
        )}

        {/* Dependency Map Section (Advanced Mode Only) */}
        {!isSimple && state.targetDocument && (
          <View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowGraph(!showGraph)}
              style={styles.toggleButton}
            >
              <Ionicons
                name={showGraph ? "chevron-up-outline" : "chevron-down-outline"}
                size={16}
                color={colors.blue600}
                style={styles.toggleIcon}
              />
              <Text style={styles.toggleButtonText}>
                {showGraph ? 'Hide Dependency Map' : 'View Dependency Map'}
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
              style={[styles.toggleButton, { marginTop: 0 }]}
            >
              <Ionicons
                name={showTrace ? "chevron-up-outline" : "chevron-down-outline"}
                size={16}
                color={colors.blue600}
                style={styles.toggleIcon}
              />
              <Text style={styles.toggleButtonText}>
                {showTrace ? "Hide Algorithm Trace" : "View Algorithm Trace"}
              </Text>
            </TouchableOpacity>

            {showTrace && (
              <AlgorithmTrace trace={trace} subgraphEmpty={!state.targetDocument} />
            )}
          </View>
        )}
      </ScrollView>
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
    backgroundColor: colors.blue600,
    borderColor: colors.blue600,
  },
  modeToggleText: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    color: colors.teal600,
  },
  modeToggleTextActive: {
    color: colors.white,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: colors.gray100,
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
    backgroundColor: colors.blueLight,
    borderColor: colors.blueBorder,
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
    color: colors.blueText,
    flex: 1,
  },
  statsBarContainer: {
    height: 64,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
    backgroundColor: colors.gray50,
    marginBottom: 16,
  },
  statsScroll: {
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: spacing.sm,
  },
  statCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: radii.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    height: 44,
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNum: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    color: colors.gray900,
  },
  statLabel: {
    fontSize: 8,
    fontFamily: 'Inter_400Regular',
    color: colors.gray500,
    marginTop: 1,
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
    borderColor: colors.gray200,
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
    color: colors.blue600,
  },
});
