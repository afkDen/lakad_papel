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
| Styling | React Native StyleSheet + `src/theme.ts` | Native styling with zero config; centralized design tokens in theme.ts |
| Fonts | @expo-google-fonts/inter | Inter font family; loaded before splash screen hides |
| Splash | expo-splash-screen | Holds splash while fonts load; prevents flash of unstyled text |
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
│   ├── _layout.tsx               # Root layout — wraps DocumentProvider, loads fonts
│   ├── index.tsx                 # Entry redirect to /checklist
│   ├── checklist.tsx             # ChecklistScreen
│   ├── target.tsx                # TargetScreen
│   ├── roadmap.tsx               # RoadmapScreen
│   ├── history.tsx               # HistoryScreen
│   └── explorer.tsx              # DAG Explorer Screen (new)
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
│   │   ├── DependencyGraph.tsx   # SVG node-link DAG visualizer (roadmap toggle)
│   │   ├── CategoryHeader.tsx    # Section header for grouped lists
│   │   ├── DAGExplorer.tsx       # Full interactive DAG canvas (new)
│   │   ├── AlgorithmTrace.tsx    # Step-by-step Kahn's algorithm panel (new)
│   │   └── NodeDetailSheet.tsx   # Bottom sheet for tapped node info (new)
│   ├── hooks/
│   │   ├── useDocumentContext.ts  # Typed hook for DocumentContext
│   │   ├── useLocation.ts         # Wraps expo-location with permission flow
│   │   └── useDAGLayout.ts        # Computes node positions for DAG rendering (new)
│   └── theme.ts                  # Centralized design tokens (colors, spacing, radii)
├── __tests__/
│   ├── topologicalSort.test.ts   # Kahn's Algorithm unit tests
│   └── bfsLocator.test.ts        # BFS unit tests
├── assets/
│   └── fonts/                    # Inter font files (via @expo-google-fonts/inter)
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

**Font:** Inter — loaded via `@expo-google-fonts/inter` in `_layout.tsx`. Splash screen is held until fonts are ready to prevent flash of unstyled text.

| Usage | Weight | Size | Line Height |
|---|---|---|---|
| Screen title | 700 | 22px | 28px |
| Section header | 600 | 14px | 20px |
| Body / card label | 400 | 16px | 24px |
| Secondary label | 400 | 13px | 18px |
| Button label | 600 | 15px | 20px |

No other fonts. No system fonts (avoid inconsistency between Android and iOS defaults).

### 7.2 Color Palette

All colors are defined in `src/theme.ts` under `TOKENS.colors`. Reference by token name, never by raw hex in component files.

| Token name | Hex | Use |
|---|---|---|
| `white` | #ffffff | Screen and card backgrounds |
| `bgScreen` | #f9fafb | Screen background (non-white screens) |
| `bgCard` | #ffffff | Card background |
| `bgMuted` | #f3f4f6 | Muted section backgrounds |
| `border` | #e5e7eb | Card borders, separators |
| `borderLight` | #f3f4f6 | Subtle dividers |
| `textPrimary` | #111827 | Primary body text |
| `textSecondary` | #6b7280 | Secondary / supporting text |
| `textMuted` | #9ca3af | Placeholder, disabled text |
| `green` | #16a34a | Possessed document, done state |
| `greenLight` | #f0fdf4 | Green pill background |
| `teal` | #0d9488 | Next attainable node (DAG) |
| `blue` | #2563eb | Primary action buttons |
| `blueLight` | #eff6ff | Info banner background |
| `blueBorder` | #bfdbfe | Info banner border |
| `blueText` | #1d4ed8 | Info banner text |
| `gray900` | #111827 | Step badge background |
| `gray400` | #9ca3af | Empty state, inactive icons |
| `gray300` | #d1d5db | Unchecked checkbox border |
| `gray200` | #e5e7eb | Borders |
| `gray100` | #f3f4f6 | Search bar background |
| `gray50` | #f9fafb | Category header background |

No gradients. No shadows deeper than elevation 2. No border radius larger than 16px except full-circle elements.

### 7.3 Spacing

All spacing values are defined in `src/theme.ts` under `TOKENS.spacing`. Base unit: 4px.

