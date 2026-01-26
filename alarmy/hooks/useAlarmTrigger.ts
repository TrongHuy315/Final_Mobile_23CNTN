import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { AlarmManager } from '../utils/alarm-manager';

const DAYS_MAP = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export const useAlarmTrigger = () => {
  const router = useRouter();
  const lastTriggered = useRef<string | null>(null);

  useEffect(() => {
    const checkAlarms = async () => {
      const now = new Date();
      // Only check at the start of the minute (0th second) to be efficient? 
      // Or check constantly but gate with lastTriggered.
      // Checking seconds triggers precisely when the minute changes.
      
      const currentDay = DAYS_MAP[now.getDay()];
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const timeString = `${currentDay}-${currentHour}:${currentMinute}`;

      // If we already triggered for this exact minute, skip
      if (lastTriggered.current === timeString) return;

      const alarms = await AlarmManager.loadAlarms();
      
      // Find active alarm
      const activeAlarm = alarms.find(alarm => {
        if (!alarm.enabled) return false;
        
        // Check time match
        const timeMatch = alarm.hour === currentHour && alarm.minute === currentMinute;
        if (!timeMatch) return false;

        // Check day match
        // If days array is empty, it's a "Once" alarm. 
        // We assume "Once" alarms are for the next occurrence, so if time matches, valid.
        // (Realworld logic might compare timestamps, but simple check is active + time + unset days)
        if (alarm.days.length === 0) return true;

        // If repeating, check if today is selected
        return alarm.days.includes(currentDay);
      });

      if (activeAlarm) {
        console.log('⏰ Alarm Triggered:', activeAlarm.label);
        lastTriggered.current = timeString;
        
        // Navigate to ringing screen
        router.push({ 
          pathname: '/alarm-ringing', 
          params: {
            alarmId: activeAlarm.id,
            snoozeCount: activeAlarm.snoozeSettings.maxCount === 'unlimited' ? 99 : activeAlarm.snoozeSettings.maxCount,
            label: activeAlarm.label
          } 
        });
        
        // If it's a one-time alarm, disable it
        if (activeAlarm.days.length === 0) {
          await AlarmManager.toggleAlarm(activeAlarm.id);
        }
      }
    };

    // Poll every 1 second
    const intervalId = setInterval(checkAlarms, 1000);

    return () => clearInterval(intervalId);
  }, []);
};
