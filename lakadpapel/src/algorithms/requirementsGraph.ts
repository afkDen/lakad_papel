import { DocumentId, DocumentNode } from '../context/types';

export const REQUIREMENTS_GRAPH: Record<DocumentId, DocumentNode> = {
  // FOUNDATION DOCUMENTS
  psa_birth_cert: {
    id: 'psa_birth_cert',
    label: 'PSA Birth Certificate',
    agency: 'PSA',
    prerequisites: [],
    fees: 'PHP 155 per copy',
    typicalDays: '1 working day (outlet) / 3–5 working days (delivery)',
    officeType: 'PSA Serbilis Outlet or LCR',
  },
  barangay_cert: {
    id: 'barangay_cert',
    label: 'Barangay Certificate / Cedula',
    agency: 'BARANGAY',
    prerequisites: [],
    fees: 'PHP 100–200 (Cedula)',
    typicalDays: 'Same day',
    officeType: 'Barangay Hall',
  },
  lto_medical_cert: {
    id: 'lto_medical_cert',
    label: 'LTO-Accredited Medical Certificate',
    agency: 'LTO',
    prerequisites: [],
    fees: 'PHP 200–400',
    typicalDays: 'Same day',
    officeType: 'LTO-accredited clinic',
  },

  // PRIMARY IDS
  voters_id: {
    id: 'voters_id',
    label: "Voter's ID (COMELEC)",
    agency: 'COMELEC',
    prerequisites: ['psa_birth_cert', 'barangay_cert'],
    fees: 'Free',
    typicalDays: 'Varies by registration period',
    officeType: 'COMELEC Local Office',
  },
  philsys_id: {
    id: 'philsys_id',
    label: 'PhilSys National ID',
    agency: 'PHILSYS',
    prerequisites: ['psa_birth_cert', 'barangay_cert'],
    fees: 'Free',
    typicalDays: '3–6 months (card delivery)',
    officeType: 'PhilSys Registration Center',
  },
  passport_regular: {
    id: 'passport_regular',
    label: 'Philippine Passport (Regular)',
    agency: 'DFA',
    prerequisites: ['psa_birth_cert', 'voters_id'],
    fees: 'PHP 950 (regular) / PHP 1,200 (expedite)',
    typicalDays: '15–20 working days (regular)',
    officeType: 'DFA Consular Office',
    notes: 'One valid government-issued photo ID required. Voter\'s ID is the minimum path; PhilSys ID also accepted.',
  },
  nbi_clearance: {
    id: 'nbi_clearance',
    label: 'NBI Clearance',
    agency: 'NBI',
    prerequisites: ['voters_id'],
    fees: 'PHP 130',
    typicalDays: 'Same day (no hit) / 5–15 working days (with hit)',
    officeType: 'NBI Clearance Center or Satellite Office',
    notes: 'Minimum prerequisite path: Voter\'s ID. PhilSys ID and Passport are also accepted government IDs.',
  },

  // LICENSES
  lto_student_permit: {
    id: 'lto_student_permit',
    label: 'LTO Student Permit',
    agency: 'LTO',
    prerequisites: ['psa_birth_cert', 'lto_medical_cert'],
    fees: 'PHP 727.63',
    typicalDays: 'Same day',
    officeType: 'LTO District Office',
  },
  lto_nonpro_license: {
    id: 'lto_nonpro_license',
    label: 'LTO Non-Professional Driver\'s License',
    agency: 'LTO',
    prerequisites: ['lto_student_permit', 'lto_medical_cert'],
    fees: 'PHP 585',
    typicalDays: 'Same day',
    officeType: 'LTO District Office',
    notes: 'Student Permit must be held for at least 1 year before applying.',
  },

  // PROFESSIONAL / EMPLOYMENT
  official_tor: {
    id: 'official_tor',
    label: 'Official Transcript of Records',
    agency: 'SCHOOL',
    prerequisites: ['psa_birth_cert'],
    fees: 'Varies by institution',
    typicalDays: '3–10 working days',
    officeType: 'University Registrar',
    notes: 'Issued by the applicant\'s school registrar. BFS returns null for this type; BranchCard displays details accordingly.',
  },
  prc_board_app: {
    id: 'prc_board_app',
    label: 'PRC Licensure Exam Application',
    agency: 'PRC',
    prerequisites: ['psa_birth_cert', 'official_tor', 'nbi_clearance'],
    fees: 'PHP 900 (exam fee varies)',
    typicalDays: 'Varies by exam schedule',
    officeType: 'PRC Regional Office',
  },
  sss_id: {
    id: 'sss_id',
    label: 'SSS ID (Unified Multi-Purpose ID)',
    agency: 'SSS',
    prerequisites: ['psa_birth_cert', 'voters_id'],
    fees: 'Free',
    typicalDays: '5–10 working days',
    officeType: 'SSS Branch',
    notes: 'Two valid secondary IDs required. Voter\'s ID qualifies as one.',
  },
  gsis_ecard: {
    id: 'gsis_ecard',
    label: 'GSIS eCard',
    agency: 'GSIS',
    prerequisites: ['psa_birth_cert'],
    fees: 'Free (for active government employees)',
    typicalDays: '5–10 working days',
    officeType: 'GSIS Branch or Agency HR',
    notes: 'Active government employment record required.',
  },
};

export const DOCUMENT_CATEGORIES: Record<string, DocumentId[]> = {
  'Foundation Documents': ['psa_birth_cert', 'barangay_cert', 'lto_medical_cert'],
  'Primary IDs': ['voters_id', 'philsys_id', 'passport_regular', 'nbi_clearance'],
  'Licenses': ['lto_student_permit', 'lto_nonpro_license'],
  'Professional / Employment': ['official_tor', 'prc_board_app', 'sss_id', 'gsis_ecard'],
};

export function validateGraph(graph: Record<DocumentId, DocumentNode>): void {
  const missingPrerequisites: string[] = [];
  for (const node of Object.values(graph)) {
    for (const prereqId of node.prerequisites) {
      if (!graph[prereqId]) {
        missingPrerequisites.push(prereqId);
      }
    }
  }
  if (missingPrerequisites.length > 0) {
    throw new Error(
      `Cycle or validation error: Prerequisite(s) not found in graph: ${missingPrerequisites.join(
        ', '
      )}`
    );
  }
}

// Run validation at module load time
validateGraph(REQUIREMENTS_GRAPH);
