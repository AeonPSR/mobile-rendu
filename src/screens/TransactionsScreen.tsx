import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Fonts, Spacing } from '@/utils/config';
import { useTheme } from '@/context/ThemeContext';

export default function TransactionsScreen() {
  const { colors } = useTheme();
  
  const mockTransactions = [
    { id: '1', type: 'Conversion', amount: '+¥1,014.902', time: '16:35 PM', isPositive: true },
    { id: '2', type: 'Transfer', amount: '-$253.62', time: '15:20 PM', isPositive: false },
    { id: '3', type: 'Top-up', amount: '+$100.00', time: '14:15 PM', isPositive: true },
  ];

  const renderTransaction = ({ item }: { item: any }) => (
    <TouchableOpacity style={[styles.transactionItem, { backgroundColor: colors.surface }]}>
      <View style={styles.transactionInfo}>
        <Text style={[styles.transactionType, { color: colors.text }]}>{item.type}</Text>
        <Text style={[styles.transactionTime, { color: colors.textSecondary }]}>{item.time}</Text>
      </View>
      <Text style={[
        styles.transactionAmount, 
        { color: item.isPositive ? colors.success : colors.error }
      ]}>
        {item.amount}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={mockTransactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { paddingHorizontal: Spacing.lg },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: 12,
    marginVertical: Spacing.sm,
  },
  transactionInfo: { flex: 1 },
  transactionType: { fontSize: 16, fontFamily: Fonts.medium },
  transactionTime: { fontSize: 14, fontFamily: Fonts.regular },
  transactionAmount: { fontSize: 16, fontFamily: Fonts.semibold },
});