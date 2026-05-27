import React, { useState } from 'react';
import { View, Text, ScrollView, Dimensions, StyleSheet } from 'react-native';
import Svg, { Line, Circle, Text as SvgText } from 'react-native-svg';
import { DocumentNode, DocumentId } from '../context/types';
import { colors } from '../theme';

interface DependencyGraphProps {
  subgraph: Record<DocumentId, DocumentNode>;
  possessed: Set<DocumentId>;
  nextAttainable: Set<DocumentId>;
}

const DependencyGraph = React.memo(function DependencyGraph({
  subgraph,
  possessed,
  nextAttainable,
}: DependencyGraphProps) {
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const subgraphKeys = Object.keys(subgraph);

  if (subgraphKeys.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No steps remaining.</Text>
      </View>
    );
  }

  // 1. Calculate topological levels of each node in the subgraph
  const levels: Record<DocumentId, number> = {};
  for (const id of subgraphKeys) {
    levels[id] = 0;
  }

  let changed = true;
  let iterations = 0;
  const maxIterations = subgraphKeys.length * 2;

  while (changed && iterations < maxIterations) {
    changed = false;
    iterations++;
    for (const id of subgraphKeys) {
      const node = subgraph[id];
      const prereqsInSubgraph = node.prerequisites.filter((pId) => subgraph[pId] !== undefined);
      if (prereqsInSubgraph.length > 0) {
        let maxPrereqLevel = -1;
        for (const pId of prereqsInSubgraph) {
          maxPrereqLevel = Math.max(maxPrereqLevel, levels[pId]);
        }
        const targetLevel = maxPrereqLevel + 1;
        if (levels[id] !== targetLevel) {
          levels[id] = targetLevel;
          changed = true;
        }
      }
    }
  }

  // 2. Group nodes by level
  const nodesByLevel: Record<number, DocumentId[]> = {};
  for (const [id, lvl] of Object.entries(levels)) {
    if (!nodesByLevel[lvl]) {
      nodesByLevel[lvl] = [];
    }
    nodesByLevel[lvl].push(id);
  }

  const levelKeys = Object.keys(nodesByLevel)
    .map(Number)
    .sort((a, b) => a - b);
  const levelCount = levelKeys.length;

  // 3. Compute coordinates for each node
  const screenWidth = Dimensions.get('window').width;
  
  // Dynamically calculate graph height based on maximum nodes in a level to prevent overlap
  let maxNodesInLevel = 1;
  levelKeys.forEach((lvl) => {
    maxNodesInLevel = Math.max(maxNodesInLevel, nodesByLevel[lvl].length);
  });
  const graphHeight = Math.max(200, maxNodesInLevel * 80);

  const levelWidth = 110;
  const paddingX = 40;
  const svgWidth = Math.max(screenWidth - 12, levelCount * levelWidth + paddingX * 2);

  const coords: Record<DocumentId, { x: number; y: number }> = {};

  levelKeys.forEach((lvl, lvlIdx) => {
    const ids = nodesByLevel[lvl];
    const k = ids.length;
    const x = paddingX + lvlIdx * levelWidth + levelWidth / 2;

    ids.forEach((id, nodeIdx) => {
      const y = ((nodeIdx + 1) * graphHeight) / (k + 1);
      coords[id] = { x, y };
    });
  });

  // 4. Determine node colors
  const getNodeColor = (id: DocumentId) => {
    if (possessed.has(id)) return colors.green600;
    if (nextAttainable.has(id)) return colors.teal600;
    return colors.gray400;
  };

  // 5. Build lines and circles
  const lines: React.ReactNode[] = [];
  const circles: React.ReactNode[] = [];

  subgraphKeys.forEach((id) => {
    const node = subgraph[id];
    const fromCoord = coords[id];
    if (!fromCoord) return;

    node.prerequisites.forEach((prereqId) => {
      const toCoord = coords[prereqId];
      if (toCoord) {
        lines.push(
          <Line
            key={`${prereqId}->${id}`}
            x1={toCoord.x}
            y1={toCoord.y}
            x2={fromCoord.x}
            y2={fromCoord.y}
            stroke={colors.gray300}
            strokeWidth={2}
          />
        );
      }
    });
  });

  subgraphKeys.forEach((id) => {
    const node = subgraph[id];
    const coord = coords[id];
    if (!coord) return;

    const color = getNodeColor(id);

    circles.push(
      <React.Fragment key={id}>
        <Circle
          cx={coord.x}
          cy={coord.y}
          r={20}
          fill={color}
          stroke={colors.white}
          strokeWidth={2}
          onPress={() => setSelectedLabel(node.label)}
        />
        <SvgText
          x={coord.x}
          y={coord.y + 3}
          fontSize="8"
          fontWeight="bold"
          fill={colors.white}
          textAnchor="middle"
          onPress={() => setSelectedLabel(node.label)}
        >
          {node.agency}
        </SvgText>
      </React.Fragment>
    );
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Prerequisite Dependency Map</Text>

      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
        <Svg
          width={svgWidth}
          height={graphHeight}
          viewBox={`0 0 ${svgWidth} ${graphHeight}`}
        >
          {lines}
          {circles}
        </Svg>
      </ScrollView>

      <Text style={styles.selectedLabel}>
        {selectedLabel ? `Selected: ${selectedLabel}` : 'Tap a node to view document details'}
      </Text>
    </View>
  );
});

export default DependencyGraph;

const styles = StyleSheet.create({
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: colors.gray50,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 8,
    marginHorizontal: 24,
    marginVertical: 16,
  },
  emptyText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    lineHeight: 20,
    color: colors.gray500,
  },
  container: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 8,
    marginHorizontal: 24,
    marginVertical: 16,
    padding: 16,
  },
  title: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    lineHeight: 16,
    color: colors.gray500,
    marginBottom: 8,
  },
  selectedLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 16,
    color: colors.gray400,
    textAlign: 'center',
    marginTop: 8,
    minHeight: 16,
  },
});
