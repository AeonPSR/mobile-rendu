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
import { Fonts, Spacing } from '@/utils/config';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import { hapticService } from '@/services/hapticService';
import { formatCurrency, getCurrencyFlag } from '@/utils/helpers';

type WalletScreenNavigationProp = StackNavigationProp<WalletStackParamList, 'Wallet'>;

interface Props {
  navigation: WalletScreenNavigationProp;
}


export default function WalletScreen({ navigation }: Props) {
  const { state } = useApp();
  const { colors } = useTheme();
  
  // Use real accounts from state
  const accounts = state.accounts || [];
  const primaryAccount = accounts.length > 0 ? accounts[0] : null;

  const handleAddMoney = () => {
    hapticService.impactLight();
    navigation.navigate('AddMoney');
  };

  const handleTransfer = () => {
    hapticService.impactLight();
    navigation.navigate('Transfer');
  };

  const handleWithdraw = () => {
    hapticService.impactLight();
    navigation.navigate('Withdraw');
  };

  const renderAccountCard = ({ item }: { item: any }) => (
    <View style={[styles.accountCard, { backgroundColor: colors.surface }]}>
      <View style={styles.accountHeader}>
        <Text style={styles.currencyFlag}>{item.currency?.flag || getCurrencyFlag(item.currencyCode)}</Text>
        <Text style={[styles.currencyCode, { color: colors.text }]}>{item.currencyCode}</Text>
        <TouchableOpacity onPress={() => {
          hapticService.selectionChanged();
          navigation.navigate('AddMoney', { accountId: item.id, currencyCode: item.currencyCode });
        }}>
          <Ionicons name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>
      <Text style={[styles.accountBalance, { color: colors.text }]}>
        {formatCurrency(item.balance, item.currencyCode)}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => hapticService.selectionChanged()}>
            <Ionicons name="person-circle-outline" size={32} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>My Wallet</Text>
          <TouchableOpacity onPress={() => hapticService.selectionChanged()}>
            <Ionicons name="notifications-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Currency Cards */}
        <FlatList
          data={accounts}
          renderItem={renderAccountCard}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.accountsList}
          contentContainerStyle={styles.accountsListContent}
        />

        {/* Main Balance */}
        <View style={styles.balanceSection}>
          <Text style={[styles.balanceLabel, { color: colors.textSecondary }]}>Balance</Text>
          <Text style={[styles.balanceAmount, { color: colors.text }]}>
            {primaryAccount ? 
              formatCurrency(primaryAccount.balance, primaryAccount.currencyCode) : 
              'No accounts yet'
            }
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.actionButton} onPress={handleAddMoney}>
            <View style={[styles.actionIcon, { backgroundColor: colors.primary }]}>
              <Ionicons name="add" size={24} color={colors.surface} />
            </View>
            <Text style={[styles.actionLabel, { color: colors.text }]}>Add</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleTransfer}>
            <View style={[styles.actionIcon, { backgroundColor: colors.primary }]}>
              <Ionicons name="arrow-up" size={24} color={colors.surface} />
            </View>
            <Text style={[styles.actionLabel, { color: colors.text }]}>Send</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleWithdraw}>
            <View style={[styles.actionIcon, { backgroundColor: colors.error }]}>
              <Ionicons name="remove" size={24} color={colors.surface} />
            </View>
            <Text style={[styles.actionLabel, { color: colors.text }]}>Withdraw</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  accountsList: {
    marginTop: Spacing.md,
  },
  accountsListContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  accountCard: {
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
    flex: 1,
    marginLeft: Spacing.sm,
  },
  accountBalance: {
    fontSize: 16,
    fontFamily: Fonts.semibold,
  },
  balanceSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  balanceLabel: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    marginBottom: Spacing.sm,
  },
  balanceAmount: {
    fontSize: 36,
    fontFamily: Fonts.bold,
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
  },
});
