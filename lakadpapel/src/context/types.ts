export type DocumentId = string;

export type AgencyType =
  | 'PSA'
  | 'DFA'
  | 'NBI'
  | 'LTO'
  | 'COMELEC'
  | 'PHILSYS'
  | 'PRC'
  | 'SSS'
  | 'GSIS'
  | 'PHILHEALTH'
  | 'PAGIBIG'
  | 'PHLPOST'
  | 'BIR'
  | 'BARANGAY'
  | 'SCHOOL';

export interface DocumentNode {
  id: DocumentId;
  label: string;
  agency: AgencyType;
  prerequisites: DocumentId[];
  fees: string;
  typicalDays: string;
  officeType: string;
  notes?: string;
  requirements?: string[];
  detailedSteps?: string[];
}

export interface AgencyBranch {
  id: string;
  name: string;
  agency: AgencyType;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  hours: string;
  phone?: string;
  mapsUrl?: string;
}

export interface RoadmapStep {
  document: DocumentNode;
  nearestBranch: AgencyBranch | null;
  isDone: boolean;
}

export interface CompletedFlow {
  targetDocumentId: DocumentId;
  completedAt: string;
  stepCount: number;
}

export interface AppState {
  possessedDocuments: Set<DocumentId>;
  targetDocument: DocumentId | null;
  roadmap: RoadmapStep[];
  history: CompletedFlow[];
  userMode: 'simple' | 'advanced';
}

export type AppAction =
  | { type: 'TOGGLE_DOCUMENT'; payload: DocumentId }
  | { type: 'SET_TARGET'; payload: DocumentId }
  | { type: 'MARK_DONE'; payload: DocumentId }
  | { type: 'ADD_TO_HISTORY'; payload: CompletedFlow }
  | { type: 'TOGGLE_USER_MODE' }
  | { type: 'HYDRATE'; payload: { possessedDocuments: DocumentId[]; history: CompletedFlow[]; userMode: 'simple' | 'advanced' } };
