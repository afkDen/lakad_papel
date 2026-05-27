import { DocumentId, DocumentNode } from '../context/types';

export function buildSubgraph(
  graph: Record<DocumentId, DocumentNode>,
  possessed: Set<DocumentId>,
  target: DocumentId
): Record<DocumentId, DocumentNode> {
  if (possessed.has(target)) {
    return {};
  }

  const subgraph: Record<DocumentId, DocumentNode> = {};
  const visited = new Set<DocumentId>();
  const queue: DocumentId[] = [target];
  visited.add(target);

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const node = graph[currentId];
    if (!node) continue;

    subgraph[currentId] = {
      ...node,
      prerequisites: [...node.prerequisites],
    };

    for (const prereqId of node.prerequisites) {
      if (possessed.has(prereqId)) {
        continue;
      }
      if (!visited.has(prereqId)) {
        visited.add(prereqId);
        queue.push(prereqId);
      }
    }
  }

  // Clean up prerequisites of nodes in the subgraph so they only reference nodes that are also in the subgraph
  for (const node of Object.values(subgraph)) {
    node.prerequisites = node.prerequisites.filter((id) => subgraph[id] !== undefined);
  }

  return subgraph;
}

export function topologicalSort(subgraph: Record<DocumentId, DocumentNode>): DocumentId[] {
  const inDegree: Record<DocumentId, number> = {};
  const adj: Record<DocumentId, DocumentId[]> = {};

  // Initialize
  for (const id of Object.keys(subgraph)) {
    inDegree[id] = 0;
    adj[id] = [];
  }

  // Populate adjacency list and in-degrees
  for (const [id, node] of Object.entries(subgraph)) {
    for (const prereqId of node.prerequisites) {
      if (subgraph[prereqId]) {
        adj[prereqId].push(id);
        inDegree[id]++;
      }
    }
  }

  // Queue of nodes with in-degree 0
  const queue: DocumentId[] = [];
  const sortedKeys = Object.keys(subgraph).sort();
  for (const id of sortedKeys) {
    if (inDegree[id] === 0) {
      queue.push(id);
    }
  }

  const order: DocumentId[] = [];

  while (queue.length > 0) {
    const u = queue.shift()!;
    order.push(u);

    const neighbors = adj[u] || [];
    for (const v of neighbors) {
      inDegree[v]--;
      if (inDegree[v] === 0) {
        queue.push(v);
      }
    }
  }

  if (order.length !== Object.keys(subgraph).length) {
    throw new Error('Cycle detected in prerequisite graph');
  }

  return order;
}

export interface TraceStep {
  step: number;
  dequeued: DocumentId;
  queueBefore: DocumentId[];
  queueAfter: DocumentId[];
  inDegreeChanges: { node: DocumentId; from: number; to: number }[];
}

export function topologicalSortWithTrace(
  subgraph: Record<DocumentId, DocumentNode>
): { order: DocumentId[]; trace: TraceStep[] } {
  const inDegree: Record<DocumentId, number> = {};
  const adj: Record<DocumentId, DocumentId[]> = {};

  // Initialize
  for (const id of Object.keys(subgraph)) {
    inDegree[id] = 0;
    adj[id] = [];
  }

  // Populate adjacency list and in-degrees
  for (const [id, node] of Object.entries(subgraph)) {
    for (const prereqId of node.prerequisites) {
      if (subgraph[prereqId]) {
        adj[prereqId].push(id);
        inDegree[id]++;
      }
    }
  }

  // Queue of nodes with in-degree 0 (sort keys for determinism)
  const queue: DocumentId[] = [];
  const sortedKeys = Object.keys(subgraph).sort();
  for (const id of sortedKeys) {
    if (inDegree[id] === 0) {
      queue.push(id);
    }
  }

  const order: DocumentId[] = [];
  const trace: TraceStep[] = [];
  let stepCounter = 1;

  while (queue.length > 0) {
    const queueBefore = [...queue];
    const u = queue.shift()!;
    order.push(u);

    const inDegreeChanges: { node: DocumentId; from: number; to: number }[] = [];
    const neighbors = adj[u] || [];
    for (const v of neighbors) {
      const fromVal = inDegree[v];
      inDegree[v]--;
      const toVal = inDegree[v];
      inDegreeChanges.push({ node: v, from: fromVal, to: toVal });
      if (inDegree[v] === 0) {
        queue.push(v);
      }
    }

    const queueAfter = [...queue];

    trace.push({
      step: stepCounter++,
      dequeued: u,
      queueBefore,
      queueAfter,
      inDegreeChanges,
    });
  }

  if (order.length !== Object.keys(subgraph).length) {
    throw new Error('Cycle detected in prerequisite graph');
  }

  return { order, trace };
}

// Inline self-test for development (only run when testing)
if (process.env.NODE_ENV === 'test') {
  // Can be used by Jest directly
}
