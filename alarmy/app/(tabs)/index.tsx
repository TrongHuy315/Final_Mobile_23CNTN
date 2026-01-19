import { AlarmCard } from '@/components/alarm-card';
import { FloatingActionButton } from '@/components/floating-action-button';
import { NewFeatureBanner } from '@/components/new-feature-banner';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

interface Alarm {
  id: string;
  time: string;
  label: string;
  days: string;
  enabled: boolean;
}

export default function AlarmsScreen() {
  const insets = useSafeAreaInsets
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

  const [menu, setMenu] = useState(false);

  const handleToggleAlarm = (id: string, enabled: boolean) => {
    setAlarms(alarms.map(alarm =>
      alarm.id === id ? { ...alarm, enabled } : alarm
    ));
  };

  const handleAddAlarm = () => setMenu(!menu);

  return (
    <SafeAreaProvider style={styles.container}>
      <View style={styles.header}>
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
          <Text style={styles.sectionTitle}>Đó chuông sau 2 ngày</Text>
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

      {menu && (
        <View style={styles.overlay}>
          <TouchableOpacity 
            style={styles.backdrop}
            activeOpacity={1}
            onPress={() => setMenu(false)}
          />

          <View style={styles.menu}>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuText}>
                Báo thức thói quen
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuText}>
                Báo thức nhanh
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuText}>
                Báo thức
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaProvider>
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
    marginTop: 50
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

  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: "box-none"
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject, // Thay cho top, left, right, bottom
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1,
  },

  menu: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    backgroundColor: '#1a202c',
    borderRadius: 12,
    paddingVertical: 8,
    width: 180,
    zIndex: 2,          // Phải lớn hơn zIndex của backdrop
    elevation: 10,      // Bắt buộc để nổi lên trên Android
  },

  menuText: {
    color: '#ffffff',   // Thêm dòng này để chữ không bị "tàng hình"
    fontSize: 14,
  },

  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  }
});
