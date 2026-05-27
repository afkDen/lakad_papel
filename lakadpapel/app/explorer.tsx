import React, { useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useDocumentContext } from '../src/hooks/useDocumentContext';
import DAGExplorer from '../src/components/DAGExplorer';
import NodeDetailSheet from '../src/components/NodeDetailSheet';
import { REQUIREMENTS_GRAPH } from '../src/algorithms/requirementsGraph';
import { colors, spacing, radii, typography, shadows } from '../src/theme';
import { DocumentId } from '../src/context/types';

export default function ExplorerScreen() {
  const { state, dispatch } = useDocumentContext();
  const router = useRouter();
  const [highlightAttainable, setHighlightAttainable] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<DocumentId | null>(null);

  // Derived Graph Stats
  const totalNodes = Object.keys(REQUIREMENTS_GRAPH).length;
  
  const totalEdges = Object.values(REQUIREMENTS_GRAPH).reduce(
    (sum, n) => sum + n.prerequisites.length,
    0
  );

  const ownedCount = state.possessedDocuments.size;

  // Calculate attainable documents (in-degree 0 in the current unpossessed set)
  const attainableCount = Object.entries(REQUIREMENTS_GRAPH).filter(([id, node]) => {
    if (state.possessedDocuments.has(id)) return false;
    return node.prerequisites.every((prereq) => state.possessedDocuments.has(prereq));
  }).length;

  const remainingCount = state.roadmap.filter((step) => !step.isDone).length;

  // Estimated days & costs based on remaining steps
  const estDays = state.roadmap.reduce((sum, step) => {
    if (step.isDone) return sum;
    const daysStr = step.document.typicalDays.toLowerCase();
    if (daysStr.includes('same day')) return sum + 0.5;
    const match = daysStr.match(/(\d+)/);
    return sum + (match ? parseInt(match[1]) : 1);
  }, 0);

  const estCost = state.roadmap.reduce((sum, step) => {
    if (step.isDone) return sum;
    const feesStr = step.document.fees.toLowerCase();
    if (feesStr.includes('free')) return sum;
    const match = feesStr.replace(/,/g, '').match(/(\d+)/);
    return sum + (match ? parseInt(match[1]) : 0);
  }, 0);

  const handleNodeSelect = (id: DocumentId) => {
    setSelectedNodeId(id);
  };

  const handleSetTarget = (id: DocumentId) => {
    dispatch({ type: 'SET_TARGET', payload: id });
    router.push('/roadmap');
  };

  const handleTogglePossession = (id: DocumentId) => {
    dispatch({ type: 'TOGGLE_DOCUMENT', payload: id });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 1. Header Navigation Bar */}
      <View style={styles.header}>
        <View style={styles.headerTitleCol}>
          <Text style={styles.headerTitle}>Graph Explorer</Text>
          <Text style={styles.headerSubtitle}>Explore Philippine Document Dependencies</Text>
        </View>
        
        {/* Toggle Mode */}
        <TouchableOpacity
          style={[styles.highlightBtn, highlightAttainable && styles.highlightBtnActive]}
          onPress={() => setHighlightAttainable(!highlightAttainable)}
          activeOpacity={0.8}
        >
          <Ionicons
            name={highlightAttainable ? "flash" : "flash-outline"}
            size={18}
            color={highlightAttainable ? colors.white : colors.teal600}
            style={styles.highlightBtnIcon}
          />
          <Text style={[styles.highlightBtnText, highlightAttainable && styles.highlightBtnTextActive]}>
            Next Steps
          </Text>
        </TouchableOpacity>
      </View>

      {/* 2. Color Legend */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.green600 }]} />
          <Text style={styles.legendText}>Owned</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.teal600 }]} />
          <Text style={styles.legendText}>Available</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.gray300 }]} />
          <Text style={styles.legendText}>Locked</Text>
        </View>
        {state.targetDocument && (
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.blue600 }]} />
            <Text style={styles.legendText}>Target</Text>
          </View>
        )}
      </View>

      {/* 3. Live Graph Stats Bar */}
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
            <Text style={[styles.statNum, { color: colors.teal600 }]}>{attainableCount}</Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>
          {state.targetDocument && (
            <>
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
            </>
          )}
        </ScrollView>
      </View>

      {/* 4. Canvas View Area (Horizontal + Vertical Scrollable Grid) */}
      <View style={styles.canvasContainer}>
        <ScrollView style={styles.vertScroll} contentContainerStyle={styles.vertScrollContent}>
          <ScrollView horizontal style={styles.horizScroll} contentContainerStyle={styles.horizScrollContent}>
            <DAGExplorer
              possessedDocuments={state.possessedDocuments}
              targetDocumentId={state.targetDocument}
              highlightAttainable={highlightAttainable}
              selectedNodeId={selectedNodeId}
              onNodeSelect={handleNodeSelect}
            />
          </ScrollView>
        </ScrollView>
      </View>

      {/* 5. Details Drawer Bottom Sheet */}
      <NodeDetailSheet
        documentId={selectedNodeId}
        onClose={() => setSelectedNodeId(null)}
        onSetTarget={handleSetTarget}
        onTogglePossession={handleTogglePossession}
        isPossessed={selectedNodeId ? state.possessedDocuments.has(selectedNodeId) : false}
        isTarget={selectedNodeId ? state.targetDocument === selectedNodeId : false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.white,
  },
  headerTitleCol: {
    flex: 1,
    paddingRight: spacing.md,
  },
  headerTitle: {
    ...typography.screenTitle,
    fontSize: 22,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.gray500,
    marginTop: 2,
  },
  highlightBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.teal600,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    height: 34,
  },
  highlightBtnActive: {
    backgroundColor: colors.teal600,
    borderColor: colors.teal600,
  },
  highlightBtnIcon: {
    marginRight: 4,
  },
  highlightBtnText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: colors.teal600,
  },
  highlightBtnTextActive: {
    color: colors.white,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: radii.full,
    marginRight: 4,
  },
  legendText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.gray500,
  },
  statsBarContainer: {
    height: 64,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
    backgroundColor: colors.gray50,
  },
  statsScroll: {
    paddingHorizontal: spacing.xl,
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
  canvasContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  vertScroll: {
    flex: 1,
  },
  vertScrollContent: {
    flexGrow: 1,
  },
  horizScroll: {
    flex: 1,
  },
  horizScrollContent: {
    flexGrow: 1,
  },
});
