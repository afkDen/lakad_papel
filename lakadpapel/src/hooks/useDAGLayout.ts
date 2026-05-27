import { useMemo } from 'react';
import { DocumentId, DocumentNode } from '../context/types';

export function getTopologicalLevels(
  graph: Record<DocumentId, DocumentNode>
): Record<DocumentId, number> {
  const levels: Record<DocumentId, number> = {};

  function getNodeLevel(id: DocumentId): number {
    if (levels[id] !== undefined) {
      return levels[id];
    }
    const node = graph[id];
    if (!node || node.prerequisites.length === 0) {
      levels[id] = 0;
      return 0;
    }
    let maxPrereqLevel = 0;
    for (const prereqId of node.prerequisites) {
      if (graph[prereqId]) {
        maxPrereqLevel = Math.max(maxPrereqLevel, getNodeLevel(prereqId));
      }
    }
    levels[id] = maxPrereqLevel + 1;
    return levels[id];
  }

  for (const id of Object.keys(graph)) {
    getNodeLevel(id);
  }

  return levels;
}

export function computeDAGPositions(
  graph: Record<DocumentId, DocumentNode>,
  columnWidth = 135,
  rowHeight = 85,
  paddingX = 35,
  paddingY = 40
): Record<DocumentId, { x: number; y: number }> {
  const levels = getTopologicalLevels(graph);
  
  // Group nodes by level
  const nodesByLevel: Record<number, DocumentId[]> = {};
  for (const [id, level] of Object.entries(levels)) {
    if (!nodesByLevel[level]) {
      nodesByLevel[level] = [];
    }
    nodesByLevel[level].push(id);
  }

  const maxLevel = Math.max(...Object.keys(nodesByLevel).map(Number), 0);
  for (let l = 0; l <= maxLevel; l++) {
    if (nodesByLevel[l]) {
      // Sort alphabetically for stable, predictable rendering
      nodesByLevel[l].sort();
    }
  }

  const positions: Record<DocumentId, { x: number; y: number }> = {};
  for (let l = 0; l <= maxLevel; l++) {
    const ids = nodesByLevel[l] || [];
    const numNodes = ids.length;
    for (let i = 0; i < numNodes; i++) {
      const id = ids[i];
      const x = paddingX + l * columnWidth;
      const y = paddingY + i * rowHeight;
      positions[id] = { x, y };
    }
  }

  return positions;
}

export function useDAGLayout(
  graph: Record<DocumentId, DocumentNode>,
  columnWidth = 135,
  rowHeight = 85,
  paddingX = 35,
  paddingY = 40
) {
  return useMemo(() => {
    return computeDAGPositions(graph, columnWidth, rowHeight, paddingX, paddingY);
  }, [graph, columnWidth, rowHeight, paddingX, paddingY]);
}
