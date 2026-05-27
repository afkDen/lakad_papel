import { AgencyBranch, AgencyType } from '../context/types';
import { buildProximityEdges } from '../data/agencyLocations';

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export interface LocationGraph {
  branches: AgencyBranch[];
  adjacency: Map<string, string[]>;
}

export function buildLocationGraph(
  branches: AgencyBranch[],
  thresholdKm: number = 3
): LocationGraph {
  const adjacency = buildProximityEdges(branches, thresholdKm);
  return { branches, adjacency };
}

export function bfsNearestBranch(
  userLatitude: number,
  userLongitude: number,
  agencyType: AgencyType,
  locationGraph: LocationGraph
): AgencyBranch | null {
  if (agencyType === 'BARANGAY' || agencyType === 'SCHOOL') {
    return null;
  }

  const { branches, adjacency } = locationGraph;
  if (branches.length === 0) {
    return null;
  }

  // 1. Find the origin node (branch closest to the user regardless of agency)
  let origin: AgencyBranch | null = null;
  let minDistance = Infinity;

  for (const b of branches) {
    const dist = haversineKm(userLatitude, userLongitude, b.latitude, b.longitude);
    if (dist < minDistance) {
      minDistance = dist;
      origin = b;
    }
  }

  if (!origin) {
    return null;
  }

  // 2. Initialize BFS from origin
  const visited = new Set<string>();
  const queue: string[] = [origin.id];
  visited.add(origin.id);

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const currentBranch = branches.find((b) => b.id === currentId);
    if (!currentBranch) continue;

    if (currentBranch.agency === agencyType) {
      return currentBranch;
    }

    const neighbors = adjacency.get(currentId) || [];
    for (const neighborId of neighbors) {
      if (!visited.has(neighborId)) {
        visited.add(neighborId);
        queue.push(neighborId);
      }
    }
  }

  return null;
}
