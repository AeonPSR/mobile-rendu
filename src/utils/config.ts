// Environment configuration
export const Config = {
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co',
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key',
  
  // Exchange Rate API (mock for now)
  EXCHANGE_API_URL: 'https://api.exchangerate-api.com/v4/latest',
  
  // App Configuration
  BASE_CURRENCY: 'USD',
  SUPPORTED_CURRENCIES: ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'CAD', 'AUD'],
  
  // Feature flags
  ENABLE_CAMERA: true,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_GEOLOCATION: true,
  
  // UI Configuration
  CURRENCY_DECIMAL_PLACES: 2,
  TRANSACTION_PAGE_SIZE: 20,
} as const;

export const Colors = {
  primary: '#007AFF',
  secondary: '#5856D6',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  background: '#F2F2F7',
  surface: '#FFFFFF',
  text: '#000000',
  textSecondary: '#6D6D80',
  border: '#C6C6C8',
  placeholder: '#3C3C43',
} as const;

export const Fonts = {
  regular: 'System',
  medium: 'System-Medium',
  semibold: 'System-Semibold',
  bold: 'System-Bold',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;