| Token name | Value | Use |
|---|---|---|
| `xs` | 4px | Tight gaps between inline elements |
| `sm` | 8px | Icon-to-label gaps, chip padding |
| `md` | 12px | Internal card gaps |
| `base` | 16px | Card padding, button vertical padding |
| `lg` | 20px | Larger internal gaps |
| `xl` | 24px | Screen horizontal padding |
| `xxl` | 32px | Section bottom margin, empty state padding |

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
        ├── /target          (tab: "Find")
        ├── /roadmap         (tab: "Roadmap")
        ├── /explorer        (tab: "Explorer")    ← new
        └── /history         (tab: "History")
```

Tab bar: 5 tabs, text labels + single icon each. No badge counts.

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

---

## 15. New Features — DAG Explorer and Algorithm Visualization

These features make the prerequisite graph a first-class, interactive part of the app rather than a hidden toggle on the roadmap screen. Each feature is self-contained and does not touch any existing algorithm logic.

---

### 15.1 DAG Explorer Screen (`/explorer`)

**Purpose:** A dedicated full-screen, interactive canvas showing the entire prerequisite graph. The user can explore all documents and their relationships visually, see their current progress painted onto the graph, and tap any node to learn about that document.

**New files:**
- `app/explorer.tsx` — the screen
- `src/components/DAGExplorer.tsx` — the interactive SVG canvas
- `src/components/NodeDetailSheet.tsx` — bottom sheet shown when a node is tapped
- `src/hooks/useDAGLayout.ts` — computes (x, y) position for every node

**Layout:**
- Full-screen SVG canvas wrapped in a `<ScrollView horizontal>` + `<ScrollView vertical>` for pan
- Header bar (outside canvas): screen title "Graph Explorer", a legend row showing three colored dots with labels (Possessed, Next, Locked)
- Canvas renders the full REQUIREMENTS_GRAPH, not just the current subgraph

**Node layout algorithm (`useDAGLayout.ts`):**
- Assign each node a topological level (0 = root nodes, 1 = nodes whose only prerequisites are at level 0, etc.)
- X position = level × column width (120px)
- Y position = index within level × row height (80px)
- Return a `Map<DocumentId, { x: number; y: number }>` for the renderer

**Node rendering:**
- Circle radius 28px
- Color:
  - `TOKENS.colors.green` — in `possessedDocuments`
  - `TOKENS.colors.teal` — in-degree 0 in current subgraph (next attainable)
  - `TOKENS.colors.gray300` — not yet attainable
  - `TOKENS.colors.blue` — currently selected target document
- Label: document agency abbreviation inside the circle (white, 9px, bold)
- Short label below the circle: truncated document name (10 chars max, 8px, gray)
- Edges: SVG `<Line>` from prerequisite center to dependent center, color `TOKENS.colors.gray200`, strokeWidth 1.5
- Edges leading into the currently selected target path: color `TOKENS.colors.blue`, strokeWidth 2.5

**Interaction:**
- Tap a node: opens `NodeDetailSheet` as a bottom sheet
- No drag-to-rearrange (static layout is sufficient)
- Canvas pans via ScrollView — no custom gesture handler needed

**NodeDetailSheet content:**
- Document label (large, bold)
- Agency badge (colored pill matching agency)
- Fee and typical processing time
- Prerequisites list: each prerequisite shown as a small colored dot + label (green if possessed, grey if not)
- Unlocks list: all documents that list this document as a prerequisite
- Button: "Set as Target" — dispatches SET_TARGET and navigates to /roadmap
- Button: "Mark as Possessed / Remove" — dispatches TOGGLE_DOCUMENT
- If SCHOOL or BARANGAY agency: shows the plain-text instruction instead of branch info

---

### 15.2 Algorithm Trace Panel (`AlgorithmTrace.tsx`)

**Purpose:** A collapsible panel on the RoadmapScreen that shows the actual step-by-step execution of Kahn's Algorithm for the current target. Each step shows the queue state, which node was dequeued, and which neighbors had their in-degree decremented. This is the educational DAA component.

**New file:** `src/components/AlgorithmTrace.tsx`

**Where it appears:** Below the DependencyGraph toggle on RoadmapScreen, as a second collapsible section labelled "Algorithm Trace".

**Data source:** `topologicalSort.ts` needs a new exported function alongside the existing one:

```typescript
export interface TraceStep {
  step: number;
  dequeued: DocumentId;
  queueBefore: DocumentId[];
  queueAfter: DocumentId[];
  inDegreeChanges: { node: DocumentId; from: number; to: number }[];
}

