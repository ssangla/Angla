// ============================================================================
// App Context - Global State Management
// ============================================================================

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import {
  AppState,
  UIState,
  User,
  PromptScore,
  Suggestion,
  RefinementOptions,
  RefinementAction,
  PromptTone,
  PromptLength,
  AudienceLevel,
  StructureFormat,
} from '@/types';

// ----------------------------------------------------------------------------
// Initial State
// ----------------------------------------------------------------------------

const initialUIState: UIState = {
  theme: 'light',
  sidebarOpen: true,
  activePanel: 'suggestions',
  modals: {
    settings: false,
    export: false,
    share: false,
    templates: false,
  },
};

const initialRefinementOptions: RefinementOptions = {
  tone: PromptTone.PROFESSIONAL,
  length: PromptLength.MODERATE,
  audienceLevel: AudienceLevel.INTERMEDIATE,
  includeExamples: true,
  includeConstraints: true,
  includeContext: true,
  structureFormat: StructureFormat.SECTIONS,
};

const initialState: AppState = {
  prompt: {
    current: null,
    history: [],
    isLoading: false,
    error: null,
  },
  score: {
    current: null,
    history: [],
    isAnalyzing: false,
  },
  suggestions: {
    items: [],
    alternativeFormats: [],
    isLoading: false,
  },
  refinement: {
    options: initialRefinementOptions,
    history: [],
    canUndo: false,
    canRedo: false,
  },
  user: {
    user: null,
    isAuthenticated: false,
    isLoading: false,
  },
  collaboration: {
    session: null,
    events: [],
    isConnected: false,
  },
  ui: initialUIState,
};

// ----------------------------------------------------------------------------
// Action Types
// ----------------------------------------------------------------------------

type AppAction =
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_ACTIVE_PANEL'; payload: UIState['activePanel'] }
  | { type: 'OPEN_MODAL'; payload: keyof UIState['modals'] }
  | { type: 'CLOSE_MODAL'; payload: keyof UIState['modals'] }
  | { type: 'SET_SCORE'; payload: PromptScore }
  | { type: 'SET_ANALYZING'; payload: boolean }
  | { type: 'SET_SUGGESTIONS'; payload: Suggestion[] }
  | { type: 'SET_REFINEMENT_OPTIONS'; payload: Partial<RefinementOptions> }
  | { type: 'ADD_REFINEMENT_ACTION'; payload: RefinementAction }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_AUTHENTICATED'; payload: boolean };

// ----------------------------------------------------------------------------
// Reducer
// ----------------------------------------------------------------------------

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_THEME':
      return {
        ...state,
        ui: { ...state.ui, theme: action.payload },
      };

    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        ui: { ...state.ui, sidebarOpen: !state.ui.sidebarOpen },
      };

    case 'SET_ACTIVE_PANEL':
      return {
        ...state,
        ui: { ...state.ui, activePanel: action.payload },
      };

    case 'OPEN_MODAL':
      return {
        ...state,
        ui: {
          ...state.ui,
          modals: { ...state.ui.modals, [action.payload]: true },
        },
      };

    case 'CLOSE_MODAL':
      return {
        ...state,
        ui: {
          ...state.ui,
          modals: { ...state.ui.modals, [action.payload]: false },
        },
      };

    case 'SET_SCORE':
      return {
        ...state,
        score: { ...state.score, current: action.payload },
      };

    case 'SET_ANALYZING':
      return {
        ...state,
        score: { ...state.score, isAnalyzing: action.payload },
      };

    case 'SET_SUGGESTIONS':
      return {
        ...state,
        suggestions: { ...state.suggestions, items: action.payload },
      };

    case 'SET_REFINEMENT_OPTIONS':
      return {
        ...state,
        refinement: {
          ...state.refinement,
          options: { ...state.refinement.options, ...action.payload },
        },
      };

    case 'ADD_REFINEMENT_ACTION':
      return {
        ...state,
        refinement: {
          ...state.refinement,
          history: [...state.refinement.history, action.payload],
          canUndo: true,
        },
      };

    case 'SET_USER':
      return {
        ...state,
        user: { ...state.user, user: action.payload },
      };

    case 'SET_AUTHENTICATED':
      return {
        ...state,
        user: { ...state.user, isAuthenticated: action.payload },
      };

    default:
      return state;
  }
}

// ----------------------------------------------------------------------------
// Context
// ----------------------------------------------------------------------------

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

// ----------------------------------------------------------------------------
// Provider
// ----------------------------------------------------------------------------

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// ----------------------------------------------------------------------------
// Hook
// ----------------------------------------------------------------------------

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

// ----------------------------------------------------------------------------
// Selectors
// ----------------------------------------------------------------------------

export const selectTheme = (state: AppState) => state.ui.theme;
export const selectSidebarOpen = (state: AppState) => state.ui.sidebarOpen;
export const selectActivePanel = (state: AppState) => state.ui.activePanel;
export const selectScore = (state: AppState) => state.score.current;
export const selectIsAnalyzing = (state: AppState) => state.score.isAnalyzing;
export const selectSuggestions = (state: AppState) => state.suggestions.items;
export const selectRefinementOptions = (state: AppState) => state.refinement.options;
export const selectUser = (state: AppState) => state.user.user;
export const selectIsAuthenticated = (state: AppState) => state.user.isAuthenticated;
