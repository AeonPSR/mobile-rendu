import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Spacing } from '@/utils/config';

export default function TransactionsScreen() {
  const mockTransactions = [
    { id: '1', type: 'Conversion', amount: '+¥1,014.902', time: '16:35 PM', color: Colors.success },
    { id: '2', type: 'Transfer', amount: '-$253.62', time: '15:20 PM', color: Colors.error },
    { id: '3', type: 'Top-up', amount: '+$100.00', time: '14:15 PM', color: Colors.success },
  ];

  const renderTransaction = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.transactionItem}>
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionType}>{item.type}</Text>
        <Text style={styles.transactionTime}>{item.time}</Text>
      </View>
      <Text style={[styles.transactionAmount, { color: item.color }]}>{item.amount}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
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
  container: { flex: 1, backgroundColor: Colors.background },
  list: { paddingHorizontal: Spacing.lg },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: 12,
    marginVertical: Spacing.sm,
  },
  transactionInfo: { flex: 1 },
  transactionType: { fontSize: 16, fontFamily: Fonts.medium, color: Colors.text },
  transactionTime: { fontSize: 14, fontFamily: Fonts.regular, color: Colors.textSecondary },
  transactionAmount: { fontSize: 16, fontFamily: Fonts.semibold },
});