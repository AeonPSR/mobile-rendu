import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Fonts, Spacing } from '@/utils/config';
import { useTheme } from '@/context/ThemeContext';
import { useApp } from '@/context/AppContext';
import { hapticService } from '@/services/hapticService';

export default function TransactionsScreen() {
  const { colors } = useTheme();
  const { state, loadUserTransactions } = useApp();
  
  useEffect(() => {
    // Load transactions when screen mounts
    if (state.user) {
      loadUserTransactions(state.user.id);
    }
  }, [state.user]);
  
  const transactions = state.transactions || [];
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'top_up': return 'add-circle';
      case 'withdrawal': return 'remove-circle';
      case 'transfer': return 'swap-horizontal';
      case 'conversion': return 'refresh';
      default: return 'help-circle';
    }
  };
  
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'top_up': return colors.success;
      case 'withdrawal': return colors.error;
      case 'transfer': return colors.primary;
      case 'conversion': return colors.warning;
      default: return colors.textSecondary;
    }
  };
  
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'top_up': return 'Money Added';
      case 'withdrawal': return 'Money Withdrawn';
      case 'transfer': return 'Transfer';
      case 'conversion': return 'Currency Conversion';
      default: return 'Transaction';
    }
  };
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const formatTransactionAmount = (transaction: any) => {
    if (transaction.type === 'top_up') {
      return `+$${transaction.toAmount || transaction.amount || '0.00'}`;
    } else if (transaction.type === 'withdrawal') {
      return `-$${transaction.fromAmount || transaction.amount || '0.00'}`;
    } else if (transaction.type === 'transfer') {
      return `-$${transaction.fromAmount || transaction.amount || '0.00'}`;
    } else if (transaction.type === 'conversion') {
      return `${transaction.fromAmount} → ${transaction.toAmount}`;
    }
    return `$${transaction.amount || '0.00'}`;
  };
  
  const getAmountColor = (transaction: any) => {
    if (transaction.type === 'top_up') return colors.success;
    if (transaction.type === 'withdrawal') return colors.error;
    return colors.text;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={transactions}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[styles.transactionItem, { borderBottomColor: colors.border }]}
            onPress={() => hapticService.selectionChanged()}
          >
            <View style={styles.transactionLeft}>
              <View style={[styles.typeIcon, { backgroundColor: getTypeColor(item.type) }]}>
                <Ionicons 
                  name={getTypeIcon(item.type)} 
                  size={16} 
                  color="white" 
                />
              </View>
              <View>
                <Text style={[styles.transactionDescription, { color: colors.text }]}>
                  {item.description || getTypeLabel(item.type)}
                </Text>
                <Text style={[styles.transactionDate, { color: colors.textSecondary }]}>
                  {formatDate(item.createdAt)}
                </Text>
              </View>
            </View>
            <Text style={[styles.transactionAmount, { color: getAmountColor(item) }]}>
              {formatTransactionAmount(item)}
            </Text>
          </TouchableOpacity>
        )}
        style={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No transactions yet
            </Text>
          </View>
        }
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
    borderBottomWidth: 1,
    marginVertical: Spacing.sm,
  },
  transactionLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  typeIcon: { 
    width: 32, 
    height: 32, 
    borderRadius: 16, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: Spacing.sm 
  },
  transactionDescription: { fontSize: 16, fontFamily: Fonts.medium },
  transactionDate: { fontSize: 14, fontFamily: Fonts.regular, marginTop: 2 },
  transactionAmount: { fontSize: 16, fontFamily: Fonts.semibold },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  emptyText: { fontSize: 16, fontFamily: Fonts.regular },
});