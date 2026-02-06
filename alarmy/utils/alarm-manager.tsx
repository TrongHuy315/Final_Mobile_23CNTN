// AlarmManager.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NotificationManager } from "./notification-manager";

export type AlarmTask = {
  id: string;
  type: string;
  name: string;
  icon: string;
  iconColor: string;
  settings?: any;
};

export interface Alarm {
  id: string;
  hour: number;
  minute: number;
  enabled: boolean;
  label: string;
  icon: string;
  days: string[]; // ['T2', 'T3']
  volume: number; // 0 - 100
  vibration: boolean;
  gentleWake: string; // 'off', '30s', ...
  tasks: AlarmTask[];
  snoozeSettings: {
    enabled: boolean;
    interval: number;
    maxCount: number | 'unlimited';
  };
  type: 'regular' | 'flash';
  createdAt: number;
}

export interface SleepRecord {
  id: string;
  date: string; // YYYY-MM-DD
  sleepTime: number; // timestamp
  wakeTime: number; // timestamp
  duration: number; // minutes
  quality: number; // 0-100
  notes: string;
  createdAt: number;
}

export interface WakeUpRecord {
  id: string;
  date: string; // YYYY-MM-DD
  wakeUpTime: number; // timestamp
  taskCompleted: boolean;
  completionTime?: number; // timestamp
  createdAt: number;
}

export class AlarmManager {
  private static STORAGE_KEY = "ALARMS_STORAGE";
  private static SLEEP_RECORDS_KEY = "SLEEP_RECORDS_STORAGE";
  private static WAKEUP_RECORDS_KEY = "WAKEUP_RECORDS_STORAGE";

  /* ================= LOAD / SAVE ================= */

