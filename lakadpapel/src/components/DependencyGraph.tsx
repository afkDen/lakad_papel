import React, { useState } from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import Svg, { Line, Circle, Text as SvgText } from 'react-native-svg';
import { DocumentNode, DocumentId } from '../context/types';

interface DependencyGraphProps {
  subgraph: Record<DocumentId, DocumentNode>;
  possessed: Set<DocumentId>;
  nextAttainable: Set<DocumentId>;
}

export default function DependencyGraph({
  subgraph,
  possessed,
  nextAttainable,
}: DependencyGraphProps) {
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const subgraphKeys = Object.keys(subgraph);

  if (subgraphKeys.length === 0) {
    return (
      <View className="items-center justify-center p-6 bg-gray-50 border border-gray-200 rounded-lg mx-6 my-4">
        <Text className="text-sm font-semibold text-gray-500">No steps remaining.</Text>
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
  const maxIterations = subgraphKeys.length * 2; // prevent infinite loops in case of unexpected cycles

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
  const graphHeight = 200;
  const levelWidth = 110;
  const paddingX = 40;
  const svgWidth = Math.max(screenWidth - 12, levelCount * levelWidth + paddingX * 2);

  const coords: Record<DocumentId, { x: number; y: number }> = {};

  levelKeys.forEach((lvl, lvlIdx) => {
    const ids = nodesByLevel[lvl];
    const k = ids.length;

    // Distribute horizontally
    const x = paddingX + lvlIdx * levelWidth + levelWidth / 2;

    ids.forEach((id, nodeIdx) => {
      // Distribute vertically
      const y = ((nodeIdx + 1) * graphHeight) / (k + 1);
      coords[id] = { x, y };
    });
  });

  // 4. Determine node colors
  const getNodeColor = (id: DocumentId) => {
    if (possessed.has(id)) return '#16a34a'; // green
    if (nextAttainable.has(id)) return '#0d9488'; // teal
    return '#9ca3af'; // grey
  };

  // 5. Build lines and circles
  const lines: React.ReactNode[] = [];
  const circles: React.ReactNode[] = [];

  // Draw lines first (so they render behind circles)
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
            stroke="#d1d5db"
            strokeWidth={2}
          />
        );
      }
    });
  });

  // Draw circles and text on top
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
          stroke="#ffffff"
          strokeWidth={2}
          onPress={() => setSelectedLabel(node.label)}
        />
        <SvgText
          x={coord.x}
          y={coord.y + 3}
          fontSize="8"
          fontWeight="bold"
          fill="#ffffff"
          textAnchor="middle"
          onPress={() => setSelectedLabel(node.label)}
        >
          {node.agency}
        </SvgText>
      </React.Fragment>
    );
  });

  return (
    <View className="bg-white border border-gray-200 rounded-lg mx-6 my-4 p-4">
      <Text className="text-xs text-gray-500 font-semibold mb-2">
        Prerequisite Dependency Map
      </Text>

      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
        <Svg width={svgWidth} height={graphHeight}>
          {lines}
          {circles}
        </Svg>
      </ScrollView>

      <Text className="text-center text-xs text-gray-400 mt-2 min-h-[16px]">
        {selectedLabel ? `Selected: ${selectedLabel}` : 'Tap a node to view document details'}
      </Text>
    </View>
  );
}
