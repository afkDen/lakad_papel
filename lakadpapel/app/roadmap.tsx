import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useDocumentContext } from '../src/hooks/useDocumentContext';
import { useLocation } from '../src/hooks/useLocation';
import StepCard from '../src/components/StepCard';
import DependencyGraph from '../src/components/DependencyGraph';
import { REQUIREMENTS_GRAPH } from '../src/algorithms/requirementsGraph';
import { buildSubgraph } from '../src/algorithms/topologicalSort';
import { colors } from '../src/theme';

export default function RoadmapScreen() {
  const { state, dispatch } = useDocumentContext();
  const { latitude, longitude } = useLocation();
  const [showGraph, setShowGraph] = useState(false);

  const remainingSteps = state.roadmap.filter((step) => !step.isDone);

  // Location Re-trigger: regenerate roadmap when GPS coordinates update
  useEffect(() => {
    if (state.targetDocument && latitude !== null && longitude !== null) {
      dispatch({ type: 'SET_TARGET', payload: state.targetDocument });
    }
  }, [latitude, longitude]);

  // Compute values for DependencyGraph when expanded
  let subgraph = {};
  const nextAttainable = new Set<string>();

  if (state.targetDocument) {
    subgraph = buildSubgraph(REQUIREMENTS_GRAPH, state.possessedDocuments, state.targetDocument);
    for (const [id, node] of Object.entries(subgraph)) {
      const nodeNode = node as any;
      const inDegree = nodeNode.prerequisites.filter((pId: string) => subgraph[pId] !== undefined).length;
      if (inDegree === 0) {
        nextAttainable.add(id);
      }
    }
  }

  const renderHeader = () => {
    if (!state.targetDocument) {
      return null;
    }
    const targetLabel = REQUIREMENTS_GRAPH[state.targetDocument]?.label ?? state.targetDocument;
    return (
      <View style={styles.headerContainer}>
        <Text style={styles.targetLabel}>{targetLabel}</Text>
        <Text style={styles.stepCount}>
          {remainingSteps.length} {remainingSteps.length === 1 ? 'step' : 'steps'} remaining
        </Text>
      </View>
    );
  };

  const renderEmptyState = () => {
    if (!state.targetDocument) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Select a document from 'What do I need?' to generate your roadmap.
          </Text>
        </View>
      );
    }
    if (remainingSteps.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            All steps complete. Check your History tab.
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
        {renderEmptyState()}

        {/* Roadmap Steps */}
        {remainingSteps.length > 0 && (
          <View>
            {remainingSteps.map((step, idx) => (
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

        {/* Dependency Map Toggle & Graph */}
        {state.targetDocument && (
          <View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowGraph(!showGraph)}
              style={styles.toggleButton}
            >
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
    paddingTop: 24,
    paddingBottom: 16,
  },
  targetLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    lineHeight: 28,
    color: colors.gray900,
  },
  stepCount: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: colors.gray500,
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 24,
  },
  emptyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 24,
    color: colors.gray500,
    textAlign: 'center',
  },
  toggleButton: {
    marginHorizontal: 24,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    lineHeight: 20,
    color: colors.blue600,
  },
});
