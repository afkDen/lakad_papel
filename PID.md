# Project Initiation Document (PID)
## LakadPapel — Philippine Government Document Navigator

---

## 1. Project Identity

| Field | Detail |
|---|---|
| **Project Name** | LakadPapel |
| **Subtitle** | A Mobile App Guide for Navigating Philippine Government Document Requirements |
| **Project Type** | Academic — Design and Analysis of Algorithms (DAA) Capstone |
| **Institution** | Polytechnic University of the Philippines, College of Computer and Information Sciences |
| **Course** | Design and Analysis of Algorithms |
| **Section** | BSCS 2-4 |
| **Submitted To** | Prof. Ria Sagum |
| **Submission Date** | April 18, 2026 |
| **Target Delivery** | July 4, 2026 |

---

## 2. Project Team

| Name | Role |
|---|---|
| **Liwanag, Mark Daniel L.** | Lead Developer — Algorithm Implementation, Core Logic |
| **Evaristo, Yeshaya Gabriel I.** | Developer — UI Wiring, BFS Integration, HistoryScreen |
| **Antolin, Anicah Kim R.** | QA / Testing — Unit Tests, Wireframes, Documentation |
| **Boisilio, Jewelle Melody T.** | DevOps / Data — Branch Dataset, Persistence, Presentation |

---

## 3. Problem Statement

Filipino citizens, particularly first-time applicants and young adults, have no single resource that maps the full prerequisite chain for government documents. Agency websites are siloed. No tool tells a citizen: "Given the documents you already have, here is the exact sequence of steps and offices you must visit to get the document you need."

The result is wasted trips, multi-hour queues, and counter-rejections for missing prerequisites. The average Filipino spends 4 to 6 hours per government transaction, a figure that climbs significantly when prerequisite gaps force return visits.

---

## 4. Proposed Solution

LakadPapel models the Philippine government document ecosystem as a **Directed Acyclic Graph (DAG)** and resolves it algorithmically.

