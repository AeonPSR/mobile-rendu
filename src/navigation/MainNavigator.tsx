import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/utils/config';

// Import screens
import WalletScreen from '@/screens/WalletScreen';
import TransactionsScreen from '@/screens/TransactionsScreen';
import ConversionScreen from '@/screens/ConversionScreen';
import SettingsScreen from '@/screens/SettingsScreen';
import TransactionDetailScreen from '@/screens/TransactionDetailScreen';
import AddMoneyScreen from '@/screens/AddMoneyScreen';
import TransferScreen from '@/screens/TransferScreen';

// Type definitions for navigation
export type MainTabParamList = {
  WalletTab: undefined;
  TransactionsTab: undefined;
  ConvertTab: undefined;
  SettingsTab: undefined;
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

export type ConversionStackParamList = {
  Conversion: undefined;
};

export type SettingsStackParamList = {
  Settings: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const WalletStack = createStackNavigator<WalletStackParamList>();
const TransactionStack = createStackNavigator<TransactionStackParamList>();
const ConversionStack = createStackNavigator<ConversionStackParamList>();
const SettingsStack = createStackNavigator<SettingsStackParamList>();

// Stack Navigators
function WalletNavigator() {
  return (
    <WalletStack.Navigator>
      <WalletStack.Screen 
        name="Wallet" 
        component={WalletScreen}
        options={{ 
          title: 'My Wallet',
          headerStyle: { backgroundColor: Colors.background },
          headerTitleStyle: { color: Colors.text },
        }}
      />
      <WalletStack.Screen 
        name="AddMoney" 
        component={AddMoneyScreen}
        options={{ 
          title: 'Add Money',
          headerStyle: { backgroundColor: Colors.background },
          headerTitleStyle: { color: Colors.text },
        }}
      />
      <WalletStack.Screen 
        name="Transfer" 
        component={TransferScreen}
        options={{ 
          title: 'Transfer',
          headerStyle: { backgroundColor: Colors.background },
          headerTitleStyle: { color: Colors.text },
        }}
      />
    </WalletStack.Navigator>
  );
}

function TransactionsNavigator() {
  return (
    <TransactionStack.Navigator>
      <TransactionStack.Screen 
        name="Transactions" 
        component={TransactionsScreen}
        options={{ 
          title: 'Transactions',
          headerStyle: { backgroundColor: Colors.background },
          headerTitleStyle: { color: Colors.text },
        }}
      />
      <TransactionStack.Screen 
        name="TransactionDetail" 
        component={TransactionDetailScreen}
        options={{ 
          title: 'Transaction Details',
          headerStyle: { backgroundColor: Colors.background },
          headerTitleStyle: { color: Colors.text },
        }}
      />
    </TransactionStack.Navigator>
  );
}

function ConversionNavigator() {
  return (
    <ConversionStack.Navigator>
      <ConversionStack.Screen 
        name="Conversion" 
        component={ConversionScreen}
        options={{ 
          title: 'Convert Currency',
          headerStyle: { backgroundColor: Colors.background },
          headerTitleStyle: { color: Colors.text },
        }}
      />
    </ConversionStack.Navigator>
  );
}

function SettingsNavigator() {
  return (
    <SettingsStack.Navigator>
      <SettingsStack.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ 
          title: 'Settings',
          headerStyle: { backgroundColor: Colors.background },
          headerTitleStyle: { color: Colors.text },
        }}
      />
    </SettingsStack.Navigator>
  );
}

// Main Tab Navigator
export default function MainNavigator() {
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
            case 'ConvertTab':
              iconName = focused ? 'swap-horizontal' : 'swap-horizontal-outline';
              break;
            case 'SettingsTab':
              iconName = focused ? 'settings' : 'settings-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
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
      <Tab.Screen
        name="ConvertTab"
        component={ConversionNavigator}
        options={{ tabBarLabel: 'Convert' }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsNavigator}
        options={{ tabBarLabel: 'Settings' }}
      />
    </Tab.Navigator>
  );
}