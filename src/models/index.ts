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
  fromAccountId?: string; // null for top-ups
  toAccountId?: string;   // null for withdrawals
  type: TransactionType;
  amount: number;
  currency: string;
  exchangeRate?: number; // For conversion transactions
  description?: string;
  status: TransactionStatus;
  location?: GeoLocation;
  receiptImage?: string; // Base64 or image URL
  createdAt: Date;
  processedAt?: Date;
}

export enum TransactionType {
  TOP_UP = 'top_up',
  TRANSFER = 'transfer',
  CONVERSION = 'conversion',
  WITHDRAWAL = 'withdrawal',
  PAYMENT = 'payment'
}

export enum TransactionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
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