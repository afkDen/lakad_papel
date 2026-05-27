import {
  haversineKm,
  buildLocationGraph,
  bfsNearestBranch,
  LocationGraph,
} from '../src/algorithms/bfsLocator';
import { AGENCY_BRANCHES } from '../src/data/agencyLocations';
import { AgencyBranch } from '../src/context/types';

describe('BFS Nearest Branch Locator Tests', () => {
  describe('Haversine Formula Tests', () => {
    it('should return 0 for identical points', () => {
      const lat = 14.5841;
      const lon = 121.0573;
      expect(haversineKm(lat, lon, lat, lon)).toBeCloseTo(0, 4);
    });

    it('should return a reasonable distance between SM Megamall and SM North EDSA', () => {
      // SM Megamall: 14.5841, 121.0573
      // SM North EDSA: 14.6563, 121.0294
      const distance = haversineKm(14.5841, 121.0573, 14.6563, 121.0294);
      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(50);
    });
  });

  describe('buildLocationGraph Tests', () => {
    it('should build a valid location graph with adjacency edges', () => {
      const graph = buildLocationGraph(AGENCY_BRANCHES, 3); // 3km threshold
      expect(graph.branches).toEqual(AGENCY_BRANCHES);
      expect(graph.adjacency.size).toBe(AGENCY_BRANCHES.length);

      // Verify that at least one branch has a neighbor
      let totalNeighbors = 0;
      for (const [id, neighbors] of graph.adjacency.entries()) {
        totalNeighbors += neighbors.length;
      }
      expect(totalNeighbors).toBeGreaterThan(0);
    });
  });

  describe('bfsNearestBranch Tests', () => {
    let graph: LocationGraph;

    beforeAll(() => {
      graph = buildLocationGraph(AGENCY_BRANCHES, 5); // 5km threshold to ensure nice connectivity
    });

    it('should locate a DFA branch near SM Megamall', () => {
      // SM Megamall coordinates: 14.5841, 121.0573
      const nearestDfa = bfsNearestBranch(14.5841, 121.0573, 'DFA', graph);
      expect(nearestDfa).not.toBeNull();
      expect(nearestDfa!.agency).toBe('DFA');
      expect(nearestDfa!.id).toBe('dfa_sm_megamall');
    });

    it('should locate an NBI branch near SM Megamall', () => {
      const nearestNbi = bfsNearestBranch(14.5841, 121.0573, 'NBI', graph);
      expect(nearestNbi).not.toBeNull();
      expect(nearestNbi!.agency).toBe('NBI');
    });

    it('should return null immediately for BARANGAY agency', () => {
      const branch = bfsNearestBranch(14.5841, 121.0573, 'BARANGAY', graph);
      expect(branch).toBeNull();
    });

    it('should return null immediately for SCHOOL agency', () => {
      const branch = bfsNearestBranch(14.5841, 121.0573, 'SCHOOL', graph);
      expect(branch).toBeNull();
    });

    it('should degrade gracefully for coordinate in the middle of the ocean', () => {
      // Lat 0, Lon 0
      const branch = bfsNearestBranch(0, 0, 'DFA', graph);
      // It should either return a branch (if one is reachable from the closest branch) or null, without crashing
      // Since it initiates BFS from the closest branch (which would be dfa_aseana), it should find a DFA branch
      expect(() => {
        bfsNearestBranch(0, 0, 'DFA', graph);
      }).not.toThrow();
    });
  });

  describe('Disconnected Graph Tests', () => {
    it('should handle isolated components correctly', () => {
      // Create isolated branches
      const branch1: AgencyBranch = {
        id: 'isolated_dfa',
        name: 'Isolated DFA',
        agency: 'DFA',
        address: 'Isolated Address 1',
        city: 'City A',
        latitude: 10.0,
        longitude: 10.0,
        hours: '8-5',
      };

      const branch2: AgencyBranch = {
        id: 'isolated_nbi',
        name: 'Isolated NBI',
        agency: 'NBI',
        address: 'Isolated Address 2',
        city: 'City B',
        latitude: 20.0,
        longitude: 20.0,
        hours: '8-5',
      };

      const tinyGraph = buildLocationGraph([branch1, branch2], 3); // 3km threshold, they are far apart

      // BFS searching from near branch1 for DFA should return branch1
      const resultDfa = bfsNearestBranch(10.01, 10.01, 'DFA', tinyGraph);
      expect(resultDfa).not.toBeNull();
      expect(resultDfa!.id).toBe('isolated_dfa');

      // BFS searching from near branch1 for NBI should return null because they are in disconnected components
      const resultNbi = bfsNearestBranch(10.01, 10.01, 'NBI', tinyGraph);
      expect(resultNbi).toBeNull();
    });
  });
});
