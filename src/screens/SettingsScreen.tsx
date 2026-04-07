import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import { Fonts, Spacing } from '@/utils/config';
import HapticService from '@/services/hapticService';
import NotificationService, { NotificationPermissionStatus } from '@/services/notificationService';

export default function SettingsScreen() {
  const { signOut, state } = useApp();
  const { theme, setTheme, colors, isDark } = useTheme();
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermissionStatus | null>(null);
  const [isLoadingNotification, setIsLoadingNotification] = useState(false);

  // Check notification permission on mount
  useEffect(() => {
    checkNotificationPermission();
  }, []);

  const checkNotificationPermission = async () => {
    const status = await NotificationService.getPermissionStatus();
    setNotificationPermission(status);
  };

  const handleRequestNotificationPermission = async () => {
    HapticService.light();
    
    // Explain why we need permission
    Alert.alert(
      'Enable Notifications',
      'We\'d like to send you notifications about your transactions, exchange rate alerts, and important account updates.\n\nYou can change this later in Settings.',
      [
        {
          text: 'Not Now',
          style: 'cancel',
          onPress: () => HapticService.light(),
        },
        {
          text: 'Enable',
          onPress: async () => {
            const granted = await NotificationService.requestPermission();
            await checkNotificationPermission();
            
            if (granted) {
              HapticService.success();
              Alert.alert('Success', 'Notifications enabled!');
            } else {
              HapticService.error();
              Alert.alert(
                'Permission Denied',
                'You can enable notifications later in your device settings.',
                [{ text: 'OK' }]
              );
            }
          },
        },
      ]
    );
  };

  const handleSendTestNotification = async () => {
    HapticService.medium();
    setIsLoadingNotification(true);

    try {
      // Check permission first
      if (!notificationPermission?.granted) {
        const granted = await NotificationService.requestPermission();
        await checkNotificationPermission();
        
        if (!granted) {
          Alert.alert(
            'Notifications Disabled',
            'Please enable notifications to receive alerts.',
            [{ text: 'OK' }]
          );
          setIsLoadingNotification(false);
          return;
        }
      }

      // Send test notification
      const notificationId = await NotificationService.sendLocalNotification(
        '💰 Test Notification',
        'This is a test notification from International Wallet. Your notifications are working!',
        { type: 'test' }
      );

      if (notificationId) {
        HapticService.success();
        Alert.alert('Sent!', 'Check your notification panel.');
      } else {
        HapticService.error();
        Alert.alert('Failed', 'Could not send notification.');
      }
    } catch (error) {
      HapticService.error();
      Alert.alert('Error', 'Something went wrong.');
    } finally {
      setIsLoadingNotification(false);
    }
  };

  const handleSendTransactionNotification = async () => {
    HapticService.medium();
    setIsLoadingNotification(true);

    try {
      if (!notificationPermission?.granted) {
        await handleRequestNotificationPermission();
        setIsLoadingNotification(false);
        return;
      }

      const notificationId = await NotificationService.sendTransactionNotification(
        'received',
        '150.00',
        'USD'
      );

      if (notificationId) {
        HapticService.success();
      }
    } catch (error) {
      HapticService.error();
    } finally {
      setIsLoadingNotification(false);
    }
  };

  const handleSignOut = async () => {
    HapticService.medium();
    await signOut();
  };

  const handleThemeChange = async () => {
    HapticService.light();
    const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    await setTheme(nextTheme);
  };

  const getThemeDisplayName = () => {
    switch (theme) {
      case 'light': return 'Light';
      case 'dark': return 'Dark';
      case 'system': return 'System';
      default: return 'System';
    }
  };

  const settingsItems = [
    { 
      title: 'Theme', 
      icon: isDark ? 'moon' : 'sunny', 
      action: handleThemeChange,
      rightText: getThemeDisplayName()
    },
    { title: 'Profile', icon: 'person-outline', action: () => HapticService.light() },
    { title: 'Notifications', icon: 'notifications-outline', action: () => HapticService.light() },
    { title: 'Security', icon: 'shield-checkmark-outline', action: () => HapticService.light() },
    { title: 'Currency Preferences', icon: 'globe-outline', action: () => HapticService.light() },
    { title: 'Help & Support', icon: 'help-circle-outline', action: () => HapticService.light() },
    { title: 'About', icon: 'information-circle-outline', action: () => HapticService.light() },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView}>
        {/* User Info */}
        <View style={[styles.userSection, { backgroundColor: colors.surface }]}>
          <View style={[styles.avatar, { backgroundColor: colors.background }]}>
            <Ionicons name="person" size={32} color={colors.primary} />
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.text }]}>
              {state.user?.firstName} {state.user?.lastName}
            </Text>
            <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{state.user?.email}</Text>
          </View>
        </View>

        {/* Settings Items */}
        <View style={[styles.settingsSection, { backgroundColor: colors.surface }]}>
          {settingsItems.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={[
                styles.settingItem, 
                { borderBottomColor: colors.border },
                index === settingsItems.length - 1 && { borderBottomWidth: 0 }
              ]} 
              onPress={item.action}
            >
              <Ionicons name={item.icon as any} size={24} color={colors.text} />
              <Text style={[styles.settingText, { color: colors.text }]}>{item.title}</Text>
              <View style={styles.rightSection}>
                {item.rightText && (
                  <Text style={[styles.rightText, { color: colors.textSecondary }]}>
                    {item.rightText}
                  </Text>
                )}
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Notifications Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Notifications</Text>
        </View>
        
        <View style={[styles.settingsSection, { backgroundColor: colors.surface }]}>
          {/* Permission Status */}
          <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <Ionicons 
              name={notificationPermission?.granted ? 'notifications' : 'notifications-off'} 
              size={24} 
              color={notificationPermission?.granted ? colors.success : colors.textSecondary} 
            />
            <Text style={[styles.settingText, { color: colors.text }]}>
              Permission Status
            </Text>
            <View style={styles.rightSection}>
              <Text style={[
                styles.rightText, 
                { color: notificationPermission?.granted ? colors.success : colors.error }
              ]}>
                {notificationPermission?.granted ? 'Enabled' : 'Disabled'}
              </Text>
            </View>
          </View>

          {/* Request Permission Button - show only if not granted */}
          {!notificationPermission?.granted && (
            <TouchableOpacity 
              style={[styles.settingItem, { borderBottomColor: colors.border }]}
              onPress={handleRequestNotificationPermission}
            >
              <Ionicons name="shield-checkmark-outline" size={24} color={colors.primary} />
              <Text style={[styles.settingText, { color: colors.primary }]}>
                Enable Notifications
              </Text>
              <View style={styles.rightSection}>
                <Ionicons name="chevron-forward" size={20} color={colors.primary} />
              </View>
            </TouchableOpacity>
          )}

          {/* Test Notification Button */}
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: colors.border }]}
            onPress={handleSendTestNotification}
            disabled={isLoadingNotification}
          >
            <Ionicons name="paper-plane-outline" size={24} color={colors.text} />
            <Text style={[styles.settingText, { color: colors.text }]}>
              Send Test Notification
            </Text>
            <View style={styles.rightSection}>
              {isLoadingNotification ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              )}
            </View>
          </TouchableOpacity>

          {/* Transaction Notification Button */}
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomWidth: 0 }]}
            onPress={handleSendTransactionNotification}
            disabled={isLoadingNotification}
          >
            <Ionicons name="cash-outline" size={24} color={colors.text} />
            <Text style={[styles.settingText, { color: colors.text }]}>
              Test Transaction Alert
            </Text>
            <View style={styles.rightSection}>
              {isLoadingNotification ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity 
          style={[styles.signOutButton, { backgroundColor: colors.surface }]} 
          onPress={handleSignOut}
        >
          <Ionicons name="log-out-outline" size={24} color={colors.error} />
          <Text style={[styles.signOutText, { color: colors.error }]}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    marginTop: Spacing.md,
    marginHorizontal: Spacing.lg,
    borderRadius: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
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
  },
  userEmail: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    marginTop: 2,
  },
  settingsSection: {
    marginTop: Spacing.lg,
    marginHorizontal: Spacing.lg,
    borderRadius: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
  },
  settingText: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    flex: 1,
    marginLeft: Spacing.md,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    marginRight: Spacing.sm,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xl,
    marginHorizontal: Spacing.lg,
    padding: Spacing.md,
    borderRadius: 12,
  },
  signOutText: {
    fontSize: 16,
    fontFamily: Fonts.semibold,
    marginLeft: Spacing.sm,
  },
  sectionHeader: {
    marginTop: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: Fonts.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});