# Design Document
## LakadPapel — Philippine Government Document Navigator

---

## 1. Design Philosophy

LakadPapel is a utility app. Every design decision serves one goal: get the user from "I need a passport" to a printed list of exactly what to do and where to go, before they leave the house.

The visual design is:
- **Functional first.** No decorative elements that do not carry information.
- **High contrast, readable at a glance.** Most use happens under fluorescent lights in a waiting area.
- **One interaction per screen.** Each screen asks exactly one thing of the user.

---

## 2. Tech Stack

### Frontend (Mobile)

| Layer | Technology | Reason |
|---|---|---|
| Framework | React Native via Expo SDK 51 | Single codebase for Android and iOS; fast iteration with Expo Go |
| Language | TypeScript | Type safety on the DAG data structures prevents encoding errors |
| Navigation | Expo Router (file-based) | Maps directly to screen names; no manual stack wiring |
| Styling | NativeWind 4 (Tailwind CSS for RN) | Write Tailwind classes directly on RN components; no StyleSheet boilerplate |
| State | React Context + useReducer | Predictable, serializable state transitions; no third-party dependency |
| Persistence | @react-native-async-storage/async-storage | On-device key-value store; works offline; no auth required |
| Location | expo-location | Standard Expo module; handles Android and iOS permissions uniformly |
| Graph Visualization | react-native-svg | Renders the DAG node-link diagram as scalable SVG on both platforms |
| Testing | Jest + @testing-library/react-native | Standard for React Native; sufficient for algorithm unit tests |

### Backend

There is no backend. All data is bundled at build time. All algorithms run on-device. This is a deliberate architectural choice: the app must work in a government waiting room with no signal.

### Build and Distribution

| Tool | Use |
|---|---|
| Expo Go | Development and demo |
| Expo EAS Build | Standalone APK (Android) and IPA (iOS) |
| GitHub Actions | Optional CI for Jest test runs on push |

---

## 3. Folder Structure

```
lakadpapel/
├── app/                          # Expo Router screens (file = route)
│   ├── _layout.tsx               # Root layout — wraps DocumentProvider
│   ├── index.tsx                 # Entry redirect to /checklist
│   ├── checklist.tsx             # ChecklistScreen
│   ├── target.tsx                # TargetScreen
│   ├── roadmap.tsx               # RoadmapScreen
│   └── history.tsx               # HistoryScreen
├── src/
│   ├── algorithms/
│   │   ├── requirementsGraph.ts  # DAG: document nodes + prerequisite edges
│   │   ├── topologicalSort.ts    # buildSubgraph() + topologicalSort() (Kahn's)
│   │   └── bfsLocator.ts         # buildLocationGraph() + bfsNearestBranch()
│   ├── data/
│   │   └── agencyLocations.ts    # Agency branch dataset (GPS + metadata)
│   ├── context/
│   │   ├── DocumentContext.tsx   # Context provider + useReducer
│   │   └── types.ts              # Shared TypeScript types
│   ├── components/
│   │   ├── DocumentCard.tsx      # Single document row in checklist
│   │   ├── StepCard.tsx          # Single roadmap step card
│   │   ├── BranchCard.tsx        # Agency branch info card
│   │   ├── DependencyGraph.tsx   # SVG node-link DAG visualizer
│   │   └── CategoryHeader.tsx    # Section header for grouped lists
│   └── hooks/
│       ├── useDocumentContext.ts  # Typed hook for DocumentContext
│       └── useLocation.ts        # Wraps expo-location with permission flow
├── __tests__/
│   ├── topologicalSort.test.ts   # Kahn's Algorithm unit tests
│   └── bfsLocator.test.ts        # BFS unit tests
├── assets/
│   └── fonts/
│       └── Inter/                # Inter variable font files
├── tailwind.config.js
├── babel.config.js
├── app.json
└── tsconfig.json
```

---

## 4. Data Architecture

### 4.1 Document Node Schema

```typescript
// src/context/types.ts

export type DocumentId = string; // e.g. "psa_birth_cert", "passport_regular"

export interface DocumentNode {
  id: DocumentId;
  label: string;                 // Human-readable name
  agency: AgencyType;            // Issuing agency enum
  prerequisites: DocumentId[];   // Direct prerequisite node IDs
  fees: string;                  // e.g. "PHP 365" or "Free"
  typicalDays: string;           // e.g. "3–5 working days"
  officeType: string;            // e.g. "PSA outlet or LCR"
  notes?: string;                // Optional edge case notes
}

export type AgencyType =
  | 'PSA' | 'DFA' | 'NBI' | 'LTO' | 'COMELEC'
  | 'PHILSYS' | 'PRC' | 'SSS' | 'GSIS' | 'BARANGAY' | 'SCHOOL';
```

