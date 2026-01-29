// Utility functions for the app

import { Currency, Transaction, TransactionType } from '@/models';
import { Config } from './config';

export const formatCurrency = (
  amount: number,
  currencyCode: string,
  symbol?: string
): string => {
  const formattedAmount = amount.toFixed(Config.CURRENCY_DECIMAL_PLACES);
  const currencySymbol = symbol || getCurrencySymbol(currencyCode);
  
  // Handle negative amounts
  if (amount < 0) {
    return `-${currencySymbol}${Math.abs(amount).toFixed(Config.CURRENCY_DECIMAL_PLACES)}`;
  }
  
  return `${currencySymbol}${formattedAmount}`;
};

export const getCurrencySymbol = (currencyCode: string): string => {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CNY: '¥',
    CAD: 'C$',
    AUD: 'A$',
  };
  return symbols[currencyCode] || currencyCode;
};

export const getCurrencyFlag = (currencyCode: string): string => {
  const flags: Record<string, string> = {
    USD: '🇺🇸',
    EUR: '🇪🇺',
    GBP: '🇬🇧',
    JPY: '🇯🇵',
    CNY: '🇨🇳',
    CAD: '🇨🇦',
    AUD: '🇦🇺',
  };
  return flags[currencyCode] || '🌍';
};

export const formatTransactionAmount = (
  transaction: Transaction,
  showSign: boolean = true
): string => {
  let amount = transaction.amount;
  let prefix = '';
  
  if (showSign) {
    switch (transaction.type) {
      case TransactionType.TOP_UP:
      case TransactionType.CONVERSION:
        prefix = '+';
        break;
      case TransactionType.TRANSFER:
      case TransactionType.WITHDRAWAL:
      case TransactionType.PAYMENT:
        prefix = '-';
        break;
    }
  }
  
  const symbol = getCurrencySymbol(transaction.currency);
  return `${prefix}${symbol}${amount.toFixed(Config.CURRENCY_DECIMAL_PLACES)}`;
};

export const getTransactionColor = (transaction: Transaction): string => {
  switch (transaction.type) {
    case TransactionType.TOP_UP:
    case TransactionType.CONVERSION:
      return '#34C759'; // Green for incoming
    case TransactionType.TRANSFER:
    case TransactionType.WITHDRAWAL:
    case TransactionType.PAYMENT:
      return '#FF3B30'; // Red for outgoing
    default:
      return '#6D6D80'; // Gray for neutral
  }
};

export const formatDate = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffHours < 1) {
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    return `${diffMinutes}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return date.toLocaleDateString();
  }
};

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): {
  isValid: boolean;
  message?: string;
} => {
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  return { isValid: true };
};

export const generateTransactionId = (): string => {
  return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const calculateConversion = (
  amount: number,
  fromRate: number,
  toRate: number
): number => {
  // Convert to base currency (USD) then to target currency
  const baseAmount = amount / fromRate;
  return baseAmount * toRate;
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T => {
  let timeoutId: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T;
};

export const isValidAmount = (amount: string): boolean => {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0 && num < 1000000; // Max amount check
};