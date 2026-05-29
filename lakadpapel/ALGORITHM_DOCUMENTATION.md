# LakadPapel — Algorithm Documentation

This document explains the mathematical foundations, implementations, code locations, and integration points of the key algorithms that drive the LakadPapel application.

---

## 1. Topological Sorting & Kahn's Algorithm

### Context & Purpose
In Philippine bureaucracy, documents have strict prerequisite dependencies. For example, to get a **Regular Passport**, you must first possess a **PSA Birth Certificate** and a **Voter's Certification**. 

This relationship forms a **Directed Acyclic Graph (DAG)**. To present a step-by-step roadmap to the user, we must resolve this graph into a linear sequence of actions. We use **Kahn's Algorithm** to compute this topological ordering.

### Code Location
* **Algorithm Definition**: [topologicalSort.ts](file:///c:/Users/Darleen%20LIWANAG/Documents/DAA2/lakadpapel/src/algorithms/topologicalSort.ts#L46-L173)
* **Visual Graph Rendering**: [DAGExplorer.tsx](file:///c:/Users/Darleen%20LIWANAG/Documents/DAA2/lakadpapel/src/components/DAGExplorer.tsx)
* **Educational Trace Walk**: [AlgorithmTrace.tsx](file:///c:/Users/Darleen%20LIWANAG/Documents/DAA2/lakadpapel/src/components/AlgorithmTrace.tsx)

### Application in the UI
1. **Roadmap Generation** (`app/roadmap.tsx`):
   When the user picks a target document, `topologicalSort()` is executed on the filtered requirements subgraph to determine the chronological step ordering (Step 1, Step 2, etc.) displayed in the milestone timeline.
2. **DAA Trace Board** (`src/components/AlgorithmTrace.tsx`):
   In *Advanced Mode*, the application runs `topologicalSortWithTrace()`. This specialized method records the exact state of the zero-in-degree queue and in-degree decrements at every single algorithmic loop. The roadmap screen displays this step-by-step to explain how the DAA sorting operates behind the scenes in real time.

### Complexity
* **Time Complexity**: $\mathcal{O}(V + E)$, where $V$ is the number of document requirements in the subgraph, and $E$ is the number of prerequisite edges. This guarantees sub-millisecond execution times on mobile processors.
* **Space Complexity**: $\mathcal{O}(V + E)$ to build the in-memory adjacency list and track in-degrees.

---

## 2. Reverse BFS Subgraph Pruning

### Context & Purpose
If a user wants to obtain a **PRC License**, they technically need 7 ancestral documents. However, if the user already possesses a **PSA Birth Certificate** and an **NBI Clearance**, those nodes and their prior dependencies must be omitted from the computed path.

To do this, we perform a **Reverse Breadth-First Search (BFS)** starting from the target document, traversing backward along prerequisite edges, and pruning any branches that are already marked as possessed.

### Code Location
* **Algorithm Definition**: [topologicalSort.ts](file:///c:/Users/Darleen%20LIWANAG/Documents/DAA2/lakadpapel/src/algorithms/topologicalSort.ts#L3-L44)

### Application in the UI
* **Roadmap Calculations** (`src/context/DocumentContext.tsx`):
  Inside `generateRoadmap()`, before running Kahn's algorithm, `buildSubgraph()` is called. This guarantees that only the unowned prerequisites are passed to the visual dependency charts, keeping the interface uncluttered and personalized to the user's specific progress.

### Complexity
* **Time Complexity**: $\mathcal{O}(V + E)$ traversal space.
* **Space Complexity**: $\mathcal{O}(V)$ to store visited state.

---

## 3. Proximity-Based BFS Agency Locator

### Context & Purpose
Once the linear sequence of required documents is computed, the app must tell the user **where** to go to get each one. 

While simple approaches just search for the closest branch of a given agency, LakadPapel uses a more sophisticated network routing technique. It views all 114 government branches nationwide as a physical proximity network. Branches are connected by a logical "transit edge" if they are within **5 kilometers** of each other.

To find an agency branch, the locator:
1. Identifies the absolute closest government office to the user (the origin node, regardless of agency type).
2. Spreads outward via **Breadth-First Search (BFS)** across the proximity network until it hits a branch matching the target agency.

This model mimics real-world trip chaining, guiding users to multi-agency government hubs (like Robinsons Lingkod Pinoy or SM Aura) where they can complete multiple tasks in a single trip.

### Code Location
* **Algorithm Definition**: [bfsLocator.ts](file:///c:/Users/Darleen%20LIWANAG/Documents/DAA2/lakadpapel/src/algorithms/bfsLocator.ts#L31-L86)
* **Distance Equations**: [bfsLocator.ts](file:///c:/Users/Darleen%20LIWANAG/Documents/DAA2/lakadpapel/src/algorithms/bfsLocator.ts#L4-L16)
* **Adjacency Proximity Builder**: [agencyLocations.ts](file:///c:/Users/Darleen%20LIWANAG/Documents/DAA2/lakadpapel/src/data/agencyLocations.ts)

### Application in the UI
* **Step Routing** (`app/roadmap.tsx` & `src/components/BranchCard.tsx`):
  For each step in the roadmap, `bfsNearestBranch()` computes the ideal office location. The result is passed to `BranchCard`, which renders the branch name, verified hours of operation, precise address, and coordinates for GPS navigation.

### Complexity
* **Time Complexity**: 
  * Proximity graph construction: $\mathcal{O}(N^2)$ where $N = 114$ branches. This is computed **once** at module load and cached.
  * BFS Routing Search: $\mathcal{O}(V_L + E_L)$ where $V_L$ is the number of branch nodes (114) and $E_L$ is the proximity edges.
* **Space Complexity**: $\mathcal{O}(V_L + E_L)$ to maintain the spatial adjacency matrix in memory.

---

## 4. The Haversine Spherical Distance Equation

### Context & Purpose
Because the Earth is an oblate spheroid, simple flat-plane Pythagorean geometry fails to calculate coordinates accurately over long distances. We use the **Haversine formula** to measure the great-circle distance between coordinates (Latitude/Longitude) on the Earth's surface.

### Mathematical Formulation
Given two points $(\phi_1, \lambda_1)$ and $(\phi_2, \lambda_2)$ in radians:

$$d = 2r \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta\phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta\lambda}{2}\right)}\right)$$

Where:
* $r$ is the Earth's mean radius ($6,371 \text{ km}$)
* $\Delta\phi = \phi_2 - \phi_1$ (difference in latitude)
* $\Delta\lambda = \lambda_2 - \lambda_1$ (difference in longitude)

### Code Location
* **Equation Implementation**: [bfsLocator.ts](file:///c:/Users/Darleen%20LIWANAG/Documents/DAA2/lakadpapel/src/algorithms/bfsLocator.ts#L4-L16)

### Application in the UI
* Used directly by the proximity builder to construct logical connections between branches, and by the step cards to display distances.
