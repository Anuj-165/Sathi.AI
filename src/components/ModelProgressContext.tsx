import React, { createContext, useContext, useReducer, ReactNode, useMemo } from 'react';

export type ModelStatus = 'idle' | 'downloading' | 'loading' | 'cached' | 'complete' | 'error';

interface ProgressState {
  current: string;
  progress: number;
  status: ModelStatus;
}

type ProgressAction = { type: 'SET_PROGRESS'; payload: Partial<ProgressState> };

const initialState: ProgressState = {
  current: '',
  progress: 0,
  status: 'idle',
};

const ProgressContext = createContext<{
  state: ProgressState;
  dispatch: React.Dispatch<ProgressAction>;
}>({ state: initialState, dispatch: () => null });

function progressReducer(state: ProgressState, action: ProgressAction): ProgressState {
  switch (action.type) {
    case 'SET_PROGRESS':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

export const ModelProgressProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(progressReducer, initialState);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
};

export const useModelProgress = () => useContext(ProgressContext);