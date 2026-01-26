// AlarmManager.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Alarm {
  id: string;
  hour: number;        // 0 – 23
  minute: number;      // 0 – 59
  volume: number;      // 0 – 100
  vibration: boolean;
  enabled: boolean;
  label?: string;
  createdAt: number;   // timestamp
  type: 'regular' | 'flash';
}

export class AlarmManager {
  private static STORAGE_KEY = "ALARMS_STORAGE";

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
    return updated;
  }

  static async removeAlarm(id: string): Promise<Alarm[]> {
    const alarms = await this.loadAlarms();
    const updated = alarms.filter(a => a.id !== id);
    await this.saveAlarms(updated);
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
    return updated;
  }

  static async toggleAlarm(id: string): Promise<Alarm[]> {
    const alarms = await this.loadAlarms();

    const updated = alarms.map(alarm =>
      alarm.id === id ? { ...alarm, enabled: !alarm.enabled } : alarm
    );

    await this.saveAlarms(updated);
    return updated;
  }

  static async clearAll(): Promise<void> {
    await AsyncStorage.removeItem(this.STORAGE_KEY);
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
      label,
      type
    };
  }
}
