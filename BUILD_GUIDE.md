# Build Guide
## LakadPapel — Philippine Government Document Navigator

> This guide is written for an AI coding assistant (Claude Code, Cursor, or similar).
> Each part contains a prompt block you paste directly into the assistant.
> `@filename` references tell the assistant which files to read before writing code.
> Run prompts in order. Do not skip parts.
> After each part completes, update `PROGRESS.md` as instructed at the end of each section.

---

## Prerequisites

Before starting Part 0, confirm the following are installed on your machine:

| Tool | Version | Install |
|---|---|---|
| Node.js | 18.x or 20.x LTS | https://nodejs.org |
| npm | 9+ (bundled with Node) | Comes with Node |
| Git | Any recent | https://git-scm.com |
| Expo CLI | Latest | `npm install -g expo-cli` |
| EAS CLI | Latest | `npm install -g eas-cli` |
| Android Studio | Latest | For Android emulator (optional) |
| Expo Go app | Latest | Install on your physical Android or iOS device |

Confirm by running:
```bash
node --version
npm --version
git --version
npx expo --version
```

---

## Repository Initialization

Run this once before starting any prompts:

```bash
npx create-expo-app@latest lakadpapel --template blank-typescript
cd lakadpapel
git init
git add .
git commit -m "chore: initial Expo TypeScript project"
```

Create a GitHub repository named `lakadpapel` and push:
```bash
git remote add origin https://github.com/YOUR_USERNAME/lakadpapel.git
git branch -M main
git push -u origin main
```

---

## Part 0 — Project Setup

### What this part does

Installs all dependencies, configures NativeWind, Expo Router, Inter font, Jest, and TypeScript path aliases. Creates the base folder structure.

### Prompt 0A — Install Dependencies

```
Install all dependencies for the LakadPapel React Native Expo project.

Run the following installs in order. After each, confirm the package appears in package.json.

1. Expo Router (file-based navigation):
   npx expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar

2. NativeWind 4 (Tailwind for React Native):
   npm install nativewind
   npm install --save-dev tailwindcss

3. AsyncStorage:
   npx expo install @react-native-async-storage/async-storage

4. expo-location:
   npx expo install expo-location

5. react-native-svg (for DAG visualizer):
   npx expo install react-native-svg

6. expo-font (for Inter):
   npx expo install expo-font

7. @expo/vector-icons (already included with Expo, confirm it is present):
   npx expo install @expo/vector-icons

8. Jest for testing:
   npm install --save-dev jest jest-expo @testing-library/react-native @types/jest

After all installs, show me the full package.json dependencies and devDependencies sections.
```

### Prompt 0B — Configuration Files

```
@app.json @package.json

Configure the LakadPapel Expo project. Apply all of the following changes:

1. app.json — update with:
   - name: "LakadPapel"
   - slug: "lakadpapel"
   - scheme: "lakadpapel" (required for Expo Router deep links)
   - version: "1.0.0"
   - orientation: "portrait"
   - plugins: ["expo-router", "expo-font"]
   - android.adaptiveIcon.foregroundImage: "./assets/adaptive-icon.png"
   - android.adaptiveIcon.backgroundColor: "#ffffff"
   - ios.bundleIdentifier: "com.group4.lakadpapel"
   - android.package: "com.group4.lakadpapel"
   - experiments.typedRoutes: true (Expo Router typed routes)

2. tailwind.config.js — create at root with:
   - content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"]
   - presets: [require("nativewind/preset")]
   - No custom theme extensions needed for now

3. babel.config.js — update to include:
   - presets: ["babel-preset-expo"]
   - plugins: ["nativewind/babel"]

4. tsconfig.json — update with:
   - extends: "expo/tsconfig.base"
   - compilerOptions.strict: true
   - compilerOptions.paths: {
       "@/*": ["./src/*"],
       "@app/*": ["./app/*"]
     }

5. package.json — add jest configuration block:
   {
     "jest": {
       "preset": "jest-expo",
       "setupFilesAfterFramework": ["@testing-library/react-native/extend-expect"],
       "moduleNameMapper": {
         "^@/(.*)$": "<rootDir>/src/$1"
       }
     }
   }

6. package.json — add scripts:
   - "test": "jest"
   - "test:watch": "jest --watch"

Show me the final content of all modified files.
```

### Prompt 0C — Folder Structure

```
Create the complete folder structure for LakadPapel. Create all files as empty stubs (just a comment "// TODO" in each .ts/.tsx file and no content in .md files). Do not implement any logic yet.

Create this exact structure:

lakadpapel/
├── app/
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── checklist.tsx
│   ├── target.tsx
│   ├── roadmap.tsx
│   └── history.tsx
├── src/
│   ├── algorithms/
│   │   ├── requirementsGraph.ts
│   │   ├── topologicalSort.ts
│   │   └── bfsLocator.ts
│   ├── data/
│   │   └── agencyLocations.ts
│   ├── context/
│   │   ├── DocumentContext.tsx
│   │   └── types.ts
│   ├── components/
│   │   ├── DocumentCard.tsx
│   │   ├── StepCard.tsx
│   │   ├── BranchCard.tsx
│   │   ├── DependencyGraph.tsx
│   │   └── CategoryHeader.tsx
│   └── hooks/
│       ├── useDocumentContext.ts
│       └── useLocation.ts
├── __tests__/
│   ├── topologicalSort.test.ts
│   └── bfsLocator.test.ts
└── assets/
    └── fonts/   (empty directory — Inter fonts will go here)

After creating the structure, run:
  npx expo start --clear
and confirm the app starts without errors (blank screen is expected at this stage).
```

**After Part 0 completes:**
- Update PROGRESS.md: check all boxes under "Part 0 — Project Setup"
- Commit: `git add . && git commit -m "chore: project setup and configuration"`

---

## Part 1 — Data Layer

### What this part does

Defines all TypeScript types and implements the two static data files: the prerequisite DAG (`requirementsGraph.ts`) and the agency branch dataset (`agencyLocations.ts`).

### Prompt 1A — TypeScript Types

