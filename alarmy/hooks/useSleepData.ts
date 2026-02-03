import { useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { AlarmManager, SleepRecord, WakeUpRecord } from '../utils/alarm-manager';
import { SleepTracker } from '../utils/sleep-tracker';

export function useSleepData() {
  const [sleepRecords, setSleepRecords] = useState<SleepRecord[]>([]);
  const [wakeUpRecords, setWakeUpRecords] = useState<WakeUpRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const sleep = await AlarmManager.loadSleepRecords();
      const wakeUp = await AlarmManager.loadWakeUpRecords();
      
      setSleepRecords(sleep.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setWakeUpRecords(wakeUp.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (err) {
      console.error('Error loading sleep data:', err);
    } finally {
      setLoading(false);
    }
  };

  const addSleepRecord = async (record: Omit<SleepRecord, 'id' | 'createdAt'>) => {
    const updated = await AlarmManager.addSleepRecord(record);
    setSleepRecords(updated.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    return updated;
  };

  const recordWakeUp = async (completedTasks: boolean = false) => {
    const record = await SleepTracker.recordWakeUp('', completedTasks);
    loadData(); // Reload to update UI
    return record;
  };

  const markWakeUpComplete = async (recordId: string) => {
    const updated = await SleepTracker.markWakeUpTaskComplete(recordId);
    setWakeUpRecords(updated.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    return updated;
  };

  const getWeekStats = async () => {
    const { startDate, endDate } = SleepTracker.getThisWeekRange();
    const sleepStats = await SleepTracker.getSleepStats(startDate, endDate);
    const wakeStats = await SleepTracker.getWakeUpStats(startDate, endDate);
    return { sleepStats, wakeStats };
  };

  const getTodayRecord = () => {
    const today = new Date().toISOString().split('T')[0];
    return wakeUpRecords.find(r => r.date === today);
  };

  return {
    sleepRecords,
    wakeUpRecords,
    loading,
    loadData,
    addSleepRecord,
    recordWakeUp,
    markWakeUpComplete,
    getWeekStats,
    getTodayRecord,
  };
}

export function useMorningRoutines() {
  const [routines, setRoutines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadRoutines();
    }, [])
  );

  const loadRoutines = async () => {
    try {
      setLoading(true);
      const data = await SleepTracker.getTodayRoutines();
      setRoutines(data);
    } catch (err) {
      console.error('Error loading routines:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateRoutines = async (newRoutines: any[]) => {
    try {
      await SleepTracker.saveTodayRoutines(newRoutines);
      setRoutines(newRoutines);
    } catch (err) {
      console.error('Error updating routines:', err);
    }
  };

  const toggleRoutine = async (id: string) => {
    const updated = routines.map(r =>
      r.id === id ? { ...r, completed: !r.completed, completedAt: !r.completed ? Date.now() : undefined } : r
    );
    await updateRoutines(updated);
  };

  const addRoutine = async (routine: any) => {
    const updated = [...routines, routine];
    await updateRoutines(updated);
  };

  const removeRoutine = async (id: string) => {
    const updated = routines.filter(r => r.id !== id);
    await updateRoutines(updated);
  };

  const getCompletionStats = () => {
    const total = routines.length;
    const completed = routines.filter(r => r.completed).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percent };
  };

  return {
    routines,
    loading,
    loadRoutines,
    updateRoutines,
    toggleRoutine,
    addRoutine,
    removeRoutine,
    getCompletionStats,
  };
}
