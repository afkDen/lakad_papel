# LakadPapel — Codebase Overview

> **Purpose**: This document is a portable reference for any future AI prompt or developer onboarding session. It describes where everything lives, how the pieces connect, and what each file does.
> 
> **Last Updated**: 2026-05-29

---

## 1. What This App Is

LakadPapel is an **offline-first React Native (Expo)** mobile app that helps Filipino citizens navigate the bureaucratic maze of obtaining Philippine government documents. Users select a target document (e.g. Philippine Passport), and the app computes the optimal acquisition order using graph algorithms, then locates the nearest government branch offices via GPS.

**Key facts:**
- **100% offline** — all data is bundled at build time, no backend or API calls
- **17 government documents** modeled as a Directed Acyclic Graph (DAG)
- **114 verified branch locations** across 13 agencies nationwide
- **Bilingual** — English and Tagalog (Filipino)
- **Dark mode** support
- **Two UI modes** — "Simple" (senior-friendly) and "Advanced" (shows DAG visualization, algorithm traces)

---

## 2. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React Native via Expo SDK | 56 |
| Language | TypeScript | 6.0 |
| Routing | Expo Router (file-based tabs) | 56.2 |
| State | `useReducer` + React Context | — |
| Persistence | `@react-native-async-storage/async-storage` | 2.2 |
| Fonts | `@expo-google-fonts/inter` (400, 600, 700) | 0.4 |
| Icons | `@expo/vector-icons` (Ionicons) | 15.0 |
| SVG | `react-native-svg` | 15.15 |
| Location | `expo-location` | 56.0 |
| Testing | Jest + `jest-expo` + `@testing-library/react-native` | 29.7 |

---

## 3. Directory Structure

```
lakadpapel/
├── app/                          # Expo Router screens (each file = a tab)
│   ├── _layout.tsx               # Root layout: providers, tab bar, font loading
│   ├── index.tsx                 # Entry point — redirects to /checklist
│   ├── checklist.tsx             # "Documents" tab — mark IDs you already have
│   ├── target.tsx                # "Find ID" tab — pick your target document
│   ├── roadmap.tsx               # "Roadmap" tab — step-by-step acquisition plan
│   ├── explorer.tsx              # "Explorer" tab — DAG visualization / FAQ guide
│   ├── history.tsx               # "History" tab — completed acquisition flows
│   └── settings.tsx              # "Settings" tab — theme, language, cache reset
│
├── src/
│   ├── algorithms/               # Pure algorithmic logic (no React)
│   │   ├── requirementsGraph.ts  # DAG definition: 17 document nodes + categories
│   │   ├── topologicalSort.ts    # Kahn's algorithm: subgraph extraction + sorting
│   │   └── bfsLocator.ts        # BFS nearest-branch finder using Haversine distance
│   │
│   ├── components/               # Reusable React Native components
│   │   ├── DocumentCard.tsx      # Checkbox card for a single document
│   │   ├── CategoryHeader.tsx    # Section header for document groups
│   │   ├── StepCard.tsx          # Roadmap step card (document + nearest branch)
│   │   ├── BranchCard.tsx        # Branch details card (address, hours, GPS link)
│   │   ├── DAGExplorer.tsx       # Interactive SVG graph canvas (Advanced mode)
│   │   ├── DependencyGraph.tsx   # Subgraph visualization on roadmap screen
│   │   ├── NodeDetailSheet.tsx   # Bottom sheet with full document details
│   │   ├── LinearTimeline.tsx    # Vertical milestone timeline (Simple mode)
│   │   ├── AlgorithmTrace.tsx    # Step-by-step Kahn's algorithm educational trace
│   │   └── ErrorBoundary.tsx     # Crash-safe error boundary wrapper
│   │
│   ├── context/                  # React Context providers + types
│   │   ├── types.ts              # Core TypeScript types (DocumentNode, AgencyBranch, etc.)
│   │   ├── DocumentContext.tsx   # Main app state: reducer, AsyncStorage hydration/sync
│   │   ├── ThemeContext.tsx      # Dark/light mode toggle, persisted to AsyncStorage
│   │   └── LanguageContext.tsx   # English/Tagalog toggle, persisted to AsyncStorage
│   │
│   ├── data/
│   │   └── agencyLocations.ts   # 114 branch records with GPS coords, hours, phones
│   │
│   ├── hooks/
│   │   ├── useDocumentContext.ts # Convenience hook for DocumentContext
│   │   ├── useDAGLayout.ts      # Computes x/y positions for DAG canvas rendering
│   │   └── useLocation.ts       # Expo Location wrapper (GPS permission + coords)
│   │
│   ├── theme.ts                 # Design tokens: colors, typography, spacing, radii, shadows
│   │
│   └── utils/
│       └── languages.ts         # Full translation matrix (English + Tagalog)
│
├── __tests__/
│   ├── topologicalSort.test.ts  # 13 specs: ordering, exclusion, cycles, trace
│   └── bfsLocator.test.ts       # 9 specs: haversine, graph build, BFS, disconnected
│
├── assets/                      # App icons, splash screen images
├── app.json                     # Expo configuration
├── package.json                 # Dependencies and scripts
├── tsconfig.json                # TypeScript config
└── babel.config.js              # Babel config (expo preset)
```

