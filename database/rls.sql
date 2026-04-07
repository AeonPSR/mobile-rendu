-- Row Level Security (RLS) Policies
-- Run this AFTER schema.sql

-- Enable RLS on all tables
alter table public.users enable row level security;
alter table public.accounts enable row level security;
alter table public.transactions enable row level security;
-- currencies and exchange_rates are public reference data, no RLS needed

-- Users table policies
-- Users can only see and update their own profile
create policy "Users can view their own profile"
    on public.users for select
    using (auth.uid()::text = id::text);

create policy "Users can update their own profile"
    on public.users for update
    using (auth.uid()::text = id::text);

-- Note: Insert is handled by the signup process
-- No delete policy - users cannot delete their own account

-- Accounts table policies
-- Users can only see and manage their own accounts
create policy "Users can view their own accounts"
    on public.accounts for select
    using (auth.uid()::text = user_id::text);

create policy "Users can create their own accounts"
    on public.accounts for insert
    with check (auth.uid()::text = user_id::text);

create policy "Users can update their own accounts"
    on public.accounts for update
    using (auth.uid()::text = user_id::text);

-- Users cannot delete accounts (for audit trail)
-- create policy "Users can delete their own accounts"
--     on public.accounts for delete
--     using (auth.uid()::text = user_id::text);

-- Transactions table policies
-- Users can only see transactions involving their accounts
create policy "Users can view their own transactions"
    on public.transactions for select
    using (
        auth.uid()::text = user_id::text
        or 
        exists (
            select 1 from public.accounts 
            where id = transactions.from_account_id 
            and user_id::text = auth.uid()::text
        )
        or
        exists (
            select 1 from public.accounts 
            where id = transactions.to_account_id 
            and user_id::text = auth.uid()::text
        )
    );

create policy "Users can create transactions for their accounts"
    on public.transactions for insert
    with check (
        auth.uid()::text = user_id::text
        and
        -- Ensure user owns the from_account if specified
        (from_account_id is null or exists (
            select 1 from public.accounts 
            where id = from_account_id 
            and user_id::text = auth.uid()::text
        ))
        and
        -- Ensure user owns the to_account if specified
        (to_account_id is null or exists (
            select 1 from public.accounts 
            where id = to_account_id 
            and user_id::text = auth.uid()::text
        ))
    );

-- Transactions cannot be updated or deleted once created (for audit trail)
-- This ensures transaction integrity

-- Grant permissions to authenticated users
grant usage on schema public to authenticated;
grant all on public.users to authenticated;
grant all on public.accounts to authenticated;
grant all on public.transactions to authenticated;
grant select on public.currencies to authenticated;
grant select on public.exchange_rates to authenticated;

-- Grant permissions for sequences (if any)
grant usage, select on all sequences in schema public to authenticated;