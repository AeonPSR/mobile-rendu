import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Modal,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { WalletStackParamList } from '@/navigation/MainNavigator';
import { Fonts, Spacing } from '@/utils/config';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import { hapticService } from '@/services/hapticService';
import { formatCurrency, getCurrencyFlag, getCurrencySymbol } from '@/utils/helpers';

type WalletScreenNavigationProp = StackNavigationProp<WalletStackParamList, 'Wallet'>;

interface Props {
  navigation: WalletScreenNavigationProp;
}


export default function WalletScreen({ navigation }: Props) {
  const { state, createAccount } = useApp();
  const { colors } = useTheme();
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [creatingAccount, setCreatingAccount] = useState(false);
  
  // Use real accounts from state
  const accounts = state.accounts || [];
  const primaryAccount = accounts.length > 0 ? accounts[0] : null;

  const ALL_CURRENCIES = [
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'JPY', name: 'Japanese Yen' },
    { code: 'CNY', name: 'Chinese Yuan' },
    { code: 'CAD', name: 'Canadian Dollar' },
    { code: 'AUD', name: 'Australian Dollar' },
  ];

  const ownedCodes = accounts.map((a: any) => a.currencyCode);
  const availableCurrencies = ALL_CURRENCIES.filter(c => !ownedCodes.includes(c.code));

  const handleCreateWallet = async (currencyCode: string) => {
    setCreatingAccount(true);
    hapticService.impactLight();
    const success = await createAccount(currencyCode);
    setCreatingAccount(false);
    setShowCurrencyModal(false);
    if (success) {
      hapticService.notificationSuccess();
    } else {
      hapticService.notificationError();
      if (Platform.OS === 'web') {
        alert('Failed to create wallet');
      } else {
        Alert.alert('Error', 'Failed to create wallet');
      }
    }
  };

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
          <TouchableOpacity onPress={() => { hapticService.selectionChanged(); navigation.navigate('Settings'); }}>
            <Ionicons name="person-circle-outline" size={32} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>My Wallet</Text>
          <TouchableOpacity onPress={() => hapticService.selectionChanged()}>
            <Ionicons name="notifications-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Currency Cards */}
        <FlatList
          data={[...accounts, ...(availableCurrencies.length > 0 ? [{ id: '__add__' }] : [])]}
          renderItem={({ item }) => {
            if (item.id === '__add__') {
              return (
                <TouchableOpacity
                  style={[styles.accountCard, styles.addWalletCard, { backgroundColor: colors.surface, borderColor: colors.primary }]}
                  onPress={() => { hapticService.selectionChanged(); setShowCurrencyModal(true); }}
                >
                  <Ionicons name="add-circle-outline" size={28} color={colors.primary} />
                  <Text style={[styles.addWalletLabel, { color: colors.primary }]}>New Wallet</Text>
                </TouchableOpacity>
              );
            }
            return renderAccountCard({ item });
          }}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.accountsList}
          contentContainerStyle={styles.accountsListContent}
        />

        {/* Currency Picker Modal */}
        <Modal visible={showCurrencyModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>  
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Add Wallet</Text>
                <TouchableOpacity onPress={() => setShowCurrencyModal(false)}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
              {creatingAccount ? (
                <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 24 }} />
              ) : (
                availableCurrencies.map(c => (
                  <TouchableOpacity
                    key={c.code}
                    style={[styles.currencyRow, { borderBottomColor: colors.border }]}
                    onPress={() => handleCreateWallet(c.code)}
                  >
                    <Text style={styles.currencyFlag}>{getCurrencyFlag(c.code)}</Text>
                    <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                      <Text style={[styles.currencyCode, { color: colors.text }]}>{c.code}</Text>
                      <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{c.name}</Text>
                    </View>
                    <Text style={{ color: colors.textSecondary }}>{getCurrencySymbol(c.code)}</Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </View>
        </Modal>

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
  addWalletCard: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  addWalletLabel: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: Spacing.lg,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: Fonts.semibold,
  },
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