export function topologicalSortWithTrace(
  subgraph: Record<DocumentId, DocumentNode>
): { order: DocumentId[]; trace: TraceStep[] }
```

This function runs identical logic to `topologicalSort()` but records state at each step. The original `topologicalSort()` is not changed.

**Panel layout:**
- Header row: "Kahn's Algorithm Trace" label + step counter "Step X of Y" + a play/pause button
- When playing: auto-advances one step every 800ms
- Each step card shows:
  - Step number badge
  - "Dequeued: [document label]" in bold
  - "Queue before: [label, label, ...]" in small grey text
  - "Queue after: [label, label, ...]" in small grey text
  - In-degree changes: each shown as "[label] in-degree: 3 → 2" with an arrow
- The current step is highlighted in blue; past steps are grey; future steps are not shown
- A horizontal stepper at the bottom: back one step, play/pause, forward one step

**Behavior:**
- Resets to step 1 when target document changes
- Works with the static subgraph — no re-running the algorithm, just replaying the recorded trace
- If subgraph is empty: panel shows "No algorithm to trace — select a target document."

---

### 15.3 Live Graph Stats Bar

**Purpose:** A compact stats row shown at the top of both the RoadmapScreen and the Explorer screen that gives the user a live numerical summary of the current graph state.

**No new files needed** — implemented as an inline component within each screen.

**Stats shown (all derived from current state, recomputed on every state change):**

| Stat | Label | Derivation |
|---|---|---|
| Total nodes in full graph | "Nodes" | `Object.keys(REQUIREMENTS_GRAPH).length` |
| Total edges in full graph | "Edges" | Sum of all prerequisites array lengths |
| Steps remaining | "Remaining" | `roadmap.filter(s => !s.isDone).length` |
| Documents possessed | "Owned" | `possessedDocuments.size` |
| Estimated total days | "Est. Days" | Sum of `typicalDays` numeric values for remaining steps |
| Estimated total cost | "Est. Cost" | Sum of `fees` numeric values for remaining steps (PHP) |

**Layout:**
- Horizontal `ScrollView` (so it fits on narrow screens without wrapping)
- Each stat: a small card with the number in bold (18px) and the label below (10px, grey)
- Background: `TOKENS.colors.bgMuted`, border bottom `TOKENS.colors.border`
- Height: 64px fixed

---

### 15.4 "What Unlocks Next?" Highlight Mode

**Purpose:** On the DAG Explorer canvas, a toggle button that highlights only the documents the user can get right now (in-degree 0 in the current subgraph) and draws animated pulsing rings around those nodes.

**Trigger:** A button in the Explorer header: "What can I get now?" — toggles highlight mode on/off.

**Behavior when active:**
- All non-attainable nodes dim to 30% opacity
- All currently attainable nodes (in-degree 0) show a pulsing ring animation (SVG `<Circle>` with animated strokeOpacity via `react-native-reanimated` or a simple JS interval)
- A count label in the header updates: "X documents available now"

**No new files** — implemented within `DAGExplorer.tsx` and `explorer.tsx` using local state.

---

### 15.5 Minimum vs Full Path Toggle

**Purpose:** On the RoadmapScreen, a toggle that switches between two views of the roadmap:
- **Minimum path** (default): the current behavior — shortest attainable sequence given possessed documents
- **Full path**: shows every document in the ancestor chain of the target, including ones the user already has, with possessed ones shown as greyed-out completed steps

**Trigger:** A segmented control below the target document header on RoadmapScreen: "Remaining | Full Path"

**Full path behavior:**
- Runs `buildSubgraph()` with an empty possessed set (ignores what the user has)
- Runs `topologicalSort()` on that full subgraph
- Renders the full ordered list as StepCards
- Possessed documents shown with a green "Already have this" badge instead of a "Mark as Done" button
- Non-possessed documents shown as normal StepCards

**No new files** — implemented within `roadmap.tsx` using local state `viewMode: 'remaining' | 'full'`.

---

### 15.6 Updated Icon List

Add these icons to Section 7.5 for the new features:

| Icon | Use |
|---|---|
| `git-network-outline` | Explorer tab bar icon |
| `play-outline` | Algorithm trace play button |
| `pause-outline` | Algorithm trace pause button |
| `chevron-back-outline` | Algorithm trace step back |
| `information-circle-outline` | Node detail sheet trigger |
| `flash-outline` | "What can I get now?" highlight toggle |