- **Topological Sort (Kahn's Algorithm)** — resolves the prerequisite chain for any target document, given the user's current document holdings, producing a guaranteed-valid, ordered acquisition sequence.
- **Breadth-First Search (BFS)** — radiates from the user's GPS coordinates across a graph of known agency branch locations to identify the nearest branch for each required office visit.

Both algorithms operate under the **Decrease and Conquer** paradigm and run entirely on-device with no server dependency.

---

## 5. Project Objectives

### 5.1 General Objective

Design and develop LakadPapel: a mobile application that algorithmically resolves Philippine government document prerequisite chains using Topological Sort and locates the nearest agency branches using BFS, giving citizens a clear, personalized, step-by-step acquisition roadmap.

### 5.2 Specific Objectives

1. Model the Philippine document prerequisite system as a DAG with 30+ document nodes, encoded in `requirementsGraph.ts` based on official agency sources.
2. Implement Kahn's Algorithm that processes the DAG, strips already-possessed nodes, and outputs a valid ordered acquisition sequence for any target document.
3. Implement BFS that traverses a graph of agency branch locations from the user's GPS coordinates to return the nearest branch for each required step.
4. Build a React Native (Expo) mobile application presenting the roadmap as an interactive checklist with branch info and GPS deep-links.
5. Implement offline-capable, persistent document checklist storage via `AsyncStorage`.
6. Validate Topological Sort correctness through Jest unit tests across all valid possessed-document combinations.

---

## 6. Scope

### In Scope

- Prerequisite DAG covering 30+ Philippine government documents: Passport, NBI Clearance, PSA documents, PhilSys National ID, Voter's ID, LTO Driver's License, PRC License, SSS ID, GSIS eCard, Barangay documents.
- Topological Sort engine personalized to the user's possessed-document set.
- BFS-based nearest branch locator for Metro Manila branches of DFA, NBI, PSA, LTO, PhilSys, PRC, COMELEC, SSS, and GSIS.
- Persistent on-device checklist via AsyncStorage.
- Interactive roadmap with step completion tracking and GPS deep-links.
- Document Dependency Visualizer: live, color-coded node-link diagram of the prerequisite subgraph.
- Android and iOS compatibility from a single Expo codebase.
- Offline-capable core functionality (prerequisite resolution and checklist work without internet).

### Out of Scope

- Real-time appointment booking or e-government portal integration.
- Live requirement updates between app releases.
- Nationwide branch coverage (initial version: Metro Manila + selected major cities).
- Government form translation, filling, or processing.
- User accounts or cloud backup.
- Real-time traffic or transit routing for BFS.

---

## 7. Technology Stack

| Component | Technology |
|---|---|
| **Platform** | React Native — Expo SDK 51+ |
| **Language** | TypeScript (ES6+) |
| **Navigation** | Expo Router (file-based) |
| **UI Styling** | NativeWind 4 (Tailwind utilities for React Native) |
| **Location** | expo-location |
| **State Management** | React Context + useReducer |
| **Persistence** | @react-native-async-storage/async-storage |
| **Algorithm Modules** | Pure TypeScript — requirementsGraph.ts, topologicalSort.ts, bfsLocator.ts |
| **Testing** | Jest + React Native Testing Library |
| **Build/Distribution** | Expo Go (demo), Expo EAS Build (standalone APK/IPA) |
| **Version Control** | Git / GitHub |

---

## 8. System Architecture Summary

LakadPapel is a **three-layer, server-free mobile application**:

```
Algorithm Layer        State Layer            Screen Layer
─────────────────      ─────────────────      ─────────────────
requirementsGraph.ts   DocumentContext        ChecklistScreen
topologicalSort.ts  →  useReducer         →   TargetScreen
bfsLocator.ts          AsyncStorage           RoadmapScreen
                                              HistoryScreen
```

All computation runs on-device. No backend. No network dependency for core features.

---

## 9. Key Algorithms

### Topological Sort — Kahn's Algorithm
- **Input:** DAG G = (V, E), user's possessed-document set, selected target document T
- **Process:** `buildSubgraph()` extracts ancestor subgraph of T, removes possessed nodes; Kahn's Algorithm produces the ordered acquisition sequence
- **Output:** Valid ordered list of documents the user must still obtain
- **Complexity:** O(V + E) time, O(V) space

### Breadth-First Search — Nearest Branch
- **Input:** User GPS coordinates, required agency type, branch location graph H = (V', E')
- **Process:** BFS radiates from the GPS-nearest node; first match of required agencyType is returned
- **Output:** Nearest branch address, operating hours, GPS coordinates for deep-link
- **Complexity:** O(V' + E') time, O(V') space

---

## 10. Data Sources

All prerequisite edges in `requirementsGraph.ts` are verified against:
- DFA official site (dfa.gov.ph)
- NBI clearance portal (clearance.nbi.gov.ph)
- PSA civil registry (psa.gov.ph)
- PhilSys registration (philsys.gov.ph)
- LTO frontline services (lto.gov.ph)
- COMELEC voter registration (comelec.gov.ph)
- PRC licensure (prc.gov.ph)
- SSS member registration (sss.gov.ph)
- GSIS (gsis.gov.ph)

Where sources conflict, the more restrictive requirement is encoded. No personally identifiable user data is collected, stored, or transmitted.

---

## 11. Project Timeline

| Week | Dates | Milestone |
|---|---|---|
| 1 | May 5–9 | DAG authoring — encode 30+ document nodes in `requirementsGraph.ts` |
| 2 | May 12–16 | Complete DAG for all agencies; draft `agencyLocations.ts` for Metro Manila |
| 3 | May 19–23 | Wireframe all 4 screens; finalize Context API and AsyncStorage schema |
| 4 | May 26–30 | Implement `topologicalSort.ts`; write Jest unit tests for all chains |
| 5 | Jun 2–6 | Implement `bfsLocator.ts`; integrate expo-location GPS |
| 6 | Jun 9–13 | Build ChecklistScreen and TargetScreen; connect DocumentContext |
| 7 | Jun 16–20 | Build RoadmapScreen + Dependency Visualizer; build HistoryScreen |
| 8 | Jun 23–27 | Integration testing; offline tests; performance benchmarking |
| 9 | Jun 30–Jul 4 | Expo Go demo build; EAS APK; final documentation; submission |

---

## 12. Success Criteria

| Criterion | Measure |
|---|---|
| Algorithm correctness | Topological Sort passes Jest tests for all 30+ document chains without invalid ordering |
| BFS accuracy | Nearest branch returned matches or beats manual lookup within 2 hops |
| Performance | Full pipeline completes in under 10ms on any Android device |
| Persistence | Possessed-document checklist survives app restart correctly |
| Offline function | Prerequisite resolution and checklist work with airplane mode enabled |
| Platform coverage | App runs without crashes on Android 12+ and iOS 15+ via Expo Go |

---

## 13. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Government agency changes requirements mid-project | Medium | High | Encode the more restrictive version; add a "last verified" date field per node |
| Branch GPS coordinates are stale or wrong | Medium | Medium | Cross-validate each entry across Google Maps, OpenStreetMap, and official pages |
| Expo SDK breaking change | Low | High | Pin Expo SDK version; test against pinned version throughout |
| Device GPS unavailable | Medium | Medium | Fall back to text-search branch lookup if GPS permission denied |
| Prerequisite DAG contains an accidental cycle | Low | High | Enforce acyclicity check on `requirementsGraph.ts` at load time with a cycle-detection test |

---

## 14. References

- Kahn, A. B. (1962). Topological sorting of large networks. *Communications of the ACM, 5*(11), 558–562.
- Cormen, T. H., Leiserson, C. E., Rivest, R. L., & Stein, C. (2022). *Introduction to Algorithms* (4th ed.). MIT Press.
- Kleinberg, J., & Tardos, E. (2006). *Algorithm Design*. Pearson Addison-Wesley.
- Expo Documentation (2024). https://docs.expo.dev
- @react-native-async-storage/async-storage (2024). https://react-native-async-storage.github.io
