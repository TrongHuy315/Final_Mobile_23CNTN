import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  FlatList,
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AlarmManager } from '@/utils/alarm-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const MORNING_ROUTINES = [
  { id: '1', name: 'Thức dậy sớm', icon: 'bird', color: '#fbbf24', duration: '1 phút' },
  { id: '2', name: 'Uống nước', icon: 'water', color: '#3b82f6', duration: '2 phút' },
  { id: '3', name: 'Giãn cơ 5 phút', icon: 'weight-lifter', color: '#64748b', duration: '5 phút' },
  { id: '4', name: 'Thiền 1 phút', icon: 'meditation', color: '#a855f7', duration: '1 phút' },
  { id: '5', name: 'Đọc lời cầu nguyện', icon: 'hands-pray', color: '#f59e0b', duration: '3 phút' },
  { id: '6', name: 'Tắm nước nóng', icon: 'shower-head', color: '#14b8a6', duration: '10 phút' },
];

interface RoutineTask {
  id: string;
  name: string;
  completed: boolean;
  completedAt?: number;
}

export default function DayScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [todayRoutines, setTodayRoutines] = useState<RoutineTask[]>([]);
  const [todayDate, setTodayDate] = useState(new Date());
  const [wakeUpTime, setWakeUpTime] = useState<number | null>(null);

  // Load today's wake up record
  useFocusEffect(
    useCallback(() => {
      const loadTodayData = async () => {
        const wakeUpRecord = await AlarmManager.getTodayWakeUpRecord();
        if (wakeUpRecord) {
          setWakeUpTime(wakeUpRecord.completionTime || wakeUpRecord.wakeUpTime);
          // Initialize routines from AsyncStorage or set defaults
          const stored = await AsyncStorage.getItem('TODAY_ROUTINES');
          if (stored) {
            setTodayRoutines(JSON.parse(stored));
          } else {
            // Initialize with first few routines
            const initial = MORNING_ROUTINES.slice(0, 3).map(r => ({
              id: r.id,
              name: r.name,
              completed: false,
            }));
            setTodayRoutines(initial);
          }
        }
        setTodayDate(new Date());
      };
      loadTodayData();
    }, [])
  );

  const toggleRoutine = async (id: string) => {
    const updated = todayRoutines.map(r =>
      r.id === id ? { ...r, completed: !r.completed, completedAt: !r.completed ? Date.now() : undefined } : r
    );
    setTodayRoutines(updated);
    // Save to storage
    await AsyncStorage.setItem('TODAY_ROUTINES', JSON.stringify(updated));
  };

  const completedCount = todayRoutines.filter(r => r.completed).length;
  const totalCount = todayRoutines.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const getFormattedDate = () => {
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const dayName = days[todayDate.getDay()];
    const day = todayDate.getDate();
    const month = todayDate.getMonth() + 1;
    return `${dayName}, ${day}/${month}`;
  };

  const getRoutineIcon = (iconName: string) => {
    return <MaterialCommunityIcons name={iconName as any} size={24} color="#ffffff" />;
  };

  return (
    <SafeAreaProvider style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Text style={styles.headerTitle}>Sáng</Text>
        <Text style={styles.headerDate}>{getFormattedDate()}</Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        {/* Wake Up Info Card */}
        {wakeUpTime && (
          <View style={styles.wakeUpCard}>
            <View style={styles.wakeUpCardHeader}>
              <Ionicons name="sunny" size={28} color="#fbbf24" />
              <View style={styles.wakeUpCardText}>
                <Text style={styles.wakeUpCardTitle}>Thức dậy lúc</Text>
                <Text style={styles.wakeUpCardTime}>{formatTime(wakeUpTime)}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.editButton}>
              <Ionicons name="pencil" size={16} color="#3b82f6" />
            </TouchableOpacity>
          </View>
        )}

        {/* Progress Section */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Thói quen sáng</Text>
            <Text style={styles.progressCount}>
              {completedCount}/{totalCount}
            </Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                { width: `${progressPercent}%` },
              ]}
            />
          </View>
          <Text style={styles.progressPercent}>{progressPercent}% hoàn thành</Text>
        </View>

        {/* Routines List */}
        <View style={styles.routinesSection}>
          {todayRoutines.map((routine) => {
            const routineInfo = MORNING_ROUTINES.find(r => r.id === routine.id);
            return (
              <TouchableOpacity
                key={routine.id}
                style={[
                  styles.routineItem,
                  routine.completed && styles.routineItemCompleted,
                ]}
                onPress={() => toggleRoutine(routine.id)}
              >
                <View style={styles.routineItemContent}>
                  <View
                    style={[
                      styles.routineCheckbox,
                      routine.completed && styles.routineCheckboxCompleted,
                    ]}
                  >
                    {routine.completed && (
                      <Ionicons name="checkmark" size={18} color="#ffffff" />
                    )}
                  </View>
                  <View style={styles.routineInfo}>
                    <Text
                      style={[
                        styles.routineName,
                        routine.completed && styles.routineNameCompleted,
                      ]}
                    >
                      {routine.name}
                    </Text>
                    {routineInfo && (
                      <Text style={styles.routineDuration}>
                        ~{routineInfo.duration}
                      </Text>
                    )}
                  </View>
                </View>
                {routine.completed && (
                  <Text style={styles.completedTime}>
                    {routine.completedAt ? formatTime(routine.completedAt) : ''}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Add More Routines */}
        <TouchableOpacity
          style={styles.addMoreButton}
          onPress={() => router.push('/routine-selection')}
        >
          <Ionicons name="add-circle-outline" size={20} color="#3b82f6" />
          <Text style={styles.addMoreButtonText}>Thêm thói quen khác</Text>
        </TouchableOpacity>

        {/* Suggestions */}
        {todayRoutines.length < MORNING_ROUTINES.length && (
          <View style={styles.suggestionsSection}>
            <Text style={styles.suggestionsTitle}>Gợi ý khác</Text>
            <FlatList
              data={MORNING_ROUTINES.filter(
                r => !todayRoutines.find(tr => tr.id === r.id)
              )}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.suggestionItem}
                  onPress={() => {
                    const newRoutine: RoutineTask = {
                      id: item.id,
                      name: item.name,
                      completed: false,
                    };
                    const updated = [...todayRoutines, newRoutine];
                    setTodayRoutines(updated);
                    AsyncStorage.setItem('TODAY_ROUTINES', JSON.stringify(updated));
                  }}
                >
                  <View style={[styles.suggestionIcon, { backgroundColor: item.color }]}>
                    {getRoutineIcon(item.icon)}
                  </View>
                  <View style={styles.suggestionInfo}>
                    <Text style={styles.suggestionName}>{item.name}</Text>
                    <Text style={styles.suggestionDuration}>{item.duration}</Text>
                  </View>
                  <Ionicons name="add" size={20} color="#64748b" />
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerDate: {
    fontSize: 14,
    color: '#94a3b8',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  wakeUpCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#fbbf24',
  },
  wakeUpCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  wakeUpCardText: {
    flex: 1,
  },
  wakeUpCardTitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 2,
  },
  wakeUpCardTime: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressSection: {
    marginTop: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  progressCount: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#1e293b',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 4,
  },
  progressPercent: {
    fontSize: 12,
    color: '#64748b',
  },
  routinesSection: {
    marginTop: 20,
    gap: 12,
  },
  routineItem: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  routineItemCompleted: {
    borderColor: '#22c55e',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  routineItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  routineCheckbox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#64748b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  routineCheckboxCompleted: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  routineInfo: {
    flex: 1,
  },
  routineName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: 2,
  },
  routineNameCompleted: {
    color: '#94a3b8',
    textDecorationLine: 'line-through',
  },
  routineDuration: {
    fontSize: 12,
    color: '#64748b',
  },
  completedTime: {
    fontSize: 12,
    color: '#22c55e',
    fontWeight: '500',
  },
  addMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#334155',
    borderStyle: 'dashed',
  },
  addMoreButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
  suggestionsSection: {
    marginTop: 24,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    marginBottom: 8,
  },
  suggestionIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionInfo: {
    flex: 1,
  },
  suggestionName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: 2,
  },
  suggestionDuration: {
    fontSize: 12,
    color: '#64748b',
  },
});

