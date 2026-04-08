import { ApiResponse } from '@/models';
import SupabaseService from '@/services/supabase';
import LocalStorage from './localStorage';

export interface ExchangeRate {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  source: string;
  lastUpdated: Date;
}

export class ExchangeRateRepository {
  private static instance: ExchangeRateRepository;
  private readonly TABLE_NAME = 'exchange_rates';
  private readonly CACHE_KEY = 'exchange_rates';
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  public static getInstance(): ExchangeRateRepository {
    if (!ExchangeRateRepository.instance) {
      ExchangeRateRepository.instance = new ExchangeRateRepository();
    }
    return ExchangeRateRepository.instance;
  }

  /**
   * Get exchange rate between two currencies
   */
  async getExchangeRate(fromCurrency: string, toCurrency: string): Promise<ApiResponse<ExchangeRate>> {
    try {
      // Same currency = 1.0
      if (fromCurrency === toCurrency) {
        return {
          success: true,
          data: {
            fromCurrency,
            toCurrency,
            rate: 1.0,
            source: 'internal',
            lastUpdated: new Date(),
          },
        };
      }

      // Check cache first
      const cached = await this.getCachedRate(fromCurrency, toCurrency);
      if (cached) {
        return { success: true, data: cached };
      }

      const client = SupabaseService.getClient();
      
      const { data, error } = await client
        .from(this.TABLE_NAME)
        .select('*')
        .eq('from_currency', fromCurrency)
        .eq('to_currency', toCurrency)
        .single();

      if (error) {
        console.error('ExchangeRateRepository.getExchangeRate error:', error);
        
        // Try reverse rate (1 / rate)
        const reverseResult = await this.getReverseRate(fromCurrency, toCurrency);
        if (reverseResult.success) {
          return reverseResult;
        }

        return {
          success: false,
          error: `Exchange rate not found for ${fromCurrency}/${toCurrency}`,
        };
      }

      const rate: ExchangeRate = {
        fromCurrency: data.from_currency,
        toCurrency: data.to_currency,
        rate: parseFloat(data.rate),
        source: data.source,
        lastUpdated: new Date(data.last_updated),
      };

      // Cache result
      await this.cacheRate(rate);

      return {
        success: true,
        data: rate,
      };
    } catch (error) {
      console.error('ExchangeRateRepository.getExchangeRate error:', error);
      return {
        success: false,
        error: 'Failed to fetch exchange rate',
      };
    }
  }

  /**
   * Try to get reverse exchange rate (1 / rate)
   */
  private async getReverseRate(fromCurrency: string, toCurrency: string): Promise<ApiResponse<ExchangeRate>> {
    try {
      const client = SupabaseService.getClient();
      
      const { data, error } = await client
        .from(this.TABLE_NAME)
        .select('*')
        .eq('from_currency', toCurrency)
        .eq('to_currency', fromCurrency)
        .single();

      if (error || !data) {
        return { success: false, error: 'Reverse rate not found' };
      }

      const reverseRate: ExchangeRate = {
        fromCurrency,
        toCurrency,
        rate: 1 / parseFloat(data.rate),
        source: data.source + ' (reversed)',
        lastUpdated: new Date(data.last_updated),
      };

      // Cache result
      await this.cacheRate(reverseRate);

      return {
        success: true,
        data: reverseRate,
      };
    } catch (error) {
      return { success: false, error: 'Failed to get reverse rate' };
    }
  }

  /**
   * Get all exchange rates for a currency
   */
  async getCurrencyRates(currency: string): Promise<ApiResponse<ExchangeRate[]>> {
    try {
      const client = SupabaseService.getClient();
      
      const { data, error } = await client
        .from(this.TABLE_NAME)
        .select('*')
        .eq('from_currency', currency)
        .order('to_currency');

      if (error) {
        console.error('ExchangeRateRepository.getCurrencyRates error:', error);
        return {
          success: false,
          error: error.message,
        };
      }

      const rates: ExchangeRate[] = data.map(item => ({
        fromCurrency: item.from_currency,
        toCurrency: item.to_currency,
        rate: parseFloat(item.rate),
        source: item.source,
        lastUpdated: new Date(item.last_updated),
      }));

      return {
        success: true,
        data: rates,
      };
    } catch (error) {
      console.error('ExchangeRateRepository.getCurrencyRates error:', error);
      return {
        success: false,
        error: 'Failed to fetch currency rates',
      };
    }
  }

  /**
   * Update exchange rates (admin function)
   */
  async updateExchangeRates(rates: { from: string; to: string; rate: number; source?: string }[]): Promise<ApiResponse<void>> {
    try {
      const client = SupabaseService.getClient();
      
      const updates = rates.map(rate => ({
        from_currency: rate.from,
        to_currency: rate.to,
        rate: rate.rate,
        source: rate.source || 'api_update',
        last_updated: new Date().toISOString(),
      }));

      const { error } = await client
        .from(this.TABLE_NAME)
        .upsert(updates, {
          onConflict: 'from_currency,to_currency'
        });

      if (error) {
        console.error('ExchangeRateRepository.updateExchangeRates error:', error);
        return {
          success: false,
          error: error.message,
        };
      }

      // Clear cache after update
      await LocalStorage.removeItem(this.CACHE_KEY);

      return {
        success: true,
        message: `Updated ${updates.length} exchange rates`,
      };
    } catch (error) {
      console.error('ExchangeRateRepository.updateExchangeRates error:', error);
      return {
        success: false,
        error: 'Failed to update exchange rates',
      };
    }
  }

  /**
   * Calculate conversion amount
   */
  async calculateConversion(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<ApiResponse<{ amount: number; rate: number }>> {
    const rateResult = await this.getExchangeRate(fromCurrency, toCurrency);
    
    if (!rateResult.success || !rateResult.data) {
      return {
        success: false,
        error: rateResult.error || 'Could not get exchange rate',
      };
    }

    const convertedAmount = amount * rateResult.data.rate;
    
    return {
      success: true,
      data: {
        amount: Math.round(convertedAmount * 100) / 100, // Round to 2 decimals
        rate: rateResult.data.rate,
      },
    };
  }

  /**
   * Cache management
   */
  private async getCachedRate(fromCurrency: string, toCurrency: string): Promise<ExchangeRate | null> {
    try {
      const cached = await LocalStorage.getItem<{ [key: string]: ExchangeRate & { cachedAt: number } }>(this.CACHE_KEY);
      if (!cached) return null;

      const key = `${fromCurrency}_${toCurrency}`;
      const entry = cached[key];
      
      if (!entry) return null;

      // Check if cache expired
      if (Date.now() - entry.cachedAt > this.CACHE_DURATION) {
        return null;
      }

      return {
        fromCurrency: entry.fromCurrency,
        toCurrency: entry.toCurrency,
        rate: entry.rate,
        source: entry.source,
        lastUpdated: entry.lastUpdated,
      };
    } catch (error) {
      return null;
    }
  }

  private async cacheRate(rate: ExchangeRate): Promise<void> {
    try {
      const cached = await LocalStorage.getItem<{ [key: string]: ExchangeRate & { cachedAt: number } }>(this.CACHE_KEY) || {};
      
      const key = `${rate.fromCurrency}_${rate.toCurrency}`;
      cached[key] = {
        ...rate,
        cachedAt: Date.now(),
      };

      await LocalStorage.setItem(this.CACHE_KEY, cached);
    } catch (error) {
      console.warn('Failed to cache exchange rate:', error);
    }
  }
}

export default ExchangeRateRepository.getInstance();