```
@src/context/types.ts @DESIGN_DOCUMENT.md

Implement all TypeScript types for LakadPapel in src/context/types.ts.

Define the following types exactly as specified:

1. DocumentId — a string type alias

2. AgencyType — a union of string literals:
   'PSA' | 'DFA' | 'NBI' | 'LTO' | 'COMELEC' | 'PHILSYS' | 'PRC' | 'SSS' | 'GSIS' | 'BARANGAY' | 'SCHOOL'

3. DocumentNode interface:
   - id: DocumentId
   - label: string
   - agency: AgencyType
   - prerequisites: DocumentId[]
   - fees: string
   - typicalDays: string
   - officeType: string
   - notes?: string

4. AgencyBranch interface:
   - id: string
   - name: string
   - agency: AgencyType
   - address: string
   - city: string
   - latitude: number
   - longitude: number
   - hours: string
   - phone?: string
   - mapsUrl?: string

5. RoadmapStep interface:
   - document: DocumentNode
   - nearestBranch: AgencyBranch | null
   - isDone: boolean

6. CompletedFlow interface:
   - targetDocumentId: DocumentId
   - completedAt: string
   - stepCount: number

7. AppState interface:
   - possessedDocuments: Set<DocumentId>
   - targetDocument: DocumentId | null
   - roadmap: RoadmapStep[]
   - history: CompletedFlow[]

8. AppAction — a discriminated union of all reducer actions:
   - { type: 'TOGGLE_DOCUMENT'; payload: DocumentId }
   - { type: 'SET_TARGET'; payload: DocumentId }
   - { type: 'MARK_DONE'; payload: DocumentId }
   - { type: 'ADD_TO_HISTORY'; payload: CompletedFlow }
   - { type: 'HYDRATE'; payload: { possessedDocuments: DocumentId[]; history: CompletedFlow[] } }

Export all types. No default export.
```

### Prompt 1B — Requirements Graph (DAG)

```
@src/algorithms/requirementsGraph.ts @src/context/types.ts

Implement the prerequisite DAG for LakadPapel in src/algorithms/requirementsGraph.ts.

The file exports a single constant: REQUIREMENTS_GRAPH — a Record<DocumentId, DocumentNode>.

Encode all of the following document nodes with correct prerequisite edges. Use the exact IDs listed.

FOUNDATION DOCUMENTS (no prerequisites — root nodes):
1. id: "psa_birth_cert"
   label: "PSA Birth Certificate"
   agency: "PSA"
   prerequisites: []
   fees: "PHP 155 per copy"
   typicalDays: "1 working day (outlet) / 3–5 working days (delivery)"
   officeType: "PSA Serbilis Outlet or LCR"

2. id: "barangay_cert"
   label: "Barangay Certificate / Cedula"
   agency: "BARANGAY"
   prerequisites: []
   fees: "PHP 100–200 (Cedula)"
   typicalDays: "Same day"
   officeType: "Barangay Hall"

3. id: "lto_medical_cert"
   label: "LTO-Accredited Medical Certificate"
   agency: "LTO"
   prerequisites: []
   fees: "PHP 200–400"
   typicalDays: "Same day"
   officeType: "LTO-accredited clinic"

PRIMARY IDS:
4. id: "voters_id"
   label: "Voter's ID (COMELEC)"
   agency: "COMELEC"
   prerequisites: ["psa_birth_cert", "barangay_cert"]
   fees: "Free"
   typicalDays: "Varies by registration period"
   officeType: "COMELEC Local Office"

5. id: "philsys_id"
   label: "PhilSys National ID"
   agency: "PHILSYS"
   prerequisites: ["psa_birth_cert", "barangay_cert"]
   fees: "Free"
   typicalDays: "3–6 months (card delivery)"
   officeType: "PhilSys Registration Center"

6. id: "passport_regular"
   label: "Philippine Passport (Regular)"
   agency: "DFA"
   prerequisites: ["psa_birth_cert", "voters_id"]
   fees: "PHP 950 (regular) / PHP 1,200 (expedite)"
   typicalDays: "15–20 working days (regular)"
   officeType: "DFA Consular Office"
   notes: "One valid government-issued photo ID required. Voter's ID is the minimum path; PhilSys ID also accepted."

7. id: "nbi_clearance"
   label: "NBI Clearance"
   agency: "NBI"
   prerequisites: ["voters_id"]
   fees: "PHP 130"
   typicalDays: "Same day (no hit) / 5–15 working days (with hit)"
   officeType: "NBI Clearance Center or Satellite Office"
   notes: "Minimum prerequisite path: Voter's ID. PhilSys ID and Passport are also accepted government IDs. The DAG encodes Voter's ID as the single prerequisite edge because it is the shortest attainable path from zero documents."

LICENSES:
8. id: "lto_student_permit"
   label: "LTO Student Permit"
   agency: "LTO"
   prerequisites: ["psa_birth_cert", "lto_medical_cert"]
   fees: "PHP 727.63"
   typicalDays: "Same day"
   officeType: "LTO District Office"

9. id: "lto_nonpro_license"
   label: "LTO Non-Professional Driver's License"
   agency: "LTO"
   prerequisites: ["lto_student_permit", "lto_medical_cert"]
   fees: "PHP 585"
   typicalDays: "Same day"
   officeType: "LTO District Office"
   notes: "Student Permit must be held for at least 1 year before applying."

PROFESSIONAL / EMPLOYMENT:
10. id: "official_tor"
    label: "Official Transcript of Records"
    agency: "SCHOOL"
    prerequisites: ["psa_birth_cert"]
    fees: "Varies by institution"
    typicalDays: "3–10 working days"
    officeType: "University Registrar"
    notes: "Issued by the applicant's school registrar. Agency type is SCHOOL — BFS returns null for this type; BranchCard displays 'Contact your school's registrar office' instead of a branch address."

11. id: "prc_board_app"
    label: "PRC Licensure Exam Application"
    agency: "PRC"
    prerequisites: ["psa_birth_cert", "official_tor", "nbi_clearance"]
    fees: "PHP 900 (exam fee varies)"
    typicalDays: "Varies by exam schedule"
    officeType: "PRC Regional Office"

12. id: "sss_id"
    label: "SSS ID (Unified Multi-Purpose ID)"
    agency: "SSS"
    prerequisites: ["psa_birth_cert", "voters_id"]
    fees: "Free"
    typicalDays: "5–10 working days"
    officeType: "SSS Branch"
    notes: "Two valid secondary IDs required. Voter's ID qualifies as one."

13. id: "gsis_ecard"
    label: "GSIS eCard"
    agency: "GSIS"
    prerequisites: ["psa_birth_cert"]
    fees: "Free (for active government employees)"
    typicalDays: "5–10 working days"
    officeType: "GSIS Branch or Agency HR"
    notes: "Active government employment record required."

After all nodes are encoded, add a validation function at the bottom of the file:
  export function validateGraph(graph: Record<DocumentId, DocumentNode>): void
  This function checks that every prerequisite ID referenced in the graph exists as a node. If any are missing, throw an Error listing the missing IDs. If valid, do nothing.

Also export a DOCUMENT_CATEGORIES constant — a Record<string, DocumentId[]> grouping all IDs by category:
  "Foundation Documents": ["psa_birth_cert", "barangay_cert", "lto_medical_cert"]
  "Primary IDs": ["voters_id", "philsys_id", "passport_regular", "nbi_clearance"]
  "Licenses": ["lto_student_permit", "lto_nonpro_license"]
  "Professional / Employment": ["official_tor", "prc_board_app", "sss_id", "gsis_ecard"]

Run validateGraph(REQUIREMENTS_GRAPH) at module load time (outside any function) to catch encoding errors immediately.
```

