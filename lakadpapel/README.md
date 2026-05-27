# LakadPapel — Philippine Government Document Navigator

LakadPapel is a React Native mobile application that guides Filipino citizens through the prerequisite chains and office locations required to acquire government documents.

## Core Functionality

LakadPapel resolves the fragmented and siloed document application process by modeling the entire ecosystem as a Directed Acyclic Graph (DAG). Users can personalize their roadmap by marking documents they already possess. The application then calculates a guaranteed-valid, ordered sequence of steps to acquire the target document and locates the geographically nearest agency branch offices from a verified nationwide dataset of **114 branches across 13 government agencies**. The entire system runs fully on-device and operates 100% offline.

---

## Interactive DAA Visualizer Features (New!)

To support academic learning in **Design and Analysis of Algorithms (DAA)**, the application includes a suite of advanced visual and educational features:

### 1. DAG Explorer Screen (`/explorer` tab)
* **Interactive SVG Canvas**: Displays all 13 document nodes and their prerequisite edges in an interactive, pan-able SVG layout rendered via `react-native-svg`.
* **Topological Leveling**: Nodes are dynamically laid out on 4 horizontal columns representing their prerequisite levels ($0 \to 3$) computed via a topological depth-indexing layout hook (`useDAGLayout.ts`).
* **Interactive Bottom Sheet (`NodeDetailSheet.tsx`)**: Tapping any node displays a custom slide-up sheet showing estimated costs, processing times, office metadata, required items, unlocked child documents, and buttons to toggle document ownership or set as active target.
* **"Next Steps" Highlight Mode**: Toggling the flash indicator dims locked documents to 30% opacity and triggers pulsing halo ring animations on next attainable documents (in-degree 0 in the active subgraph).

### 2. Kahn's Algorithm Trace Player (`AlgorithmTrace.tsx`)
* **Autoplay Control Panel**: Allows users to watch a step-by-step playback (950ms interval) of Kahn's Algorithm resolving dependencies.
* **Trace Log**: Displays dequeued nodes, queue states before/after each dequeue, and neighbor in-degree decrements (e.g. `nbi_clearance in-degree: 1 → 0`) indicating how nodes are unlocked.
* **Interactive Stepper**: Supports manual navigation (Step Forward, Step Back, Play, Pause, and Reset).

### 3. Live Graph Stats Bar
* Scrollable horizontal row at the top of the **Roadmap** and **Explorer** screens displaying live graph metrics:
  - **Total Nodes** & **Edges** in the full graph.
  - **Owned** & **Available** document counts.
  - **Remaining Steps** in the active flow.
  - **Estimated Days** (sum of days for remaining steps).
  - **Estimated Cost** (sum of fees for remaining steps).

### 4. Minimum vs Full Path Toggle
* Segmented control on the **Roadmap** screen to toggle between:
  - **Remaining** (default): Show only the shortest sequence of missing documents.
  - **Full Path**: Show the complete prerequisite sequence of the target document, with possessed documents greyed out as completed steps.

---

## Technology Stack

| Layer | Technology | Reason |
|---|---|---|
| Framework | React Native via Expo SDK 56 | Cross-platform build target (Android/iOS) with rapid testing |
| Language | TypeScript | Type safety for DAG node manipulation and BFS graph traversals |
| Navigation | Expo Router | Modern file-based routing architecture |
| Styling | React Native StyleSheet + `src/theme.ts` | Centralized design tokens; native performance and stability |
| Fonts | @expo-google-fonts/inter | High-contrast premium typography loaded before splash screen hides |
| Splash | expo-splash-screen | Controls splash hiding to avoid flashes of unstyled content |
| State | React Context + useReducer | Predictable state management with AsyncStorage persistence |
| Location | expo-location | Standard interface for offline native GPS coordinates |
| Graph Visuals | react-native-svg | Renders DAG nodes and edges as scalable, interactive vector graphics |
| Testing | Jest | Complete unit testing for pure algorithms |

---

