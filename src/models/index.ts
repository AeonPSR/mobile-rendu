// Core domain models for the International Wallet app

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Currency {
  code: string; // USD, EUR, CNY, etc.
  name: string; // US Dollar, Euro, Chinese Yuan
  symbol: string; // $, €, ¥
  flag?: string; // Country flag emoji
  decimalPlaces?: number; // Number of decimal places for currency
}

export interface Account {
  id: string;
  userId: string;
  currencyCode: string; // Direct currency code (USD, EUR, etc.)
  balance: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Optional populated currency details
  currency?: Currency;
}

export interface Transaction {
  id: string;
  userId: string;
  // Source account (null for external top-ups)
  fromAccountId?: string;
  fromAmount?: number;
  fromCurrency?: string;
  // Destination account (null for external withdrawals)  
  toAccountId?: string;
  toAmount?: number;
  toCurrency?: string;
  // Transaction details
  type: TransactionType;
  exchangeRate?: number; // For conversion transactions
  description?: string;
  referenceId?: string; // External reference
  status: TransactionStatus;
  metadata?: any; // Additional data as JSON
  createdAt: Date;
}

export enum TransactionType {
  TRANSFER = 'transfer',
  CONVERSION = 'conversion', 
  TOP_UP = 'top_up',
  WITHDRAWAL = 'withdrawal'
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  country?: string;
}

export interface ExchangeRate {
  id: string;
  baseCurrency: string;
  targetCurrency: string;
  rate: number;
  timestamp: Date;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// App state types
export interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  accounts: Account[];
  currencies: Currency[];
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string;
  success?: boolean;
}