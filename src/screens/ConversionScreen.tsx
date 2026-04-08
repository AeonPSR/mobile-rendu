import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
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

export default function ConversionScreen() {
  const { colors } = useTheme();
  const { state, createConversion, getExchangeRate } = useApp();
  const [amount, setAmount] = useState('140.00');
  const [convertedAmount, setConvertedAmount] = useState('1014.902');
  const [loading, setLoading] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(7.25);
  
  // For simplicity, using first two accounts as from/to
  const accounts = state.accounts || [];
  const fromAccount = accounts.find((acc: any) => acc.currencyCode === 'USD');
  const toAccount = accounts.find((acc: any) => acc.currencyCode === 'CNY');
  
  useEffect(() => {
    loadExchangeRate();
  }, []);
  
  const loadExchangeRate = async () => {
    if (fromAccount && toAccount) {
      const rate = await getExchangeRate(fromAccount.currencyCode, toAccount.currencyCode);
      if (rate) {
        setExchangeRate(rate);
        updateConvertedAmount(amount, rate);
      }
    }
  };
  
  const updateConvertedAmount = (inputAmount: string, rate: number) => {
    const numAmount = parseFloat(inputAmount) || 0;
    setConvertedAmount((numAmount * rate).toFixed(3));
  };
  
  const handleContinue = async () => {
    if (!fromAccount || !toAccount) {
      showAlert('Error', 'Currency accounts not available');
      return;
    }
    
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      showAlert('Error', 'Please enter a valid amount');
      return;
    }
    
    if (numAmount > fromAccount.balance) {
      showAlert('Error', 'Insufficient balance');
      return;
    }
    
    console.log('Converting:', { fromAccountId: fromAccount.id, toAccountId: toAccount.id, amount: numAmount, rate: exchangeRate });
    setLoading(true);
    hapticService.impactLight();
    
    try {
      const success = await createConversion(fromAccount.id, toAccount.id, numAmount, exchangeRate);
      
      setLoading(false);
      
      if (success) {
        hapticService.notificationSuccess();
        NotificationService.sendLocalNotification(
          'Conversion Complete',
          `Converted $${numAmount} to ¥${convertedAmount}`
        );
        showAlert('Success', `Converted $${numAmount} to ¥${convertedAmount}`);
        setAmount('0.00');
        setConvertedAmount('0.000');
      } else {
        hapticService.notificationError();
        showAlert('Error', 'Failed to convert currency - check console for details');
      }
    } catch (error) {
      setLoading(false);
      console.error('Error in handleContinue:', error);
      hapticService.notificationError();
      showAlert('Error', 'Network error - check console for details');
    }
  };

  const keypadNumbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'];

  const renderKeypadButton = (value: string) => (
    <TouchableOpacity 
      key={value} 
      style={styles.keypadButton}
      onPress={() => hapticService.selectionChanged()}
    >
      <Text style={[styles.keypadText, { color: colors.text }]}>{value}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => hapticService.impactLight()}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Between Accounts</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.conversionInfo}>
        <Text style={[styles.conversionRate, { 
          backgroundColor: colors.primary, 
          color: colors.surface 
        }]}>
          1USD = 7.2493 CNY
        </Text>
      </View>

      <View style={styles.amountSection}>
        <TouchableOpacity 
          style={styles.currencySelector}
          onPress={() => hapticService.selectionChanged()}
        >
          <Text style={[styles.currencyText, { color: colors.text }]}>🇺🇸 USD</Text>
          <Ionicons name="chevron-down" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.amount, { color: colors.text }]}>{amount}</Text>
        <Text style={[styles.balance, { color: colors.textSecondary }]}>
          Balance: ${fromAccount?.balance || 0}
        </Text>
      </View>

      <TouchableOpacity 
        style={styles.swapIcon}
        onPress={() => hapticService.impactMedium()}
      >
        <Ionicons name="swap-horizontal" size={24} color={colors.primary} />
      </TouchableOpacity>

      <View style={styles.amountSection}>
        <TouchableOpacity 
          style={styles.currencySelector}
          onPress={() => hapticService.selectionChanged()}
        >
          <Text style={[styles.currencyText, { color: colors.text }]}>🇨🇳 CNY</Text>
          <Ionicons name="chevron-down" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.amount, { color: colors.text }]}>{convertedAmount}</Text>
        <Text style={[styles.balance, { color: colors.textSecondary }]}>
          Balance: ¥{toAccount?.balance || 0}
        </Text>
      </View>

      <View style={styles.keypad}>
        {keypadNumbers.map(renderKeypadButton)}
      </View>

      <TouchableOpacity 
        style={[
          styles.continueButton, 
          { backgroundColor: colors.primary },
          loading && { opacity: 0.6 }
        ]}
        onPress={handleContinue}
        disabled={loading}
      >
        <Text style={[styles.continueText, { color: colors.surface }]}>
          {loading ? 'Converting...' : 'Continue'}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerTitle: { fontSize: 16, fontFamily: Fonts.medium },
  conversionInfo: { alignItems: 'center', padding: Spacing.md },
  conversionRate: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    fontSize: 14,
    fontFamily: Fonts.medium,
  },
  amountSection: { alignItems: 'center', paddingVertical: Spacing.lg },
  currencySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  currencyText: { fontSize: 16, fontFamily: Fonts.medium, marginRight: Spacing.sm },
  amount: { fontSize: 32, fontFamily: Fonts.bold },
  balance: { fontSize: 14, fontFamily: Fonts.regular },
  swapIcon: { alignItems: 'center', paddingVertical: Spacing.sm },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
  },
  keypadButton: {
    width: '33.333%',
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keypadText: { fontSize: 24, fontFamily: Fonts.regular },
  continueButton: {
    margin: Spacing.lg,
    padding: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueText: { fontSize: 16, fontFamily: Fonts.semibold },
});