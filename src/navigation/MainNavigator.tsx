import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

// Import screens
import WalletScreen from '@/screens/WalletScreen';
import TransactionsScreen from '@/screens/TransactionsScreen';

import TransactionDetailScreen from '@/screens/TransactionDetailScreen';
import AddMoneyScreen from '@/screens/AddMoneyScreen';
import TransferScreen from '@/screens/TransferScreen';

// Type definitions for navigation
export type MainTabParamList = {
  WalletTab: undefined;
  TransactionsTab: undefined;
};

export type WalletStackParamList = {
  Wallet: undefined;
  AddMoney: undefined;
  Transfer: undefined;
};

export type TransactionStackParamList = {
  Transactions: undefined;
  TransactionDetail: { transactionId: string };
};



const Tab = createBottomTabNavigator<MainTabParamList>();
const WalletStack = createStackNavigator<WalletStackParamList>();
const TransactionStack = createStackNavigator<TransactionStackParamList>();


// Stack Navigators
function WalletNavigator() {
  const { colors } = useTheme();
  
  return (
    <WalletStack.Navigator>
      <WalletStack.Screen 
        name="Wallet" 
        component={WalletScreen}
        options={{ 
          title: 'My Wallet',
          headerStyle: { backgroundColor: colors.background },
          headerTitleStyle: { color: colors.text },
          headerTintColor: colors.primary,
        }}
      />
      <WalletStack.Screen 
        name="AddMoney" 
        component={AddMoneyScreen}
        options={{ 
          title: 'Add Money',
          headerStyle: { backgroundColor: colors.background },
          headerTitleStyle: { color: colors.text },
          headerTintColor: colors.primary,
        }}
      />
      <WalletStack.Screen 
        name="Transfer" 
        component={TransferScreen}
        options={{ 
          title: 'Transfer',
          headerStyle: { backgroundColor: colors.background },
          headerTitleStyle: { color: colors.text },
          headerTintColor: colors.primary,
        }}
      />
    </WalletStack.Navigator>
  );
}

function TransactionsNavigator() {
  const { colors } = useTheme();
  
  return (
    <TransactionStack.Navigator>
      <TransactionStack.Screen 
        name="Transactions" 
        component={TransactionsScreen}
        options={{ 
          title: 'Transactions',
          headerStyle: { backgroundColor: colors.background },
          headerTitleStyle: { color: colors.text },
          headerTintColor: colors.primary,
        }}
      />
      <TransactionStack.Screen 
        name="TransactionDetail" 
        component={TransactionDetailScreen}
        options={{ 
          title: 'Transaction Details',
          headerStyle: { backgroundColor: colors.background },
          headerTitleStyle: { color: colors.text },
          headerTintColor: colors.primary,
        }}
      />
    </TransactionStack.Navigator>
  );
}



// Main Tab Navigator
export default function MainNavigator() {
  const { colors } = useTheme();
  
  return (
    <Tab.Navigator
      initialRouteName="WalletTab"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'WalletTab':
              iconName = focused ? 'wallet' : 'wallet-outline';
              break;
            case 'TransactionsTab':
              iconName = focused ? 'list' : 'list-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
      })}
    >
      <Tab.Screen
        name="WalletTab"
        component={WalletNavigator}
        options={{ tabBarLabel: 'Wallet' }}
      />
      <Tab.Screen
        name="TransactionsTab"
        component={TransactionsNavigator}
        options={{ tabBarLabel: 'Transactions' }}
      />

    </Tab.Navigator>
  );
}