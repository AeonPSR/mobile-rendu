# International Wallet

Cross-platform React Native (Expo) app for multi-currency wallet management.

## Tech Stack

- **React Native** + **Expo SDK 54** (TypeScript)
- **Supabase** — Auth (email/password) + Postgres database + RLS
- **React Navigation** v6 — Stack + Bottom Tabs
- **React Context** + useReducer — State management
- **AsyncStorage** — Offline cache
- **expo-haptics** — Native haptic feedback
- **expo-notifications** — Local push notifications
- **expo-secure-store** — Secure token storage on mobile

## Architecture

3-layer separation:

| Layer | Folder | Role |
|-------|--------|------|
| **UI** | `screens/`, `components/`, `navigation/` | Presentation only, no API calls |
| **Business** | `context/`, `services/` | State management, orchestration |
| **Data** | `repositories/`, `models/` | Supabase API, local cache, data mapping |

## Features

- **Auth**: Register, login, logout (Supabase). All data scoped to user via RLS.
- **Wallet**: View accounts, create new currency wallets (USD, EUR, GBP, JPY, CNY, CAD, AUD)
- **Transactions**: Add money, transfer between accounts, currency conversion
- **Detail screen**: View transaction details, edit description, delete
- **Settings**: Theme toggle (dark/light), profile info, notification permissions, sign out
- **Native**: Haptic feedback on actions, local push notifications on transactions
- **Offline**: Cache-first data loading, orange banner when offline, cached data displayed

## Screens

1. Login / Register (auth)
2. Wallet dashboard (list, add wallet)
3. Add Money (form)
4. Transfer (form)
5. Currency Conversion (form)
6. Transactions list (list → detail)
7. Transaction Detail (view, edit, delete)
8. Settings

## Getting Started

### Prerequisites

- Node.js 16+
- Expo Go on phone (iOS/Android) or an emulator

### Setup

```bash
# Install dependencies
npm install

# Copy env and fill in your Supabase credentials
cp .env.example .env

# Start dev server
npm start
```

Scan QR code with Expo Go, or press `w` for web, `a` for Android emulator.

### Database

SQL files in `database/`:
- `schema.sql` — Tables (accounts, transactions, currencies, exchange_rates)
- `rls.sql` — Row-level security policies
- `seed.sql` — Default currencies and exchange rates

Run these in your Supabase SQL editor in order.

## Project Structure

```
src/
├── components/      # OfflineBanner
├── context/         # AppContext (state), ThemeContext
├── models/          # TypeScript interfaces
├── navigation/      # AuthNavigator, MainNavigator
├── repositories/    # Supabase data access + cache
├── screens/         # All 8+ screens
├── services/        # supabase client, hapticService, notificationService
└── utils/           # config, helpers
```