---

## 4. Architecture & Data Flow

### 4.1 Provider Hierarchy

The app wraps all screens in a strict provider chain defined in `app/_layout.tsx`:

```
ErrorBoundary
  └── LanguageProvider          (English/Tagalog state)
        └── ThemeProvider       (Dark/Light mode state)
              └── DocumentProvider  (Core app state: possessed docs, target, roadmap, history)
                    └── <Tabs>  (Expo Router tab navigator)
```

All providers persist their state to `AsyncStorage` with keys prefixed `@lakadpapel/`.

### 4.2 Core State (DocumentContext)

The app's central state is managed by a `useReducer` inside `DocumentContext.tsx`:

```typescript
interface AppState {
  possessedDocuments: Set<DocumentId>;   // IDs the user already has
  targetDocument: DocumentId | null;     // The document the user wants to get
  roadmap: RoadmapStep[];                // Computed step-by-step plan
  history: CompletedFlow[];              // Log of completed acquisition journeys
  userMode: 'simple' | 'advanced';       // UI complexity toggle
}
```

**Actions dispatched:**
| Action | Effect |
|--------|--------|
| `TOGGLE_DOCUMENT` | Flip a document's possession state; clears active target/roadmap |
| `SET_TARGET` | Set a target document and auto-generate the roadmap |
| `MARK_DONE` | Mark a roadmap step as complete; auto-logs to history when all done |
| `TOGGLE_USER_MODE` | Switch between Simple and Advanced UI |
| `HYDRATE` | Restore state from AsyncStorage on app launch |
| `ADD_TO_HISTORY` | Append a completed flow record |

### 4.3 Algorithm Pipeline

When a user selects a target document, the following pipeline executes **entirely on-device**:

```
1. buildSubgraph()        ← Reverse BFS from target, excluding possessed docs
2. topologicalSort()      ← Kahn's algorithm on the filtered subgraph
3. bfsNearestBranch()     ← For each step, find the nearest agency branch via GPS
4. → RoadmapStep[]        ← Result: ordered steps with branch info
```

#### Algorithm Details:

- **`buildSubgraph(graph, possessed, target)`** — Does a reverse BFS from the target document, collecting all ancestor prerequisites. Filters out any documents the user already possesses. Returns a pruned subgraph.

- **`topologicalSort(subgraph)`** — Implements Kahn's algorithm: computes in-degrees, processes nodes with in-degree 0, detects cycles. Returns a guaranteed-valid chronological ordering.

- **`topologicalSortWithTrace(subgraph)`** — Same algorithm but records each step's queue state and in-degree changes for the educational "Algorithm Trace" UI panel.

