import { AlarmCard } from '@/components/alarm-card';
import { FloatingActionButton } from '@/components/floating-action-button';
import { NewFeatureBanner } from '@/components/new-feature-banner';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Alarm {
  id: string;
  time: string;
  label: string;
  days: string;
  enabled: boolean;
}

export default function AlarmsScreen() {
  const insets = useSafeAreaInsets();
  const [alarms, setAlarms] = useState<Alarm[]>([
    {
      id: '1',
      time: '08:00',
      label: 'T2 T3 T4 T5 T6',
      days: 'T7',
      enabled: false,
    },
    {
      id: '2',
      time: '08:00',
      label: 'T2 T3 T4 T5 T6',
      days: 'T7',
      enabled: true,
    },
  ]);

  const handleToggleAlarm = (id: string, enabled: boolean) => {
    setAlarms(alarms.map(alarm =>
      alarm.id === id ? { ...alarm, enabled } : alarm
    ));
  };

  const handleAddAlarm = () => {
    console.log('Add new alarm');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Text style={styles.headerTitle}>PRO Start</Text>
        <TouchableOpacity>
          <Ionicons name="ellipsis-vertical" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <NewFeatureBanner />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Đó chuông sau 2ngày</Text>
        </View>

        <View style={styles.alarmsList}>
          {alarms.map(alarm => (
            <AlarmCard
              key={alarm.id}
              id={alarm.id}
              time={alarm.time}
              label={alarm.label}
              days={alarm.days}
              enabled={alarm.enabled}
              onToggle={handleToggleAlarm}
            />
          ))}
        </View>
      </ScrollView>

      <FloatingActionButton onPress={handleAddAlarm} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#a0aec0',
    marginLeft: 4,
  },
  alarmsList: {
    marginBottom: 20,
  },
});
