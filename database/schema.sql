-- International Wallet Database Schema
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Users table (already exists from userRepository.ts)
create table if not exists public.users (
    id uuid default uuid_generate_v4() primary key,
    email text unique not null,
    password text not null, -- Demo only - should be hashed in production
    first_name text,
    last_name text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Currencies table (reference data)
create table if not exists public.currencies (
    code text primary key, -- USD, EUR, CNY, etc.
    name text not null,
    symbol text not null,
    flag text, -- emoji flag
    decimal_places integer default 2,
    is_active boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- User accounts (wallets) table
create table if not exists public.accounts (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.users(id) on delete cascade not null,
    currency_code text references public.currencies(code) not null,
    balance decimal(20,8) default 0 not null check (balance >= 0),
    is_active boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    
    -- Ensure one account per user per currency
    unique(user_id, currency_code)
);

-- Exchange rates table
create table if not exists public.exchange_rates (
    id uuid default uuid_generate_v4() primary key,
    from_currency text references public.currencies(code) not null,
    to_currency text references public.currencies(code) not null,
    rate decimal(20,8) not null check (rate > 0),
    source text default 'manual', -- API source name
    last_updated timestamp with time zone default timezone('utc'::text, now()) not null,
    
    -- Ensure unique currency pairs
    unique(from_currency, to_currency)
);

-- Transactions table
create table if not exists public.transactions (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.users(id) on delete cascade not null,
    
    -- Transaction type
    type text not null check (type in ('transfer', 'conversion', 'top_up', 'withdrawal')),
    
    -- Source account (null for top-ups from external)
    from_account_id uuid references public.accounts(id),
    from_amount decimal(20,8),
    from_currency text references public.currencies(code),
    
    -- Destination account (null for withdrawals to external)
    to_account_id uuid references public.accounts(id),
    to_amount decimal(20,8),
    to_currency text references public.currencies(code),
    
    -- Exchange rate used (for conversions)
    exchange_rate decimal(20,8),
    
    -- Transaction details
    description text,
    reference_id text, -- external reference if any
    status text default 'completed' check (status in ('pending', 'completed', 'failed', 'cancelled')),
    
    -- Metadata
    metadata jsonb, -- flexible field for additional data
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    
    -- Constraints
    check (
        -- At least one account must be specified
        (from_account_id is not null or to_account_id is not null)
        and
        -- For transfers, both accounts required
        (type != 'transfer' or (from_account_id is not null and to_account_id is not null))
        and  
        -- For conversions, both accounts required
        (type != 'conversion' or (from_account_id is not null and to_account_id is not null and exchange_rate is not null))
        and
        -- For top-ups, only to_account required
        (type != 'top_up' or to_account_id is not null)
        and
        -- Amounts must be positive
        (from_amount is null or from_amount > 0)
        and
        (to_amount is null or to_amount > 0)
    )
);

-- Indexes for performance
create index if not exists idx_accounts_user_id on public.accounts(user_id);
create index if not exists idx_accounts_currency on public.accounts(currency_code);
create index if not exists idx_transactions_user_id on public.transactions(user_id);
create index if not exists idx_transactions_type on public.transactions(type);
create index if not exists idx_transactions_created_at on public.transactions(created_at desc);
create index if not exists idx_transactions_from_account on public.transactions(from_account_id);
create index if not exists idx_transactions_to_account on public.transactions(to_account_id);
create index if not exists idx_exchange_rates_currencies on public.exchange_rates(from_currency, to_currency);

-- Updated timestamp triggers
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Apply updated_at triggers
create trigger handle_updated_at_users before update on public.users for each row execute procedure public.handle_updated_at();
create trigger handle_updated_at_accounts before update on public.accounts for each row execute procedure public.handle_updated_at();

-- Comments for documentation
comment on table public.users is 'User accounts and authentication';
comment on table public.currencies is 'Supported currencies reference data';
comment on table public.accounts is 'User wallet accounts per currency';
comment on table public.exchange_rates is 'Currency exchange rates';
comment on table public.transactions is 'All financial transactions (transfers, conversions, top-ups)';

comment on column public.accounts.balance is 'Account balance in the account currency';
comment on column public.transactions.type is 'Transaction type: transfer (between users), conversion (currency exchange), top_up (add money), withdrawal (remove money)';
comment on column public.transactions.exchange_rate is 'Exchange rate used for currency conversions (to_amount = from_amount * exchange_rate)';
comment on column public.transactions.metadata is 'Additional transaction data stored as JSON';