- **`bfsNearestBranch(lat, lon, agencyType, locationGraph)`** — Finds the physical branch closest to the user via BFS on a proximity graph. The proximity graph connects branches within 5km of each other (built once at module load using Haversine distance).

---

## 5. The Document Graph

### 5.1 Structure

Defined in `src/algorithms/requirementsGraph.ts` as `REQUIREMENTS_GRAPH`:

Each document is a `DocumentNode`:
```typescript
interface DocumentNode {
  id: DocumentId;           // e.g. 'passport_regular'
  label: string;            // Human-readable name
  agency: AgencyType;       // Which agency issues it (maps to branch locations)
  prerequisites: DocumentId[];  // DAG edges — what you need first
  fees: string;             // Official government fees
  typicalDays: string;      // Processing time
  officeType: string;       // Type of office to visit
  notes?: string;           // Real-world tips and regulatory notices
}
```

### 5.2 Current Documents (17 total)

**Foundation Documents** (no prerequisites):
| ID | Label | Agency |
|----|-------|--------|
| `psa_birth_cert` | PSA Birth Certificate | PSA |
| `barangay_cert` | Barangay Certificate / Cedula | BARANGAY |
| `lto_medical_cert` | LTO-Accredited Medical Certificate | LTO |

**Primary IDs**:
| ID | Label | Agency | Prerequisites |
|----|-------|--------|--------------|
| `voters_id` | Voter's Certification (COMELEC) | COMELEC | psa_birth_cert, barangay_cert |
| `philsys_id` | PhilSys National ID | PHILSYS | psa_birth_cert, barangay_cert |
| `passport_regular` | Philippine Passport (Regular) | DFA | psa_birth_cert, voters_id |
| `nbi_clearance` | NBI Clearance | NBI | voters_id |
| `postal_id` | PHLPost Postal ID | PHLPOST | psa_birth_cert, barangay_cert |
| `bir_tin` | BIR TIN Card | BIR | psa_birth_cert, barangay_cert |

**Licenses**:
| ID | Label | Agency | Prerequisites |
|----|-------|--------|--------------|
| `lto_student_permit` | LTO Student Permit | LTO | psa_birth_cert, lto_medical_cert |
| `lto_nonpro_license` | LTO Non-Pro Driver's License | LTO | lto_student_permit, lto_medical_cert |

**Professional / Employment**:
| ID | Label | Agency | Prerequisites |
|----|-------|--------|--------------|
| `official_tor` | Official Transcript of Records | SCHOOL | psa_birth_cert |
| `prc_board_app` | PRC Licensure Exam Application | PRC | psa_birth_cert, official_tor, nbi_clearance |
| `sss_id` | SSS UMID / ATM Pay Card | SSS | psa_birth_cert, voters_id |
| `gsis_ecard` | GSIS eCard | GSIS | psa_birth_cert |
| `philhealth_id` | PhilHealth Member ID Card | PHILHEALTH | psa_birth_cert, barangay_cert |
| `pagibig_loyalty` | Pag-IBIG Loyalty Card Plus | PAGIBIG | psa_birth_cert, voters_id |

### 5.3 Graph Validation

`validateGraph()` runs at **module load time** — if any prerequisite references a document ID that doesn't exist in the graph, it throws immediately. This prevents silent data corruption.

### 5.4 Category Grouping

`DOCUMENT_CATEGORIES` groups document IDs into named sections for the UI's `SectionList` displays. Adding a new document requires:
1. Adding the node to `REQUIREMENTS_GRAPH`
2. Adding its ID to the appropriate category array in `DOCUMENT_CATEGORIES`

---

## 6. Branch Location Database

Defined in `src/data/agencyLocations.ts` as `AGENCY_BRANCHES` (114 entries):