  static async loadAlarms(): Promise<Alarm[]> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (!data) return [];
      return JSON.parse(data) as Alarm[];
    } catch (err) {
      console.error("Load alarms error:", err);
      return [];
    }
  }

  static async saveAlarms(alarms: Alarm[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(alarms));
    } catch (err) {
      console.error("Save alarms error:", err);
    }
  }

  /* ================= SLEEP RECORDS ================= */

  static async loadSleepRecords(): Promise<SleepRecord[]> {
    try {
      const data = await AsyncStorage.getItem(this.SLEEP_RECORDS_KEY);
      if (!data) return [];
      return JSON.parse(data) as SleepRecord[];
    } catch (err) {
      console.error("Load sleep records error:", err);
      return [];
    }
  }

  static async saveSleepRecords(records: SleepRecord[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.SLEEP_RECORDS_KEY, JSON.stringify(records));
    } catch (err) {
      console.error("Save sleep records error:", err);
    }
  }

  static async addSleepRecord(record: Omit<SleepRecord, "id" | "createdAt">): Promise<SleepRecord[]> {
    const records = await this.loadSleepRecords();
    const newRecord: SleepRecord = {
      ...record,
      id: Date.now().toString(),
      createdAt: Date.now(),
    };
    const updated = [...records, newRecord];
    await this.saveSleepRecords(updated);
    return updated;
  }

  /* ================= WAKEUP RECORDS ================= */

  static async loadWakeUpRecords(): Promise<WakeUpRecord[]> {
    try {
      const data = await AsyncStorage.getItem(this.WAKEUP_RECORDS_KEY);
      if (!data) return [];
      return JSON.parse(data) as WakeUpRecord[];
    } catch (err) {
      console.error("Load wakeup records error:", err);
      return [];
    }
  }

  static async saveWakeUpRecords(records: WakeUpRecord[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.WAKEUP_RECORDS_KEY, JSON.stringify(records));
    } catch (err) {
      console.error("Save wakeup records error:", err);
    }
  }

  static async addWakeUpRecord(record: Omit<WakeUpRecord, "id" | "createdAt">): Promise<WakeUpRecord[]> {
    const records = await this.loadWakeUpRecords();
    const newRecord: WakeUpRecord = {
      ...record,
      id: Date.now().toString(),
      createdAt: Date.now(),
    };
    const updated = [...records, newRecord];
    await this.saveWakeUpRecords(updated);
    return updated;
  }

  static async getTodayWakeUpRecord(): Promise<WakeUpRecord | null> {
    const records = await this.loadWakeUpRecords();
    const today = new Date().toISOString().split('T')[0];
    return records.find(r => r.date === today) || null;
  }

  static async updateWakeUpRecord(id: string, updates: Partial<WakeUpRecord>): Promise<WakeUpRecord[]> {
    const records = await this.loadWakeUpRecords();
    const updated = records.map(r => r.id === id ? { ...r, ...updates } : r);
    await this.saveWakeUpRecords(updated);
    return updated;
  }

  /* ================= CRUD ================= */

  static async addAlarm(
    alarm: Omit<Alarm, "id" | "createdAt">
  ): Promise<Alarm[]> {
    const alarms = await this.loadAlarms();

    const newAlarm: Alarm = {
      ...alarm,
      id: Date.now().toString(),
      createdAt: Date.now(),
    };

    const updated = [...alarms, newAlarm];
    await this.saveAlarms(updated);

    // Schedule notification for this alarm if enabled
    if (newAlarm.enabled) {
      const triggerTime = this.getNextTriggerTime(newAlarm);
      await NotificationManager.scheduleAlarmNotification(
        triggerTime,
        newAlarm.id,
        `🔔 ${newAlarm.label}`,
        `Báo thức lúc ${String(newAlarm.hour).padStart(2, '0')}:${String(newAlarm.minute).padStart(2, '0')}`
      );
    }

    return updated;
  }

  static async removeAlarm(id: string): Promise<Alarm[]> {
    const alarms = await this.loadAlarms();
    const updated = alarms.filter(a => a.id !== id);
    await this.saveAlarms(updated);

    // Cancel notification for this alarm
    await NotificationManager.cancelAlarmNotification(id);

    return updated;
  }

  static async updateAlarm(
    id: string,
    newData: Partial<Alarm>
  ): Promise<Alarm[]> {
    const alarms = await this.loadAlarms();

    const updated = alarms.map(alarm =>
      alarm.id === id ? { ...alarm, ...newData } : alarm
    );

    await this.saveAlarms(updated);

    // Update/reschedule notification
    const updatedAlarm = updated.find(a => a.id === id);
    if (updatedAlarm) {
      if (updatedAlarm.enabled) {
        // Cancel old notification and reschedule
        await NotificationManager.cancelAlarmNotification(id);
        const triggerTime = this.getNextTriggerTime(updatedAlarm);
        await NotificationManager.scheduleAlarmNotification(
          triggerTime,
          updatedAlarm.id,
          `🔔 ${updatedAlarm.label}`,
          `Báo thức lúc ${String(updatedAlarm.hour).padStart(2, '0')}:${String(updatedAlarm.minute).padStart(2, '0')}`
        );
      } else {
        // Cancel notification if disabled
        await NotificationManager.cancelAlarmNotification(id);
      }
    }

    return updated;
  }

  static async toggleAlarm(id: string): Promise<Alarm[]> {
    const alarms = await this.loadAlarms();

    const updated = alarms.map(alarm =>
      alarm.id === id ? { ...alarm, enabled: !alarm.enabled } : alarm
    );

    await this.saveAlarms(updated);

    // Handle notification for toggled alarm
    const toggledAlarm = updated.find(a => a.id === id);
    if (toggledAlarm) {
      if (toggledAlarm.enabled) {
        // Re-enable: schedule notification
        const triggerTime = this.getNextTriggerTime(toggledAlarm);
        await NotificationManager.scheduleAlarmNotification(
          triggerTime,
          toggledAlarm.id,
          `🔔 ${toggledAlarm.label}`,
          `Báo thức lúc ${String(toggledAlarm.hour).padStart(2, '0')}:${String(toggledAlarm.minute).padStart(2, '0')}`
        );
      } else {
        // Disable: cancel notification
        await NotificationManager.cancelAlarmNotification(id);
      }
    }

    return updated;
  }

  static async clearAll(): Promise<void> {
    await AsyncStorage.removeItem(this.STORAGE_KEY);
    await AsyncStorage.removeItem(this.SLEEP_RECORDS_KEY);
    await AsyncStorage.removeItem(this.WAKEUP_RECORDS_KEY);
  }

  /* ================= UTILITIES ================= */

  // Tính thời điểm alarm sẽ kêu (timestamp)
  static getNextTriggerTime(alarm: Alarm): number {
    const now = new Date();
    const trigger = new Date();

    trigger.setHours(alarm.hour);
    trigger.setMinutes(alarm.minute);
    trigger.setSeconds(0);
    trigger.setMilliseconds(0);

    // Nếu giờ đã qua hôm nay → chuyển sang ngày mai
    if (trigger.getTime() <= now.getTime()) {
      trigger.setDate(trigger.getDate() + 1);
    }

    return trigger.getTime();
  }

  // Lấy alarm sắp kêu nhất
  static async getNextAlarm(): Promise<Alarm | null> {
    const alarms = await this.loadAlarms();
    const enabledAlarms = alarms.filter(a => a.enabled);

    if (enabledAlarms.length === 0) return null;

    let nextAlarm = enabledAlarms[0];
    let minTime = this.getNextTriggerTime(nextAlarm);

    for (const alarm of enabledAlarms) {
      const t = this.getNextTriggerTime(alarm);
      if (t < minTime) {
        minTime = t;
        nextAlarm = alarm;
      }
    }

    return nextAlarm;
  }

  // Tạo alarm từ "sau X phút" giống logic màn hình của em
  static createFromDelay(
    delayMinutes: number,
    volume: number,
    vibration: boolean,
    label?: string
  ): Omit<Alarm, "id" | "createdAt"> {
    const now = new Date();
    const totalMinutes = now.getHours() * 60 + now.getMinutes() + delayMinutes;

    const hour = Math.floor((totalMinutes / 60) % 24);
    const minute = totalMinutes % 60;

    const type = "flash";

    return {
      hour,
      minute,
      volume,
      vibration,
      enabled: true,
      label: label || "Báo thức nhanh",
      icon: '⏰',
      days: [],
      type,
      gentleWake: 'off',
      tasks: [],
      snoozeSettings: {
        enabled: false,
        interval: 5,
        maxCount: 3,
      },
    };
  }
}