### Prompt 1C — Agency Branch Dataset

```
@src/data/agencyLocations.ts @src/context/types.ts

Implement the agency branch location dataset for LakadPapel in src/data/agencyLocations.ts.

Export a constant AGENCY_BRANCHES — an AgencyBranch[] array.

Include at least 3 branches per agency for the following agencies, all in Metro Manila.
Use real branch names, real GPS coordinates, and real addresses verified against Google Maps.

Required agencies and sample branches (you must fill in correct GPS lat/lng for each):

DFA (Philippine Passport):
- DFA Aseana (main office), Paranaque — landmark office
- DFA Robinsons Galleria, Quezon City
- DFA SM Megamall, Mandaluyong

NBI:
- NBI Main Office, Taft Avenue, Manila
- NBI Robinsons Ermita, Manila
- NBI SM North EDSA, Quezon City

PSA:
- PSA Serbilis SM Megamall, Mandaluyong
- PSA Serbilis SM North EDSA, Quezon City
- PSA Serbilis SM Mall of Asia, Pasay

LTO:
- LTO NCR District Office 7, Quezon City
- LTO NCR District Office 4, Manila
- LTO Paranaque District Office

COMELEC:
- COMELEC Main Office, Intramuros, Manila
- COMELEC Quezon City Office
- COMELEC Makati Office

PHILSYS (PhilSys Registration Centers):
- PhilSys Registration Center — PSA Manila
- PhilSys Registration Center — SM North EDSA, Quezon City
- PhilSys Registration Center — SM Megamall, Mandaluyong

PRC:
- PRC Main Office, Sampaloc, Manila
- PRC NCR — Manila Regional Office

SSS:
- SSS Main Office, East Avenue, Quezon City
- SSS Makati Branch
- SSS Manila Branch

GSIS:
- GSIS Main Office, Pasay City
- GSIS NCR Branch

BARANGAY:
- Do not include barangay halls in this dataset. BFS returns null for BARANGAY type; BranchCard shows "Visit your local Barangay Hall".

SCHOOL:
- Do not include school registrars in this dataset. BFS returns null for SCHOOL type; BranchCard shows "Contact your school's registrar office".

For each branch, include:
  id: unique snake_case string (e.g., "dfa_aseana")
  name: full branch name
  agency: correct AgencyType
  address: full street address
  city: city name
  latitude: number (correct GPS coordinate)
  longitude: number (correct GPS coordinate)
  hours: real operating hours (e.g., "Mon–Fri 8:00 AM – 5:00 PM")
  mapsUrl: Google Maps search URL for the branch

Also export a function buildProximityEdges(branches: AgencyBranch[], thresholdKm: number): Map<string, string[]>
This builds the proximity graph used by BFS: for each branch, it finds all other branches within thresholdKm kilometers and returns a Map from branch ID to list of neighbor IDs.
Use the Haversine formula to compute distances.

Export: AGENCY_BRANCHES, buildProximityEdges
```

**After Part 1 completes:**
- Update PROGRESS.md: check all boxes under "Part 1 — Data Layer"
- Commit: `git add . && git commit -m "feat: data layer — types, DAG, and agency branch dataset"`

---

## Part 2 — Algorithm Implementation

### What this part does

Implements Kahn's Algorithm (Topological Sort) and BFS (nearest branch locator) as pure TypeScript modules with no UI dependencies, then writes Jest unit tests for both.

### Prompt 2A — Topological Sort (Kahn's Algorithm)

```
@src/algorithms/topologicalSort.ts @src/algorithms/requirementsGraph.ts @src/context/types.ts

Implement Topological Sort using Kahn's Algorithm in src/algorithms/topologicalSort.ts.

The file exports two functions:

1. buildSubgraph(
     graph: Record<DocumentId, DocumentNode>,
     possessed: Set<DocumentId>,
     target: DocumentId
   ): Record<DocumentId, DocumentNode>

   Logic:
   - Perform a reverse BFS from target: start at target, follow prerequisite edges backward to collect all ancestor nodes
   - Include target in the subgraph
   - Remove all nodes whose IDs are in possessed (along with their edges)
   - Return the reduced subgraph as a Record<DocumentId, DocumentNode>
   - If target is already in possessed, return an empty record

2. topologicalSort(
     subgraph: Record<DocumentId, DocumentNode>
   ): DocumentId[]

   Logic:
   - Implement Kahn's Algorithm exactly:
     a. Compute in-degree for each node (count how many other subgraph nodes list it as a prerequisite)
     b. Initialize queue with all nodes of in-degree 0
     c. While queue is not empty: dequeue node, push to order array, decrement in-degree of all its neighbors (nodes that list it as a prerequisite), enqueue any neighbor whose in-degree drops to 0
   - After the loop: if order.length !== Object.keys(subgraph).length, throw new Error("Cycle detected in prerequisite graph")
   - Return the ordered array of DocumentIds
   - O(V + E) complexity — no nested loops allowed

Both functions must be pure: no side effects, no imports from Context or UI, no async.

After implementing, write a quick inline self-test at the bottom of the file inside an if (process.env.NODE_ENV === 'test') block — do not run it in production.
```

### Prompt 2B — BFS Nearest Branch Locator

