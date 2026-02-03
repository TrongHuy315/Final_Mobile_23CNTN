import AsyncStorage from '@react-native-async-storage/async-storage';
import { AlarmManager, SleepRecord, WakeUpRecord } from './alarm-manager';

export class SleepTracker {
  static MORNING_ROUTINE_KEY = 'TODAY_ROUTINES';
  static MORNING_ROUTINE_HISTORY_KEY = 'MORNING_ROUTINE_HISTORY';

  /**
   * Save today's morning routines
   */
  static async saveTodayRoutines(routines: any[]) {
    try {
      await AsyncStorage.setItem(this.MORNING_ROUTINE_KEY, JSON.stringify(routines));
    } catch (err) {
      console.error('Error saving routines:', err);
    }
  }

  /**
   * Load today's morning routines
   */
  static async getTodayRoutines() {
    try {
      const data = await AsyncStorage.getItem(this.MORNING_ROUTINE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (err) {
      console.error('Error loading routines:', err);
      return [];
    }
  }

  /**
   * Clear today's routines (called at start of new day)
   */
  static async clearTodayRoutines() {
    try {
      await AsyncStorage.removeItem(this.MORNING_ROUTINE_KEY);
    } catch (err) {
      console.error('Error clearing routines:', err);
    }
  }

  /**
   * Record wake up event
   */
  static async recordWakeUp(alarmId: string, completedTasks: boolean = false) {
    const today = new Date().toISOString().split('T')[0];
    
    // Check if already recorded today
    const existing = await AlarmManager.getTodayWakeUpRecord();
    if (existing) {
      return existing;
    }

    const record: Omit<WakeUpRecord, 'id' | 'createdAt'> = {
      date: today,
      wakeUpTime: Date.now(),
      taskCompleted: completedTasks,
    };

    const records = await AlarmManager.addWakeUpRecord(record);
    return records[records.length - 1];
  }

  /**
   * Update wake up task completion status
   */
  static async markWakeUpTaskComplete(recordId: string) {
    return AlarmManager.updateWakeUpRecord(recordId, {
      taskCompleted: true,
      completionTime: Date.now(),
    });
  }

  /**
   * Get sleep stats for a date range
   */
  static async getSleepStats(startDate: string, endDate: string) {
    const records = await AlarmManager.loadSleepRecords();
    const filtered = records.filter(
      (r) => r.date >= startDate && r.date <= endDate
    );

    if (filtered.length === 0) {
      return {
        count: 0,
        avgDuration: 0,
        avgQuality: 0,
        totalDuration: 0,
      };
    }

    const totalDuration = filtered.reduce((sum, r) => sum + r.duration, 0);
    const avgQuality = Math.round(
      filtered.reduce((sum, r) => sum + r.quality, 0) / filtered.length
    );

    return {
      count: filtered.length,
      avgDuration: Math.round(totalDuration / filtered.length),
      avgQuality,
      totalDuration,
    };
  }

  /**
   * Get wake up stats for a date range
   */
  static async getWakeUpStats(startDate: string, endDate: string) {
    const records = await AlarmManager.loadWakeUpRecords();
    const filtered = records.filter(
      (r) => r.date >= startDate && r.date <= endDate
    );

    const completed = filtered.filter((r) => r.taskCompleted).length;

    return {
      total: filtered.length,
      completed,
      completionRate: filtered.length > 0 ? Math.round((completed / filtered.length) * 100) : 0,
      streak: calculateStreak(filtered),
    };
  }

  /**
   * Get this week's date range
   */
  static getThisWeekRange() {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const firstDay = new Date(now);
    firstDay.setDate(now.getDate() - dayOfWeek);
    firstDay.setHours(0, 0, 0, 0);

    const lastDay = new Date(firstDay);
    lastDay.setDate(firstDay.getDate() + 6);
    lastDay.setHours(23, 59, 59, 999);

    const startDate = firstDay.toISOString().split('T')[0];
    const endDate = lastDay.toISOString().split('T')[0];

    return { startDate, endDate };
  }

  /**
   * Get last week's date range
   */
  static getLastWeekRange() {
    const { startDate } = this.getThisWeekRange();
    const firstDay = new Date(startDate);
    firstDay.setDate(firstDay.getDate() - 7);

    const lastDay = new Date(firstDay);
    lastDay.setDate(firstDay.getDate() + 6);

    const newStartDate = firstDay.toISOString().split('T')[0];
    const newEndDate = lastDay.toISOString().split('T')[0];

    return { startDate: newStartDate, endDate: newEndDate };
  }
}

/**
 * Helper to calculate wake up streak
 */
function calculateStreak(records: WakeUpRecord[]): number {
  if (records.length === 0) return 0;

  // Sort by date descending
  const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date));

  let streak = 0;
  const today = new Date().toISOString().split('T')[0];
  let currentDate = today;

  for (const record of sorted) {
    if (record.date === currentDate && record.taskCompleted) {
      streak++;
      const prev = new Date(currentDate);
      prev.setDate(prev.getDate() - 1);
      currentDate = prev.toISOString().split('T')[0];
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Format duration in minutes to human readable format
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

/**
 * Format time from timestamp
 */
export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Format date in Vietnamese format
 */
export function formatDateVN(dateStr: string): string {
  const date = new Date(dateStr);
  const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const dayName = days[date.getDay()];
  const day = date.getDate();
  const month = date.getMonth() + 1;
  return `${dayName}, ${day}/${month}`;
}
