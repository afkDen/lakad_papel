# Pseudocode of LakadPapel

This document outlines the high-level logic, state transitions, and core algorithmic procedures that power the offline-first LakadPapel application.

---

## 1. Main Application Lifecycle & Core Router

```text
PROCEDURE MainApplicationStart()
    // 1. Initialize global providers in order
    INITIALIZE ErrorBoundary
    INITIALIZE LanguageProvider
    INITIALIZE ThemeProvider
    INITIALIZE DocumentProvider
    
    // 2. Load stored system configurations asynchronously
    AppLanguage <- LOAD_FROM_ASYNC_STORAGE("@lakadpapel/language") OR "en"
    ThemeMode   <- LOAD_FROM_ASYNC_STORAGE("@lakadpapel/theme") OR "light"
    UserMode    <- LOAD_FROM_ASYNC_STORAGE("@lakadpapel/user_mode") OR "simple"
    
    // 3. Hydrate state in DocumentProvider
    PossessedIDs <- LOAD_FROM_ASYNC_STORAGE("@lakadpapel/possessed_documents") OR []
    FlowHistory  <- LOAD_FROM_ASYNC_STORAGE("@lakadpapel/history") OR []
    
    DISPATCH HYDRATE(PossessedIDs, FlowHistory, UserMode)
    
    // 4. Start GPS monitoring
    START_GPS_LISTENER()
    
    // 5. Route to primary tab
    REDIRECT_TO("/checklist")
END PROCEDURE

PROCEDURE START_GPS_LISTENER()
    IF HAS_LOCATION_PERMISSION() THEN
        START_WATCHING_GEOLOCATION(callback = ON_GPS_COORDINATES_RESOLVED)
    END IF
END PROCEDURE

PROCEDURE ON_GPS_COORDINATES_RESOLVED(Latitude, Longitude)
    // Cache location globally
    GLOBAL_LAST_KNOWN_LOCATION <- { lat: Latitude, lon: Longitude }
    
    // Reactive update: if there is an active target, rebuild branch proximity
    IF GLOBAL_APP_STATE.targetDocument IS NOT NULL THEN
        DISPATCH SET_TARGET(GLOBAL_APP_STATE.targetDocument)
    END IF
END PROCEDURE
```

---

## 2. Core State Reducer (`AppReducer`)

Handles all state mutations, maintaining state invariants.

```text
FUNCTION AppReducer(CurrentState, Action)
    SWITCH Action.type:
        
        CASE "HYDRATE":
            RETURN CurrentState WITH {
                possessedDocuments: Action.payload.possessedDocuments,
                history: Action.payload.history,
                userMode: Action.payload.userMode
            }
            
        CASE "TOGGLE_DOCUMENT":
            TargetID <- Action.payload
            NewPossessed <- COPY_SET(CurrentState.possessedDocuments)
            
            IF NewPossessed CONTAINS TargetID THEN
                REMOVE TargetID FROM NewPossessed
            ELSE
                ADD TargetID TO NewPossessed
            END IF
            
            // Invariant: Changing possessed documents invalidates active roadmap
            RETURN CurrentState WITH {
                possessedDocuments: NewPossessed,
                targetDocument: NULL,
                roadmap: []
            }
            
        CASE "SET_TARGET":
            TargetID <- Action.payload
            
            // Re-generate roadmap steps based on current possession and location
            ComputedRoadmap <- GenerateRoadmapSteps(CurrentState.possessedDocuments, TargetID)
            
            RETURN CurrentState WITH {
                targetDocument: TargetID,
                roadmap: ComputedRoadmap
            }
            
        CASE "MARK_DONE":
            DocumentID <- Action.payload
            UpdatedRoadmap <- []
            
            // Mark step as completed
            FOR EACH Step IN CurrentState.roadmap DO
                IF Step.document.id == DocumentID THEN
                    Step.isDone <- TRUE
                END IF
                APPEND Step TO UpdatedRoadmap
            END FOR
            
            // Check if all steps in the roadmap are completed
            AllStepsFinished <- TRUE
            FOR EACH Step IN UpdatedRoadmap DO
                IF Step.isDone == FALSE THEN
                    AllStepsFinished <- FALSE
                END IF
            END FOR
            
            NewPossessed <- COPY_SET(CurrentState.possessedDocuments)
            ADD DocumentID TO NewPossessed
            
            NewHistory <- CurrentState.history
            IF AllStepsFinished == TRUE THEN
                // Record completed journey in history log
                NewJourney <- CREATE_COMPLETED_JOURNEY_RECORD(CurrentState.targetDocument, UpdatedRoadmap)
                APPEND NewJourney TO NewHistory
                
                // Clear active target
                RETURN CurrentState WITH {
                    possessedDocuments: NewPossessed,
                    targetDocument: NULL,
                    roadmap: [],
                    history: NewHistory
                }
            END IF
            
            RETURN CurrentState WITH {
                possessedDocuments: NewPossessed,
                roadmap: UpdatedRoadmap
            }
            
        CASE "TOGGLE_USER_MODE":
            NewMode <- (CurrentState.userMode == "simple") ? "advanced" : "simple"
            RETURN CurrentState WITH { userMode: NewMode }
            
    END SWITCH
END FUNCTION
```