```
@src/algorithms/bfsLocator.ts @src/data/agencyLocations.ts @src/context/types.ts

Implement Breadth-First Search nearest branch locator in src/algorithms/bfsLocator.ts.

The file exports two functions:

1. buildLocationGraph(
     branches: AgencyBranch[],
     thresholdKm?: number
   ): { branches: AgencyBranch[]; adjacency: Map<string, string[]> }

   Logic:
   - Default thresholdKm = 3
   - Use buildProximityEdges from agencyLocations.ts to build the adjacency map
   - Return both the branches array and the adjacency map as a single object

2. bfsNearestBranch(
     userLatitude: number,
     userLongitude: number,
     agencyType: AgencyType,
     locationGraph: { branches: AgencyBranch[]; adjacency: Map<string, string[]> }
   ): AgencyBranch | null

   Logic:
   - Find the origin node: the branch closest to userLatitude/userLongitude by Haversine distance (regardless of agency type)
   - Initialize BFS from origin
   - BFS explores neighbors using the adjacency map, tracking visited nodes
   - The first node whose agency === agencyType is returned immediately
   - If BARANGAY or SCHOOL is the agencyType, return null immediately (BARANGAY: user visits their local barangay hall; SCHOOL: user contacts their own school registrar — neither is in the branch dataset)
   - If no match found after full BFS traversal, return null
   - Must use a queue (array with shift/unshift or a proper Queue class) — no recursion

Both functions must be pure. No async. No imports from Context or UI layers.

Export: buildLocationGraph, bfsNearestBranch
Also export the Haversine helper: haversineKm(lat1, lon1, lat2, lon2): number
```

### Prompt 2C — Unit Tests: Topological Sort

```
@__tests__/topologicalSort.test.ts @src/algorithms/topologicalSort.ts @src/algorithms/requirementsGraph.ts @src/context/types.ts

Write Jest unit tests for topologicalSort.ts in __tests__/topologicalSort.test.ts.

Tests must cover:

1. BASIC ORDERING TESTS — for each of the following target documents with zero possessed documents, call buildSubgraph() then topologicalSort() and assert:
   - "passport_regular": output includes "psa_birth_cert", "voters_id", "barangay_cert", and "passport_regular"
   - "passport_regular": "psa_birth_cert" appears before "voters_id" in the output
   - "passport_regular": "barangay_cert" appears before "voters_id" in the output
   - "passport_regular": "passport_regular" appears last in the output
   - "nbi_clearance": all prerequisites appear before "nbi_clearance"
   - "lto_nonpro_license": "lto_student_permit" appears before "lto_nonpro_license"
   - "prc_board_app": "nbi_clearance" appears before "prc_board_app"
   - "prc_board_app": "official_tor" appears before "prc_board_app"

2. POSSESSED DOCUMENT EXCLUSION TESTS:
   - With possessed = {"psa_birth_cert"}: buildSubgraph for "voters_id" does NOT include "psa_birth_cert" in the output
   - With possessed = {"psa_birth_cert", "barangay_cert"}: buildSubgraph for "voters_id" returns a subgraph containing only "voters_id"
   - With possessed = all prerequisites for "passport_regular": topologicalSort returns only ["passport_regular"]

3. EDGE CASE TESTS:
   - Target already possessed: buildSubgraph returns empty object {}
   - topologicalSort on empty subgraph {} returns []
   - Cycle detection: inject a small fake subgraph with a cycle (A depends on B, B depends on A) and confirm topologicalSort throws an error

4. REAL GRAPH VALIDATION:
   - Import REQUIREMENTS_GRAPH and run validateGraph on it — confirm no error is thrown

Use describe() blocks to group tests. Use it() for each test case. Use expect().toBe(), expect().toContain(), expect().toThrow() as appropriate.

All tests must pass with: npx jest __tests__/topologicalSort.test.ts
```

### Prompt 2D — Unit Tests: BFS

```
@__tests__/bfsLocator.test.ts @src/algorithms/bfsLocator.ts @src/data/agencyLocations.ts @src/context/types.ts

Write Jest unit tests for bfsLocator.ts in __tests__/bfsLocator.test.ts.

Tests must cover:

1. HAVERSINE TESTS:
   - haversineKm for two identical points returns 0
   - haversineKm between PSA SM Megamall (known coords) and NBI SM North EDSA (known coords) returns a value > 0 and < 50 (sanity check)

2. buildLocationGraph TESTS:
   - Returns an object with branches array and adjacency Map
   - adjacency map has the same number of keys as AGENCY_BRANCHES.length
   - At least one branch has at least one neighbor (sanity check that edges exist)

3. bfsNearestBranch TESTS:
   - Given GPS coordinates near SM Megamall, Mandaluyong, returns a DFA branch (not null)
   - Given GPS coordinates near SM Megamall, Mandaluyong, returns an NBI branch (not null)
   - Given any GPS coordinates and agencyType 'BARANGAY', returns null immediately
   - Given any GPS coordinates and agencyType 'SCHOOL', returns null immediately
   - Given GPS coordinates in the middle of the ocean (lat: 0, lon: 0), result is null or a branch (no crash — just graceful)

4. DISCONNECTED GRAPH TEST:
   - Build a tiny test graph of 2 isolated branches (no adjacency edges) with different agency types
   - Call bfsNearestBranch with origin matching branch 1's agency — should return branch 1
   - Call bfsNearestBranch with origin matching branch 1 but looking for branch 2's agency — should return null (not crash)

All tests must pass with: npx jest __tests__/bfsLocator.test.ts
```

**After Part 2 completes:**
- Run `npx jest` and confirm all tests pass
- Update PROGRESS.md: check all boxes under "Part 2 — Algorithm Implementation"
- Commit: `git add . && git commit -m "feat: algorithm layer — topological sort, BFS, and unit tests"`

---

## Part 3 — State Layer

### What this part does

Implements the React Context provider, useReducer with all actions, AsyncStorage persistence, and the two custom hooks.

### Prompt 3A — DocumentContext

