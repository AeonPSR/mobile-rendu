import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Fonts, Spacing } from '@/utils/config';
import { useTheme } from '@/context/ThemeContext';

export default function AddMoneyScreen() {
  const { colors } = useTheme();
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Add Money</Text>
        <Text style={[styles.placeholder, { color: colors.textSecondary }]}>Add money functionality will be implemented here</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.lg },
  title: { fontSize: 24, fontFamily: Fonts.bold, marginBottom: Spacing.md },
  placeholder: { fontSize: 16, fontFamily: Fonts.regular },
});