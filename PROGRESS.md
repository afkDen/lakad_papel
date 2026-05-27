# PROGRESS.md
## LakadPapel — Build Progress Tracker

> This file is updated at the end of every completed build part.
> Format: check the box, fill the completion date, add any blockers or notes.

---

## Legend

- [ ] Not started
- [~] In progress
- [x] Complete

---

## Part 0 — Project Setup

| Task | Status | Completed | Notes |
|---|---|---|---|
| Expo project initialized with TypeScript template | [ ] | | |
| GitHub repository created and initial commit pushed | [ ] | | |
| NativeWind 4 installed and configured | [ ] | | |
| Expo Router configured, root `_layout.tsx` stub created (full implementation in Part 5) | [ ] | | |
| Inter font loaded via `expo-font` | [ ] | | |
| AsyncStorage installed | [ ] | | |
| expo-location installed | [ ] | | |
| react-native-svg installed | [ ] | | |
| Jest configured with `jest-expo` preset | [ ] | | |
| `tsconfig.json` path aliases configured (`@/` → `src/`, `@app/` → `app/`) | [ ] | | |
| `tailwind.config.js` configured for NativeWind | [ ] | | |
| `PROGRESS.md` initialized in repository root | [ ] | | |

**Part 0 Complete:** [ ] — Date: ___________

---

## Part 1 — Data Layer