```
@src/context/DocumentContext.tsx @src/context/types.ts @src/algorithms/topologicalSort.ts @src/algorithms/bfsLocator.ts @src/algorithms/requirementsGraph.ts @src/data/agencyLocations.ts

Implement the DocumentContext provider in src/context/DocumentContext.tsx.

This is the central state manager for LakadPapel. Implement the following:

1. INITIAL STATE:
   const initialState: AppState = {
     possessedDocuments: new Set(),
     targetDocument: null,
     roadmap: [],
     history: [],
   }

2. REDUCER — implement appReducer(state: AppState, action: AppAction): AppState
   Handle each action type:

   HYDRATE:
   - Replace possessedDocuments with new Set(action.payload.possessedDocuments)
   - Replace history with action.payload.history
   - Return updated state

   TOGGLE_DOCUMENT:
   - If DocumentId is in possessedDocuments, remove it; else add it
   - Clear roadmap (set to [])
   - Clear targetDocument (set to null)
   - Return updated state

   SET_TARGET:
   - Set targetDocument to action.payload
   - Run buildSubgraph(REQUIREMENTS_GRAPH, state.possessedDocuments, action.payload)
   - Run topologicalSort() on the subgraph
   - For each step in the sorted order, run bfsNearestBranch() with the cached location graph and the step's agency type
   - Build a RoadmapStep[] from the results
   - Return state with updated targetDocument and roadmap

   MARK_DONE:
   - Add action.payload (a DocumentId) to possessedDocuments
   - Re-run buildSubgraph + topologicalSort + BFS to regenerate roadmap
   - If roadmap becomes empty after regeneration, dispatch ADD_TO_HISTORY internally and clear targetDocument
   - Return updated state

   ADD_TO_HISTORY:
   - Append action.payload to history
   - Return updated state

3. ASYNCSTORAGE PERSISTENCE:
   - On mount (inside a useEffect in the Provider), read '@lakadpapel/possessed_documents' and '@lakadpapel/history' from AsyncStorage
   - If values exist, dispatch HYDRATE
   - After every TOGGLE_DOCUMENT and MARK_DONE action, write the updated possessedDocuments (serialized as JSON array) back to AsyncStorage
   - After every ADD_TO_HISTORY, write the updated history to AsyncStorage

4. LOCATION GRAPH:
   - Build the locationGraph once at module level using buildLocationGraph(AGENCY_BRANCHES)
   - Pass it into the reducer (or keep it as a module-level constant) — do not rebuild it on every action

5. PROVIDER:
   export function DocumentProvider({ children }: { children: React.ReactNode })
   - Uses useReducer(appReducer, initialState)
   - Handles AsyncStorage hydration on mount
   - Exposes state and dispatch via context

6. CONTEXT EXPORT:
   export const DocumentContext = createContext<...>

Export: DocumentContext, DocumentProvider
```

### Prompt 3B — Custom Hooks

```
@src/hooks/useDocumentContext.ts @src/hooks/useLocation.ts @src/context/DocumentContext.tsx @src/context/types.ts

Implement both custom hooks.

FILE 1: src/hooks/useDocumentContext.ts

Implement:
  export function useDocumentContext(): { state: AppState; dispatch: Dispatch<AppAction> }

- Calls useContext(DocumentContext)
- If context is undefined (hook used outside Provider), throw an Error: 'useDocumentContext must be used within DocumentProvider'
- Returns { state, dispatch }

FILE 2: src/hooks/useLocation.ts

Implement:
  export function useLocation(): {
    latitude: number | null;
    longitude: number | null;
    permissionGranted: boolean;
    requestPermission: () => Promise<void>;
  }

- Uses expo-location's requestForegroundPermissionsAsync() for permission
- Uses expo-location's getCurrentPositionAsync() to get coordinates
- Stores coordinates in local state
- permissionGranted is true only when status === 'granted'
- requestPermission() requests permission then immediately fetches location
- On mount, checks if permission is already granted; if so, fetches location automatically
- Returns null coordinates if permission is denied or location unavailable
```

**After Part 3 completes:**
- Update PROGRESS.md: check all boxes under "Part 3 — State Layer"
- Commit: `git add . && git commit -m "feat: state layer — DocumentContext, reducer, AsyncStorage persistence, hooks"`

---

## Part 4 — Shared Components

### What this part does

Builds all reusable UI components. No screen logic here — only presentational and lightly interactive components.

### Prompt 4A — Base Components

```
@src/components/CategoryHeader.tsx @src/components/DocumentCard.tsx @src/components/BranchCard.tsx @src/context/types.ts @DESIGN_DOCUMENT.md

Implement three base components. Use NativeWind Tailwind classes for all styling. Do not use StyleSheet. Follow the design system in DESIGN_DOCUMENT.md exactly.

COMPONENT 1: src/components/CategoryHeader.tsx
Props: { title: string }
Renders:
- A View with className="px-6 pt-6 pb-2"
- A Text with className="text-sm font-semibold text-gray-500 uppercase tracking-wide"
  displaying the title

COMPONENT 2: src/components/DocumentCard.tsx
Props: {
  document: DocumentNode;
  isChecked: boolean;
  onToggle: () => void;
  isDisabled?: boolean;
}
Renders:
- A TouchableOpacity wrapping a View, full width
- Outer View: className="flex-row items-center px-6 py-4 border-b border-gray-200 bg-white"
- Left: a Ionicons checkmark-circle icon (size 24):
  - Color #16a34a when isChecked
  - Color #d1d5db when not checked
  - Color #9ca3af when isDisabled
- Center (flex-1, px-3):
  - Document label: className="text-base text-gray-900 font-normal"
  - Agency label below: className="text-xs text-gray-500 mt-0.5" — shows document.agency
- When isDisabled: the entire card opacity is 0.4 and onToggle is ignored
- Minimum height 56dp for tap target

COMPONENT 3: src/components/BranchCard.tsx
Props: { branch: AgencyBranch | null; agencyType: AgencyType }
Renders when branch is null:
- A View with className="bg-gray-50 rounded-lg p-4 mt-3"
- If agencyType is 'BARANGAY': Text: "Visit your local Barangay Hall"
- If agencyType is 'SCHOOL': Text: "Contact your school's registrar office"
- For any other type returning null: Text: "Visit your nearest [agencyType] office"

Renders when branch is not null:
- A View with className="bg-gray-50 rounded-lg p-4 mt-3"
- Branch name: className="text-sm font-semibold text-gray-900"
- Address row: Ionicons location-outline (size 14, color #6b7280) + address text className="text-xs text-gray-500 ml-1 flex-1"
- Hours row: Ionicons time-outline (size 14, color #6b7280) + hours text className="text-xs text-gray-500 ml-1"
- "Get Directions" TouchableOpacity (only if branch.mapsUrl exists):
  className="flex-row items-center mt-3"
  - Ionicons map-outline (size 14, color #2563eb)
  - Text className="text-xs text-blue-600 font-semibold ml-1": "Get Directions"
  - On press: Linking.openURL(branch.mapsUrl)

All three components use export default.
```

### Prompt 4B — StepCard and DependencyGraph

