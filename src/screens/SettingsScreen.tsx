import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Spacing } from '@/utils/config';
import { useApp } from '@/context/AppContext';

export default function SettingsScreen() {
  const { signOut, state } = useApp();

  const handleSignOut = async () => {
    await signOut();
  };

  const settingsItems = [
    { title: 'Profile', icon: 'person-outline', action: () => {} },
    { title: 'Notifications', icon: 'notifications-outline', action: () => {} },
    { title: 'Security', icon: 'shield-checkmark-outline', action: () => {} },
    { title: 'Currency Preferences', icon: 'globe-outline', action: () => {} },
    { title: 'Help & Support', icon: 'help-circle-outline', action: () => {} },
    { title: 'About', icon: 'information-circle-outline', action: () => {} },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* User Info */}
        <View style={styles.userSection}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={32} color={Colors.primary} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {state.user?.firstName} {state.user?.lastName}
            </Text>
            <Text style={styles.userEmail}>{state.user?.email}</Text>
          </View>
        </View>

        {/* Settings Items */}
        <View style={styles.settingsSection}>
          {settingsItems.map((item, index) => (
            <TouchableOpacity key={index} style={styles.settingItem} onPress={item.action}>
              <Ionicons name={item.icon as any} size={24} color={Colors.text} />
              <Text style={styles.settingText}>{item.title}</Text>
              <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={24} color={Colors.error} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    marginTop: Spacing.md,
    marginHorizontal: Spacing.lg,
    borderRadius: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontFamily: Fonts.semibold,
    color: Colors.text,
  },
  userEmail: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  settingsSection: {
    backgroundColor: Colors.surface,
    marginTop: Spacing.lg,
    marginHorizontal: Spacing.lg,
    borderRadius: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingText: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: Colors.text,
    flex: 1,
    marginLeft: Spacing.md,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    marginTop: Spacing.xl,
    marginHorizontal: Spacing.lg,
    padding: Spacing.md,
    borderRadius: 12,
  },
  signOutText: {
    fontSize: 16,
    fontFamily: Fonts.semibold,
    color: Colors.error,
    marginLeft: Spacing.sm,
  },
});