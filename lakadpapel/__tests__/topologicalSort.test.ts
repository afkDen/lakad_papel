import { buildSubgraph, topologicalSort, topologicalSortWithTrace } from '../src/algorithms/topologicalSort';
import { REQUIREMENTS_GRAPH, validateGraph } from '../src/algorithms/requirementsGraph';
import { DocumentNode, DocumentId } from '../src/context/types';

describe('Topological Sort & Prerequisite Graph Tests', () => {
  describe('Basic Ordering Tests (Zero Possessed Documents)', () => {
    it('should order passport_regular prerequisites correctly', () => {
      const possessed = new Set<DocumentId>();
      const subgraph = buildSubgraph(REQUIREMENTS_GRAPH, possessed, 'passport_regular');
      const order = topologicalSort(subgraph);

      // Ancestors of passport_regular: psa_birth_cert, barangay_cert, voters_id, passport_regular
      expect(order).toContain('psa_birth_cert');
      expect(order).toContain('barangay_cert');
      expect(order).toContain('voters_id');
      expect(order).toContain('passport_regular');

      // Check relative ordering
      const psaIndex = order.indexOf('psa_birth_cert');
      const barangayIndex = order.indexOf('barangay_cert');
      const votersIndex = order.indexOf('voters_id');
      const passportIndex = order.indexOf('passport_regular');

      expect(psaIndex).toBeLessThan(votersIndex);
      expect(barangayIndex).toBeLessThan(votersIndex);
      expect(votersIndex).toBeLessThan(passportIndex);
      expect(passportIndex).toBe(order.length - 1);
    });

    it('should order nbi_clearance prerequisites correctly', () => {
      const possessed = new Set<DocumentId>();
      const subgraph = buildSubgraph(REQUIREMENTS_GRAPH, possessed, 'nbi_clearance');
      const order = topologicalSort(subgraph);

      expect(order).toContain('psa_birth_cert');
      expect(order).toContain('barangay_cert');
      expect(order).toContain('voters_id');
      expect(order).toContain('nbi_clearance');

      const votersIndex = order.indexOf('voters_id');
      const nbiIndex = order.indexOf('nbi_clearance');
      expect(votersIndex).toBeLessThan(nbiIndex);
    });

    it('should order lto_nonpro_license prerequisites correctly', () => {
      const possessed = new Set<DocumentId>();
      const subgraph = buildSubgraph(REQUIREMENTS_GRAPH, possessed, 'lto_nonpro_license');
      const order = topologicalSort(subgraph);

      expect(order).toContain('psa_birth_cert');
      expect(order).toContain('lto_medical_cert');
      expect(order).toContain('lto_student_permit');
      expect(order).toContain('lto_nonpro_license');

      const studentIndex = order.indexOf('lto_student_permit');
      const nonProIndex = order.indexOf('lto_nonpro_license');
      expect(studentIndex).toBeLessThan(nonProIndex);
    });

    it('should order prc_board_app prerequisites correctly', () => {
      const possessed = new Set<DocumentId>();
      const subgraph = buildSubgraph(REQUIREMENTS_GRAPH, possessed, 'prc_board_app');
      const order = topologicalSort(subgraph);

      expect(order).toContain('psa_birth_cert');
      expect(order).toContain('official_tor');
      expect(order).toContain('nbi_clearance');
      expect(order).toContain('prc_board_app');

      const nbiIndex = order.indexOf('nbi_clearance');
      const torIndex = order.indexOf('official_tor');
      const prcIndex = order.indexOf('prc_board_app');

      expect(nbiIndex).toBeLessThan(prcIndex);
      expect(torIndex).toBeLessThan(prcIndex);
    });

    it('should order the new documents (bir_tin, philhealth_id, pagibig_loyalty, postal_id) correctly', () => {
      const possessed = new Set<DocumentId>();
      
      // 1. bir_tin
      const subgraphTin = buildSubgraph(REQUIREMENTS_GRAPH, possessed, 'bir_tin');
      const orderTin = topologicalSort(subgraphTin);
      expect(orderTin).toContain('psa_birth_cert');
      expect(orderTin).toContain('barangay_cert');
      expect(orderTin).toContain('bir_tin');
      expect(orderTin.indexOf('psa_birth_cert')).toBeLessThan(orderTin.indexOf('bir_tin'));
      expect(orderTin.indexOf('barangay_cert')).toBeLessThan(orderTin.indexOf('bir_tin'));
      
      // 2. philhealth_id
      const subgraphPhilhealth = buildSubgraph(REQUIREMENTS_GRAPH, possessed, 'philhealth_id');
      const orderPhilhealth = topologicalSort(subgraphPhilhealth);
      expect(orderPhilhealth).toContain('psa_birth_cert');
      expect(orderPhilhealth).toContain('barangay_cert');
      expect(orderPhilhealth).toContain('philhealth_id');
      expect(orderPhilhealth.indexOf('psa_birth_cert')).toBeLessThan(orderPhilhealth.indexOf('philhealth_id'));
      expect(orderPhilhealth.indexOf('barangay_cert')).toBeLessThan(orderPhilhealth.indexOf('philhealth_id'));

      // 3. pagibig_loyalty
      const subgraphPagibig = buildSubgraph(REQUIREMENTS_GRAPH, possessed, 'pagibig_loyalty');
      const orderPagibig = topologicalSort(subgraphPagibig);
      expect(orderPagibig).toContain('psa_birth_cert');
      expect(orderPagibig).toContain('barangay_cert');
      expect(orderPagibig).toContain('voters_id');
      expect(orderPagibig).toContain('pagibig_loyalty');
      expect(orderPagibig.indexOf('psa_birth_cert')).toBeLessThan(orderPagibig.indexOf('voters_id'));
      expect(orderPagibig.indexOf('barangay_cert')).toBeLessThan(orderPagibig.indexOf('voters_id'));
      expect(orderPagibig.indexOf('voters_id')).toBeLessThan(orderPagibig.indexOf('pagibig_loyalty'));

      // 4. postal_id
      const subgraphPostal = buildSubgraph(REQUIREMENTS_GRAPH, possessed, 'postal_id');
      const orderPostal = topologicalSort(subgraphPostal);
      expect(orderPostal).toContain('psa_birth_cert');
      expect(orderPostal).toContain('barangay_cert');
      expect(orderPostal).toContain('postal_id');
      expect(orderPostal.indexOf('psa_birth_cert')).toBeLessThan(orderPostal.indexOf('postal_id'));
      expect(orderPostal.indexOf('barangay_cert')).toBeLessThan(orderPostal.indexOf('postal_id'));
    });
  });

  describe('Possessed Document Exclusion Tests', () => {
    it('should exclude possessed documents from subgraph', () => {
      const possessed = new Set<DocumentId>(['psa_birth_cert']);
      const subgraph = buildSubgraph(REQUIREMENTS_GRAPH, possessed, 'voters_id');
      const order = topologicalSort(subgraph);

      expect(order).not.toContain('psa_birth_cert');
      expect(order).toContain('barangay_cert');
      expect(order).toContain('voters_id');
    });

    it('should return only the target if all prerequisites are possessed', () => {
      const possessed = new Set<DocumentId>(['psa_birth_cert', 'barangay_cert']);
      const subgraph = buildSubgraph(REQUIREMENTS_GRAPH, possessed, 'voters_id');
      const order = topologicalSort(subgraph);

      expect(order).toEqual(['voters_id']);
    });

    it('should return only target when all passport prerequisites are possessed', () => {
      const possessed = new Set<DocumentId>(['psa_birth_cert', 'barangay_cert', 'voters_id']);
      const subgraph = buildSubgraph(REQUIREMENTS_GRAPH, possessed, 'passport_regular');
      const order = topologicalSort(subgraph);

      expect(order).toEqual(['passport_regular']);
    });
  });

  describe('Edge Cases', () => {
    it('should return empty subgraph if target is already possessed', () => {
      const possessed = new Set<DocumentId>(['passport_regular']);
      const subgraph = buildSubgraph(REQUIREMENTS_GRAPH, possessed, 'passport_regular');
      expect(subgraph).toEqual({});
    });

    it('should return empty order for empty subgraph', () => {
      const order = topologicalSort({});
      expect(order).toEqual([]);
    });

    it('should throw an error if a cycle is detected', () => {
      const cyclicGraph: Record<DocumentId, DocumentNode> = {
        nodeA: {
          id: 'nodeA',
          label: 'Node A',
          agency: 'PSA',
          prerequisites: ['nodeB'],
          fees: '',
          typicalDays: '',
          officeType: '',
        },
        nodeB: {
          id: 'nodeB',
          label: 'Node B',
          agency: 'PSA',
          prerequisites: ['nodeA'],
          fees: '',
          typicalDays: '',
          officeType: '',
        },
      };

      expect(() => {
        topologicalSort(cyclicGraph);
      }).toThrow('Cycle detected in prerequisite graph');
    });
  });

  describe('Real Graph Validation', () => {
    it('should pass validation of the real REQUIREMENTS_GRAPH without error', () => {
      expect(() => {
        validateGraph(REQUIREMENTS_GRAPH);
      }).not.toThrow();
    });
  });

  describe('topologicalSortWithTrace Tests', () => {
    it('should generate trace steps matching order for voters_id', () => {
      const possessed = new Set<DocumentId>();
      const subgraph = buildSubgraph(REQUIREMENTS_GRAPH, possessed, 'voters_id');
      const { order, trace } = topologicalSortWithTrace(subgraph);

      expect(order).toContain('psa_birth_cert');
      expect(order).toContain('barangay_cert');
      expect(order).toContain('voters_id');

      expect(trace.length).toBe(3);
      expect(trace[0].step).toBe(1);
      expect(trace[0].queueBefore).toEqual(expect.arrayContaining(['psa_birth_cert', 'barangay_cert']));
      expect(trace[2].dequeued).toBe('voters_id');
      expect(trace[2].queueAfter).toEqual([]);
    });
  });
});
