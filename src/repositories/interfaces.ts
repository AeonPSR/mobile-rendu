// Base repository interface for data persistence
import { ApiResponse, LoadingState } from '@/models';

export interface IRepository<T> {
  // Local operations (always available)
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T | null>;
  create(item: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  update(id: string, item: Partial<T>): Promise<T>;
  delete(id: string): Promise<boolean>;
  
  // Sync operations
  sync(): Promise<void>;
  markForSync(id: string): Promise<void>;
  getPendingSync(): Promise<T[]>;
}

export interface IAuthRepository {
  signUp(email: string, password: string, firstName?: string, lastName?: string): Promise<ApiResponse<any>>;
  signIn(email: string, password: string): Promise<ApiResponse<any>>;
  signOut(): Promise<ApiResponse<void>>;
  getCurrentUser(): Promise<ApiResponse<any>>;
  isAuthenticated(): Promise<boolean>;
}

export interface IUserRepository extends IRepository<any> {
  getCurrentUser(): Promise<any | null>;
  updateProfile(data: any): Promise<any>;
}

export interface IAccountRepository extends IRepository<any> {
  getByUserId(userId: string): Promise<any[]>;
  getByUserIdAndCurrency(userId: string, currencyId: string): Promise<any | null>;
  updateBalance(accountId: string, newBalance: number): Promise<any>;
}

export interface ITransactionRepository extends IRepository<any> {
  getByUserId(userId: string, limit?: number, offset?: number): Promise<any[]>;
  getByAccountId(accountId: string): Promise<any[]>;
  getByDateRange(startDate: Date, endDate: Date): Promise<any[]>;
  createTransfer(fromAccountId: string, toAccountId: string, amount: number, description?: string): Promise<any>;
  createConversion(fromAccountId: string, toAccountId: string, amount: number, exchangeRate: number): Promise<any>;
}

export interface ICurrencyRepository extends IRepository<any> {
  getByCode(code: string): Promise<any | null>;
  getExchangeRates(): Promise<any[]>;
  updateExchangeRates(rates: any[]): Promise<void>;
  getLastUpdated(): Promise<Date | null>;
}

// Local storage interface
export interface ILocalStorage {
  getItem<T>(key: string): Promise<T | null>;
  setItem<T>(key: string, value: T): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
  getAllKeys(): Promise<string[]>;
}

// Network interface
export interface INetworkService {
  isConnected(): Promise<boolean>;
  makeRequest<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>>;
}

// Sync service interface
export interface ISyncService {
  syncAll(): Promise<void>;
  syncTable(table: string): Promise<void>;
  hasPendingChanges(): Promise<boolean>;
  getLastSyncTime(): Promise<Date | null>;
  setLastSyncTime(date: Date): Promise<void>;
}