## Setup and Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/afkDen/lakad_papel.git
   cd lakad_papel/lakadpapel
   ```

2. **Install dependencies:**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Start the development server:**
   ```bash
   npx expo start --clear
   ```

4. **Run on emulator/device:**
   - Press `a` for Android Emulator.
   - Press `i` for iOS Simulator.
   - Scan the generated QR code with the **Expo Go** app on your physical device.

---

## Running Unit Tests

To run the complete suite of algorithm and tracing unit tests:
```bash
npm run test
```

---

## Folder Structure

```
lakadpapel/
├── app/                          # Expo Router screens (routing routes)
│   ├── _layout.tsx               # Root layout wrapping DocumentProvider and loading fonts
│   ├── index.tsx                 # Redirect entry point
│   ├── checklist.tsx             # ChecklistScreen (possessed documents checklist)
│   ├── target.tsx                # TargetScreen (target document selector)
│   ├── roadmap.tsx               # RoadmapScreen (stats, segmented roadmap list, graph and trace toggles)
│   ├── explorer.tsx              # DAG Explorer Screen (pan canvas, stats bar, details sheet)
│   └── history.tsx               # HistoryScreen (completion logs)
├── src/
│   ├── algorithms/
│   │   ├── requirementsGraph.ts  # DAG representing document node prereqs
│   │   ├── topologicalSort.ts    # Kahn's topological sort and tracing implementations
│   │   └── bfsLocator.ts         # BFS nearest agency branch search engine
│   ├── data/
│   │   └── agencyLocations.ts    # Nationwide agency branch dataset (114 verified locations)
│   ├── context/
│   │   ├── DocumentContext.tsx   # Context state provider and action reducer
│   │   └── types.ts              # Global TypeScript interfaces
│   ├── components/
│   │   ├── CategoryHeader.tsx    # Category section list headers
│   │   ├── DocumentCard.tsx      # Checkbox card for document toggles
│   │   ├── BranchCard.tsx        # Details card for nearest office branch
│   │   ├── StepCard.tsx          # Card representing single acquisition step
│   │   ├── DependencyGraph.tsx   # Collapsible SVG DAG rendering component
│   │   ├── DAGExplorer.tsx       # Full interactive SVG DAG canvas with pulsing attainable nodes
│   │   ├── AlgorithmTrace.tsx    # Kahn's algorithm step-by-step playback visualizer panel
│   │   └── NodeDetailSheet.tsx   # Custom absolute slide-up detail bottom sheet
│   └── hooks/
│       ├── useDocumentContext.ts # Context abstraction hook
│       ├── useLocation.ts        # expo-location GPS wrapper hook
│       ├── useDAGLayout.ts       # Topological depth coordinate offset computing hook
│       └── theme.ts              # Design tokens color, sizing, radii values
└── __tests__/
    ├── topologicalSort.test.ts   # Kahn's algorithm and step tracing unit tests
    └── bfsLocator.test.ts        # BFS nearest branch unit tests
```

---

## Algorithm Summary

### Topological Sort & Step-by-Step Trace
Calculates the optimal order in which a user must acquire documents. The application first performs a reverse BFS starting from the selected target document to isolate its ancestral prerequisite subgraph. It then filters out any documents the user already possesses. Kahn's Algorithm traverses the remaining subgraph by computing in-degrees and processing nodes with in-degree 0, returning a guaranteed-valid chronological checklist and identifying cycle anomalies. The visualizer records step states dynamically (`topologicalSortWithTrace`) for educational demonstration.

### Breadth-First Search (BFS)
Locates the geographically closest physical branch office for the government agencies involved in the roadmap. The locator identifies the coordinate-nearest branch to the user's current GPS position across a verified nationwide dataset of 114 branches (spanning Metro Manila, Luzon, Visayas, and Mindanao) to serve as the search origin. It then performs a queue-based BFS traversal across a Haversine-computed proximity graph to return the first office matching the required agency type. The "Get Directions" feature opens Google Maps with a named search query, with an automatic fallback to Apple Maps on iOS devices.

---

## Data Sources

The prerequisite relationships in the graph are modeled after official guidelines from the following agencies. The branch location dataset includes **114 verified offices** across all major regions of the Philippines (Metro Manila, Luzon, Visayas, and Mindanao), sourced from official government websites and verified third-party directories.

| Agency | Branches | Coverage |
|---|---|---|
| Department of Foreign Affairs (DFA) | 23 | Nationwide |
| National Bureau of Investigation (NBI) | 19 | Nationwide |
| Philippine Statistics Authority (PSA) | 12 | NCR + Major Cities |
| Land Transportation Office (LTO) | 9 | NCR + Major Cities |
| Commission on Elections (COMELEC) | 5 | NCR + Cebu + Davao |
| Philippine National ID System (PhilSys) | 6 | NCR + Major Cities |
| Professional Regulation Commission (PRC) | 6 | NCR + Major Cities |
| Social Security System (SSS) | 9 | Nationwide |
| Government Service Insurance System (GSIS) | 4 | NCR |
| Philippine Health Insurance Corp. (PhilHealth) | 4 | NCR |
| Pag-IBIG Fund (HDMF) | 6 | NCR + Cebu |
| Philippine Postal Corporation (PHLPost) | 6 | NCR + Major Cities |
| Bureau of Internal Revenue (BIR) | 5 | NCR |

---

## Standalone Compilation (EAS Build)

To package the standalone Android APK using Expo Application Services (EAS):
```bash
npx eas build:configure
npx eas build --platform android --profile preview
```

---

## Team Members and Roles

- **Liwanag, Mark Daniel L.** — Lead Developer: Algorithm Implementation & Core Logic
- **Evaristo, Yeshaya Gabriel I.** — Developer: UI Wiring, BFS Integration & HistoryScreen
- **Antolin, Anicah Kim R.** — QA & Testing: Unit Tests, Wireframes & Documentation
- **Boisilio, Jewelle Melody T.** — DevOps & Data: Branch Dataset, Persistence & Presentation

---

## Academic Context

Developed in fulfillment of course requirements for:
- **Course**: Design and Analysis of Algorithms (DAA)
- **Academic Program**: Bachelor of Science in Computer Science (BSCS 2-4)
- **Institution**: Polytechnic University of the Philippines, College of Computer and Information Sciences
- **Submitted To**: Prof. Ria Sagum
