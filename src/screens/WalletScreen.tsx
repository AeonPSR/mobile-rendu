import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { WalletStackParamList } from '@/navigation/MainNavigator';
import { Colors, Fonts, Spacing } from '@/utils/config';
import { useApp } from '@/context/AppContext';
import { formatCurrency, getCurrencyFlag } from '@/utils/helpers';

type WalletScreenNavigationProp = StackNavigationProp<WalletStackParamList, 'Wallet'>;

interface Props {
  navigation: WalletScreenNavigationProp;
}

// Mock data for demonstration
const mockAccounts = [
  { id: '1', currency: 'USD', balance: 150.56, flag: '🇺🇸' },
  { id: '2', currency: 'CNY', balance: 1014.902, flag: '🇨🇳' },
  { id: '3', currency: 'EUR', balance: 0, flag: '🇪🇺' },
];

const mockTransactions = [
  {
    id: '1',
    type: 'conversion',
    amount: '+¥1014.902',
    description: 'Conversion',
    time: '16:35 PM',
    color: Colors.success,
  },
  {
    id: '2',
    type: 'conversion',
    amount: '-$140.00',
    description: 'Conversion',
    time: '16:35 PM',
    color: Colors.error,
  },
  {
    id: '3',
    type: 'transfer',
    amount: '-¥253.62',
    description: 'Transfer',
    time: '15:20 PM',
    color: Colors.error,
  },
  {
    id: '4',
    type: 'top_up',
    amount: '+$100.00',
    description: 'Balance top-up',
    time: '14:15 PM',
    color: Colors.success,
  },
];

export default function WalletScreen({ navigation }: Props) {
  const { state } = useApp();
  const primaryAccount = mockAccounts[0]; // USD account as primary

  const handleAddMoney = () => {
    navigation.navigate('AddMoney');
  };

  const handleTransfer = () => {
    navigation.navigate('Transfer');
  };

  const renderAccountCard = ({ item }: { item: any }) => (
    <View style={styles.accountCard}>
      <View style={styles.accountHeader}>
        <Text style={styles.currencyFlag}>{item.flag}</Text>
        <Text style={styles.currencyCode}>{item.currency}</Text>
        <TouchableOpacity>
          <Ionicons name="add" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>
      <Text style={styles.accountBalance}>
        {formatCurrency(item.balance, item.currency)}
      </Text>
    </View>
  );

  const renderTransactionItem = ({ item }: { item: any }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionIcon}>
        <Ionicons 
          name={item.type === 'conversion' ? 'swap-horizontal' : 
                item.type === 'transfer' ? 'arrow-up' : 'add'} 
          size={20} 
          color={Colors.surface} 
        />
      </View>
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionDescription}>{item.description}</Text>
        <Text style={styles.transactionTime}>{item.time}</Text>
      </View>
      <Text style={[styles.transactionAmount, { color: item.color }]}>
        {item.amount}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity>
            <Ionicons name="person-circle-outline" size={32} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Wallet</Text>
          <TouchableOpacity>
            <Ionicons name="notifications-outline" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* Currency Cards */}
        <FlatList
          data={mockAccounts}
          renderItem={renderAccountCard}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.accountsList}
          contentContainerStyle={styles.accountsListContent}
        />

        {/* Main Balance */}
        <View style={styles.balanceSection}>
          <Text style={styles.balanceLabel}>Balance</Text>
          <Text style={styles.balanceAmount}>
            {formatCurrency(primaryAccount.balance, primaryAccount.currency)}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.actionButton} onPress={handleAddMoney}>
            <View style={styles.actionIcon}>
              <Ionicons name="add" size={24} color={Colors.surface} />
            </View>
            <Text style={styles.actionLabel}>Add</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleTransfer}>
            <View style={styles.actionIcon}>
              <Ionicons name="arrow-up" size={24} color={Colors.surface} />
            </View>
            <Text style={styles.actionLabel}>Send</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionIcon}>
              <Ionicons name="swap-horizontal" size={24} color={Colors.surface} />
            </View>
            <Text style={styles.actionLabel}>Convert</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionIcon}>
              <Ionicons name="ellipsis-horizontal" size={24} color={Colors.surface} />
            </View>
            <Text style={styles.actionLabel}>More</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Transactions */}
        <View style={styles.transactionsSection}>
          <View style={styles.transactionsHeader}>
            <Text style={styles.transactionsTitle}>Transactions</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View all</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={mockTransactions}
            renderItem={renderTransactionItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: Fonts.semibold,
    color: Colors.text,
  },
  accountsList: {
    marginTop: Spacing.md,
  },
  accountsListContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  accountCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.md,
    width: 120,
    marginRight: Spacing.md,
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  currencyFlag: {
    fontSize: 20,
  },
  currencyCode: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: Colors.text,
    flex: 1,
    marginLeft: Spacing.sm,
  },
  accountBalance: {
    fontSize: 16,
    fontFamily: Fonts.semibold,
    color: Colors.text,
  },
  balanceSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  balanceLabel: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  balanceAmount: {
    fontSize: 36,
    fontFamily: Fonts.bold,
    color: Colors.text,
  },
  actionsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIcon: {
    backgroundColor: Colors.text,
    borderRadius: 24,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  actionLabel: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: Colors.text,
  },
  transactionsSection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  transactionsTitle: {
    fontSize: 18,
    fontFamily: Fonts.semibold,
    color: Colors.text,
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: Colors.primary,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  transactionIcon: {
    backgroundColor: Colors.textSecondary,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: Colors.text,
  },
  transactionTime: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontFamily: Fonts.semibold,
  },
});