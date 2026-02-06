import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * Notification Manager for handling alarm notifications
 * Supports both foreground and background notifications
 */
export class NotificationManager {
  private static isInitialized = false;

  /**
   * Initialize notification system
   */
  static async initialize() {
    if (this.isInitialized) return;

    try {
      // Suppress warnings for Expo Go
      const originalWarn = console.warn;
      console.warn = (...args: any[]) => {
        const message = args[0]?.toString?.() || '';
        if (message.includes('expo-notifications') || message.includes('expo-av')) {
          return; // Suppress Expo Go warnings
        }
        originalWarn(...args);
      };

      // Set notification handler
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });

      // Request permissions
      if (Platform.OS !== 'web') {
        try {
          const { status } = await Notifications.requestPermissionsAsync();
          if (status !== 'granted') {
            // Silently continue - permissions denied but not critical
          }
        } catch (permError) {
          // Notification permissions request failed (expected in Expo Go)
        }
      }

      // Restore console.warn
      console.warn = originalWarn;

      this.isInitialized = true;
    } catch (error) {
      // Silently fail - notification system not fully available in Expo Go
      this.isInitialized = true;
    }
  }

  /**
   * Schedule an alarm notification
   * @param alarmTime - Time when alarm should trigger (milliseconds since epoch)
   * @param alarmId - Unique alarm identifier
   * @param title - Notification title
   * @param body - Notification body
   */
  static async scheduleAlarmNotification(
    alarmTime: number,
    alarmId: string,
    title: string = 'Báo thức',
    body: string = 'Đã đến giờ thức dậy'
  ): Promise<string | null> {
    try {
      const triggerTime = new Date(alarmTime);
      const now = new Date();

      // Don't schedule if time is in the past
      if (triggerTime <= now) {
        return null;
      }

      try {
        const notificationId = await Notifications.scheduleNotificationAsync({
          identifier: alarmId,
          content: {
            title,
            body,
            sound: 'default',
            badge: 1,
            data: {
              alarmId,
              type: 'alarm',
              triggerTime: alarmTime,
            },
          },
          trigger: {
            type: 'time',
            seconds: Math.max(1, Math.floor((triggerTime.getTime() - now.getTime()) / 1000)),
          } as any,
        });

        return notificationId;
      } catch (scheduleError) {
        // Silently fail for Expo Go - notifications not fully supported
        return null;
      }
    } catch (error) {
      return null;
    }
  }

  /**
   * Cancel a scheduled alarm notification
   */
  static async cancelAlarmNotification(alarmId: string): Promise<boolean> {
    try {
      await Notifications.cancelScheduledNotificationAsync(alarmId);
      return true;
    } catch (error) {
      // Silently fail - not critical
      return false;
    }
  }

  /**
   * Get all scheduled notifications
   */
  static async getAllScheduledNotifications(): Promise<
    Notifications.NotificationRequest[]
  > {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  /**
   * Send immediate notification (for testing/foreground)
   */
  static async sendImmediateNotification(
    title: string,
    body: string,
    data?: Record<string, any>
  ): Promise<string | null> {
    try {
      return await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: 'default',
          badge: 1,
          data: data || {},
        },
        trigger: null, // Immediate
      });
    } catch (error) {
      console.error('Error sending notification:', error);
      return null;
    }
  }

  /**
   * Listen to notification responses (user tapped notification)
   */
  static addNotificationResponseListener(
    callback: (response: Notifications.NotificationResponse) => void
  ) {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }

  /**
   * Listen to foreground notifications
   */
  static addForegroundNotificationListener(
    callback: (notification: Notifications.Notification) => void
  ) {
    return Notifications.addNotificationReceivedListener(callback);
  }

  /**
   * Cancel all notifications
   */
  static async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('✅ Cancelled all scheduled notifications');
    } catch (error) {
      console.error('Error cancelling all notifications:', error);
    }
  }

  /**
   * Send task completion request notification
   */
  static async sendTaskNotification(
    alarmId: string,
    taskType: string,
    title: string = 'Hoàn thành nhiệm vụ',
    body: string = 'Vui lòng hoàn thành nhiệm vụ để dừng báo thức'
  ): Promise<string | null> {
    try {
      return await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: 'default',
          badge: 2,
          data: {
            alarmId,
            taskType,
            type: 'task',
          },
        },
        trigger: null, // Immediate
      });
    } catch (error) {
      console.error('Error sending task notification:', error);
      return null;
    }
  }

  /**
   * Send completion notification
   */
  static async sendCompletionNotification(
    title: string = 'Chúc mừng!',
    body: string = 'Bạn đã hoàn thành nhiệm vụ'
  ): Promise<string | null> {
    try {
      return await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: 'default',
          badge: 1,
          data: {
            type: 'completion',
          },
        },
        trigger: null, // Immediate
      });
    } catch (error) {
      console.error('Error sending completion notification:', error);
      return null;
    }
  }
}
