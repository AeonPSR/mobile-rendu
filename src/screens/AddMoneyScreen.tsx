import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Fonts, Spacing } from '@/utils/config';
import { useTheme } from '@/context/ThemeContext';
import { useApp } from '@/context/AppContext';
import { hapticService } from '@/services/hapticService';

type RootStackParamList = {
  AddMoney: { accountId?: string; currencyCode?: string };
};

type AddMoneyScreenRouteProp = RouteProp<RootStackParamList, 'AddMoney'>;

// Cross-platform alert
const showAlert = (title: string, message: string) => {
  if (Platform.OS === 'web') {
    console.log(`${title}: ${message}`);
    alert(`${title}: ${message}`);
  } else {
    Alert.alert(title, message);
  }
};

export default function AddMoneyScreen() {
  const { colors } = useTheme();
  const route = useRoute<AddMoneyScreenRouteProp>();
  const { state, createTopUp, createAccount } = useApp();
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
  
  const handleCreateAccount = async () => {
    setLoading(true);
    const success = await createAccount('USD');
    setLoading(false);
    
    if (success) {
      showAlert('Success', 'USD account created! You can now add money.');
    } else {
      showAlert('Error', 'Failed to create account - check console for details');
    }
  };
  
  const handleAddMoney = async () => {
    if (!selectedAccount) {
      showAlert('Error', 'No account selected - please select an account or create one');
      return;
    }
    
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      showAlert('Error', 'Please enter a valid amount');
      return;
    }
    
    console.log('Adding money:', { accountId: selectedAccount.id, amount: numAmount });
    setLoading(true);
    hapticService.impactLight();
    
    try {
      const success = await createTopUp(selectedAccount.id, numAmount, 'Add money');
      
      setLoading(false);
      
      if (success) {
        hapticService.notificationSuccess();
        showAlert('Success', `$${numAmount} added to your ${selectedAccount.currencyCode} wallet`);
        setAmount('');
      } else {
        hapticService.notificationError();
        showAlert('Error', 'Failed to add money - check console for details');
      }
    } catch (error) {
      setLoading(false);
      console.error('Error in handleAddMoney:', error);
      hapticService.notificationError();
      showAlert('Error', 'Network error - check console for details');
    }
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Add Money</Text>
        
        {accounts.length === 0 ? (
          // No accounts available - show account creation 
          <View style={styles.noAccountContainer}>
            <Text style={[styles.noAccountText, { color: colors.textSecondary }]}>
              No wallet accounts found. Create your first account to start managing money.
            </Text>
            <TouchableOpacity
              style={[
                styles.createAccountButton, 
                { backgroundColor: colors.primary },
                loading && { opacity: 0.6 }
              ]}
              onPress={handleCreateAccount}
              disabled={loading}
            >
              <Text style={[styles.createAccountButtonText, { color: colors.surface }]}>
                {loading ? 'Creating...' : 'Create USD Account'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : showPicker || !selectedAccount ? (
          // Show account picker
          <View style={styles.noAccountContainer}>
            <Text style={[styles.noAccountText, { color: colors.textSecondary }]}>
              Select an account to add money to:
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
          // Account selected - show normal add money UI
          <>
            <View style={styles.accountInfo}>
              <Text style={[styles.accountText, { color: colors.textSecondary }]}>
                Adding to: {selectedAccount.currencyCode} Account
              </Text>
              <Text style={[styles.balanceText, { color: colors.text }]}>
                Current Balance: ${selectedAccount.balance}
              </Text>
              
              {/* Show account selection if multiple accounts */}
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
                styles.addButton, 
                { backgroundColor: colors.primary },
                (!amount || loading) && { opacity: 0.6 }
              ]}
              onPress={handleAddMoney}
              disabled={!amount || loading}
            >
              <Text style={[styles.addButtonText, { color: colors.surface }]}>
                {loading ? 'Adding...' : 'Add Funds'}
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
  
  // No account state
  noAccountContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: -Spacing.xl },
  noAccountText: { fontSize: 16, fontFamily: Fonts.regular, textAlign: 'center', marginBottom: Spacing.xl, lineHeight: 24 },
  createAccountButton: {
    padding: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 200,
  },
  createAccountButtonText: { fontSize: 16, fontFamily: Fonts.semibold },
  
  // Account exists state
  accountInfo: { marginBottom: Spacing.xl, alignItems: 'center' },
  accountText: { fontSize: 16, fontFamily: Fonts.medium },
  balanceText: { fontSize: 18, fontFamily: Fonts.semibold, marginTop: Spacing.sm },
  changeAccountButton: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    marginTop: Spacing.sm,
  },
  changeAccountText: { fontSize: 14, fontFamily: Fonts.medium },
  
  // Account selection
  accountSelectButton: {
    padding: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: Spacing.sm,
    minWidth: 250,
  },
  accountSelectText: { fontSize: 16, fontFamily: Fonts.semibold },
  inputContainer: { marginBottom: Spacing.xl },
  inputLabel: { fontSize: 16, fontFamily: Fonts.medium, marginBottom: Spacing.sm },
  amountInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: Spacing.md,
    fontSize: 18,
    fontFamily: Fonts.regular,
  },
  addButton: {
    padding: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  addButtonText: { fontSize: 16, fontFamily: Fonts.semibold },
});