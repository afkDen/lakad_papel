# LakadPapel — Philippine Government Document Navigator

LakadPapel is a React Native mobile application that guides Filipino citizens through the prerequisite chains and office locations required to acquire government documents.

## Core Functionality

LakadPapel resolves the fragmented and siloed document application process by modeling the entire ecosystem as a Directed Acyclic Graph (DAG). Users can personalize their roadmap by marking documents they already possess. The application then calculates a guaranteed-valid, ordered sequence of steps to acquire the target document and locates the geographically nearest agency branch offices from a verified nationwide dataset of **114 branches across 13 government agencies**. The entire system runs fully on-device and operates 100% offline.

## Technology Stack

| Layer | Technology | Reason |
|---|---|---|
| Framework | React Native via Expo SDK 56 | Cross-platform build target (Android/iOS) with rapid testing |
| Language | TypeScript | Type safety for DAG node manipulation and BFS graph traversals |
| Navigation | Expo Router | Modern file-based routing architecture |
| Styling | React Native StyleSheet + `src/theme.ts` | Centralized design tokens; native performance and stability |
| State | React Context + useReducer | Serializable and predictable central state management |
| Persistence | AsyncStorage | Persistent on-device key-value storage for possessed checklist |
| Location | expo-location | Unified native interface for GPS location permission and tracking |
| Graph Visuals | react-native-svg | Renders the prerequisite ancestor DAG as an interactive SVG |
| Testing | Jest | Complete unit testing for pure algorithms |

## Prerequisites

- **Node.js**: Version 18.x or 20.x LTS
- **npm**: Version 9+ (bundled with Node)
- **Expo Go App**: Latest version installed on a physical iOS or Android device
- **EAS CLI**: Optional (for standalone compilation)

## Setup and Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/lakadpapel.git
   cd lakadpapel
   ```

2. **Install dependencies:**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Start the development server:**
   ```bash
   npx expo start
   ```

4. **Run on physical device:**
   Scan the generated Metro QR code with the Expo Go app on your phone.

## Running Unit Tests

To run the complete suite of algorithm unit tests:
```bash
npm run test
```

## Folder Structure

```
lakadpapel/
├── app/                          # Expo Router screens (routing routes)
│   ├── _layout.tsx               # Root layout wrapping DocumentProvider
│   ├── index.tsx                 # Redirect entry point
│   ├── checklist.tsx             # ChecklistScreen (possessed documents checklist)
│   ├── target.tsx                # TargetScreen (target document selector)
│   ├── roadmap.tsx               # RoadmapScreen (ordered steps checklist and map)
│   └── history.tsx               # HistoryScreen (completion logs)
├── src/
│   ├── algorithms/
│   │   ├── requirementsGraph.ts  # DAG representing document node prereqs
│   │   ├── topologicalSort.ts    # Kahn's topological sort implementation
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
│   │   └── DependencyGraph.tsx   # SVG DAG rendering component
│   └── hooks/
│       ├── useDocumentContext.ts  # Context abstraction hook
│       └── useLocation.ts        # expo-location GPS wrapper hook
└── __tests__/
    ├── topologicalSort.test.ts   # Kahn's algorithm unit tests
    └── bfsLocator.test.ts        # BFS nearest branch unit tests
```

## Algorithm Summary

### Topological Sort (Kahn's Algorithm)
Calculates the optimal order in which a user must acquire documents. The application first performs a reverse BFS starting from the selected target document to isolate its ancestral prerequisite subgraph. It then filters out any documents the user already possesses. Kahn's Algorithm traverses the remaining subgraph by computing in-degrees and processing nodes with in-degree 0, returning a guaranteed-valid chronological checklist and identifying cycle anomalies.

### Breadth-First Search (BFS)
Locates the geographically closest physical branch office for the government agencies involved in the roadmap. The locator identifies the coordinate-nearest branch to the user's current GPS position across a verified nationwide dataset of 114 branches (spanning Metro Manila, Luzon, Visayas, and Mindanao) to serve as the search origin. It then performs a queue-based BFS traversal across a Haversine-computed proximity graph to return the first office matching the required agency type. The "Get Directions" feature opens Google Maps with a named search query, with an automatic fallback to Apple Maps on iOS devices.

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

## Standalone Compilation (EAS Build)

To package the standalone Android APK using Expo Application Services (EAS):
```bash
npx eas build:configure
npx eas build --platform android --profile preview
```

## Team Members and Roles

- **Liwanag, Mark Daniel L.** — Lead Developer: Algorithm Implementation & Core Logic
- **Evaristo, Yeshaya Gabriel I.** — Developer: UI Wiring, BFS Integration & HistoryScreen
- **Antolin, Anicah Kim R.** — QA & Testing: Unit Tests, Wireframes & Documentation
- **Boisilio, Jewelle Melody T.** — DevOps & Data: Branch Dataset, Persistence & Presentation

## Academic Context

Developed in fulfillment of course requirements for:
- **Course**: Design and Analysis of Algorithms (DAA)
- **Academic Program**: Bachelor of Science in Computer Science (BSCS 2-4)
- **Institution**: Polytechnic University of the Philippines, College of Computer and Information Sciences
- **Submitted To**: Prof. Ria Sagum
