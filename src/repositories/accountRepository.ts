import { Account, ApiResponse } from '@/models';
import SupabaseService from '@/services/supabase';
import LocalStorage from './localStorage';

export interface CreateAccountRequest {
  user_id: string;
  currency_code: string;
  initial_balance?: number;
}

export interface UpdateBalanceRequest {
  account_id: string;
  new_balance: number;
  operation_type?: 'set' | 'add' | 'subtract';
}

export class AccountRepository {
  private static instance: AccountRepository;
  private readonly TABLE_NAME = 'accounts';
  private readonly CACHE_KEY = 'user_accounts';

  private constructor() {}

  public static getInstance(): AccountRepository {
    if (!AccountRepository.instance) {
      AccountRepository.instance = new AccountRepository();
    }
    return AccountRepository.instance;
  }

  /**
   * Get all accounts for a specific user
   */
  async getUserAccounts(userId: string): Promise<ApiResponse<Account[]>> {
    // Guest mode - load from localStorage
    if (userId === 'guest-user') {
      try {
        const cachedAccounts = await LocalStorage.getItem<Account[]>(`${this.CACHE_KEY}_guest-user`);
        return {
          success: true,
          data: cachedAccounts || [],
        };
      } catch (error) {
        return {
          success: true,
          data: [], // Return empty array for guest if no cached data
        };
      }
    }

    // Regular database mode
    try {
      const client = SupabaseService.getClient();
      
      const { data, error } = await client
        .from(this.TABLE_NAME)
        .select(`
          *,
          currencies!accounts_currency_code_fkey (
            code,
            name,
            symbol,
            flag,
            decimal_places
          )
        `)
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('AccountRepository.getUserAccounts error:', error);
        return {
          success: false,
          error: error.message,
        };
      }

      // Transform to Account model
      const accounts: Account[] = data.map(item => ({
        id: item.id,
        userId: item.user_id,
        currencyCode: item.currency_code,
        balance: parseFloat(item.balance),
        isActive: item.is_active,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
        // Currency details from join
        currency: item.currencies ? {
          code: item.currencies.code,
          name: item.currencies.name,
          symbol: item.currencies.symbol,
          flag: item.currencies.flag,
          decimalPlaces: item.currencies.decimal_places,
        } : undefined,
      }));

      // Cache locally
      await LocalStorage.setItem(`${this.CACHE_KEY}_${userId}`, accounts);

      return {
        success: true,
        data: accounts,
      };
    } catch (error) {
      console.error('AccountRepository.getUserAccounts error:', error);
      
      // Try to return cached data on error
      const cachedAccounts = await LocalStorage.getItem<Account[]>(`${this.CACHE_KEY}_${userId}`);
      if (cachedAccounts) {
        return {
          success: true,
          data: cachedAccounts,
          message: 'Returned cached data due to network error',
        };
      }

      return {
        success: false,
        error: 'Failed to fetch accounts',
      };
    }
  }

  /**
   * Create a new account for a user in a specific currency
   */
  async createAccount(request: CreateAccountRequest): Promise<ApiResponse<Account>> {
    // Guest mode - create mock account in localStorage
    if (request.user_id === 'guest-user') {
      try {
        // Load existing guest accounts
        const existingAccounts = await LocalStorage.getItem<Account[]>(`${this.CACHE_KEY}_guest-user`) || [];
        
        // Check if account already exists
        const existingAccount = existingAccounts.find(acc => acc.currencyCode === request.currency_code);
        if (existingAccount) {
          return {
            success: false,
            error: `Account already exists for ${request.currency_code}`,
          };
        }
        
        // Create new guest account
        const newAccount: Account = {
          id: `guest-account-${request.currency_code.toLowerCase()}`,
          userId: 'guest-user',
          currencyCode: request.currency_code,
          balance: request.initial_balance || 0,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        // Add to existing accounts and save
        const updatedAccounts = [...existingAccounts, newAccount];
        await LocalStorage.setItem(`${this.CACHE_KEY}_guest-user`, updatedAccounts);
        
        return {
          success: true,
          data: newAccount,
          message: `Created guest ${request.currency_code} account`,
        };
      } catch (error) {
        return {
          success: false,
          error: 'Failed to create guest account',
        };
      }
    }

    // Regular database mode
    try {
      const client = SupabaseService.getClient();

      // Check if account already exists for this user/currency
      const { data: existingAccount } = await client
        .from(this.TABLE_NAME)
        .select('id')
        .eq('user_id', request.user_id)
        .eq('currency_code', request.currency_code)
        .single();

      if (existingAccount) {
        return {
          success: false,
          error: `Account already exists for ${request.currency_code}`,
        };
      }

      // Create new account
      const { data, error } = await client
        .from(this.TABLE_NAME)
        .insert({
          user_id: request.user_id,
          currency_code: request.currency_code,
          balance: request.initial_balance || 0,
        })
        .select(`
          *,
          currencies!accounts_currency_code_fkey (
            code,
            name, 
            symbol,
            flag,
            decimal_places
          )
        `)
        .single();

      if (error) {
        console.error('AccountRepository.createAccount error:', error);
        return {
          success: false,
          error: error.message,
        };
      }

      const account: Account = {
        id: data.id,
        userId: data.user_id,
        currencyCode: data.currency_code,
        balance: parseFloat(data.balance),
        isActive: data.is_active,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        currency: data.currencies ? {
          code: data.currencies.code,
          name: data.currencies.name,
          symbol: data.currencies.symbol,
          flag: data.currencies.flag,
          decimalPlaces: data.currencies.decimal_places,
        } : undefined,
      };

      // Clear cache to force refresh
      await LocalStorage.removeItem(`${this.CACHE_KEY}_${request.user_id}`);

      return {
        success: true,
        data: account,
        message: 'Account created successfully',
      };
    } catch (error) {
      console.error('AccountRepository.createAccount error:', error);
      return {
        success: false,
        error: 'Failed to create account',
      };
    }
  }

  /**
   * Update account balance
   */
  async updateBalance(request: UpdateBalanceRequest): Promise<ApiResponse<Account>> {
    // Guest mode - update balance in localStorage
    if (request.account_id.startsWith('guest-account-')) {
      try {
        const existingAccounts = await LocalStorage.getItem<Account[]>(`${this.CACHE_KEY}_guest-user`) || [];
        const accountIndex = existingAccounts.findIndex(acc => acc.id === request.account_id);
        
        if (accountIndex === -1) {
          return {
            success: false,
            error: 'Guest account not found',
          };
        }
        
        const account = existingAccounts[accountIndex];
        let newBalance = account.balance;
        
        if (request.operation_type === 'add') {
          newBalance = account.balance + request.new_balance;
        } else if (request.operation_type === 'subtract') {
          newBalance = Math.max(account.balance - request.new_balance, 0);
        } else {
          newBalance = request.new_balance;
        }
        
        // Update the account
        const updatedAccount = { ...account, balance: newBalance, updatedAt: new Date() };
        existingAccounts[accountIndex] = updatedAccount;
        
        // Save back to localStorage
        await LocalStorage.setItem(`${this.CACHE_KEY}_guest-user`, existingAccounts);
        
        return {
          success: true,
          data: updatedAccount,
          message: `Updated guest account balance to ${newBalance}`,
        };
      } catch (error) {
        return {
          success: false,
          error: 'Failed to update guest account balance',
        };
      }
    }

    // Regular database mode
    try {
      const client = SupabaseService.getClient();

      let updateQuery;
      
      if (request.operation_type === 'add') {
        // Fetch current balance first
        const { data: currentAccount, error: fetchError } = await client
          .from(this.TABLE_NAME)
          .select('balance')
          .eq('id', request.account_id)
          .single();
        
        if (fetchError) throw fetchError;
        
        const newBalance = (currentAccount?.balance || 0) + request.new_balance;
        
        updateQuery = client
          .from(this.TABLE_NAME)
          .update({ 
            balance: newBalance,
            updated_at: new Date().toISOString(),
          })
          .eq('id', request.account_id);
      } else if (request.operation_type === 'subtract') {
        // Fetch current balance first
        const { data: currentAccount, error: fetchError } = await client
          .from(this.TABLE_NAME)
          .select('balance')
          .eq('id', request.account_id)
          .single();
        
        if (fetchError) throw fetchError;
        
        const newBalance = Math.max((currentAccount?.balance || 0) - request.new_balance, 0);
        
        updateQuery = client
          .from(this.TABLE_NAME)
          .update({ 
            balance: newBalance,
            updated_at: new Date().toISOString(),
          })
          .eq('id', request.account_id);
      } else {
        // Set exact balance (default)
        updateQuery = client
          .from(this.TABLE_NAME)
          .update({ 
            balance: request.new_balance,
            updated_at: new Date().toISOString(),
          })
          .eq('id', request.account_id);
      }

      const { data, error } = await updateQuery
        .select(`
          *,
          currencies!accounts_currency_code_fkey (
            code,
            name,
            symbol,
            flag,
            decimal_places
          )
        `)
        .single();

      if (error) {
        console.error('AccountRepository.updateBalance error:', error);
        return {
          success: false,
          error: error.message,
        };
      }

      const account: Account = {
        id: data.id,
        userId: data.user_id,
        currencyCode: data.currency_code,
        balance: parseFloat(data.balance),
        isActive: data.is_active,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        currency: data.currencies ? {
          code: data.currencies.code,
          name: data.currencies.name,
          symbol: data.currencies.symbol,
          flag: data.currencies.flag,
          decimalPlaces: data.currencies.decimal_places,
        } : undefined,
      };

      // Clear cache
      await LocalStorage.removeItem(`${this.CACHE_KEY}_${data.user_id}`);

      return {
        success: true,
        data: account,
        message: 'Balance updated successfully',
      };
    } catch (error) {
      console.error('AccountRepository.updateBalance error:', error);
      return {
        success: false,
        error: 'Failed to update balance',
      };
    }
  }

  /**
   * Get specific account by ID
   */
  async getAccountById(accountId: string): Promise<ApiResponse<Account>> {
    // Guest mode - look up from localStorage
    if (accountId.startsWith('guest-account-')) {
      try {
        const existingAccounts = await LocalStorage.getItem<Account[]>(`${this.CACHE_KEY}_guest-user`) || [];
        const account = existingAccounts.find(acc => acc.id === accountId);
        if (account) {
          return { success: true, data: account };
        }
        return { success: false, error: 'Guest account not found' };
      } catch (error) {
        return { success: false, error: 'Failed to fetch guest account' };
      }
    }

    try {
      const client = SupabaseService.getClient();
      
      const { data, error } = await client
        .from(this.TABLE_NAME)
        .select(`
          *,
          currencies!accounts_currency_code_fkey (
            code,
            name,
            symbol,
            flag,
            decimal_places
          )
        `)
        .eq('id', accountId)
        .single();

      if (error) {
        console.error('AccountRepository.getAccountById error:', error);
        return {
          success: false,
          error: error.message,
        };
      }

      const account: Account = {
        id: data.id,
        userId: data.user_id,
        currencyCode: data.currency_code,
        balance: parseFloat(data.balance),
        isActive: data.is_active,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        currency: data.currencies ? {
          code: data.currencies.code,
          name: data.currencies.name,
          symbol: data.currencies.symbol,
          flag: data.currencies.flag,
          decimalPlaces: data.currencies.decimal_places,
        } : undefined,
      };

      return {
        success: true,
        data: account,
      };
    } catch (error) {
      console.error('AccountRepository.getAccountById error:', error);
      return {
        success: false,
        error: 'Failed to fetch account',
      };
    }
  }

  /**
   * Create default accounts for new user (USD, EUR, CNY)
   */
  async createDefaultAccounts(userId: string): Promise<ApiResponse<Account[]>> {
    // Guest mode - create mock accounts in localStorage
    if (userId === 'guest-user') {
      const defaultCurrencies = ['USD', 'EUR', 'CNY'];
      const guestAccounts: Account[] = defaultCurrencies.map(currency => ({
        id: `guest-account-${currency.toLowerCase()}`,
        userId: 'guest-user',
        currencyCode: currency,
        balance: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      // Store in localStorage for guest mode
      try {
        await LocalStorage.setItem(`${this.CACHE_KEY}_guest-user`, guestAccounts);
        return {
          success: true,
          data: guestAccounts,
          message: `Created ${guestAccounts.length} guest accounts`,
        };
      } catch (error) {
        return {
          success: false,
          error: 'Failed to create guest accounts',
        };
      }
    }

    // Regular database mode for real users
    const defaultCurrencies = ['USD', 'EUR', 'CNY'];
    const createdAccounts: Account[] = [];
    const errors: string[] = [];

    for (const currency of defaultCurrencies) {
      const result = await this.createAccount({
        user_id: userId,
        currency_code: currency,
        initial_balance: 0,
      });

      if (result.success && result.data) {
        createdAccounts.push(result.data);
      } else {
        errors.push(`Failed to create ${currency} account: ${result.error}`);
      }
    }

    if (createdAccounts.length === 0) {
      return {
        success: false,
        error: `Failed to create any accounts: ${errors.join(', ')}`,
      };
    }

    return {
      success: true,
      data: createdAccounts,
      message: `Created ${createdAccounts.length} accounts. ${errors.length > 0 ? `Errors: ${errors.join(', ')}` : ''}`,
    };
  }
}

export default AccountRepository.getInstance();