| Task | Status | Completed | Notes |
|---|---|---|---|
| `src/context/types.ts` — all TypeScript interfaces defined | [ ] | | |
| `src/algorithms/requirementsGraph.ts` — foundation document nodes (PSA, Barangay) encoded | [ ] | | |
| `src/algorithms/requirementsGraph.ts` — primary ID nodes (Passport, Voter's ID, PhilSys, NBI) encoded | [ ] | | |
| `src/algorithms/requirementsGraph.ts` — secondary ID and license nodes (LTO, PRC, SSS, GSIS) encoded | [ ] | | |
| `src/algorithms/requirementsGraph.ts` — all 30+ nodes encoded and prerequisite edges verified | [ ] | | |
| Cycle detection test run on completed DAG — no cycles confirmed | [ ] | | |
| `src/data/agencyLocations.ts` — DFA and NBI Metro Manila branches encoded | [ ] | | |
| `src/data/agencyLocations.ts` — PSA, LTO, PhilSys branches encoded | [ ] | | |
| `src/data/agencyLocations.ts` — COMELEC, PRC, SSS, GSIS branches encoded | [ ] | | |
| All branch GPS coordinates cross-validated against Google Maps | [ ] | | |
| Data schema documentation written | [ ] | | |

**Part 1 Complete:** [ ] — Date: ___________

---

## Part 2 — Algorithm Implementation

| Task | Status | Completed | Notes |
|---|---|---|---|
| `src/algorithms/topologicalSort.ts` — `buildSubgraph()` implemented | [ ] | | |
| `src/algorithms/topologicalSort.ts` — `topologicalSort()` (Kahn's Algorithm) implemented | [ ] | | |
| `src/algorithms/topologicalSort.ts` — cycle detection implemented | [ ] | | |
| `src/algorithms/bfsLocator.ts` — `buildLocationGraph()` implemented | [ ] | | |
| `src/algorithms/bfsLocator.ts` — `bfsNearestBranch()` implemented | [ ] | | |
| `__tests__/topologicalSort.test.ts` — all document chain tests written | [ ] | | |
| `__tests__/topologicalSort.test.ts` — all tests passing | [ ] | | |
| `__tests__/bfsLocator.test.ts` — BFS accuracy and edge tests written | [ ] | | |
| `__tests__/bfsLocator.test.ts` — all tests passing | [ ] | | |
| Performance benchmark run: full pipeline < 10ms confirmed | [ ] | | |

**Part 2 Complete:** [ ] — Date: ___________

---

## Part 3 — State Layer

| Task | Status | Completed | Notes |
|---|---|---|---|
| `src/context/DocumentContext.tsx` — Context and Provider created | [ ] | | |
| `useReducer` set up with all action types defined | [ ] | | |
| `TOGGLE_DOCUMENT` action implemented | [ ] | | |
| `SET_TARGET` action implemented — triggers Topological Sort pipeline | [ ] | | |
| `MARK_DONE` action implemented — updates possessedDocuments + re-runs pipeline | [ ] | | |
| `ADD_TO_HISTORY` action implemented | [ ] | | |
| AsyncStorage read on mount (possessed-document set hydration) implemented | [ ] | | |
| AsyncStorage write on every `TOGGLE_DOCUMENT` and `MARK_DONE` implemented | [ ] | | |
| `src/hooks/useDocumentContext.ts` — typed hook implemented | [ ] | | |
| `src/hooks/useLocation.ts` — expo-location wrapper with permission flow implemented | [ ] | | |
| Offline persistence test: checklist survives app restart | [ ] | | |

**Part 3 Complete:** [ ] — Date: ___________

---

## Part 4 — Shared Components

| Task | Status | Completed | Notes |
|---|---|---|---|
| `src/components/CategoryHeader.tsx` built | [ ] | | |
| `src/components/DocumentCard.tsx` built | [ ] | | |
| `src/components/BranchCard.tsx` built | [ ] | | |
| `src/components/StepCard.tsx` built | [ ] | | |
| `src/components/DependencyGraph.tsx` — SVG node-link diagram built | [ ] | | |
| DependencyGraph — green node for possessed, teal for next attainable, grey for locked | [ ] | | |
| DependencyGraph — tapping node shows label tooltip | [ ] | | |
| All components render without warnings on Android and iOS | [ ] | | |

**Part 4 Complete:** [ ] — Date: ___________

---

## Part 5 — ChecklistScreen and TargetScreen

| Task | Status | Completed | Notes |
|---|---|---|---|
| `app/_layout.tsx` — fully implemented (DocumentProvider wrap, 4-tab navigator, tab bar styling) | [ ] | | |
| `app/index.tsx` — redirect to `/checklist` implemented | [ ] | | |
| `app/checklist.tsx` — document list renders all 30+ nodes grouped by category | [ ] | | |
| `app/checklist.tsx` — search bar filters list in real time | [ ] | | |
| `app/checklist.tsx` — checkbox toggle dispatches `TOGGLE_DOCUMENT` | [ ] | | |
| `app/checklist.tsx` — state restores from AsyncStorage on mount | [ ] | | |
| `app/checklist.tsx` — "What do I need?" button navigates to `/target` | [ ] | | |
| `app/target.tsx` — document list renders all non-possessed documents by category | [ ] | | |
| `app/target.tsx` — tapping document dispatches `SET_TARGET` and navigates to `/roadmap` | [ ] | | |
| Both screens tested on Android and iOS | [ ] | | |

**Part 5 Complete:** [ ] — Date: ___________

---

## Part 6 — RoadmapScreen and HistoryScreen

| Task | Status | Completed | Notes |
|---|---|---|---|
| `app/roadmap.tsx` — step list renders topologically sorted steps | [ ] | | |
| `app/roadmap.tsx` — step count header renders correctly | [ ] | | |
| `app/roadmap.tsx` — BranchCard renders with nearest branch data per step | [ ] | | |
| `app/roadmap.tsx` — "Get Directions" button opens native maps deep-link | [ ] | | |
| `app/roadmap.tsx` — "Mark as Done" dispatches `MARK_DONE` and updates list | [ ] | | |
| `app/roadmap.tsx` — DependencyGraph toggle expands/collapses correctly | [ ] | | |
| `app/roadmap.tsx` — empty state when no steps remain (all possessed) | [ ] | | |
| `app/history.tsx` — renders CompletedFlow list | [ ] | | |
| `app/history.tsx` — empty state renders correctly | [ ] | | |
| Both screens tested on Android and iOS | [ ] | | |

**Part 6 Complete:** [ ] — Date: ___________

---

## Part 7 — Integration Testing

| Task | Status | Completed | Notes |
|---|---|---|---|
| End-to-end flow tested: Passport (zero documents) | [ ] | | |
| End-to-end flow tested: NBI Clearance (zero documents) | [ ] | | |
| End-to-end flow tested: LTO Driver's License (zero documents) | [ ] | | |
| End-to-end flow tested: PhilSys National ID | [ ] | | |
| End-to-end flow tested: PRC Board Exam Application | [ ] | | |
| End-to-end flow tested: SSS ID | [ ] | | |
| End-to-end flow tested: 4 additional targets of team's choice | [ ] | | |
| Offline mode test: airplane mode enabled, checklist and roadmap confirmed working | [ ] | | |
| Offline mode test: "Get Directions" button hides when GPS unavailable | [ ] | | |
| Performance benchmark re-run: full pipeline < 10ms on low-end Android confirmed | [ ] | | |
| UI edge case: very long document label — no overflow or clipping | [ ] | | |
| UI edge case: single-step roadmap — renders correctly | [ ] | | |
| History log records completed flows correctly | [ ] | | |

**Part 7 Complete:** [ ] — Date: ___________

---

## Part 8 — Build, Documentation, and Submission

| Task | Status | Completed | Notes |
|---|---|---|---|
| `README.md` written — setup instructions, algorithm summary, team, data sources | [ ] | | |
| `app.json` metadata filled (name, slug, version, icon, splash) | [ ] | | |
| App icon asset created (1024x1024 PNG) | [ ] | | |
| Splash screen asset created | [ ] | | |
| Expo Go demo build tested on physical device | [ ] | | |
| Expo EAS standalone APK generated | [ ] | | |
| APK tested on physical Android device (not emulator) | [ ] | | |
| Final project proposal document cleaned and formatted | [ ] | | |
| Presentation slides completed | [ ] | | |
| GitHub repository — all commits pushed, README updated | [ ] | | |
| Project submitted to Prof. Ria Sagum | [ ] | | |

**Part 8 Complete:** [ ] — Date: ___________

---

## Overall Status

| Part | Description | Status | Completed |
|---|---|---|---|
| Part 0 | Project Setup | [ ] | |
| Part 1 | Data Layer | [ ] | |
| Part 2 | Algorithm Implementation | [ ] | |
| Part 3 | State Layer | [ ] | |
| Part 4 | Shared Components | [ ] | |
| Part 5 | ChecklistScreen and TargetScreen | [ ] | |
| Part 6 | RoadmapScreen and HistoryScreen | [ ] | |
| Part 7 | Integration Testing | [ ] | |
| Part 8 | Build, Documentation, and Submission | [ ] | |

---

## Blockers Log

> Document blockers and their resolutions here. One entry per blocker.

| Date | Blocker | Resolution | Resolved Date |
|---|---|---|---|
| | | | |

---

## Notes

> Free-form team notes, decisions made, and things to revisit.

- _Add notes here as the project progresses._
