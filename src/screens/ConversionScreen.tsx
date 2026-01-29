import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Spacing } from '@/utils/config';

export default function ConversionScreen() {
  const [amount, setAmount] = useState('140.00');
  const [convertedAmount, setConvertedAmount] = useState('1014.902');

  const keypadNumbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'];

  const renderKeypadButton = (value: string) => (
    <TouchableOpacity key={value} style={styles.keypadButton}>
      <Text style={styles.keypadText}>{value}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="close" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Between Accounts</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.conversionInfo}>
        <Text style={styles.conversionRate}>1USD = 7.2493 CNY</Text>
      </View>

      <View style={styles.amountSection}>
        <View style={styles.currencySelector}>
          <Text style={styles.currencyText}>🇺🇸 USD</Text>
          <Ionicons name="chevron-down" size={20} color={Colors.text} />
        </View>
        <Text style={styles.amount}>{amount}</Text>
        <Text style={styles.balance}>Balance: $150.56</Text>
      </View>

      <View style={styles.swapIcon}>
        <Ionicons name="swap-horizontal" size={24} color={Colors.primary} />
      </View>

      <View style={styles.amountSection}>
        <View style={styles.currencySelector}>
          <Text style={styles.currencyText}>🇨🇳 CNY</Text>
          <Ionicons name="chevron-down" size={20} color={Colors.text} />
        </View>
        <Text style={styles.amount}>{convertedAmount}</Text>
        <Text style={styles.balance}>Balance: ¥246.63</Text>
      </View>

      <View style={styles.keypad}>
        {keypadNumbers.map(renderKeypadButton)}
      </View>

      <TouchableOpacity style={styles.continueButton}>
        <Text style={styles.continueText}>Continue</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerTitle: { fontSize: 16, fontFamily: Fonts.medium, color: Colors.text },
  conversionInfo: { alignItems: 'center', padding: Spacing.md },
  conversionRate: {
    backgroundColor: Colors.text,
    color: Colors.surface,
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
  currencyText: { fontSize: 16, fontFamily: Fonts.medium, color: Colors.text },
  amount: { fontSize: 32, fontFamily: Fonts.bold, color: Colors.text },
  balance: { fontSize: 14, fontFamily: Fonts.regular, color: Colors.textSecondary },
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
  keypadText: { fontSize: 24, fontFamily: Fonts.regular, color: Colors.text },
  continueButton: {
    backgroundColor: Colors.text,
    margin: Spacing.lg,
    padding: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueText: { fontSize: 16, fontFamily: Fonts.semibold, color: Colors.surface },
});