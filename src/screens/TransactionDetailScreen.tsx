import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Fonts, Spacing } from '@/utils/config';
import { useTheme } from '@/context/ThemeContext';
import { useApp } from '@/context/AppContext';
import { hapticService } from '@/services/hapticService';
import { getCurrencySymbol } from '@/utils/helpers';

type RootStackParamList = {
  TransactionDetail: { transactionId: string };
};

type TransactionDetailScreenRouteProp = RouteProp<RootStackParamList, 'TransactionDetail'>;

const showAlert = (title: string, message: string, buttons?: any[]) => {
  if (Platform.OS === 'web') {
    if (buttons) {
      const confirmed = confirm(`${title}: ${message}`);
      if (confirmed && buttons.length > 1) buttons[1].onPress?.();
    } else {
      alert(`${title}: ${message}`);
    }
  } else {
    Alert.alert(title, message, buttons);
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'top_up': return 'Money Added';
    case 'withdrawal': return 'Withdrawal';
    case 'transfer': return 'Transfer';
    case 'conversion': return 'Currency Conversion';
    default: return 'Transaction';
  }
};

const getTypeIcon = (type: string): keyof typeof Ionicons.glyphMap => {
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
    case 'top_up': return '#34C759';
    case 'withdrawal': return '#FF3B30';
    case 'transfer': return '#007AFF';
    case 'conversion': return '#FF9500';
    default: return '#8E8E93';
  }
};

export default function TransactionDetailScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<TransactionDetailScreenRouteProp>();
  const { state, deleteTransaction, updateTransactionDescription } = useApp();
  const transactionId = route.params?.transactionId;

  const transaction = state.transactions.find(t => t.id === transactionId);
  const [isEditing, setIsEditing] = useState(false);
  const [editDescription, setEditDescription] = useState(transaction?.description || '');
  const [loading, setLoading] = useState(false);

  if (!transaction) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Transaction not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleDelete = () => {
    hapticService.impactMedium();
    showAlert(
      'Delete Transaction',
      'Are you sure? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            const success = await deleteTransaction(transaction.id);
            setLoading(false);
            if (success) {
              hapticService.notificationSuccess();
              navigation.goBack();
            } else {
              hapticService.notificationError();
              showAlert('Error', 'Failed to delete transaction');
            }
          },
        },
      ]
    );
  };

  const handleSaveDescription = async () => {
    setLoading(true);
    const success = await updateTransactionDescription(transaction.id, editDescription);
    setLoading(false);
    if (success) {
      hapticService.notificationSuccess();
      setIsEditing(false);
    } else {
      hapticService.notificationError();
      showAlert('Error', 'Failed to update description');
    }
  };

  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  const typeColor = getTypeColor(transaction.type);

  const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.text }]}>{value}</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Type badge */}
        <View style={[styles.typeBadge, { backgroundColor: typeColor }]}>  
          <Ionicons name={getTypeIcon(transaction.type)} size={24} color="#fff" />
          <Text style={styles.typeLabel}>{getTypeLabel(transaction.type)}</Text>
        </View>

        {/* Amount */}
        <View style={styles.amountSection}>
          {transaction.fromAmount != null && (
            <Text style={[styles.amount, { color: colors.text }]}>
              -{getCurrencySymbol(transaction.fromCurrency || '')}{transaction.fromAmount.toFixed(2)}
              {transaction.fromCurrency ? ` ${transaction.fromCurrency}` : ''}
            </Text>
          )}
          {transaction.toAmount != null && (
            <Text style={[styles.amount, { color: typeColor }]}>
              +{getCurrencySymbol(transaction.toCurrency || '')}{transaction.toAmount.toFixed(2)}
              {transaction.toCurrency ? ` ${transaction.toCurrency}` : ''}
            </Text>
          )}
        </View>

        {/* Info card */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <InfoRow label="Status" value={transaction.status} />
          <InfoRow label="Date" value={formatDate(transaction.createdAt)} />
          {transaction.exchangeRate && (
            <InfoRow label="Exchange Rate" value={transaction.exchangeRate.toFixed(4)} />
          )}
          <InfoRow label="ID" value={transaction.id.slice(0, 12) + '...'} />
        </View>

        {/* Description (editable) */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.descriptionHeader}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Description</Text>
            <TouchableOpacity onPress={() => {
              if (isEditing) {
                handleSaveDescription();
              } else {
                setEditDescription(transaction.description || '');
                setIsEditing(true);
              }
            }}>
              <Ionicons
                name={isEditing ? 'checkmark' : 'pencil'}
                size={20}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>
          {isEditing ? (
            <TextInput
              style={[styles.descriptionInput, { color: colors.text, borderColor: colors.primary }]}
              value={editDescription}
              onChangeText={setEditDescription}
              autoFocus
              placeholder="Add a description..."
              placeholderTextColor={colors.textSecondary}
            />
          ) : (
            <Text style={[styles.descriptionText, { color: colors.text }]}>
              {transaction.description || 'No description'}
            </Text>
          )}
        </View>

        {/* Delete button */}
        <TouchableOpacity
          style={[styles.deleteButton, { borderColor: colors.error }]}
          onPress={handleDelete}
          disabled={loading}
        >
          <Ionicons name="trash-outline" size={18} color={colors.error} />
          <Text style={[styles.deleteText, { color: colors.error }]}>Delete Transaction</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.lg },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, fontFamily: Fonts.regular, marginTop: Spacing.md },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
    marginBottom: Spacing.lg,
  },
  typeLabel: { color: '#fff', fontSize: 16, fontFamily: Fonts.semibold },
  amountSection: { alignItems: 'center', marginBottom: Spacing.lg },
  amount: { fontSize: 28, fontFamily: Fonts.bold, marginVertical: 2 },
  card: {
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoLabel: { fontSize: 14, fontFamily: Fonts.regular },
  infoValue: { fontSize: 14, fontFamily: Fonts.medium, textAlign: 'right', flex: 1, marginLeft: 12 },
  descriptionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  descriptionText: { fontSize: 15, fontFamily: Fonts.regular },
  descriptionInput: {
    fontSize: 15,
    fontFamily: Fonts.regular,
    borderBottomWidth: 1,
    paddingVertical: 4,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
    marginTop: Spacing.md,
  },
  deleteText: { fontSize: 16, fontFamily: Fonts.medium },
});