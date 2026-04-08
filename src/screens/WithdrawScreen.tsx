import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Fonts, Spacing } from '@/utils/config';
import { useTheme } from '@/context/ThemeContext';
import { useApp } from '@/context/AppContext';
import { hapticService } from '@/services/hapticService';

type RootStackParamList = {
  Withdraw: { accountId?: string; currencyCode?: string };
};

type WithdrawScreenRouteProp = RouteProp<RootStackParamList, 'Withdraw'>;

const showAlert = (title: string, message: string) => {
  if (Platform.OS === 'web') {
    alert(`${title}: ${message}`);
  } else {
    Alert.alert(title, message);
  }
};

export default function WithdrawScreen() {
  const { colors } = useTheme();
  const route = useRoute<WithdrawScreenRouteProp>();
  const { state, createWithdrawal } = useApp();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const accounts = state.accounts || [];
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    route.params?.accountId || (accounts.length > 0 ? accounts[0].id : null)
  );
  const [showPicker, setShowPicker] = useState(false);

  const selectedAccount = selectedAccountId
    ? accounts.find(acc => acc.id === selectedAccountId) || null
    : null;

  const handleWithdraw = async () => {
    if (!selectedAccount) {
      showAlert('Error', 'No account selected');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      showAlert('Error', 'Please enter a valid amount');
      return;
    }

    if (numAmount > selectedAccount.balance) {
      showAlert('Error', 'Insufficient balance');
      return;
    }

    setLoading(true);
    hapticService.impactLight();

    try {
      const success = await createWithdrawal(selectedAccount.id, numAmount, 'Withdraw money');

      setLoading(false);

      if (success) {
        hapticService.notificationSuccess();
        showAlert('Success', `$${numAmount} withdrawn from your ${selectedAccount.currencyCode} wallet`);
        setAmount('');
      } else {
        hapticService.notificationError();
        showAlert('Error', 'Failed to withdraw money');
      }
    } catch (error) {
      setLoading(false);
      hapticService.notificationError();
      showAlert('Error', 'Network error');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Withdraw Money</Text>

        {accounts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No accounts available.
            </Text>
          </View>
        ) : showPicker || !selectedAccount ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Select an account to withdraw from:
            </Text>
            {accounts.map((acc) => (
              <TouchableOpacity
                key={acc.id}
                style={[styles.accountSelectButton, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}
                onPress={() => { setSelectedAccountId(acc.id); setShowPicker(false); }}
              >
                <Text style={[styles.accountSelectText, { color: colors.primary }]}>
                  {acc.currencyCode} Account - ${acc.balance}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <>
            <View style={styles.accountInfo}>
              <Text style={[styles.accountText, { color: colors.textSecondary }]}>
                Withdrawing from: {selectedAccount.currencyCode} Account
              </Text>
              <Text style={[styles.balanceText, { color: colors.text }]}>
                Current Balance: ${selectedAccount.balance}
              </Text>

              {accounts.length > 1 && (
                <TouchableOpacity
                  style={[styles.changeAccountButton, { borderColor: colors.border }]}
                  onPress={() => setShowPicker(true)}
                >
                  <Text style={[styles.changeAccountText, { color: colors.primary }]}>
                    Change Account
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Amount ($)</Text>
              <TextInput
                style={[styles.amountInput, { borderColor: colors.border, color: colors.text }]}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                placeholder="Enter amount"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.withdrawButton,
                { backgroundColor: colors.error },
                (!amount || loading) && { opacity: 0.6 },
              ]}
              onPress={handleWithdraw}
              disabled={!amount || loading}
            >
              <Text style={[styles.withdrawButtonText, { color: colors.surface }]}>
                {loading ? 'Withdrawing...' : 'Withdraw Funds'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: Spacing.lg },
  title: { fontSize: 24, fontFamily: Fonts.bold, marginBottom: Spacing.lg, textAlign: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: -Spacing.xl },
  emptyText: { fontSize: 16, fontFamily: Fonts.regular, textAlign: 'center', marginBottom: Spacing.xl, lineHeight: 24 },
  accountInfo: { marginBottom: Spacing.xl, alignItems: 'center' },
  accountText: { fontSize: 16, fontFamily: Fonts.medium },
  balanceText: { fontSize: 18, fontFamily: Fonts.semibold, marginTop: Spacing.sm },
  changeAccountButton: { borderWidth: 1, borderRadius: 6, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, marginTop: Spacing.sm },
  changeAccountText: { fontSize: 14, fontFamily: Fonts.medium },
  accountSelectButton: { padding: Spacing.md, borderRadius: 8, alignItems: 'center', marginBottom: Spacing.sm, minWidth: 250 },
  accountSelectText: { fontSize: 16, fontFamily: Fonts.semibold },
  inputContainer: { marginBottom: Spacing.xl },
  inputLabel: { fontSize: 16, fontFamily: Fonts.medium, marginBottom: Spacing.sm },
  amountInput: { borderWidth: 1, borderRadius: 8, padding: Spacing.md, fontSize: 18, fontFamily: Fonts.regular },
  withdrawButton: { padding: Spacing.md, borderRadius: 8, alignItems: 'center', marginTop: Spacing.lg },
  withdrawButtonText: { fontSize: 16, fontFamily: Fonts.semibold },
});