---

## 3. Prerequisite Subgraph Extraction (Reverse BFS)

Builds a pruned sub-graph centered around the `Target` node, ignoring prerequisites that are already possessed by the user.

```text
FUNCTION BuildSubgraph(Graph, PossessedSet, TargetID)
    // If user already has the target, no steps are required
    IF PossessedSet CONTAINS TargetID THEN
        RETURN EMPTY_MAP
    END IF
    
    Subgraph <- EMPTY_MAP
    Visited  <- EMPTY_SET
    Queue    <- EMPTY_QUEUE
    
    ENQUEUE TargetID INTO Queue
    ADD TargetID TO Visited
    
    WHILE Queue IS NOT EMPTY DO
        CurrentID <- DEQUEUE Queue
        Node      <- Graph[CurrentID]
        
        IF Node IS NULL THEN
            CONTINUE
        END IF
        
        // Deep copy the node to avoid mutating the master graph definitions
        CopiedNode <- COPY_NODE(Node)
        Subgraph[CurrentID] <- CopiedNode
        
        FOR EACH PrereqID IN Node.prerequisites DO
            // Skip branches that the user already has
            IF PossessedSet CONTAINS PrereqID THEN
                CONTINUE
            END IF
            
            IF PrereqID NOT IN Visited THEN
                ADD PrereqID TO Visited
                ENQUEUE PrereqID INTO Queue
            END IF
        END FOR
    END WHILE
    
    // Pruning phase: Filter out dependencies that point to nodes outside our subgraph
    FOR EACH NodeID IN Subgraph DO
        OriginalPrereqs <- Subgraph[NodeID].prerequisites
        PrunedPrereqs <- FILTER(OriginalPrereqs, lambda id: Subgraph CONTAINS id)
        Subgraph[NodeID].prerequisites <- PrunedPrereqs
    END FOR
    
    RETURN Subgraph
END FUNCTION
```

---

## 4. Kahn's Topological Sort (With Detailed Execution Tracking)

Generates a valid timeline sequencing steps chronologically without violating prerequisite constraints.

```text
FUNCTION TopologicalSortWithTrace(Subgraph)
    InDegree <- EMPTY_MAP
    AdjacencyList <- EMPTY_MAP
    
    // 1. Initialize structures
    FOR EACH NodeID IN Subgraph DO
        InDegree[NodeID] <- 0
        AdjacencyList[NodeID] <- []
    END FOR
    
    // 2. Populate dependencies and calculate in-degree (number of immediate parents)
    FOR EACH NodeID IN Subgraph DO
        FOR EACH PrereqID IN Subgraph[NodeID].prerequisites DO
            IF Subgraph CONTAINS PrereqID THEN
                // Add an edge from Prereq -> NodeID
                APPEND NodeID TO AdjacencyList[PrereqID]
                InDegree[NodeID] <- InDegree[NodeID] + 1
            END IF
        END FOR
    END FOR
    
    // 3. Queue up all entry points (nodes with in-degree = 0)
    Queue <- EMPTY_QUEUE
    SortedKeys <- SORT_ALPHABETICALLY(KEYS(Subgraph))
    FOR EACH NodeID IN SortedKeys DO
        IF InDegree[NodeID] == 0 THEN
            ENQUEUE NodeID INTO Queue
        END IF
    END FOR
    
    OrderList  <- EMPTY_LIST
    TraceSteps <- EMPTY_LIST
    StepIndex  <- 1
    
    // 4. Process Kahn's Queue
    WHILE Queue IS NOT EMPTY DO
        QueueBefore <- COPY_LIST(Queue)
        CurrentID   <- DEQUEUE Queue
        APPEND CurrentID TO OrderList
        
        Decrements <- EMPTY_LIST
        
        // Relieve dependencies of all outgoing edges
        Neighbors <- AdjacencyList[CurrentID] OR []
        FOR EACH NeighborID IN Neighbors DO
            OldVal <- InDegree[NeighborID]
            InDegree[NeighborID] <- InDegree[NeighborID] - 1
            NewVal <- InDegree[NeighborID]
            
            APPEND { node: NeighborID, from: OldVal, to: NewVal } TO Decrements
            
            // If all prerequisites are resolved, push to the queue
            IF InDegree[NeighborID] == 0 THEN
                ENQUEUE NeighborID INTO Queue
            END IF
        END FOR
        
        QueueAfter <- COPY_LIST(Queue)
        
        // Log trace for visual DAA debugging walkthroughs in Advanced Mode
        APPEND {
            step: StepIndex,
            dequeued: CurrentID,
            queueBefore: QueueBefore,
            queueAfter: QueueAfter,
            inDegreeChanges: Decrements
        } TO TraceSteps
        
        StepIndex <- StepIndex + 1
    END WHILE
    
    // Cycle checking: If order length doesn't equal subgraph size, a prerequisite loop exists
    IF LENGTH(OrderList) != SIZE(Subgraph) THEN
        RAISE ERROR "Cycle detected in prerequisite graph"
    END IF
    
    RETURN { order: OrderList, trace: TraceSteps }
END FUNCTION
```

