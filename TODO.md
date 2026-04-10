# International Wallet - Remaining Tasks

## ✅ Done

### Backend & Data
- [x] Supabase tables: accounts, transactions, exchange_rates
- [x] RLS policies
- [x] All repositories: Account, Transaction, ExchangeRate
- [x] AppContext integration (auto-load, CRUD, conversions)

### Screens (all required screens functional)
- [x] **Auth**: Login / Register via Supabase
- [x] **Wallet (list)**: real accounts, empty state, nav to Add/Convert
- [x] **AddMoney (add/edit)**: form, validation, Supabase write, haptic feedback
- [x] **Transfer (add/edit)**: account picker, validation, Supabase write
- [x] **Conversion (add/edit)**: real exchange rates, conversion execution
- [x] **Transactions (list)**: real data, types/icons/dates, empty state
- [x] **Transaction Detail (detail)**: accepts ID param, displays info
- [x] **Settings**: profile edit, sign out, theme toggle

---

## 🔲 Remaining (requirement-relevant)

### Detail Screen (required: modify/delete actions)
- [x] TransactionDetailScreen: show real transaction data (amount, type, date, accounts)
- [x] Add delete transaction action
- [x] Add edit/modify transaction action (edit description)

### List Screen (required: delete from list)
- [x] TransactionsScreen: tap navigates to detail → delete from there

### Deliverables
- [x] README: launch instructions, tech choices, implemented features
- [x] `.env.example` template

---

## Priority Order
1. Native feature integration (notifications)
2. Offline/error handling polish
3. README + screenshots + video