```
@src/components/StepCard.tsx @src/components/DependencyGraph.tsx @src/context/types.ts @DESIGN_DOCUMENT.md

Implement two more components.

COMPONENT 1: src/components/StepCard.tsx
Props: {
  step: RoadmapStep;
  stepNumber: number;
  onMarkDone: () => void;
}
Renders:
- Outer View: className="bg-white border border-gray-200 rounded-lg mx-6 mb-3 p-4"
- Top row:
  - Step number badge: className="w-7 h-7 bg-gray-900 rounded-full items-center justify-center"
    Text inside: className="text-white text-xs font-bold" showing stepNumber
  - Document label to the right: className="text-base font-semibold text-gray-900 ml-3 flex-1"
- Fees and typical days (two rows of secondary text below the label):
  className="text-xs text-gray-500 mt-1"
  Shows: "Fee: [fees]  ·  [typicalDays]"
- BranchCard component (pass step.nearestBranch and step.document.agency)
- "Mark as Done" button below BranchCard:
  className="mt-4 bg-blue-600 rounded-lg py-3 items-center"
  Text: className="text-white text-sm font-semibold": "Mark as Done"
  On press: calls onMarkDone()
  If step.isDone: button shows "Done" and has className="mt-4 bg-green-600 rounded-lg py-3 items-center" and is not pressable

COMPONENT 2: src/components/DependencyGraph.tsx
Props: {
  subgraph: Record<DocumentId, DocumentNode>;
  possessed: Set<DocumentId>;
  nextAttainable: Set<DocumentId>;  // nodes with in-degree 0 in current subgraph
}

Renders an SVG node-link diagram using react-native-svg.

Layout algorithm (simple — no force-directed physics needed):
- Arrange nodes left-to-right by topological level
- Level 0: root nodes (in-degree 0)
- Level 1: nodes whose only prerequisites are at level 0
- And so on
- Nodes at the same level are evenly spaced vertically
- Use a fixed node radius of 20
- Draw edges (lines) between nodes first, then draw nodes on top

Node colors:
- possessed: #16a34a (green)
- nextAttainable (in-degree 0 in current subgraph): #0d9488 (teal)
- otherwise: #6b7280 (grey)

Node label: document.agency text, font size 8, centered, white, shown inside the circle

Draw edges as SVG Line elements from center of prerequisite node to center of dependent node.
Edge color: #d1d5db

Wrap the SVG in a ScrollView (horizontal) in case the graph is wide.
Use a fixed height of 200. Width = max(screen width, levelCount * 100).

If subgraph is empty, render a Text: "No steps remaining."
```

**After Part 4 completes:**
- Update PROGRESS.md: check all boxes under "Part 4 — Shared Components"
- Commit: `git add . && git commit -m "feat: shared components — DocumentCard, BranchCard, StepCard, DependencyGraph"`

---

## Part 5 — ChecklistScreen and TargetScreen

### What this part does

Builds the two input screens: the possessed-document checklist and the target document picker.

### Prompt 5A — Root Layout and Index

```
@app/_layout.tsx @app/index.tsx @src/context/DocumentContext.tsx

Implement the root layout and index redirect.

FILE 1: app/_layout.tsx
- Import DocumentProvider from src/context/DocumentContext
- Import { Tabs } from 'expo-router'
- Import Ionicons from '@expo/vector-icons/Ionicons'
- Wrap Tabs in DocumentProvider
- Configure 4 tabs:
  - checklist: label "Documents", icon "document-text-outline"
  - target: label "What do I need?", icon "search-outline"
  - roadmap: label "Roadmap", icon "map-outline"
  - history: label "History", icon "time-outline"
- Tab bar style:
  - backgroundColor: '#ffffff'
  - borderTopColor: '#e5e7eb'
  - activeTintColor: '#2563eb'
  - inactiveTintColor: '#9ca3af'
- Screen options: headerShown: true for all screens
- Header style: backgroundColor '#ffffff', no shadow, borderBottomColor '#e5e7eb'

FILE 2: app/index.tsx
- Immediately redirect to '/checklist' using expo-router's Redirect component
```

### Prompt 5B — ChecklistScreen

```
@app/checklist.tsx @src/hooks/useDocumentContext.ts @src/components/DocumentCard.tsx @src/components/CategoryHeader.tsx @src/algorithms/requirementsGraph.ts @src/context/types.ts @DESIGN_DOCUMENT.md

Implement ChecklistScreen in app/checklist.tsx.

Requirements:

1. STATE:
   - Pull state and dispatch from useDocumentContext()
   - Local state: searchQuery (string, default "")

2. FILTERED LIST:
   - Start from DOCUMENT_CATEGORIES (imported from requirementsGraph.ts)
   - Filter each category's documents by whether the document label includes the searchQuery (case-insensitive)
   - Remove categories with zero matching documents from the filtered result

3. LAYOUT (use SafeAreaView + FlatList or SectionList):
   - Header: Text "My Documents" — className="text-2xl font-bold text-gray-900 px-6 pt-6 pb-4"
   - Search bar: TextInput below header
     className="mx-6 mb-4 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-base text-gray-900"
     placeholder: "Search documents..."
     placeholderTextColor: "#9ca3af"
     value: searchQuery, onChangeText: setSearchQuery
   - SectionList rendering sections from DOCUMENT_CATEGORIES
     Each section: renderSectionHeader uses CategoryHeader component
     Each item: renders DocumentCard
       isChecked = state.possessedDocuments.has(document.id)
       onToggle = () => dispatch({ type: 'TOGGLE_DOCUMENT', payload: document.id })
   - Sticky bottom bar: View with className="border-t border-gray-200 bg-white px-6 py-4"
     TouchableOpacity: className="bg-blue-600 rounded-lg py-4 items-center"
     Text: className="text-white text-base font-semibold": "What do I need?"
     onPress: router.push('/target')

4. ASYNCSTORAGE NOTE: The checklist state comes from DocumentContext which already handles AsyncStorage hydration. ChecklistScreen does not touch AsyncStorage directly.
```

### Prompt 5C — TargetScreen

