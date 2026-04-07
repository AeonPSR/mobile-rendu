import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { User, Account, Transaction, Currency, AppState, LoadingState } from '@/models';
import UserRepository from '@/repositories/userRepository';

// Action types
type AppAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'SET_ACCOUNTS'; payload: Account[] }
  | { type: 'SET_CURRENCIES'; payload: Currency[] }
  | { type: 'SET_TRANSACTIONS'; payload: Transaction[] }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_ACCOUNT'; payload: Account }
  | { type: 'RESET_STATE' };

// Initial state
const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  accounts: [],
  currencies: [],
  transactions: [],
  isLoading: false,
  error: null,
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
      
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
      
    case 'SET_USER':
      return { ...state, user: action.payload };
      
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload };
      
    case 'SET_ACCOUNTS':
      return { ...state, accounts: action.payload };
      
    case 'SET_CURRENCIES':
      return { ...state, currencies: action.payload };
      
    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.payload };
      
    case 'ADD_TRANSACTION':
      return { 
        ...state, 
        transactions: [action.payload, ...state.transactions] 
      };
      
    case 'UPDATE_ACCOUNT':
      return {
        ...state,
        accounts: state.accounts.map(account => 
          account.id === action.payload.id ? action.payload : account
        ),
      };
      
    case 'RESET_STATE':
      return initialState;
      
    default:
      return state;
  }
}

// Context type
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  
  // Auth actions
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  
  // UI helpers
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  // Auth actions
  const signIn = async (email: string, password: string): Promise<boolean> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    // Guest mode for when Supabase is unavailable
    if (email === 'guest@example.com') {
      const guestUser = {
        id: 'guest-user',
        email: 'guest@example.com',
        firstName: 'Guest',
        lastName: 'User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      dispatch({ type: 'SET_USER', payload: guestUser });
      dispatch({ type: 'SET_AUTHENTICATED', payload: true });
      dispatch({ type: 'SET_LOADING', payload: false });
      return true;
    }
    
    try {
      const result = await UserRepository.signIn(email, password);
      
      if (result.success) {
        dispatch({ type: 'SET_USER', payload: result.data });
        dispatch({ type: 'SET_AUTHENTICATED', payload: true });
        dispatch({ type: 'SET_LOADING', payload: false });
        return true;
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.error || 'Sign in failed' });
        return false;
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Network error during sign in' });
      return false;
    }
  };
  
  const signUp = async (email: string, password: string, firstName?: string, lastName?: string): Promise<boolean> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    // Guest mode for when Supabase is unavailable
    if (email === 'guest@example.com') {
      const guestUser = {
        id: 'guest-user',
        email: 'guest@example.com',
        firstName: firstName || 'Guest',
        lastName: lastName || 'User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      dispatch({ type: 'SET_USER', payload: guestUser });
      dispatch({ type: 'SET_AUTHENTICATED', payload: true });
      dispatch({ type: 'SET_LOADING', payload: false });
      return true;
    }
    
    try {
      const result = await UserRepository.createUser(email, password, firstName, lastName);
      
      if (result.success) {
        dispatch({ type: 'SET_USER', payload: result.data });
        dispatch({ type: 'SET_AUTHENTICATED', payload: true });
        dispatch({ type: 'SET_LOADING', payload: false });
        return true;
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.error || 'Sign up failed' });
        return false;
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Network error during sign up' });
      return false;
    }
  };
  
  const signOut = async (): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      await UserRepository.signOut();
      dispatch({ type: 'RESET_STATE' });
    } catch (error) {
      // Still reset state even if API call fails
      dispatch({ type: 'RESET_STATE' });
    }
  };
  
  const checkAuthStatus = async (): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const isAuth = await UserRepository.isAuthenticated();
      
      if (isAuth) {
        const result = await UserRepository.getCurrentUser();
        if (result.success) {
          dispatch({ type: 'SET_USER', payload: result.data });
          dispatch({ type: 'SET_AUTHENTICATED', payload: true });
        } else {
          dispatch({ type: 'SET_AUTHENTICATED', payload: false });
        }
      } else {
        dispatch({ type: 'SET_AUTHENTICATED', payload: false });
      }
    } catch (error) {
      dispatch({ type: 'SET_AUTHENTICATED', payload: false });
      console.error('Error checking auth status:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };
  
  // UI helpers
  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };
  
  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };
  
  const clearError = () => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  const contextValue: AppContextType = {
    state,
    dispatch,
    signIn,
    signUp,
    signOut,
    checkAuthStatus,
    setLoading,
    setError,
    clearError,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

// Hook to use the context
export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export default AppContext;