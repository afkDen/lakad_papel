import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import Svg, { Line, Circle, Text as SvgText, Defs, Marker, Polygon } from 'react-native-svg';
import Ionicons from '@expo/vector-icons/Ionicons';
import { DocumentId, DocumentNode } from '../context/types';
import { REQUIREMENTS_GRAPH } from '../algorithms/requirementsGraph';
import { buildSubgraph } from '../algorithms/topologicalSort';
import { useDAGLayout } from '../hooks/useDAGLayout';
import { useTheme } from '../context/ThemeContext';
import { colors, spacing, radii, typography, shadows } from '../theme';

interface DAGExplorerProps {
  possessedDocuments: Set<DocumentId>;
  targetDocumentId: DocumentId | null;
  highlightAttainable: boolean;
  selectedNodeId: DocumentId | null;
  onNodeSelect: (id: DocumentId) => void;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Pulsing circle ring animation for attainable nodes
function PulsingRing({ x, y }: { x: number; y: number }) {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 1600,
        useNativeDriver: false, // Animating SVG non-transform props requires false
      })
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const radius = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [28, 42],
  });

  const opacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 0],
  });

  return (
    <AnimatedCircle
      cx={x}
      cy={y}
      r={radius}
      stroke={colors.teal600}
      strokeWidth={1.5}
      fill="none"
      opacity={opacity}
    />
  );
}

export default function DAGExplorer({
  possessedDocuments,
  targetDocumentId,
  highlightAttainable,
  selectedNodeId,
  onNodeSelect,
}: DAGExplorerProps) {
  const layout = useDAGLayout(REQUIREMENTS_GRAPH, 150, 95, 40, 50);
  const { colors: themeColors, isDarkMode } = useTheme();

  // Determine width and height of canvas based on layouts
  const coords = Object.values(layout);
  const maxX = coords.reduce((max, c) => Math.max(max, c.x), 0);
  const maxY = coords.reduce((max, c) => Math.max(max, c.y), 0);
  const canvasWidth = maxX + 80;
  const canvasHeight = maxY + 100;

  // Determine full ancestor chain for selected target
  const targetAncestors = React.useMemo(() => {
    if (!targetDocumentId) return new Set<DocumentId>();
    const subgraph = buildSubgraph(REQUIREMENTS_GRAPH, new Set(), targetDocumentId);
    return new Set<DocumentId>(Object.keys(subgraph));
  }, [targetDocumentId]);

  // Is a node attainable right now? (unpossessed, and all prereqs are possessed)
  const isNodeAttainable = (id: DocumentId, node: DocumentNode) => {
    if (possessedDocuments.has(id)) return false;
    return node.prerequisites.every((prereq) => possessedDocuments.has(prereq));
  };

  return (
    <View style={[styles.canvasWrapper, { width: canvasWidth, height: canvasHeight, backgroundColor: themeColors.background }]}>
      <Svg width={canvasWidth} height={canvasHeight}>
        {/* 1. RENDER EDGES FIRST (Behind circles) */}
        {Object.entries(REQUIREMENTS_GRAPH).map(([id, node]) => {
          const endPoint = layout[id];
          if (!endPoint) return null;

          return node.prerequisites.map((prereqId) => {
            const startPoint = layout[prereqId];
            if (!startPoint) return null;

            // Highlight edge if it connects nodes on target path
            const isHighlightedEdge =
              targetDocumentId !== null &&
              targetAncestors.has(id) &&
              targetAncestors.has(prereqId);

            // Attainable mode dims edges leading into locked nodes
            const isEndAttainable = isNodeAttainable(id, node);
            const isStartPossessed = possessedDocuments.has(prereqId);
            const shouldDimEdge =
              highlightAttainable && !(isEndAttainable && isStartPossessed);

            return (
              <Line
                key={`${prereqId}-${id}`}
                x1={startPoint.x}
                y1={startPoint.y}
                x2={endPoint.x}
                y2={endPoint.y}
                stroke={isHighlightedEdge ? colors.blue600 : (isDarkMode ? '#333333' : colors.gray200)}
                strokeWidth={isHighlightedEdge ? 2.5 : 1.5}
                opacity={shouldDimEdge ? 0.2 : 1}
              />
            );
          });
        })}

        {/* 2. RENDER ATTAINABLE PULSE RINGS */}
        {Object.entries(REQUIREMENTS_GRAPH).map(([id, node]) => {
          const pt = layout[id];
          if (!pt) return null;

          const attainable = isNodeAttainable(id, node);
          const shouldPulse = attainable && (!highlightAttainable || highlightAttainable);

          if (shouldPulse) {
            return <PulsingRing key={`pulse-${id}`} x={pt.x} y={pt.y} />;
          }
          return null;
        })}

        {/* 3. RENDER CIRCLES & TEXT */}
        {Object.entries(REQUIREMENTS_GRAPH).map(([id, node]) => {
          const pt = layout[id];
          if (!pt) return null;

          const isPossessed = possessedDocuments.has(id);
          const isTarget = targetDocumentId === id;
          const isPath = targetAncestors.has(id);
          const attainable = isNodeAttainable(id, node);

          // Node Color Mapping
          let nodeColor: string = isDarkMode ? '#404040' : colors.gray300;
          if (isPossessed) nodeColor = colors.green600;
          else if (isTarget) nodeColor = colors.blue600;
          else if (attainable) nodeColor = colors.teal600;
          else if (isPath) nodeColor = isDarkMode ? '#1e3a8a' : '#bfdbfe'; // Light blue highlight for path ancestors

          // Highlight / Dim Mode
          let nodeOpacity = 1;
          if (highlightAttainable && !attainable && !isPossessed) {
            nodeOpacity = 0.35;
          }

          const isSelected = selectedNodeId === id;

          // Helper to abbreviate name inside node
          const getAgencyAbbreviation = (label: string, agency: string) => {
            if (agency === 'SCHOOL') return 'SCH';
            if (agency === 'BARANGAY') return 'BGY';
            return agency;
          };

          const shortLabel = node.label.length > 12 ? `${node.label.slice(0, 10)}..` : node.label;

          return (
            <React.Fragment key={`node-${id}`}>
              {/* Outer stroke for currently selected node */}
              {isSelected && (
                <Circle
                  cx={pt.x}
                  cy={pt.y}
                  r={32}
                  fill="none"
                  stroke={themeColors.text}
                  strokeWidth={2}
                  strokeDasharray="4 2"
                />
              )}

              {/* Node Circle */}
              <Circle
                cx={pt.x}
                cy={pt.y}
                r={28}
                fill={nodeColor}
                opacity={nodeOpacity}
                onPress={() => onNodeSelect(id)}
              />

              {/* Inside Label: Agency */}
              <SvgText
                x={pt.x}
                y={pt.y + 4}
                textAnchor="middle"
                fill={isPath && !isTarget && !isPossessed ? (isDarkMode ? '#93c5fd' : '#1e40af') : colors.white}
                fontSize={9}
                fontWeight="bold"
                onPress={() => onNodeSelect(id)}
                opacity={nodeOpacity}
              >
                {getAgencyAbbreviation(node.label, node.agency)}
              </SvgText>

              {/* Node name label under the circle */}
              <SvgText
                x={pt.x}
                y={pt.y + 42}
                textAnchor="middle"
                fill={isSelected ? themeColors.text : themeColors.subText}
                fontSize={8}
                fontWeight={isSelected ? 'bold' : 'normal'}
                opacity={nodeOpacity}
              >
                {shortLabel}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  canvasWrapper: {
    // Background handled dynamically
  },
});
