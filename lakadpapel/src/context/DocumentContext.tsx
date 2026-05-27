import React, { createContext, useReducer, useEffect, useState, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppAction, CompletedFlow, DocumentId, RoadmapStep } from './types';
import { REQUIREMENTS_GRAPH } from '../algorithms/requirementsGraph';
import { AGENCY_BRANCHES } from '../data/agencyLocations';
import { buildLocationGraph, bfsNearestBranch } from '../algorithms/bfsLocator';
import { buildSubgraph, topologicalSort } from '../algorithms/topologicalSort';

// Module level location graph caching
const locationGraph = buildLocationGraph(AGENCY_BRANCHES, 5);

// Module level global location cache to keep reducer schema strictly compliant
let lastKnownLocation: { latitude: number; longitude: number } | null = null;

export function setLastKnownLocation(lat: number, lng: number) {
  lastKnownLocation = { latitude: lat, longitude: lng };
}

export function getLastKnownLocation() {
  return lastKnownLocation;
}

const initialState: AppState = {
  possessedDocuments: new Set<DocumentId>(),
  targetDocument: null,
  roadmap: [],
  history: [],
  userMode: 'simple',
};

function generateRoadmap(
  possessed: Set<DocumentId>,
  target: DocumentId | null
): RoadmapStep[] {
  if (!target || possessed.has(target)) {
    return [];
  }

  try {
    const subgraph = buildSubgraph(REQUIREMENTS_GRAPH, possessed, target);
    const sortedIds = topologicalSort(subgraph);

    const lat = lastKnownLocation?.latitude ?? 14.5841; // Default to SM Megamall coords
    const lon = lastKnownLocation?.longitude ?? 121.0573;

    return sortedIds.map((id) => {
      const node = REQUIREMENTS_GRAPH[id];
      const nearestBranch = bfsNearestBranch(lat, lon, node.agency, locationGraph);
      return {
        document: node,
        nearestBranch,
        isDone: false,
      };
    });
  } catch (err) {
    console.error('Error generating roadmap:', err);
    return [];
  }
}

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'HYDRATE': {
      const possessedSet = new Set<DocumentId>(action.payload.possessedDocuments);
      const history = action.payload.history;
      const userMode = action.payload.userMode ?? 'simple';
      // Regenerate roadmap if target is set
      const roadmap = generateRoadmap(possessedSet, state.targetDocument);
      return {
        ...state,
        possessedDocuments: possessedSet,
        history,
        roadmap,
        userMode,
      };
    }

    case 'TOGGLE_DOCUMENT': {
      const newPossessed = new Set<DocumentId>(state.possessedDocuments);
      if (newPossessed.has(action.payload)) {
        newPossessed.delete(action.payload);
      } else {
        newPossessed.add(action.payload);
      }

      // Toggling documents clears the active target and roadmap as specified
      return {
        ...state,
        possessedDocuments: newPossessed,
        targetDocument: null,
        roadmap: [],
      };
    }

    case 'SET_TARGET': {
      const roadmap = generateRoadmap(state.possessedDocuments, action.payload);
      return {
        ...state,
        targetDocument: action.payload,
        roadmap,
      };
    }

    case 'MARK_DONE': {
      const newPossessed = new Set<DocumentId>(state.possessedDocuments);
      newPossessed.add(action.payload);

      // Regenerate roadmap
      let regeneratedRoadmap = generateRoadmap(newPossessed, state.targetDocument);

      let updatedHistory = [...state.history];
      let updatedTargetDocument = state.targetDocument;
      let updatedRoadmap = regeneratedRoadmap;

      // If roadmap becomes empty after regeneration, dispatch / trigger history record
      if (regeneratedRoadmap.length === 0 && state.targetDocument) {
        // Calculate step count from current roadmap length
        const stepCount = state.roadmap.length;
        const completedFlow: CompletedFlow = {
          targetDocumentId: state.targetDocument,
          completedAt: new Date().toISOString(),
          stepCount: stepCount,
        };
        updatedHistory.push(completedFlow);
        updatedTargetDocument = null;
        updatedRoadmap = [];
      }

      return {
        ...state,
        possessedDocuments: newPossessed,
        targetDocument: updatedTargetDocument,
        roadmap: updatedRoadmap,
        history: updatedHistory,
      };
    }

    case 'ADD_TO_HISTORY': {
      return {
        ...state,
        history: [...state.history, action.payload],
      };
    }

    case 'TOGGLE_USER_MODE': {
      return {
        ...state,
        userMode: state.userMode === 'simple' ? 'advanced' : 'simple',
      };
    }

    default:
      if (__DEV__) throw new Error(
        `Unhandled action: ${(action as any).type}`
      );
      return state;
  }
}

export interface DocumentContextProps {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

export const DocumentContext = createContext<DocumentContextProps | undefined>(undefined);

export function DocumentProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [isHydrated, setIsHydrated] = useState(false);

  // AsyncStorage Hydration
  useEffect(() => {
    let isMounted = true;
    async function hydrate() {
      try {
        let possessedDocuments: DocumentId[] = [];
        try {
          const possessedJson = await AsyncStorage.getItem('@lakadpapel/possessed_documents');
          possessedDocuments = possessedJson ? JSON.parse(possessedJson) : [];
        } catch {
          possessedDocuments = [];
        }

        let history: CompletedFlow[] = [];
        try {
          const historyJson = await AsyncStorage.getItem('@lakadpapel/history');
          history = historyJson ? JSON.parse(historyJson) : [];
        } catch {
          history = [];
        }

        let userMode: 'simple' | 'advanced' = 'simple';
        try {
          const userModeVal = await AsyncStorage.getItem('@lakadpapel/user_mode');
          userMode = (userModeVal === 'advanced') ? 'advanced' : 'simple';
        } catch {
          userMode = 'simple';
        }

        if (isMounted) {
          dispatch({
            type: 'HYDRATE',
            payload: { possessedDocuments, history, userMode },
          });
        }
      } catch (err) {
        console.error('Failed to load state from AsyncStorage:', err);
      } finally {
        if (isMounted) {
          setIsHydrated(true);
        }
      }
    }
    hydrate();
    return () => {
      isMounted = false;
    };
  }, []);

  // AsyncStorage Syncing
  useEffect(() => {
    if (!isHydrated) return;
    async function sync() {
      try {
        await AsyncStorage.setItem(
          '@lakadpapel/possessed_documents',
          JSON.stringify(Array.from(state.possessedDocuments))
        );
      } catch (err) {
        console.warn('Failed to save possessed_documents to AsyncStorage:', err);
      }

      try {
        await AsyncStorage.setItem('@lakadpapel/history', JSON.stringify(state.history));
      } catch (err) {
        console.warn('Failed to save history to AsyncStorage:', err);
      }

      try {
        await AsyncStorage.setItem('@lakadpapel/user_mode', state.userMode);
      } catch (err) {
        console.warn('Failed to save user_mode to AsyncStorage:', err);
      }
    }
    sync();
  }, [state.possessedDocuments, state.history, state.userMode, isHydrated]);

  const value = useMemo(() => ({ state, dispatch }), [state, dispatch]);

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
}