| Agency | Count | Coverage |
|--------|-------|----------|
| DFA | 23 | Nationwide |
| NBI | 19 | Nationwide |
| PSA | 12 | NCR + Major Cities |
| LTO | 9 | NCR + Regional |
| SSS | 9 | NCR + Major Cities |
| COMELEC | 5 | NCR + Regional |
| PHILSYS | 6 | NCR + Major Cities |
| PRC | 6 | NCR + Regional |
| PAGIBIG | 6 | NCR + Cebu |
| PHLPOST | 6 | NCR + Major Cities |
| BIR | 5 | NCR + Major Cities |
| GSIS | 4 | NCR |
| PHILHEALTH | 4 | NCR |

Each branch record contains: `id`, `name`, `agency`, `address`, `city`, `latitude`, `longitude`, `hours`, `phone?`, `mapsUrl?`.

The file also exports `buildProximityEdges()` which computes a spatial adjacency graph using Haversine distance (branches within a configurable threshold are connected).

**Note**: `BARANGAY` and `SCHOOL` agency types intentionally have **no branch entries** — the BFS locator returns `null` for these, and the UI renders a special amber warning callout instead.

---

## 7. Screen-by-Screen Guide

### Documents (`checklist.tsx`)
- Grouped `SectionList` of all 17 documents organized by category
- Checkbox toggling via `TOGGLE_DOCUMENT` dispatch
- Search bar filters documents by label
- Bottom CTA navigates to Find ID tab
- Simple/Advanced mode toggle

### Find ID (`target.tsx`)
- Same grouped `SectionList`, but tapping a document sets it as the acquisition target
- Documents the user already possesses are greyed out (disabled)
- On selection: dispatches `SET_TARGET` → navigates to Roadmap

### Roadmap (`roadmap.tsx`)
- Displays the computed `RoadmapStep[]` as a `FlatList` of `StepCard` components
- Each step shows: document name, fees, processing time, nearest branch with GPS link
- "Mark as Done" button per step
- Simple mode: shows `LinearTimeline` milestone view
- Advanced mode: collapsible `DependencyGraph` and `AlgorithmTrace` panels
- Stats bar: total nodes, edges, remaining steps, est. days, est. cost

### Explorer (`explorer.tsx`)
- **Simple mode**: FAQ guide + `LinearTimeline` if target is active
- **Advanced mode**: Interactive SVG DAG canvas (`DAGExplorer`), color legend, stats bar, "Highlight Next Steps" toggle, `NodeDetailSheet` bottom drawer

### History (`history.tsx`)
- `FlatList` of `CompletedFlow` records showing past completed document journeys

### Settings (`settings.tsx`)
- Language toggle (English / Tagalog)
- Dark mode toggle
- Cache reset (clears possessed documents from AsyncStorage)
- Database version display

---

## 8. Localization System

Defined in `src/utils/languages.ts` as a `translations` object with `en` and `tl` keys. Every UI string is accessed via the `useLanguage()` hook's `t` object (e.g. `t.documents`, `t.findId`).

The `LanguageContext` persists the selected language to `AsyncStorage` under `@lakadpapel/language`.

To add a new translated string:
1. Add the key+value to both `en` and `tl` objects in `languages.ts`
2. Access it via `t.yourNewKey` in any component

---

## 9. Theming System

**Two layers:**

1. **Static tokens** (`src/theme.ts`): `colors`, `typography`, `spacing`, `radii`, `shadows` — imported directly by components for constants that don't change with dark mode.

2. **Dynamic theme** (`src/context/ThemeContext.tsx`): provides `isDarkMode`, `toggleTheme()`, and a `colors` object with keys `background`, `cardBackground`, `text`, `subText`, `border`, `primary` that swap between light/dark palettes.

Components typically do:
```tsx
const { colors: themeColors, isDarkMode } = useTheme();
// ...
style={[styles.container, { backgroundColor: themeColors.background }]}
```

---

## 10. AsyncStorage Keys

