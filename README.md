# International Wallet Mobile App

A cross-platform React Native application for international currency conversion and wallet management, built with TypeScript and Expo.

## 🏗️ Architecture

This app follows a clean 3-layer architecture pattern:

### **UI Layer (Presentation)**
- **Screens**: Login, Register, Wallet, Transactions, Conversion, Settings, etc.
- **Components**: Reusable UI components
- **Navigation**: Stack and Tab navigation setup
- **Context**: State management with React Context

### **Business Layer (Logic)**
- **Services**: Business logic and use cases
- **Utilities**: Helper functions and validation
- **Context**: App state management and actions

### **Data Layer (Persistence)**
- **Repositories**: Data access abstractions
- **Models**: TypeScript interfaces and types
- **Local Storage**: Offline-first approach with AsyncStorage
- **Supabase**: Remote data synchronization

## 🎯 Features

### **Core Functionality**
- ✅ **Authentication**: Email/password signup and login via Supabase
- ✅ **Multi-Currency Wallet**: Support for USD, EUR, CNY, and other currencies
- ✅ **Currency Conversion**: Real-time exchange rate calculations
- ✅ **Transaction History**: Track all wallet activities
- ✅ **Offline Support**: Local-first data storage with remote sync

### **Required Features (8+ Screens)**
1. **Login/Register** - User authentication
2. **Wallet Dashboard** - Main balance and account overview
3. **Transactions List** - History of all transactions
4. **Currency Conversion** - Exchange between currencies with keypad
5. **Transaction Details** - Detailed view of specific transactions
6. **Add Money** - Top-up wallet functionality
7. **Transfer Money** - Send money between accounts
8. **Settings** - Profile, preferences, and logout

### **Native Features** (Ready for Implementation)
- 📸 **Camera**: Receipt scanning for expense tracking
- 📍 **Geolocation**: Location-based currency suggestions
- 🔔 **Notifications**: Transaction alerts and rate changes
- 🔒 **Secure Storage**: Token and sensitive data protection

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- Expo CLI
- iOS Simulator or Android Emulator

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure Supabase** (update `.env`):
   ```
   EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

4. **Run on device/simulator**:
   ```bash
   npm run ios    # iOS Simulator
   npm run android # Android Emulator
   ```

## 📱 App Structure

```
src/
├── components/         # Reusable UI components
├── screens/           # Application screens
│   ├── LoginScreen.tsx
│   ├── RegisterScreen.tsx
│   ├── WalletScreen.tsx
│   ├── TransactionsScreen.tsx
│   ├── ConversionScreen.tsx
│   └── ...
├── navigation/        # Navigation configuration
│   ├── AuthNavigator.tsx
│   └── MainNavigator.tsx
├── context/           # App state management
│   └── AppContext.tsx
├── services/          # Business logic & API services
│   └── supabase.ts
├── repositories/      # Data access layer
│   ├── interfaces.ts
│   ├── authRepository.ts
│   └── localStorage.ts
├── models/           # TypeScript interfaces
│   └── index.ts
└── utils/            # Helper functions & config
    ├── config.ts
    └── helpers.ts
```

## 🎨 Design System

The app uses a consistent design system with:

- **Colors**: Primary blue (#007AFF), success green, error red
- **Typography**: System fonts with various weights
- **Spacing**: Consistent 8px grid system
- **Components**: Rounded corners, consistent shadows

## 🔄 Data Flow

1. **UI Layer**: User interactions trigger actions
2. **Context**: Actions update global state via reducers
3. **Repositories**: Abstract data access with offline-first approach
4. **Local Storage**: Immediate data persistence
5. **Supabase**: Remote synchronization when online

## 🛠️ Development Guidelines

### **Architecture Principles**
- ✅ Strict layer separation - no direct API calls from UI
- ✅ Offline-first approach - local storage prioritized
- ✅ Interface-based design for cross-platform compatibility
- ✅ TypeScript for complete type safety

### **Code Organization**
- Use absolute imports with path mapping (`@/components/...`)
- Follow consistent naming conventions
- Implement proper error handling
- Write meaningful TypeScript interfaces

## 🔧 Technology Stack

- **Frontend**: React Native + Expo
- **Language**: TypeScript
- **Navigation**: React Navigation v6
- **State Management**: React Context + Reducers
- **Backend**: Supabase (Auth + Database)
- **Storage**: AsyncStorage + SecureStore
- **Icons**: Expo Vector Icons

## 📋 TODO: Next Steps

1. **Complete Native Features**: Implement camera, notifications, geolocation
2. **Enhanced UI**: Add animations and micro-interactions
3. **Advanced Features**: Biometric auth, push notifications
4. **Testing**: Unit tests for business logic and repositories