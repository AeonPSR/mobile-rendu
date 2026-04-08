import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Fonts, Spacing } from '@/utils/config';
import { useTheme } from '@/context/ThemeContext';

type RootStackParamList = {
  TransactionDetail: { transactionId: string };
};

type TransactionDetailScreenRouteProp = RouteProp<RootStackParamList, 'TransactionDetail'>;

export default function TransactionDetailScreen() {
  const { colors } = useTheme();
  const route = useRoute<TransactionDetailScreenRouteProp>();
  const transactionId = route.params?.transactionId;
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Transaction Details</Text>
        <Text style={[styles.transactionId, { color: colors.textSecondary }]}>
          Transaction ID: {transactionId || 'N/A'}
        </Text>
        <Text style={[styles.placeholder, { color: colors.textSecondary }]}>
          Detailed transaction information will be displayed here when navigation is properly wired.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.lg },
  title: { fontSize: 24, fontFamily: Fonts.bold, marginBottom: Spacing.md },
  transactionId: { fontSize: 14, fontFamily: Fonts.medium, marginBottom: Spacing.sm },
  placeholder: { fontSize: 16, fontFamily: Fonts.regular, textAlign: 'center' },
});