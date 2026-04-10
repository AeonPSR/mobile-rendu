import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Fonts, Spacing } from '@/utils/config';
import { useTheme } from '@/context/ThemeContext';
import { useApp } from '@/context/AppContext';
import { hapticService } from '@/services/hapticService';
import NotificationService from '@/services/notificationService';

// Cross-platform alert
const showAlert = (title: string, message: string) => {
  if (Platform.OS === 'web') {
    console.log(`${title}: ${message}`);
    alert(`${title}: ${message}`);
  } else {
    Alert.alert(title, message);
  }
};

export default function TransferScreen() {
  const { colors } = useTheme();
  const { state, createTransfer } = useApp();
  const [amount, setAmount] = useState('');
  const [fromAccountId, setFromAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [loading, setLoading] = useState(false);
  
  const accounts = state.accounts || [];
  
  const handleTransfer = async () => {
    if (!fromAccountId || !toAccountId) {
      showAlert('Error', 'Please select both accounts');
      return;
    }
    
    if (fromAccountId === toAccountId) {
      showAlert('Error', 'Cannot transfer to the same account');
      return;
    }
    
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      showAlert('Error', 'Please enter a valid amount');
      return;
    }
    
    const fromAccount = accounts.find(acc => acc.id === fromAccountId);
    if (fromAccount && numAmount > fromAccount.balance) {
      showAlert('Error', 'Insufficient balance');
      return;
    }
    
    console.log('Transferring:', { fromAccountId, toAccountId, amount: numAmount });
    setLoading(true);
    hapticService.impactLight();
    
    try {
      const success = await createTransfer(fromAccountId, toAccountId, numAmount, 'Transfer between accounts');
      
      setLoading(false);
      
      if (success) {
        hapticService.notificationSuccess();
        NotificationService.sendLocalNotification(
          'Transfer Complete',
          `$${numAmount} transferred successfully`
        );
        showAlert('Success', `$${numAmount} transferred successfully`);
        setAmount('');
      } else {
        hapticService.notificationError();
        showAlert('Error', 'Failed to transfer money. Please try again later.');
      }
    } catch (error) {
      setLoading(false);
      console.warn('Error in handleTransfer:', error);
      hapticService.notificationError();
      showAlert('Error', 'You appear to be offline. Please check your connection and try again.');
    }
  };
  
  const AccountPicker = ({ 
    title, 
    selectedId, 
    onSelect 
  }: { 
    title: string; 
    selectedId: string; 
    onSelect: (id: string) => void; 
  }) => (
    <View style={styles.pickerContainer}>
      <Text style={[styles.pickerTitle, { color: colors.text }]}>{title}</Text>
      {accounts.map(account => (
        <TouchableOpacity
          key={account.id}
          style={[
            styles.accountOption,
            { borderColor: colors.border },
            selectedId === account.id && { backgroundColor: colors.primary, opacity: 0.1 }
          ]}
          onPress={() => {
            onSelect(account.id);
            hapticService.selectionChanged();
          }}
        >
          <Text style={[styles.accountCurrency, { color: colors.text }]}>
            {account.currencyCode}
          </Text>
          <Text style={[styles.accountBalance, { color: colors.textSecondary }]}>
            Balance: ${account.balance}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Transfer Money</Text>
        
        <AccountPicker
          title="From Account"
          selectedId={fromAccountId}
          onSelect={setFromAccountId}
        />
        
        <AccountPicker
          title="To Account"
          selectedId={toAccountId}
          onSelect={setToAccountId}
        />
        
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
            styles.transferButton, 
            { backgroundColor: colors.primary },
            (!amount || !fromAccountId || !toAccountId || loading) && { opacity: 0.6 }
          ]}
          onPress={handleTransfer}
          disabled={!amount || !fromAccountId || !toAccountId || loading}
        >
          <Text style={[styles.transferButtonText, { color: colors.surface }]}>
            {loading ? 'Transferring...' : 'Transfer'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: Spacing.lg },
  title: { fontSize: 24, fontFamily: Fonts.bold, marginBottom: Spacing.lg, textAlign: 'center' },
  pickerContainer: { marginBottom: Spacing.lg },
  pickerTitle: { fontSize: 16, fontFamily: Fonts.medium, marginBottom: Spacing.sm },
  accountOption: {
    padding: Spacing.md,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: Spacing.sm,
  },
  accountCurrency: { fontSize: 16, fontFamily: Fonts.semibold },
  accountBalance: { fontSize: 14, fontFamily: Fonts.regular, marginTop: 2 },
  inputContainer: { marginBottom: Spacing.xl },
  inputLabel: { fontSize: 16, fontFamily: Fonts.medium, marginBottom: Spacing.sm },
  amountInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: Spacing.md,
    fontSize: 18,
    fontFamily: Fonts.regular,
  },
  transferButton: {
    padding: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  transferButtonText: { fontSize: 16, fontFamily: Fonts.semibold },
});