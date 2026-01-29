import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AlarmManager, Alarm } from '../utils/alarm-manager';

const { width, height } = Dimensions.get('window');

// Helper to format date in Vietnamese
const getFormattedDate = (date: Date) => {
  const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const dayName = days[date.getDay()];
  const day = date.getDate();
  const month = date.getMonth() + 1;
  return `${dayName}, ${day} tháng ${month}`;
};

// Helper to format time
const getFormattedTime = (date: Date) => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

export default function AlarmRingingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeAlarm, setActiveAlarm] = useState<Alarm | null>(null);
  
  // Alarm data from params
  const alarmLabel = params.label ? String(params.label) : "Báo thức";
  const alarmId = params.alarmId ? String(params.alarmId) : null;

  // Update clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Load active alarm
  useEffect(() => {
    if (alarmId) {
      const loadAlarm = async () => {
        const alarms = await AlarmManager.loadAlarms();
        const alarm = alarms.find(a => a.id === alarmId);
        if (alarm) {
          setActiveAlarm(alarm);
        }
      };
      loadAlarm();
    }
  }, [alarmId]);

  const handleSnooze = async () => {
    if (!activeAlarm || !activeAlarm.snoozeSettings.enabled) return;

    const currentSnoozeCount = params.snoozeCount 
      ? parseInt(params.snoozeCount as string) 
      : (activeAlarm.snoozeSettings.maxCount === 'unlimited' ? 999 : activeAlarm.snoozeSettings.maxCount);

    if (currentSnoozeCount <= 0) {
      console.log("No snooze remaining");
      return;
    }

    console.log("Snooze pressed for alarm:", activeAlarm.label);
    
    // Navigate to snooze countdown
    router.replace({
      pathname: '/snooze-countdown',
      params: {
        alarmId: activeAlarm.id,
        alarmLabel: activeAlarm.label,
        interval: activeAlarm.snoozeSettings.interval.toString(),
        snoozeCount: (currentSnoozeCount).toString(),
      }
    });
  };

  const handleDismiss = async () => {
    console.log("Dismiss pressed");
    
    // Check if there are tasks to perform
    if (activeAlarm && activeAlarm.tasks.length > 0) {
      const firstTask = activeAlarm.tasks[0];
      if (firstTask.type === 'math') {
        router.replace({
          pathname: '/math-task',
          params: {
            alarmId: activeAlarm.id,
            alarmLabel: activeAlarm.label,
            difficulty: firstTask.settings?.difficulty?.toString() || '2',
            rounds: firstTask.settings?.itemCount?.toString() || '3',
          }
        });
        return;
      } else if (firstTask.type === 'tap_challenge') {
        router.replace({
          pathname: './tap-task',
          params: {
            alarmId: activeAlarm.id,
            alarmLabel: activeAlarm.label,
            itemCount: firstTask.settings?.itemCount?.toString() || '50',
          }
        });
        return;
      }
    }

    // If it's a flash alarm, remove it after dismissal
    if (activeAlarm && activeAlarm.type === 'flash') {
      console.log("Removing flash alarm after dismissal:", activeAlarm.id);
      await AlarmManager.removeAlarm(activeAlarm.id);
    }

    // No tasks, navigate home
    router.replace('/');
  };
  
  // Snooze info
  const isSnoozeEnabled = activeAlarm?.snoozeSettings.enabled ?? false;
  
  const currentSnoozeCount = params.snoozeCount 
    ? parseInt(params.snoozeCount as string) 
    : (activeAlarm?.snoozeSettings.maxCount === 'unlimited' ? '∞' : activeAlarm?.snoozeSettings.maxCount ?? 0);

  const snoozeCountDisplay = currentSnoozeCount === '∞' ? '∞' : currentSnoozeCount;

  return (
    <View style={styles.container}>
      <StatusBar style="light" hidden={true} />
      
      {/* Background - Simple Dark Gradient-like solid color */}
      <View style={styles.background} />

      <SafeAreaView style={styles.content}>
        {/* Date Section */}
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>
            {getFormattedDate(currentTime)}
          </Text>
        </View>

        {/* Time Section */}
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>
            {getFormattedTime(currentTime)}
          </Text>
        </View>

        {/* Motivational Center */}
        <View style={styles.centerContainer}>
          <Text style={styles.quoteText}>IT'S</Text>
          <Text style={styles.quoteText}>YOU VS YOU</Text>
          
          <Ionicons name="trophy-outline" size={40} color="rgba(255,255,255,0.3)" style={{marginTop: 20}} />
        </View>

        {/* Bottom Actions */}
        <View style={styles.bottomContainer}>
          {/* Snooze Button - Only show if enabled */}
          {isSnoozeEnabled && (
            <TouchableOpacity 
              style={styles.snoozeButton}
              onPress={handleSnooze}
            >
              <View style={styles.snoozeBadge}>
                <Text style={styles.snoozeBadgeText}>{snoozeCountDisplay}</Text>
              </View>
              <Text style={styles.snoozeText}>Báo lại</Text>
            </TouchableOpacity>
          )}

          {/* Dismiss Button */}
          <TouchableOpacity 
            style={styles.dismissButton}
            onPress={handleDismiss}
          >
            <Text style={styles.dismissText}>Hủy</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0f172a', // Dark slate theme
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between', // Distribute vertically
    paddingVertical: 40,
  },
  dateContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  dateText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '500',
    opacity: 0.9,
  },
  timeContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  timeText: {
    color: '#ffffff',
    fontSize: 90,
    fontWeight: '700',
    letterSpacing: 2,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quoteText: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '800', // Extra bold
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 4,
  },
  bottomContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 30, // Space between snooze and dismiss
    marginBottom: 20,
  },
  snoozeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30, // Pill shape
    gap: 10,
  },
  snoozeBadge: {
    backgroundColor: '#000000',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  snoozeBadgeText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  snoozeText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  dismissButton: {
    width: '100%',
    backgroundColor: '#ff3b30', // Red color
    paddingVertical: 18,
    borderRadius: 35, // Rounded pill
    alignItems: 'center',
    shadowColor: '#ff3b30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  dismissText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
