import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationPermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
}

class NotificationService {
  private static instance: NotificationService;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Check current notification permission status
   */
  async getPermissionStatus(): Promise<NotificationPermissionStatus> {
    const { status, canAskAgain } = await Notifications.getPermissionsAsync();
    return {
      granted: status === 'granted',
      canAskAgain,
    };
  }

  /**
   * Request notification permissions from user
   * Returns true if granted, false otherwise
   */
  async requestPermission(): Promise<boolean> {
    // Check current status first
    const currentStatus = await this.getPermissionStatus();
    
    if (currentStatus.granted) {
      return true;
    }

    // Request permission
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  }

  /**
   * Send a local notification immediately
   */
  async sendLocalNotification(
    title: string,
    body: string,
    data?: Record<string, any>
  ): Promise<string | null> {
    try {
      // Check permission first
      const hasPermission = await this.requestPermission();
      
      if (!hasPermission) {
        console.warn('Notification permission not granted');
        return null;
      }

      // Schedule notification immediately
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: true,
        },
        trigger: null, // null means immediate
      });

      return notificationId;
    } catch (error) {
      console.error('Error sending notification:', error);
      return null;
    }
  }

  /**
   * Schedule a notification for later
   */
  async scheduleNotification(
    title: string,
    body: string,
    delaySeconds: number,
    data?: Record<string, any>
  ): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermission();
      
      if (!hasPermission) {
        console.warn('Notification permission not granted');
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: true,
        },
        trigger: {
          seconds: delaySeconds,
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        },
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  /**
   * Cancel a specific notification
   */
  async cancelNotification(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /**
   * Get all pending scheduled notifications
   */
  async getPendingNotifications(): Promise<Notifications.NotificationRequest[]> {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  /**
   * Add listener for when notification is received while app is open
   */
  addNotificationReceivedListener(
    callback: (notification: Notifications.Notification) => void
  ): Notifications.EventSubscription {
    return Notifications.addNotificationReceivedListener(callback);
  }

  /**
   * Add listener for when user interacts with notification
   */
  addNotificationResponseListener(
    callback: (response: Notifications.NotificationResponse) => void
  ): Notifications.EventSubscription {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }

  // Pre-built notification types for the wallet app
  async sendTransactionNotification(
    type: 'success' | 'received' | 'sent',
    amount: string,
    currency: string
  ): Promise<string | null> {
    const titles = {
      success: 'Transaction Successful',
      received: 'Money Received',
      sent: 'Money Sent',
    };

    const bodies = {
      success: `Your transaction of ${amount} ${currency} was completed.`,
      received: `You received ${amount} ${currency}!`,
      sent: `You sent ${amount} ${currency}.`,
    };

    return this.sendLocalNotification(titles[type], bodies[type], {
      type: 'transaction',
      amount,
      currency,
    });
  }

  async sendRateAlertNotification(
    fromCurrency: string,
    toCurrency: string,
    rate: string
  ): Promise<string | null> {
    return this.sendLocalNotification(
      'Exchange Rate Alert',
      `${fromCurrency}/${toCurrency} is now at ${rate}`,
      { type: 'rate_alert', fromCurrency, toCurrency, rate }
    );
  }
}

export default NotificationService.getInstance();
