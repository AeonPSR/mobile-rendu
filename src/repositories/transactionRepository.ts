import { Transaction, TransactionType, TransactionStatus, ApiResponse } from '@/models';
import SupabaseService from '@/services/supabase';
import LocalStorage from './localStorage';
import AccountRepository from './accountRepository';

export interface CreateTransactionRequest {
  user_id: string;
  type: TransactionType;
  from_account_id?: string;
  from_amount?: number;
  from_currency?: string;
  to_account_id?: string;
  to_amount?: number;
  to_currency?: string;
  exchange_rate?: number;
  description?: string;
  reference_id?: string;
}

export class TransactionRepository {
  private static instance: TransactionRepository;
  private readonly TABLE_NAME = 'transactions';
  private readonly CACHE_KEY = 'user_transactions';

  private constructor() {}

  public static getInstance(): TransactionRepository {
    if (!TransactionRepository.instance) {
      TransactionRepository.instance = new TransactionRepository();
    }
    return TransactionRepository.instance;
  }

  /**
   * Create new transaction and update account balances
   */
  async createTransaction(request: CreateTransactionRequest): Promise<ApiResponse<Transaction>> {
    // Guest mode - store transaction in localStorage only
    if (request.user_id === 'guest-user') {
      try {
        const transaction: Transaction = {
          id: `guest-tx-${Date.now()}`,
          userId: request.user_id,
          fromAccountId: request.from_account_id,
          fromAmount: request.from_amount,
          fromCurrency: request.from_currency,
          toAccountId: request.to_account_id,
          toAmount: request.to_amount,
          toCurrency: request.to_currency,
          type: request.type as TransactionType,
          exchangeRate: request.exchange_rate,
          description: request.description,
          referenceId: request.reference_id,
          status: 'completed' as TransactionStatus,
          createdAt: new Date(),
        };

        // Update account balances
        await this.updateAccountBalances(request);

        // Save transaction to localStorage
        const existing = await LocalStorage.getItem<Transaction[]>(`${this.CACHE_KEY}_guest-user`) || [];
        existing.unshift(transaction);
        await LocalStorage.setItem(`${this.CACHE_KEY}_guest-user`, existing);

        return {
          success: true,
          data: transaction,
          message: 'Transaction created successfully',
        };
      } catch (error) {
        console.error('TransactionRepository guest createTransaction error:', error);
        return { success: false, error: 'Failed to create guest transaction' };
      }
    }

    try {
      const client = SupabaseService.getClient();
      
      // Start transaction
      const { data, error } = await client
        .from(this.TABLE_NAME)
        .insert({
          user_id: request.user_id,
          type: request.type,
          from_account_id: request.from_account_id,  
          from_amount: request.from_amount,
          from_currency: request.from_currency,
          to_account_id: request.to_account_id,
          to_amount: request.to_amount,
          to_currency: request.to_currency,
          exchange_rate: request.exchange_rate,
          description: request.description,
          reference_id: request.reference_id,
          status: 'completed', // Auto-complete for demo
        })
        .select()
        .single();

      if (error) {
        console.error('TransactionRepository.createTransaction error:', error);
        return {
          success: false,
          error: error.message,
        };
      }

      // Update account balances after transaction
      await this.updateAccountBalances(request);

      const transaction: Transaction = {
        id: data.id,
        userId: data.user_id,
        fromAccountId: data.from_account_id,
        fromAmount: data.from_amount ? parseFloat(data.from_amount) : undefined,
        fromCurrency: data.from_currency,
        toAccountId: data.to_account_id,
        toAmount: data.to_amount ? parseFloat(data.to_amount) : undefined,
        toCurrency: data.to_currency,
        type: data.type as TransactionType,
        exchangeRate: data.exchange_rate ? parseFloat(data.exchange_rate) : undefined,
        description: data.description,
        referenceId: data.reference_id,
        status: data.status as TransactionStatus,
        metadata: data.metadata,
        createdAt: new Date(data.created_at),
      };

      // Clear cache
      await LocalStorage.removeItem(`${this.CACHE_KEY}_${request.user_id}`);

      return {
        success: true,
        data: transaction,
        message: 'Transaction created successfully',
      };
    } catch (error) {
      console.error('TransactionRepository.createTransaction error:', error);
      return {
        success: false,
        error: 'Failed to create transaction',
      };
    }
  }

  /**
   * Update account balances based on transaction
   */
  private async updateAccountBalances(request: CreateTransactionRequest): Promise<void> {
    try {
      // Subtract from source account
      if (request.from_account_id && request.from_amount) {
        await AccountRepository.updateBalance({
          account_id: request.from_account_id,
          new_balance: request.from_amount,
          operation_type: 'subtract',
        });
      }

      // Add to destination account  
      if (request.to_account_id && request.to_amount) {
        await AccountRepository.updateBalance({
          account_id: request.to_account_id,
          new_balance: request.to_amount,
          operation_type: 'add',
        });
      }
    } catch (error) {
      console.error('Error updating account balances:', error);
      // Note: In production, would rollback transaction here
    }
  }

