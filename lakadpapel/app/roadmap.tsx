import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, FlatList } from 'react-native';
import { useDocumentContext } from '../src/hooks/useDocumentContext';
import { useLocation } from '../src/hooks/useLocation';
import StepCard from '../src/components/StepCard';
import DependencyGraph from '../src/components/DependencyGraph';
import { REQUIREMENTS_GRAPH } from '../src/algorithms/requirementsGraph';
import { buildSubgraph } from '../src/algorithms/topologicalSort';

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
      <View className="px-6 pt-6 pb-4">
        <Text className="text-2xl font-bold text-gray-900 leading-tight">
          {targetLabel}
        </Text>
        <Text className="text-sm text-gray-500 mt-1">
          {remainingSteps.length} {remainingSteps.length === 1 ? 'step' : 'steps'} remaining
        </Text>
      </View>
    );
  };

  const renderEmptyState = () => {
    if (!state.targetDocument) {
      return (
        <View className="flex-1 items-center justify-center py-20 px-6">
          <Text className="text-base text-gray-500 text-center leading-normal">
            Select a document from 'What do I need?' to generate your roadmap.
          </Text>
        </View>
      );
    }
    if (remainingSteps.length === 0) {
      return (
        <View className="flex-1 items-center justify-center py-20 px-6">
          <Text className="text-base text-gray-500 text-center leading-normal">
            All steps complete. Check your History tab.
          </Text>
        </View>
      );
    }
    return null;
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
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
              className="mx-6 my-4 border border-gray-200 rounded-lg py-3 items-center justify-center"
            >
              <Text className="text-sm text-blue-600 font-semibold">
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