| Key | Type | Purpose |
|-----|------|---------|
| `@lakadpapel/possessed_documents` | `DocumentId[]` (JSON) | Which documents the user has |
| `@lakadpapel/history` | `CompletedFlow[]` (JSON) | Completed acquisition logs |
| `@lakadpapel/user_mode` | `'simple' \| 'advanced'` | UI complexity preference |
| `@lakadpapel/theme` | `'dark' \| 'light'` | Theme preference |
| `@lakadpapel/language` | `'en' \| 'tl'` | Language preference |

---

## 11. Testing

**22 unit tests** across 2 test suites:

- `__tests__/topologicalSort.test.ts` (13 specs):
  - Correct prerequisite ordering for passport, NBI, LTO, PRC, and all 4 new documents
  - Possessed document exclusion
  - Edge cases: already-possessed target, empty subgraph, cycle detection
  - Graph validation of the real `REQUIREMENTS_GRAPH`
  - `topologicalSortWithTrace` trace step verification

- `__tests__/bfsLocator.test.ts` (9 specs):
  - Haversine formula (identical points, known distances)
  - Location graph construction and adjacency
  - BFS branch finding (DFA near SM Megamall, NBI lookup)
  - Null returns for BARANGAY/SCHOOL
  - Ocean coordinate graceful degradation
  - Disconnected graph components

**Run tests**: `npm run test`
**Type check**: `npx tsc --noEmit`

---

## 12. How to Add a New Document

1. **Define the node** in `REQUIREMENTS_GRAPH` inside `src/algorithms/requirementsGraph.ts`:
   ```typescript
   new_doc_id: {
     id: 'new_doc_id',
     label: 'Human Readable Name',
     agency: 'AGENCY_TYPE',  // Must match an AgencyType in types.ts
     prerequisites: ['existing_doc_id'],
     fees: 'PHP XXX',
     typicalDays: 'X working days',
     officeType: 'Office Name',
     notes: 'Optional real-world tips',
   },
   ```

2. **Register in a category** in `DOCUMENT_CATEGORIES` (same file).

3. **If the agency is new**, add it to the `AgencyType` union in `src/context/types.ts`, and add branch entries to `src/data/agencyLocations.ts`.

4. **Add translations** if needed in `src/utils/languages.ts`.

5. **Verify**: Run `npx tsc --noEmit` and `npm run test`.

---

## 13. How to Add a New Branch Location

Add an entry to the `AGENCY_BRANCHES` array in `src/data/agencyLocations.ts`:
```typescript
{
  id: 'unique_branch_id',
  name: 'Branch Display Name',
  agency: 'AGENCY_TYPE',
  address: 'Full street address',
  city: 'City Name',
  latitude: 14.XXXX,
  longitude: 121.XXXX,
  hours: 'Mon–Fri 8:00 AM – 5:00 PM',
  phone: '(02) XXXX-XXXX',
  mapsUrl: 'https://maps.google.com/?q=...',
},
```

The proximity graph is rebuilt automatically at module load time.

---

## 14. Key Architectural Decisions

1. **No backend** — Everything is bundled. The app must work in government waiting rooms with no signal.
2. **Graph algorithms are pure functions** — `topologicalSort.ts` and `bfsLocator.ts` have zero React dependencies. They can be tested independently.
3. **Module-level caching** — The location graph (`buildLocationGraph`) is computed once at module load and reused across all renders.
4. **Reducer-driven state** — All mutations flow through `appReducer` dispatches. Side effects (AsyncStorage) are handled in `useEffect` hooks, not in the reducer.
5. **Two UI modes** — The "Simple" mode hides all graph/algorithm complexity behind a senior-friendly FAQ and timeline interface, while "Advanced" mode exposes the full DAG canvas and Kahn's algorithm trace for educational purposes.

---

## 15. Scripts

| Command | Purpose |
|---------|---------|
| `npm run start` | Start Expo dev server |
| `npm run android` | Start on Android device/emulator |
| `npm run ios` | Start on iOS device/simulator |
| `npm run web` | Start web version |
| `npm run test` | Run Jest test suite |
| `npm run test:watch` | Run tests in watch mode |