```
@app/target.tsx @src/hooks/useDocumentContext.ts @src/components/DocumentCard.tsx @src/components/CategoryHeader.tsx @src/algorithms/requirementsGraph.ts @src/context/types.ts @DESIGN_DOCUMENT.md

Implement TargetScreen in app/target.tsx.

Requirements:

1. STATE:
   - Pull state and dispatch from useDocumentContext()
   - Import useRouter from expo-router for navigation

2. LAYOUT:
   - Header: Text "What do you need?" — className="text-2xl font-bold text-gray-900 px-6 pt-6 pb-2"
   - Subheader: className="text-sm text-gray-500 px-6 pb-4": "Select the document you want to obtain."
   - SectionList of all documents grouped by DOCUMENT_CATEGORIES
   - Each DocumentCard:
     isChecked = false (always — this screen shows target, not possession)
     isDisabled = state.possessedDocuments.has(document.id)  (already have it)
     onToggle = () => handleSelectTarget(document.id)

3. handleSelectTarget(documentId: DocumentId):
   - If state.possessedDocuments.has(documentId): return (do nothing — disabled)
   - Dispatch { type: 'SET_TARGET', payload: documentId }
   - router.push('/roadmap')

4. Note at top of list (below subheader, above SectionList):
   className="mx-6 mb-4 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg"
   Text: className="text-xs text-gray-500": "Documents you already have are greyed out and cannot be selected as a target."
```

**After Part 5 completes:**
- Update PROGRESS.md: check all boxes under "Part 5 — ChecklistScreen and TargetScreen"
- Run `npx expo start` and manually test the checklist and target screens on Expo Go
- Commit: `git add . && git commit -m "feat: ChecklistScreen and TargetScreen"`

---

## Part 6 — RoadmapScreen and HistoryScreen

### What this part does

Builds the output screens: the step-by-step roadmap and the history log.

### Prompt 6A — RoadmapScreen

```
@app/roadmap.tsx @src/hooks/useDocumentContext.ts @src/hooks/useLocation.ts @src/components/StepCard.tsx @src/components/DependencyGraph.tsx @src/algorithms/topologicalSort.ts @src/algorithms/requirementsGraph.ts @src/context/types.ts @DESIGN_DOCUMENT.md

Implement RoadmapScreen in app/roadmap.tsx.

Requirements:

1. STATE:
   - Pull state and dispatch from useDocumentContext()
   - Pull latitude, longitude from useLocation()
   - Local state: showGraph (boolean, default false)
   - Derive: remainingSteps = state.roadmap.filter(step => !step.isDone)

2. LOCATION RE-TRIGGER:
   When latitude or longitude changes (and is not null), dispatch SET_TARGET again with state.targetDocument to regenerate the roadmap with updated GPS coordinates. Use a useEffect with [latitude, longitude] dependency. Only dispatch if state.targetDocument is not null.

3. LAYOUT:
   - Header section:
     - Target document label (large, bold): state.targetDocument ? REQUIREMENTS_GRAPH[state.targetDocument].label : ""
     - Step count: className="text-sm text-gray-500 mt-1": "[remainingSteps.length] steps remaining"
   
   - Empty state (when state.roadmap is empty and state.targetDocument is null):
     Centered View with Text: "Select a document from 'What do I need?' to generate your roadmap."
     className="text-base text-gray-500 text-center px-6"
   
   - Empty state (when remainingSteps is empty but targetDocument is set):
     Text: "All steps complete. Check your History tab."
   
   - Step list: FlatList of remainingSteps, each rendered as StepCard
     onMarkDone = () => dispatch({ type: 'MARK_DONE', payload: step.document.id })
   
   - Below step list: "View Dependency Map" toggle
     TouchableOpacity: className="mx-6 my-4 border border-gray-200 rounded-lg py-3 items-center"
     Text: showGraph ? "Hide Dependency Map" : "View Dependency Map"
     className="text-sm text-blue-600 font-semibold"
     onPress: setShowGraph(!showGraph)
   
   - Conditionally render DependencyGraph below the toggle when showGraph is true:
     Compute the current subgraph from buildSubgraph(REQUIREMENTS_GRAPH, state.possessedDocuments, state.targetDocument)
     Compute nextAttainable: all document IDs in the subgraph with in-degree 0
     Pass subgraph, state.possessedDocuments, nextAttainable to DependencyGraph

4. WRAP the entire screen in a ScrollView with SafeAreaView.
```

### Prompt 6B — HistoryScreen

```
@app/history.tsx @src/hooks/useDocumentContext.ts @src/algorithms/requirementsGraph.ts @src/context/types.ts @DESIGN_DOCUMENT.md

Implement HistoryScreen in app/history.tsx.

Requirements:

1. STATE:
   - Pull state from useDocumentContext()

2. LAYOUT:
   - Header: Text "History" — className="text-2xl font-bold text-gray-900 px-6 pt-6 pb-4"
   
   - Empty state (state.history is empty):
     Centered View inside the list area:
     Text: "No completed flows yet." className="text-base text-gray-500 text-center"
     Text below: "Complete all steps in a roadmap to see it recorded here." className="text-sm text-gray-400 text-center mt-2"
   
   - Non-empty: FlatList of state.history (most recent first — reverse the array)
     Each item: View className="bg-white border border-gray-200 rounded-lg mx-6 mb-3 p-4"
       - Document label: REQUIREMENTS_GRAPH[item.targetDocumentId]?.label ?? item.targetDocumentId
         className="text-base font-semibold text-gray-900"
       - Date: className="text-xs text-gray-500 mt-1" — format the completedAt ISO string as "Month D, YYYY"
       - Step count: className="text-xs text-gray-400 mt-0.5" — "[item.stepCount] steps completed"

3. No delete or clear history in v1.
```

**After Part 6 completes:**
- Update PROGRESS.md: check all boxes under "Part 6 — RoadmapScreen and HistoryScreen"
- Run `npx expo start` and manually test the full end-to-end flow on Expo Go
- Commit: `git add . && git commit -m "feat: RoadmapScreen and HistoryScreen"`

---

## Part 7 — Integration Testing

### Prompt 7A — End-to-End Test Run

