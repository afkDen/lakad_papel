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
    label: "Voter's Certification (COMELEC)",
    agency: 'COMELEC',
    prerequisites: ['psa_birth_cert', 'barangay_cert'],
    fees: 'PHP 75 (Free for Seniors/PWDs/Indigents)',
    typicalDays: 'Same day',
    officeType: 'COMELEC Local Office',
    notes: 'Physical Voter\'s ID card printing is permanently suspended by COMELEC. The Voter\'s Certification is issued in its place and is widely accepted as a valid primary ID.',
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
    notes: 'One valid government-issued photo ID required. Voter\'s Certification is the minimum path; PhilSys ID also accepted.',
  },
  nbi_clearance: {
    id: 'nbi_clearance',
    label: 'NBI Clearance',
    agency: 'NBI',
    prerequisites: ['voters_id'],
    fees: 'PHP 155 (including ₱25 e-payment fee)',
    typicalDays: 'Same day (no hit) / 5–15 working days (with hit)',
    officeType: 'NBI Clearance Center or Satellite Office',
    notes: 'Minimum prerequisite path: Voter\'s Certification. PhilSys ID and Passport are also accepted government IDs. Free for first-time job seekers under RA 11261.',
  },

  // LICENSES
  lto_student_permit: {
    id: 'lto_student_permit',
    label: 'LTO Student Permit',
    agency: 'LTO',
    prerequisites: ['psa_birth_cert', 'lto_medical_cert'],
    fees: 'PHP 317.63 (LTO fee)',
    typicalDays: 'Same day',
    officeType: 'LTO District Office',
    notes: 'Requires a mandatory 15-hour Theoretical Driving Course (TDC) certificate from an LTO-accredited driving school.',
  },
  lto_nonpro_license: {
    id: 'lto_nonpro_license',
    label: 'LTO Non-Professional Driver\'s License',
    agency: 'LTO',
    prerequisites: ['lto_student_permit', 'lto_medical_cert'],
    fees: 'PHP 685 (Total LTO fees)',
    typicalDays: 'Same day',
    officeType: 'LTO District Office',
    notes: 'Student Permit must be held for at least 1 month. Requires a mandatory Practical Driving Course (PDC) certificate.',
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
    label: 'SSS UMID / ATM Pay Card',
    agency: 'SSS',
    prerequisites: ['psa_birth_cert', 'voters_id'],
    fees: 'Free',
    typicalDays: '5–10 working days',
    officeType: 'SSS Branch',
    notes: 'Standard UMID physical card printing is suspended. SSS now issues UMID ATM Pay Cards co-branded with UnionBank/RCBC. Voter\'s Certification counts as a valid primary ID.',
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
  bir_tin: {
    id: 'bir_tin',
    label: 'BIR Tax Identification Number (TIN) Card',
    agency: 'BIR',
    prerequisites: ['psa_birth_cert', 'barangay_cert'],
    fees: 'Free',
    typicalDays: 'Same day',
    officeType: 'BIR Revenue District Office (RDO)',
    notes: 'TIN issuance is free. Requires PSA Birth Certificate and Barangay Certificate.',
  },
  philhealth_id: {
    id: 'philhealth_id',
    label: 'PhilHealth Member ID Card',
    agency: 'PHILHEALTH',
    prerequisites: ['psa_birth_cert', 'barangay_cert'],
    fees: 'Free (Registration) / Premium Contribution varies',
    typicalDays: 'Same day',
    officeType: 'PhilHealth Local Health Insurance Office (LHIO)',
    notes: 'Registration and card printing is free, though active membership requires premium contributions.',
  },
  pagibig_loyalty: {
    id: 'pagibig_loyalty',
    label: 'Pag-IBIG Loyalty Card Plus',
    agency: 'PAGIBIG',
    prerequisites: ['psa_birth_cert', 'voters_id'],
    fees: 'PHP 125',
    typicalDays: 'Same day (card printing)',
    officeType: 'Pag-IBIG Member Services Branch',
    notes: 'Requires active Pag-IBIG membership and at least one primary government ID like Voter\'s ID.',
  },
  postal_id: {
    id: 'postal_id',
    label: 'PHLPost Postal ID',
    agency: 'PHLPOST',
    prerequisites: ['psa_birth_cert', 'barangay_cert'],
    fees: 'PHP 550',
    typicalDays: '15–30 working days (delivery)',
    officeType: 'PHLPost Post Office',
    notes: 'A widely accepted primary ID with simple requirements: PSA Birth Certificate and Barangay Certificate/Cedula.',
  },
};

export const DOCUMENT_CATEGORIES: Record<string, DocumentId[]> = {
  'Foundation Documents': ['psa_birth_cert', 'barangay_cert', 'lto_medical_cert'],
  'Primary IDs': [
    'voters_id',
    'philsys_id',
    'passport_regular',
    'nbi_clearance',
    'postal_id',
    'bir_tin',
  ],
  'Licenses': ['lto_student_permit', 'lto_nonpro_license'],
  'Professional / Employment': [
    'official_tor',
    'prc_board_app',
    'sss_id',
    'gsis_ecard',
    'philhealth_id',
    'pagibig_loyalty',
  ],
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