---

## 5. Haversine Spatial Distance Helper

Computes physical kilometers between two pairs of coordinate inputs.

```text
FUNCTION HaversineKm(Lat1, Lon1, Lat2, Lon2)
    EarthRadius <- 6371.0 // Radius in kilometers
    
    RadLat1 <- Lat1 * (PI / 180.0)
    RadLat2 <- Lat2 * (PI / 180.0)
    DeltaLat <- (Lat2 - Lat1) * (PI / 180.0)
    DeltaLon <- (Lon2 - Lon1) * (PI / 180.0)
    
    A <- SIN(DeltaLat / 2.0)^2 + 
         COS(RadLat1) * COS(RadLat2) * SIN(DeltaLon / 2.0)^2
         
    C <- 2.0 * ATAN2(SQRT(A), SQRT(1.0 - A))
    
    DistanceInKm <- EarthRadius * C
    RETURN DistanceInKm
END FUNCTION
```

---

## 6. Proximity-Based BFS Agency Branch Routing

Calculates which verified office location is closest and most accessible to the user using spatial search traversal.

```text
FUNCTION BFSNearestBranch(UserLat, UserLon, TargetAgency, LocationGraph)
    // Barangay halls and schools are local; handled with UI warnings
    IF TargetAgency == "BARANGAY" OR TargetAgency == "SCHOOL" THEN
        RETURN NULL
    END IF
    
    Branches  <- LocationGraph.branches
    Adjacency <- LocationGraph.adjacency
    
    IF LENGTH(Branches) == 0 THEN
        RETURN NULL
    END IF
    
    // 1. Find the starting branch (closest physical office regardless of agency)
    OriginBranch <- NULL
    MinDistance  <- INFINITY
    
    FOR EACH Branch IN Branches DO
        Distance <- HaversineKm(UserLat, UserLon, Branch.latitude, Branch.longitude)
        IF Distance < MinDistance THEN
            MinDistance  <- Distance
            OriginBranch <- Branch
        END IF
    END FOR
    
    IF OriginBranch IS NULL THEN
        RETURN NULL
    END IF
    
    // 2. Perform BFS traversal on proximity network starting from closest branch
    Visited <- EMPTY_SET
    Queue   <- EMPTY_QUEUE
    
    ENQUEUE OriginBranch.id INTO Queue
    ADD OriginBranch.id TO Visited
    
    WHILE Queue IS NOT EMPTY DO
        CurrentID     <- DEQUEUE Queue
        CurrentBranch <- FIND_BRANCH_BY_ID(Branches, CurrentID)
        
        IF CurrentBranch IS NULL THEN
            CONTINUE
        END IF
        
        // If we found a branch matching the target agency, return it immediately
        IF CurrentBranch.agency == TargetAgency THEN
            RETURN CurrentBranch
        END IF
        
        // Otherwise, traverse physical neighboring branches (within 5km proximity)
        Neighbors <- Adjacency[CurrentID] OR []
        FOR EACH NeighborID IN Neighbors DO
            IF NeighborID NOT IN Visited THEN
                ADD NeighborID TO Visited
                ENQUEUE NeighborID INTO Queue
            END IF
        END FOR
    END WHILE
    
    RETURN NULL
END FUNCTION
```
