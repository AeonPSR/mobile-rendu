# Database Setup Instructions

This folder contains the SQL scripts to set up your Supabase database for the International Wallet app.

## Setup Order

Run these scripts in your Supabase SQL Editor **in this exact order**:

### 1. `schema.sql` - Create Tables & Constraints
```sql
-- Copy and paste the entire content of schema.sql
-- This creates all tables, indexes, and constraints
```

### 2. `rls.sql` - Row Level Security Policies  
```sql
-- Copy and paste the entire content of rls.sql
-- This sets up security policies to protect user data
```

### 3. `seed.sql` - Initial Data
```sql
-- Copy and paste the entire content of seed.sql
-- This loads supported currencies and exchange rates
```

## Database Schema Overview

### Core Tables

- **`users`** - User accounts and authentication data
- **`currencies`** - Supported currencies (USD, EUR, CNY, etc.)
- **`accounts`** - User wallet accounts per currency
- **`exchange_rates`** - Currency exchange rates
- **`transactions`** - All financial transactions

### Key Features

- **Row Level Security (RLS)** - Users can only access their own data
- **Audit Trail** - Transactions cannot be deleted/modified
- **Currency Support** - 10 major currencies with exchange rates
- **Transaction Types** - Transfer, conversion, top-up, withdrawal
- **Balance Constraints** - Prevents negative balances
- **Unique Constraints** - One account per user per currency

## Environment Variables

After database setup, update your `.env` file:

```env
EXPO_PUBLIC_SUPABASE_URL=your-project-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Get these values from your Supabase project dashboard under Settings > API.

## Testing the Setup

1. Run all SQL scripts in order
2. Check that tables are created:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```

3. Verify currencies are loaded:
   ```sql
   SELECT * FROM currencies;
   ```

4. Test user signup in the app - it should create a user record

## Security Notes

- **Demo Only**: Password storage is plain text for demo purposes
- **Production**: Hash passwords with bcrypt or similar
- **RLS**: All user data is protected by Row Level Security
- **API Keys**: Keep Supabase keys secure, never commit to git

## Troubleshooting

**"relation does not exist"** - Run `schema.sql` first

**"permission denied"** - Run `rls.sql` to set up policies  

**"insert violates foreign key"** - Run `seed.sql` to load currencies

**Auth issues** - Check that RLS policies match your auth setup

## Next Steps

After database setup:
1. Update repositories to use real database calls
2. Replace mock data in screens with API calls
3. Test complete user flows (signup → add money → convert)
4. Implement real-time exchange rate updates