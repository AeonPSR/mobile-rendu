import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { User, Account, Transaction, Currency, AppState, LoadingState } from '@/models';
import UserRepository from '@/repositories/userRepository';
import AccountRepository from '@/repositories/accountRepository';
import TransactionRepository from '@/repositories/transactionRepository';
import ExchangeRateRepository from '@/repositories/exchangeRateRepository';
import localStorage from '@/repositories/localStorage';

const CACHE_KEYS = {
  ACCOUNTS: (userId: string) => `@cache_accounts_${userId}`,
  TRANSACTIONS: (userId: string) => `@cache_transactions_${userId}`,
};

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
  | { type: 'SET_OFFLINE'; payload: boolean }
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
  isOffline: false,
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

    case 'SET_OFFLINE':
      return { ...state, isOffline: action.payload };
      
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
  
  // Account actions
  loadUserAccounts: (userId: string) => Promise<void>;
  createAccount: (currencyCode: string) => Promise<boolean>;
  
  // Transaction actions
  createTopUp: (accountId: string, amount: number, description?: string) => Promise<boolean>;
  createWithdrawal: (accountId: string, amount: number, description?: string) => Promise<boolean>;
  createTransfer: (fromAccountId: string, toAccountId: string, amount: number, description?: string) => Promise<boolean>;
  createConversion: (fromAccountId: string, toAccountId: string, fromAmount: number, exchangeRate: number) => Promise<boolean>;
  loadUserTransactions: (userId: string) => Promise<void>;
  deleteTransaction: (transactionId: string) => Promise<boolean>;
  updateTransactionDescription: (transactionId: string, description: string) => Promise<boolean>;
  
  // Exchange rate actions
  getExchangeRate: (fromCurrency: string, toCurrency: string) => Promise<number | null>;
  convertAmount: (amount: number, fromCurrency: string, toCurrency: string) => Promise<number | null>;
  
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
      
      // Create guest accounts
      await ensureDefaultAccounts(guestUser.id);
      
      dispatch({ type: 'SET_LOADING', payload: false });
      return true;
    }
    
    try {
      const result = await UserRepository.signIn(email, password);
      
      if (result.success && result.data) {
        dispatch({ type: 'SET_USER', payload: result.data });
        dispatch({ type: 'SET_AUTHENTICATED', payload: true });
        
        // Load user accounts after successful sign in
        await loadUserAccounts(result.data.id);
        
        // Always ensure default accounts exist (will skip if they already exist)
        await ensureDefaultAccounts(result.data.id);
        
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
      
      if (result.success && result.data) {
        dispatch({ type: 'SET_USER', payload: result.data });
        dispatch({ type: 'SET_AUTHENTICATED', payload: true });
        
        // Create default accounts for new user and load them
        await ensureDefaultAccounts(result.data.id);
        
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
        if (result.success && result.data) {
          dispatch({ type: 'SET_USER', payload: result.data });
          dispatch({ type: 'SET_AUTHENTICATED', payload: true });
          
          // Load user accounts
          await loadUserAccounts(result.data.id);
        } else {
          dispatch({ type: 'SET_AUTHENTICATED', payload: false });
        }
      } else {
        dispatch({ type: 'SET_AUTHENTICATED', payload: false });
      }
    } catch (error) {
      dispatch({ type: 'SET_AUTHENTICATED', payload: false });
      console.warn('Error checking auth status:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };
  
  // Account management methods
  const loadUserAccounts = async (userId: string): Promise<void> => {
    // Load from cache first
    try {
      const cached = await localStorage.getItem<Account[]>(CACHE_KEYS.ACCOUNTS(userId));
      if (cached && cached.length > 0) {
        dispatch({ type: 'SET_ACCOUNTS', payload: cached });
      }
    } catch {}

    // Then try API
    try {
      const result = await AccountRepository.getUserAccounts(userId);
      if (result.success) {
        const accounts = result.data || [];
        dispatch({ type: 'SET_ACCOUNTS', payload: accounts });
        dispatch({ type: 'SET_OFFLINE', payload: false });
        // Update cache
        await localStorage.setItem(CACHE_KEYS.ACCOUNTS(userId), accounts);
      } else {
        console.warn('Failed to load user accounts:', result.error);
        dispatch({ type: 'SET_OFFLINE', payload: true });
      }
    } catch (error) {
      console.warn('Error loading accounts:', error);
      dispatch({ type: 'SET_OFFLINE', payload: true });
    }
  };

  const ensureDefaultAccounts = async (userId: string): Promise<void> => {
    try {
      const result = await AccountRepository.createDefaultAccounts(userId);
      if (result.success) {
        // Refresh accounts list
        await loadUserAccounts(userId);
      }
    } catch (error) {
      console.warn('Error creating default accounts:', error);
    }
  };

  const createAccount = async (currencyCode: string): Promise<boolean> => {
    if (!state.user) return false;
    
    try {
      const result = await AccountRepository.createAccount({
        user_id: state.user.id,
        currency_code: currencyCode,
        initial_balance: 0,
      });
      
      if (result.success) {
        // Refresh accounts list
        await loadUserAccounts(state.user.id);
        return true;
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.error || 'Failed to create account' });
        return false;
      }
    } catch (error) {
      dispatch({ type: 'SET_OFFLINE', payload: true });
      dispatch({ type: 'SET_ERROR', payload: 'Network error creating account' });
      return false;
    }
  };

  // Transaction actions
  const createTopUp = async (accountId: string, amount: number, description?: string): Promise<boolean> => {
    if (!state.user) return false;
    
    try {
      const result = await TransactionRepository.createTopUp(accountId, amount, description);
      
      if (result.success && result.data) {
        dispatch({ type: 'ADD_TRANSACTION', payload: result.data });
        // Refresh accounts to update balances
        await loadUserAccounts(state.user.id);
        return true;
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.error || 'Failed to create top-up' });
        return false;
      }
    } catch (error) {
      dispatch({ type: 'SET_OFFLINE', payload: true });
      dispatch({ type: 'SET_ERROR', payload: 'Network error during top-up' });
      return false;
    }
  };

  const createWithdrawal = async (accountId: string, amount: number, description?: string): Promise<boolean> => {
    if (!state.user) return false;
    
    try {
      const result = await TransactionRepository.createWithdrawal(accountId, amount, description);
      
      if (result.success && result.data) {
        dispatch({ type: 'ADD_TRANSACTION', payload: result.data });
        await loadUserAccounts(state.user.id);
        return true;
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.error || 'Failed to create withdrawal' });
        return false;
      }
    } catch (error) {
      dispatch({ type: 'SET_OFFLINE', payload: true });
      dispatch({ type: 'SET_ERROR', payload: 'Network error during withdrawal' });
      return false;
    }
  };

  const createTransfer = async (fromAccountId: string, toAccountId: string, amount: number, description?: string): Promise<boolean> => {
    if (!state.user) return false;
    
    try {
      const result = await TransactionRepository.createTransfer(fromAccountId, toAccountId, amount, description);
      
      if (result.success && result.data) {
        dispatch({ type: 'ADD_TRANSACTION', payload: result.data });
        // Refresh accounts to update balances
        await loadUserAccounts(state.user.id);
        return true;
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.error || 'Failed to create transfer' });
        return false;
      }
    } catch (error) {
      dispatch({ type: 'SET_OFFLINE', payload: true });
      dispatch({ type: 'SET_ERROR', payload: 'Network error during transfer' });
      return false;
    }
  };

  const createConversion = async (fromAccountId: string, toAccountId: string, fromAmount: number, exchangeRate: number): Promise<boolean> => {
    if (!state.user) return false;
    
    try {
      const result = await TransactionRepository.createConversion(fromAccountId, toAccountId, fromAmount, exchangeRate);
      
      if (result.success && result.data) {
        dispatch({ type: 'ADD_TRANSACTION', payload: result.data });
        // Refresh accounts to update balances
        await loadUserAccounts(state.user.id);
        return true;
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.error || 'Failed to create conversion' });
        return false;
      }
    } catch (error) {
      dispatch({ type: 'SET_OFFLINE', payload: true });
      dispatch({ type: 'SET_ERROR', payload: 'Network error during conversion' });
      return false;
    }
  };

  const loadUserTransactions = async (userId: string): Promise<void> => {
    // Load from cache first
    try {
      const cached = await localStorage.getItem<Transaction[]>(CACHE_KEYS.TRANSACTIONS(userId));
      if (cached && cached.length > 0) {
        dispatch({ type: 'SET_TRANSACTIONS', payload: cached });
      }
    } catch {}

    // Then try API
    try {
      const result = await TransactionRepository.getUserTransactions(userId);
      
      if (result.success && result.data) {
        dispatch({ type: 'SET_TRANSACTIONS', payload: result.data });
        dispatch({ type: 'SET_OFFLINE', payload: false });
        // Update cache
        await localStorage.setItem(CACHE_KEYS.TRANSACTIONS(userId), result.data);
      } else {
        console.warn('Failed to load transactions:', result.error);
        dispatch({ type: 'SET_OFFLINE', payload: true });
      }
    } catch (error) {
      console.warn('Network error loading transactions:', error);
      dispatch({ type: 'SET_OFFLINE', payload: true });
    }
  };

  const deleteTransaction = async (transactionId: string): Promise<boolean> => {
    if (!state.user) return false;
    try {
      const result = await TransactionRepository.deleteTransaction(transactionId, state.user.id);
      if (result.success) {
        dispatch({
          type: 'SET_TRANSACTIONS',
          payload: state.transactions.filter(t => t.id !== transactionId),
        });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const updateTransactionDescription = async (transactionId: string, description: string): Promise<boolean> => {
    if (!state.user) return false;
    try {
      const result = await TransactionRepository.updateTransactionDescription(transactionId, state.user.id, description);
      if (result.success) {
        dispatch({
          type: 'SET_TRANSACTIONS',
          payload: state.transactions.map(t =>
            t.id === transactionId ? { ...t, description } : t
          ),
        });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Exchange rate actions
  const getExchangeRate = async (fromCurrency: string, toCurrency: string): Promise<number | null> => {
    try {
      const result = await ExchangeRateRepository.getExchangeRate(fromCurrency, toCurrency);
      return result.success && result.data ? result.data.rate : null;
    } catch (error) {
      console.warn('Error getting exchange rate:', error);
      return null;
    }
  };

  const convertAmount = async (amount: number, fromCurrency: string, toCurrency: string): Promise<number | null> => {
    try {
      const result = await ExchangeRateRepository.calculateConversion(amount, fromCurrency, toCurrency);
      return result.success && result.data ? result.data.amount : null;
    } catch (error) {
      console.warn('Error converting amount:', error);
      return null;
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
    loadUserAccounts,
    createAccount,
    createTopUp,
    createWithdrawal,
    createTransfer,
    createConversion,
    loadUserTransactions,
    deleteTransaction,
    updateTransactionDescription,
    getExchangeRate,
    convertAmount,
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