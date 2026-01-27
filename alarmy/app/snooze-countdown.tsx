import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

export default function SnoozeCountdownScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const interval = params.interval ? parseInt(params.interval as string) : 5;
  const initialSnoozeCount = params.snoozeCount ? parseInt(params.snoozeCount as string) : 1;
  const alarmId = params.alarmId as string;
  const alarmLabel = params.alarmLabel as string || 'Báo thức';

  const [timeLeft, setTimeLeft] = useState(interval * 60);

  useEffect(() => {
    if (timeLeft <= 0) {
      // Re-trigger alarm ringing
      router.replace({
        pathname: '/alarm-ringing',
        params: {
          alarmId,
          label: alarmLabel,
          snoozeCount: (initialSnoozeCount - 1).toString(),
        }
      });
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const [activeAlarm, setActiveAlarm] = useState<any>(null);

  useEffect(() => {
    const loadAlarm = async () => {
      const { AlarmManager } = require('../utils/alarm-manager');
      const alarms = await AlarmManager.loadAlarms();
      const alarm = alarms.find((a: any) => a.id === alarmId);
      if (alarm) {
        setActiveAlarm(alarm);
      }
    };
    loadAlarm();
  }, [alarmId]);

  const handleCancel = () => {
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
      }
    }
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" hidden={true} />
      
      {/* Background with darker theme */}
      <View style={styles.background} />

      <SafeAreaView style={styles.content}>
        <View style={styles.centerContainer}>
          {/* Bear icon/logo placeholder as shown in image */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Ionicons name="notifications" size={32} color="#ffffff" />
            </View>
            <Text style={styles.logoText}>IT'S</Text>
            <Text style={styles.logoSubText}>YOUR TIME</Text>
          </View>

          {/* Timer Display */}
          <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>

          {/* Snooze Count Info */}
          <Text style={styles.snoozeInfoText}>
            Còn {initialSnoozeCount} lần hoãn
          </Text>
        </View>

        {/* Bottom Button */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={handleCancel}
          >
            <Text style={styles.cancelButtonText}>Hủy</Text>
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
    backgroundColor: '#0f172a', // Dark slate theme consistent with alarm ringing
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 60,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  logoText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
    opacity: 0.6,
  },
  logoSubText: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '900',
    opacity: 0.8,
    marginTop: -5,
  },
  timerText: {
    color: '#ffffff',
    fontSize: 100,
    fontWeight: '700',
    letterSpacing: 2,
  },
  snoozeInfoText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '500',
    marginTop: 20,
    opacity: 0.9,
  },
  bottomContainer: {
    width: '100%',
    paddingHorizontal: 40,
    marginBottom: 20,
  },
  cancelButton: {
    width: '100%',
    backgroundColor: '#ef4444', // Red color
    paddingVertical: 18,
    borderRadius: 35,
    alignItems: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cancelButtonText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
  },
});