```
@app/checklist.tsx @app/target.tsx @app/roadmap.tsx @src/algorithms/requirementsGraph.ts @src/algorithms/topologicalSort.ts @PROGRESS.md

Perform manual integration testing for LakadPapel. Work through each scenario below in Expo Go on a physical device. Report any failures.

SCENARIO 1 — Passport from zero:
1. Clear AsyncStorage (uninstall/reinstall or add a "Clear Data" debug button temporarily)
2. Open ChecklistScreen. Confirm all documents are unchecked.
3. Tap "What do I need?", select "Philippine Passport (Regular)"
4. Confirm roadmap shows: PSA Birth Certificate → Barangay Certificate → Voter's ID → Philippine Passport
5. Confirm each step has a branch card with a real DFA/PSA/COMELEC address

SCENARIO 2 — Possessed subset:
1. Check "PSA Birth Certificate" and "Barangay Certificate"
2. Select target: "Voter's ID (COMELEC)"
3. Confirm roadmap shows only 1 step: Voter's ID

SCENARIO 3 — NBI Clearance from zero:
1. Clear all checked documents
2. Select target: "NBI Clearance"
3. Confirm roadmap includes: PSA Birth Certificate → Barangay Certificate → Voter's ID → NBI Clearance (in valid order)

SCENARIO 4 — LTO Driver's License from zero:
1. Clear all. Select target: "LTO Non-Professional Driver's License"
2. Confirm roadmap includes Student Permit before Non-Pro License

SCENARIO 5 — Mark as Done flow:
1. Clear all. Select "NBI Clearance"
2. Tap "Mark as Done" on "PSA Birth Certificate"
3. Confirm PSA Birth Certificate disappears from the list
4. Confirm the roadmap re-renders correctly without PSA Birth Certificate

SCENARIO 6 — Offline mode:
1. Enable airplane mode
2. Open app. Confirm checklist loads correctly from storage
3. Select a target. Confirm roadmap generates
4. Confirm "Get Directions" button is hidden or does not crash

SCENARIO 7 — History:
1. Complete all steps for any target
2. Navigate to History tab. Confirm the flow is recorded.

For any failing scenario, describe the failure and what file likely needs to be fixed.
```

### Prompt 7B — Bug Fixes

```
@[files identified as needing fixes in Prompt 7A]

Fix all bugs identified during integration testing in Prompt 7A.

For each fix:
1. Identify the root cause
2. Make the minimal change necessary to fix it
3. Confirm the previously failing scenario now passes
4. Do not refactor anything not related to the bug

After all fixes are applied, run: npx jest
Confirm all unit tests still pass.
```

**After Part 7 completes:**
- Update PROGRESS.md: check all boxes under "Part 7 — Integration Testing"
- Commit: `git add . && git commit -m "test: integration testing and bug fixes"`

---

## Part 8 — Build, Documentation, and Submission

### Prompt 8A — App Assets

```
Create placeholder app assets for LakadPapel. The app is a Philippine government document navigator.

1. Update app.json to reference correct asset paths:
   - icon: "./assets/icon.png"
   - splash.image: "./assets/splash.png"
   - android.adaptiveIcon.foregroundImage: "./assets/adaptive-icon.png"

2. Describe what the icon should look like (for the team to create in Figma or Canva):
   - Background: #2563eb (solid blue)
   - Foreground: a simple white document icon with a checkmark
   - No text in the icon
   - Export at 1024x1024 PNG for icon.png and adaptive-icon.png
   - Splash: white background, centered LakadPapel text in #2563eb, Inter font, 32px

3. Update the app.json splash configuration:
   - backgroundColor: "#ffffff"
   - resizeMode: "contain"

Confirm app.json looks correct for EAS Build submission.
```

### Prompt 8B — README and Final Docs

```
@PID.md @DESIGN_DOCUMENT.md @PROGRESS.md @src/algorithms/requirementsGraph.ts @src/algorithms/topologicalSort.ts @src/algorithms/bfsLocator.ts

Write a README.md for the LakadPapel GitHub repository.

The README must include:

1. Project title and one-sentence description
2. What the app does (3–4 plain sentences, no marketing language)
3. Tech stack table (same as DESIGN_DOCUMENT.md Section 2)
4. Prerequisites (Node 18+, Expo Go, etc.)
5. Setup instructions:
   - git clone
   - npm install
   - npx expo start
   - Scan QR with Expo Go
6. Running tests: npx jest
7. Folder structure (abbreviated — top-level only)
8. Algorithm summary (2–3 sentences each for Topological Sort and BFS)
9. Data sources (same as PID.md Section 10)
10. Team members and roles
11. Academic context: PUP BSCS 2-4, Design and Analysis of Algorithms, Prof. Ria Sagum

Write in plain English. No marketing language. No emojis.
```

### Prompt 8C — EAS Build

```
Generate the Expo EAS Build for LakadPapel to produce a standalone Android APK.

Run the following steps in order and report the output of each:

1. Log in to Expo:
   npx eas login

2. Configure EAS:
   npx eas build:configure
   - Select Android
   - When asked for build profile, choose "preview" (generates APK, not AAB)

3. Verify eas.json was created with a preview profile:
   {
     "build": {
       "preview": {
         "android": {
           "buildType": "apk"
         }
       }
     }
   }

4. Start the build:
   npx eas build --platform android --profile preview

5. After build completes, download the APK from the EAS dashboard and install on a physical Android device.

6. Run through Scenario 1 from the integration test (Prompt 7A) on the installed APK to confirm it works outside Expo Go.

Report the build URL and APK download link.
```

**After Part 8 completes:**
- Update PROGRESS.md: check all boxes under "Part 8 — Build, Documentation, and Submission"
- Final commit: `git add . && git commit -m "chore: final build, README, assets, and submission prep"`
- Tag the release: `git tag v1.0.0 && git push origin v1.0.0`

---

## Quick Reference

### Run the app
```bash
npx expo start
# Scan the QR code with Expo Go on your phone
```

### Run tests
```bash
npx jest
npx jest --watch   # watch mode
npx jest __tests__/topologicalSort.test.ts   # single file
```

### Clear Metro cache
```bash
npx expo start --clear
```

### Build standalone APK
```bash
npx eas build --platform android --profile preview
```

### AsyncStorage key reference
```
@lakadpapel/possessed_documents   → JSON array of DocumentId strings
@lakadpapel/history               → JSON array of CompletedFlow objects
```

### Document ID reference
```
psa_birth_cert         barangay_cert          lto_medical_cert
voters_id              philsys_id             passport_regular
nbi_clearance          lto_student_permit     lto_nonpro_license
official_tor           prc_board_app          sss_id
gsis_ecard
```

### Algorithm complexity
| Operation | Time | Space |
|---|---|---|
| buildSubgraph | O(V + E) | O(V + E) |
| topologicalSort | O(V + E) | O(V) |
| bfsNearestBranch | O(V + E) | O(V) |
| Full pipeline | O(V + E) | O(V + E) |

V ≈ 50 document nodes, E ≈ 80 prerequisite edges. Runs in under 10ms on any Android device.
