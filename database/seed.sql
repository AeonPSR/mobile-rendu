-- Initial data for International Wallet
-- Run this AFTER schema.sql and rls.sql

-- Insert supported currencies
insert into public.currencies (code, name, symbol, flag, decimal_places) values
    ('USD', 'US Dollar', '$', '🇺🇸', 2),
    ('EUR', 'Euro', '€', '🇪🇺', 2),
    ('CNY', 'Chinese Yuan', '¥', '🇨🇳', 2),
    ('GBP', 'British Pound', '£', '🇬🇧', 2),
    ('JPY', 'Japanese Yen', '¥', '🇯🇵', 0),
    ('CAD', 'Canadian Dollar', '$', '🇨🇦', 2),
    ('AUD', 'Australian Dollar', '$', '🇦🇺', 2),
    ('CHF', 'Swiss Franc', 'CHF', '🇨🇭', 2),
    ('SEK', 'Swedish Krona', 'kr', '🇸🇪', 2),
    ('NOK', 'Norwegian Krone', 'kr', '🇳🇴', 2)
on conflict (code) do nothing;

-- Insert initial exchange rates (approximate values - should use real API)
-- Format: 1 FROM_CURRENCY = rate TO_CURRENCY
insert into public.exchange_rates (from_currency, to_currency, rate, source) values
    -- USD base rates
    ('USD', 'EUR', 0.85, 'manual'),
    ('USD', 'CNY', 7.25, 'manual'),
    ('USD', 'GBP', 0.75, 'manual'),
    ('USD', 'JPY', 110.0, 'manual'),
    ('USD', 'CAD', 1.25, 'manual'),
    ('USD', 'AUD', 1.35, 'manual'),
    ('USD', 'CHF', 0.92, 'manual'),
    ('USD', 'SEK', 8.5, 'manual'),
    ('USD', 'NOK', 8.8, 'manual'),
    
    -- Reverse rates (EUR to others)
    ('EUR', 'USD', 1.18, 'manual'),
    ('EUR', 'CNY', 8.53, 'manual'),
    ('EUR', 'GBP', 0.88, 'manual'),
    ('EUR', 'JPY', 129.4, 'manual'),
    
    -- CNY rates
    ('CNY', 'USD', 0.138, 'manual'),
    ('CNY', 'EUR', 0.117, 'manual'),
    ('CNY', 'JPY', 15.17, 'manual'),
    
    -- GBP rates
    ('GBP', 'USD', 1.33, 'manual'),
    ('GBP', 'EUR', 1.14, 'manual'),
    ('GBP', 'CNY', 9.65, 'manual'),
    
    -- JPY rates
    ('JPY', 'USD', 0.0091, 'manual'),
    ('JPY', 'EUR', 0.0077, 'manual'),
    ('JPY', 'CNY', 0.066, 'manual'),
    
    -- Same currency rates (1:1)
    ('USD', 'USD', 1.0, 'manual'),
    ('EUR', 'EUR', 1.0, 'manual'),
    ('CNY', 'CNY', 1.0, 'manual'),
    ('GBP', 'GBP', 1.0, 'manual'),
    ('JPY', 'JPY', 1.0, 'manual'),
    ('CAD', 'CAD', 1.0, 'manual'),
    ('AUD', 'AUD', 1.0, 'manual'),
    ('CHF', 'CHF', 1.0, 'manual'),
    ('SEK', 'SEK', 1.0, 'manual'),
    ('NOK', 'NOK', 1.0, 'manual')
on conflict (from_currency, to_currency) do update set
    rate = excluded.rate,
    last_updated = now();

-- Create some example demo accounts for testing (optional)
-- These will be created when users sign up, but useful for development

-- Example: Create demo user accounts
-- Note: Replace with real user IDs after users are created
-- insert into public.accounts (user_id, currency_code, balance) values
--     ('your-user-id-here', 'USD', 150.56),
--     ('your-user-id-here', 'CNY', 246.63),
--     ('your-user-id-here', 'EUR', 85.20);

-- Example: Create demo transactions
-- insert into public.transactions (user_id, type, to_account_id, to_amount, to_currency, description) values
--     ('your-user-id-here', 'top_up', 'account-id-here', 100.00, 'USD', 'Initial wallet funding'),
--     ('your-user-id-here', 'top_up', 'account-id-here', 50.56, 'USD', 'Bank transfer deposit');

-- Verify setup
select 'Database setup complete! Tables created:' as message;
select table_name from information_schema.tables where table_schema = 'public' and table_name in ('users', 'currencies', 'accounts', 'exchange_rates', 'transactions');

select 'Currencies loaded:' as message;
select code, name, symbol, flag from public.currencies order by code;

select 'Exchange rates loaded:' as message;
select from_currency, to_currency, rate from public.exchange_rates where from_currency in ('USD', 'EUR', 'CNY') order by from_currency, to_currency;