import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Fonts, Spacing } from '@/utils/config';

export default function TransactionDetailScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Transaction Details</Text>
        <Text style={styles.placeholder}>Transaction details will be shown here</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.lg },
  title: { fontSize: 24, fontFamily: Fonts.bold, color: Colors.text, marginBottom: Spacing.md },
  placeholder: { fontSize: 16, fontFamily: Fonts.regular, color: Colors.textSecondary },
});