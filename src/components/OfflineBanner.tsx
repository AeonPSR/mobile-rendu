import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import { Fonts, Spacing } from '@/utils/config';

export default function OfflineBanner() {
  const { state } = useApp();

  if (!state.isOffline) return null;

  return (
    <View style={styles.banner}>
      <Ionicons name="cloud-offline-outline" size={16} color="#fff" />
      <Text style={styles.text}>Offline — showing cached data</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF9500',
    paddingVertical: Spacing.sm,
    gap: 6,
  },
  text: {
    color: '#fff',
    fontSize: 13,
    fontFamily: Fonts.medium,
  },
});