### 4.2 Agency Branch Schema

```typescript
// src/context/types.ts

export interface AgencyBranch {
  id: string;
  name: string;
  agency: AgencyType;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  hours: string;           // e.g. "Mon–Fri 8:00 AM – 5:00 PM"
  phone?: string;
  mapsUrl?: string;        // Google Maps deep-link
}
```

### 4.3 Application State Schema

```typescript
// src/context/types.ts

export interface AppState {
  possessedDocuments: Set<DocumentId>;    // Persisted to AsyncStorage
  targetDocument: DocumentId | null;
  roadmap: RoadmapStep[];
  history: CompletedFlow[];
}

export interface RoadmapStep {
  document: DocumentNode;
  nearestBranch: AgencyBranch | null;
  isDone: boolean;
}

export interface CompletedFlow {
  targetDocumentId: DocumentId;
  completedAt: string;          // ISO timestamp
  stepCount: number;
}
```

### 4.4 AsyncStorage Keys

```typescript
const STORAGE_KEYS = {
  POSSESSED_DOCUMENTS: '@lakadpapel/possessed_documents',   // JSON array of DocumentId[]
  HISTORY:             '@lakadpapel/history',                // JSON array of CompletedFlow[]
};
```

---

## 5. Algorithm Specifications

### 5.1 Topological Sort — Kahn's Algorithm

**File:** `src/algorithms/topologicalSort.ts`

```
FUNCTION buildSubgraph(graph, possessed, target):
  nodes  <- all ancestors of target (reverse BFS from target)
  remove <- { n in nodes | n in possessed }
  RETURN graph restricted to (nodes - remove)

FUNCTION topologicalSort(subgraph):
  in_degree <- count of incoming edges per node
  queue     <- all nodes with in_degree = 0
  order     <- []
  WHILE queue is not empty:
    node <- queue.dequeue()
    order.append(node)
    FOR each neighbor of node:
      in_degree[neighbor] -= 1
      IF in_degree[neighbor] = 0: queue.enqueue(neighbor)
  IF len(order) != len(subgraph.nodes): RAISE 'cycle detected'
  RETURN order   // O(V + E)
```

**Complexity:** O(V + E) time, O(V) space.
At V ≈ 50, E ≈ 80, this completes in under 10ms on any Android device.

### 5.2 Breadth-First Search — Nearest Agency Branch

**File:** `src/algorithms/bfsLocator.ts`

```
FUNCTION bfsNearestBranch(userGPS, agencyType, branchGraph):
  origin  <- node in branchGraph nearest to userGPS (Euclidean min)
  visited <- { origin }
  queue   <- [(origin, dist=0)]
  WHILE queue is not empty:
    node, dist <- queue.dequeue()
    IF node.agency = agencyType: RETURN node
    FOR each neighbor of node NOT IN visited:
      visited.add(neighbor)
      queue.enqueue((neighbor, dist + 1))
  RETURN null   // O(V + E)
```

