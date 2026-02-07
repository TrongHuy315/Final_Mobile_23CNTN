import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Check if running in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

// Lazy-loaded notifications module (to avoid auto-registration in Expo Go)
let Notifications: typeof import('expo-notifications') | null = null;

async function getNotifications() {
  if (!Notifications && !isExpoGo) {
    Notifications = await import('expo-notifications');
  }
  return Notifications;
}

/**
 * Notification Manager for handling alarm notifications
 * Supports both foreground and background notifications
 * Note: Push notifications are disabled in Expo Go (SDK 53+)
 */
export class NotificationManager {
  private static isInitialized = false;

  /**
   * Initialize notification system
   */
  static async initialize() {
    if (this.isInitialized) return;

    try {
      // Skip push notification setup in Expo Go (not supported in SDK 53+)
      if (isExpoGo) {
        console.log('📱 Running in Expo Go - push notifications disabled');
        this.isInitialized = true;
        return;
      }

      const notifs = await getNotifications();
      if (!notifs) {
        this.isInitialized = true;
        return;
      }

      // Set notification handler
      notifs.setNotificationHandler({
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
          const { status } = await notifs.requestPermissionsAsync();
          if (status !== 'granted') {
            // Silently continue - permissions denied but not critical
          }
        } catch (permError) {
          // Notification permissions request failed
        }
      }

      this.isInitialized = true;
    } catch (error) {
      // Silently fail
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
    if (isExpoGo) return null;
    
    try {
      const notifs = await getNotifications();
      if (!notifs) return null;

      const triggerTime = new Date(alarmTime);
      const now = new Date();

      // Don't schedule if time is in the past
      if (triggerTime <= now) {
        return null;
      }

      try {
        const notificationId = await notifs.scheduleNotificationAsync({
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
    if (isExpoGo) return false;
    
    try {
      const notifs = await getNotifications();
      if (!notifs) return false;

      await notifs.cancelScheduledNotificationAsync(alarmId);
      return true;
    } catch (error) {
      // Silently fail - not critical
      return false;
    }
  }

  /**
   * Get all scheduled notifications
   */
  static async getAllScheduledNotifications(): Promise<any[]> {
    if (isExpoGo) return [];
    
    try {
      const notifs = await getNotifications();
      if (!notifs) return [];

      return await notifs.getAllScheduledNotificationsAsync();
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
    if (isExpoGo) return null;
    
    try {
      const notifs = await getNotifications();
      if (!notifs) return null;

      return await notifs.scheduleNotificationAsync({
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
    callback: (response: any) => void
  ) {
    if (isExpoGo) return { remove: () => {} };
    
    // Use synchronous require for listeners (they need to be set up early)
    try {
      const notifs = require('expo-notifications');
      return notifs.addNotificationResponseReceivedListener(callback);
    } catch {
      return { remove: () => {} };
    }
  }

  /**
   * Listen to foreground notifications
   */
  static addForegroundNotificationListener(
    callback: (notification: any) => void
  ) {
    if (isExpoGo) return { remove: () => {} };
    
    try {
      const notifs = require('expo-notifications');
      return notifs.addNotificationReceivedListener(callback);
    } catch {
      return { remove: () => {} };
    }
  }

  /**
   * Cancel all notifications
   */
  static async cancelAllNotifications(): Promise<void> {
    if (isExpoGo) return;
    
    try {
      const notifs = await getNotifications();
      if (!notifs) return;

      await notifs.cancelAllScheduledNotificationsAsync();
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
    if (isExpoGo) return null;
    
    try {
      const notifs = await getNotifications();
      if (!notifs) return null;

      return await notifs.scheduleNotificationAsync({
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
    if (isExpoGo) return null;
    
    try {
      const notifs = await getNotifications();
      if (!notifs) return null;

      return await notifs.scheduleNotificationAsync({
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
