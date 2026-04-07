import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Fonts, Spacing } from '@/utils/config';
import { useTheme } from '@/context/ThemeContext';
import { hapticService } from '@/services/hapticService';

export default function ConversionScreen() {
  const { colors } = useTheme();
  const [amount, setAmount] = useState('140.00');
  const [convertedAmount, setConvertedAmount] = useState('1014.902');

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
        <Text style={[styles.balance, { color: colors.textSecondary }]}>Balance: $150.56</Text>
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
        <Text style={[styles.balance, { color: colors.textSecondary }]}>Balance: ¥246.63</Text>
      </View>

      <View style={styles.keypad}>
        {keypadNumbers.map(renderKeypadButton)}
      </View>

      <TouchableOpacity 
        style={[styles.continueButton, { backgroundColor: colors.primary }]}
        onPress={() => hapticService.notificationSuccess()}
      >
        <Text style={[styles.continueText, { color: colors.surface }]}>Continue</Text>
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