**Complexity:** O(V' + E') time, O(V') space.
V' ≈ 500–1,000 branch nodes for Metro Manila coverage.

---

## 6. Screen Specifications

### 6.1 ChecklistScreen (`/checklist`)

**Purpose:** Let the user mark which documents they already have.

**Layout:**
- Top: search bar (plain text input, no icon clutter)
- Below: flat list of document cards grouped by category
- Bottom: sticky "What do I need?" button — navigates to `/target` when tapped

**Document Card:**
- Left: checkbox (checked = possessed)
- Center: document label + issuing agency label in smaller text
- No extra decoration

**Categories (section headers):**
- Foundation Documents
- Primary IDs
- Secondary IDs / Licenses
- Professional / Employment

**Behavior:**
- On checkbox toggle: dispatch `TOGGLE_DOCUMENT` action → updates possessedDocuments Set → writes to AsyncStorage
- AsyncStorage loads on mount; no loading spinner longer than 300ms

---

### 6.2 TargetScreen (`/target`)

**Purpose:** Let the user pick the document they want to obtain.

**Layout:**
- Header: "Which document do you need?"
- Grouped list of all documents, same categories as ChecklistScreen
- Documents already possessed are greyed out and not selectable
- Tapping a document dispatches `SET_TARGET` → runs `buildSubgraph()` + `topologicalSort()` → navigates to `/roadmap`

---

### 6.3 RoadmapScreen (`/roadmap`)

**Purpose:** Show the user exactly what to do and where to go, in order.

**Layout:**
- Header: target document name + total step count ("3 steps remaining")
- Numbered step list (StepCard per step)
- Below step list: "View Dependency Map" toggle — expands DependencyGraph component

**StepCard layout:**
- Step number (bold, large)
- Document label
- BranchCard (nested):
  - Branch name
  - Address
  - Hours
  - "Get Directions" button → opens native maps deep-link (Google Maps / Apple Maps)
- "Mark as Done" button → dispatches `MARK_DONE` → updates possessedDocuments → re-runs pipeline

**DependencyGraph:**
- SVG node-link diagram rendered via react-native-svg
- Node colors:
  - Green (#16a34a): already possessed
  - Teal (#0d9488): next attainable (in-degree 0 in current subgraph)
  - Grey (#6b7280): not yet attainable
- Tapping a node shows document label tooltip
- No animation — static render, redraws on state change

---

### 6.4 HistoryScreen (`/history`)

**Purpose:** Log of completed acquisition flows.

**Layout:**
- Flat list of CompletedFlow records
- Each item: target document label, date completed, step count
- Empty state: "No completed flows yet."
- No delete functionality in v1

---

## 7. Visual Design System

### 7.1 Typography

**Font:** Inter (variable, loaded via `expo-font`)

| Usage | Weight | Size | Line Height |
|---|---|---|---|
| Screen title | 700 | 22px | 28px |
| Section header | 600 | 14px | 20px |
| Body / card label | 400 | 16px | 24px |
| Secondary label | 400 | 13px | 18px |
| Button label | 600 | 15px | 20px |

No other fonts. No system fonts (avoid inconsistency between Android and iOS defaults).

### 7.2 Color Palette

| Token | Hex | Use |
|---|---|---|
| `bg-white` | #ffffff | Screen background |
| `bg-gray-50` | #f9fafb | Card background |
| `border-gray-200` | #e5e7eb | Card borders, separators |
| `text-gray-900` | #111827 | Primary text |
| `text-gray-500` | #6b7280 | Secondary / disabled text |
| `text-gray-400` | #9ca3af | Placeholder text |
| `green-600` | #16a34a | Possessed document indicator |
| `teal-600` | #0d9488 | Next attainable node |
| `blue-600` | #2563eb | Primary action buttons |
| `blue-700` | #1d4ed8 | Button pressed state |
| `red-500` | #ef4444 | Error states |

No gradients. No shadows deeper than `shadow-sm`. No rounded corners larger than `rounded-lg` (8px).

### 7.3 Spacing

Base unit: 4px. All spacing in multiples of 4px.

| Token | Value | Use |
|---|---|---|
| `p-4` | 16px | Card padding |
| `p-6` | 24px | Screen horizontal padding |
| `gap-3` | 12px | List item gap |
| `gap-2` | 8px | Inline element gap |
| `mb-8` | 32px | Section bottom margin |

### 7.4 Component Rules

- **No floating orbs, blobs, or background shapes.**
- **No emoji in UI.** Use text labels only.
- **No fake testimonials or placeholder content.** Every piece of text is functional.
- **No lorem ipsum anywhere** — all placeholder text is realistic (e.g., "PSA Serbilis Center — SM Megamall, Mandaluyong").
- **No skeleton loaders** for operations under 300ms. Show content directly.
- **Buttons:** full-width within their container, 48px minimum tap target height.
- **Lists:** no swipe actions in v1. Tap only.

### 7.5 Icons

Use `@expo/vector-icons` (Ionicons set only). The entire app uses exactly these icons:

| Icon | Use |
|---|---|
| `document-text-outline` | Tab bar — Documents tab |
| `search-outline` | Tab bar — What do I need? tab |
| `checkmark-circle` | Possessed / done state |
| `chevron-forward` | Navigation affordance |
| `location-outline` | Branch address |
| `time-outline` | Tab bar (History) and operating hours |
| `map-outline` | Tab bar (Roadmap) and Get Directions button |

No other icons. Do not add icons for decoration.

---

## 8. Navigation Structure

```
Root Layout (_layout.tsx)
└── DocumentProvider (wraps entire app)
    └── Tab Navigator (bottom tabs)
        ├── /checklist       (tab: "Documents")
        ├── /target          (tab: "What do I need?")
        ├── /roadmap         (tab: "Roadmap")
        └── /history         (tab: "History")
```

Tab bar: 4 tabs, text labels + single icon each. No badge counts in v1.

The `/target` screen is accessible from the tab bar and from the sticky button on `/checklist`.
The `/roadmap` screen populates when a target is selected.

---

## 9. Offline Behavior

| Feature | Online | Offline |
|---|---|---|
| Prerequisite resolution (Topological Sort) | Yes | Yes |
| Document checklist (AsyncStorage) | Yes | Yes |
| BFS nearest branch (static dataset) | Yes | Yes |
| GPS location (expo-location) | Yes | Yes (device GPS, no network) |
| "Get Directions" deep-link | Yes | No (opens native maps app) |

The app shows no network error states for core features. The only network-dependent feature is the maps deep-link, which degrades gracefully (button is hidden if GPS unavailable).

---

## 10. Performance Targets

| Metric | Target |
|---|---|
| Full Topological Sort pipeline | < 10ms |
| Full BFS per step | < 10ms |
| AsyncStorage read on mount | < 300ms |
| ChecklistScreen initial render | < 200ms on mid-range Android |
| App cold start to ChecklistScreen | < 2 seconds on Expo Go |

---

## 11. Accessibility

- All interactive elements have `accessibilityLabel` set.
- Minimum tap target: 48 x 48dp (Android Material) / 44 x 44pt (iOS HIG).
- Text contrast ratio: minimum 4.5:1 for body text (WCAG AA).
- No color-only information. Status (possessed / not possessed) is conveyed by both color and a checkmark icon.
- VoiceOver / TalkBack compatible: no gesture-only interactions.

---

## 12. Testing Plan

### 12.1 Algorithm Unit Tests (`__tests__/topologicalSort.test.ts`)

For each of the 30+ document nodes, test:
- Correct ordering when user possesses no documents
- Correct ordering when user possesses various subsets of prerequisites
- Possessed documents are excluded from the output
- Target document appears last in the output
- Cycle detection throws on a malformed graph (injected test fixture)

### 12.2 BFS Unit Tests (`__tests__/bfsLocator.test.ts`)

- Returns null when no branch of required agency exists in graph
- Returns the correct nearest branch for a known GPS fixture
- Handles disconnected graph nodes without infinite loop

### 12.3 Integration Tests

Manual test matrix — 10 target documents x 3 possession states:
- User possesses nothing
- User possesses foundational documents only
- User possesses all prerequisites except one

### 12.4 Offline Tests

- Enable airplane mode on device
- Confirm checklist loads from AsyncStorage
- Confirm roadmap generates correctly
- Confirm "Get Directions" button hides gracefully

---

## 13. Prerequisite DAG — Full Node Reference

| Document | ID | Agency | Prerequisites |
|---|---|---|---|
| PSA Birth Certificate | `psa_birth_cert` | PSA | None |
| Barangay Certificate / Cedula | `barangay_cert` | BARANGAY | None |
| Voter's ID (COMELEC) | `voters_id` | COMELEC | `psa_birth_cert`, `barangay_cert` |
| PhilSys National ID | `philsys_id` | PHILSYS | `psa_birth_cert`, `barangay_cert` |
| NBI Clearance | `nbi_clearance` | NBI | `voters_id` (minimum path — see note) |
| LTO Student Permit | `lto_student_permit` | LTO | `psa_birth_cert`, `lto_medical_cert` |
| LTO Non-Pro Driver's License | `lto_nonpro_license` | LTO | `lto_student_permit`, `lto_medical_cert` |
| LTO Medical Certificate | `lto_medical_cert` | LTO | None (obtained from LTO-accredited clinic) |
| Philippine Passport (Regular) | `passport_regular` | DFA | `psa_birth_cert`, one valid government ID |
| PRC Board Exam Application | `prc_board_app` | PRC | `psa_birth_cert`, `official_tor`, `nbi_clearance` |
| Official Transcript of Records | `official_tor` | SCHOOL | `psa_birth_cert` |
| SSS ID | `sss_id` | SSS | `psa_birth_cert`, two valid secondary IDs |
| GSIS eCard | `gsis_ecard` | GSIS | Active government employment, `psa_birth_cert` |

> **DAG design note — minimum path encoding:** Where a document accepts any one of several valid prerequisites (e.g. NBI Clearance accepts Voter's ID, PhilSys ID, or Passport), the DAG encodes only the shortest attainable path — `voters_id` for NBI Clearance, `voters_id` for SSS ID. This keeps the graph acyclic and deterministic. The `notes` field on each node documents the full set of accepted alternatives.
>
> **SCHOOL agency type:** `official_tor` is issued by the applicant's university registrar, not a government agency. Its `agency` is set to `'SCHOOL'`. BFS returns `null` for `SCHOOL` type; `BranchCard` displays "Contact your school's registrar office" in this case.
>
> This table reflects the initial DAG encoding. Additional nodes (UMID, Postal ID, TIN ID, Senior Citizen ID, PWD ID, OFW ID) are added in Week 2 per the project timeline.

---

## 14. What This Document Does Not Cover

- Server-side code (there is none)
- Database schema (there is no database — all data is static files or AsyncStorage)
- Authentication (there is no auth)
- Analytics or crash reporting (out of scope for v1)
- App store listing copy or screenshots (deferred to final submission)