  /**
   * Get user transaction history
   */
  async getUserTransactions(
    userId: string, 
    limit: number = 50,
    offset: number = 0
  ): Promise<ApiResponse<Transaction[]>> {
    // Guest mode - load from localStorage
    if (userId === 'guest-user') {
      try {
        const transactions = await LocalStorage.getItem<Transaction[]>(`${this.CACHE_KEY}_guest-user`) || [];
        return { success: true, data: transactions.slice(offset, offset + limit) };
      } catch (error) {
        return { success: true, data: [] };
      }
    }

    try {
      const client = SupabaseService.getClient();
      
      const { data, error } = await client
        .from(this.TABLE_NAME)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('TransactionRepository.getUserTransactions error:', error);
        return {
          success: false,
          error: error.message,
        };
      }

      const transactions: Transaction[] = data.map(item => ({
        id: item.id,
        userId: item.user_id,
        fromAccountId: item.from_account_id,
        fromAmount: item.from_amount ? parseFloat(item.from_amount) : undefined,
        fromCurrency: item.from_currency,
        toAccountId: item.to_account_id,
        toAmount: item.to_amount ? parseFloat(item.to_amount) : undefined,
        toCurrency: item.to_currency,
        type: item.type as TransactionType,
        exchangeRate: item.exchange_rate ? parseFloat(item.exchange_rate) : undefined,
        description: item.description,
        referenceId: item.reference_id,
        status: item.status as TransactionStatus,
        metadata: item.metadata,
        createdAt: new Date(item.created_at),
      }));

      // Cache results
      if (offset === 0) {
        await LocalStorage.setItem(`${this.CACHE_KEY}_${userId}`, transactions.slice(0, 20));
      }

      return {
        success: true,
        data: transactions,
      };
    } catch (error) {
      console.error('TransactionRepository.getUserTransactions error:', error);
      
      // Try cached data on error
      if (offset === 0) {
        const cachedTransactions = await LocalStorage.getItem<Transaction[]>(`${this.CACHE_KEY}_${userId}`);
        if (cachedTransactions) {
          return {
            success: true,
            data: cachedTransactions,
            message: 'Returned cached data due to network error',
          };
        }
      }

      return {
        success: false,
        error: 'Failed to fetch transactions',
      };
    }
  }

  /**
   * Get specific transaction by ID
   */
  async getTransactionById(transactionId: string): Promise<ApiResponse<Transaction>> {
    try {
      const client = SupabaseService.getClient();
      
      const { data, error } = await client
        .from(this.TABLE_NAME)
        .select('*')
        .eq('id', transactionId)
        .single();

      if (error) {
        console.error('TransactionRepository.getTransactionById error:', error);
        return {
          success: false,
          error: error.message,
        };
      }

      const transaction: Transaction = {
        id: data.id,
        userId: data.user_id,
        fromAccountId: data.from_account_id,
        fromAmount: data.from_amount ? parseFloat(data.from_amount) : undefined,
        fromCurrency: data.from_currency,
        toAccountId: data.to_account_id,
        toAmount: data.to_amount ? parseFloat(data.to_amount) : undefined,
        toCurrency: data.to_currency,
        type: data.type as TransactionType,
        exchangeRate: data.exchange_rate ? parseFloat(data.exchange_rate) : undefined,
        description: data.description,
        referenceId: data.reference_id,
        status: data.status as TransactionStatus,
        metadata: data.metadata,
        createdAt: new Date(data.created_at),
      };

      return {
        success: true,
        data: transaction,
      };
    } catch (error) {
      console.error('TransactionRepository.getTransactionById error:', error);
      return {
        success: false,
        error: 'Failed to fetch transaction',
      };
    }
  }

  /**
   * Detailed helper methods for specific use cases
   */

  // Top-up with full parameters (detailed version)
  async createTopUpDetailed(
    userId: string,
    accountId: string,
    amount: number,
    currency: string,
    description?: string
  ): Promise<ApiResponse<Transaction>> {
    return this.createTransaction({
      user_id: userId,
      type: TransactionType.TOP_UP,
      to_account_id: accountId,
      to_amount: amount,
      to_currency: currency,
      description: description || `Top-up ${currency} ${amount}`,
    });
  }

  // Transfer with full parameters (detailed version)
  async createTransferDetailed(
    userId: string,
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    currency: string,
    description?: string
  ): Promise<ApiResponse<Transaction>> {
    return this.createTransaction({
      user_id: userId,
      type: TransactionType.TRANSFER,
      from_account_id: fromAccountId,
      from_amount: amount,
      from_currency: currency,
      to_account_id: toAccountId,
      to_amount: amount,
      to_currency: currency,
      description: description || `Transfer ${currency} ${amount}`,
    });
  }

  // Currency conversion with full parameters (detailed version)
  async createConversionDetailed(
    userId: string,
    fromAccountId: string,
    toAccountId: string,
    fromAmount: number,
    fromCurrency: string,
    toAmount: number,
    toCurrency: string,
    exchangeRate: number,
    description?: string
  ): Promise<ApiResponse<Transaction>> {
    return this.createTransaction({
      user_id: userId,
      type: TransactionType.CONVERSION,
      from_account_id: fromAccountId,
      from_amount: fromAmount,
      from_currency: fromCurrency,
      to_account_id: toAccountId,
      to_amount: toAmount,
      to_currency: toCurrency,
      exchange_rate: exchangeRate,
      description: description || `Convert ${fromCurrency} ${fromAmount} → ${toCurrency} ${toAmount}`,
    });
  }
  
  // Simplified helper methods that match AppContext interface
  
  async createTopUp(
    accountId: string, 
    amount: number, 
    description?: string
  ): Promise<ApiResponse<Transaction>> {
    try {
      // Get account info to extract user and currency
      const accountResult = await AccountRepository.getAccountById(accountId);
      if (!accountResult.success || !accountResult.data) {
        return { success: false, error: 'Account not found' };
      }
      
      const account = accountResult.data;
      
      return this.createTransaction({
        user_id: account.userId,
        type: TransactionType.TOP_UP,
        to_account_id: accountId,
        to_amount: amount,
        to_currency: account.currencyCode,
        description: description || `Top-up ${account.currencyCode} ${amount}`,
      });
    } catch (error) {
      console.error('Error creating top-up:', error);
      return { success: false, error: 'Failed to create top-up transaction' };
    }
  }

  async createTransfer(
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    description?: string
  ): Promise<ApiResponse<Transaction>> {
    try {
      // Get both accounts to extract user and currency info
      const [fromResult, toResult] = await Promise.all([
        AccountRepository.getAccountById(fromAccountId),
        AccountRepository.getAccountById(toAccountId)
      ]);
      
      if (!fromResult.success || !fromResult.data) {
        return { success: false, error: 'From account not found' };
      }
      
      if (!toResult.success || !toResult.data) {
        return { success: false, error: 'To account not found' };
      }
      
      const fromAccount = fromResult.data;
      const toAccount = toResult.data;
      
      return this.createTransaction({
        user_id: fromAccount.userId,
        type: TransactionType.TRANSFER,
        from_account_id: fromAccountId,
        from_amount: amount,
        from_currency: fromAccount.currencyCode,
        to_account_id: toAccountId,
        to_amount: amount,
        to_currency: toAccount.currencyCode,
        description: description || `Transfer ${amount} ${fromAccount.currencyCode}`,
      });
    } catch (error) {
      console.error('Error creating transfer:', error);
      return { success: false, error: 'Failed to create transfer transaction' };
    }
  }

  async createConversion(
    fromAccountId: string,
    toAccountId: string,
    fromAmount: number,
    exchangeRate: number,
    description?: string
  ): Promise<ApiResponse<Transaction>> {
    try {
      // Get both accounts for user and currency info
      const [fromResult, toResult] = await Promise.all([
        AccountRepository.getAccountById(fromAccountId),
        AccountRepository.getAccountById(toAccountId)
      ]);
      
      if (!fromResult.success || !fromResult.data) {
        return { success: false, error: 'From account not found' };
      }
      
      if (!toResult.success || !toResult.data) {
        return { success: false, error: 'To account not found' };
      }
      
      const fromAccount = fromResult.data;
      const toAccount = toResult.data;
      const toAmount = fromAmount * exchangeRate;
      
      return this.createTransaction({
        user_id: fromAccount.userId,
        type: TransactionType.CONVERSION,
        from_account_id: fromAccountId,
        from_amount: fromAmount,
        from_currency: fromAccount.currencyCode,
        to_account_id: toAccountId,
        to_amount: toAmount,
        to_currency: toAccount.currencyCode,
        exchange_rate: exchangeRate,
        description: description || `Convert ${fromAmount} ${fromAccount.currencyCode} to ${toAmount.toFixed(2)} ${toAccount.currencyCode}`,
      });
    } catch (error) {
      console.error('Error creating conversion:', error);
      return { success: false, error: 'Failed to create conversion transaction' };
    }
  }
}

export default TransactionRepository.getInstance();