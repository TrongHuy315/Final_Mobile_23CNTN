import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  FlatList,
  Modal,
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AlarmManager, WakeUpRecord, SleepRecord } from '@/utils/alarm-manager';
import { useTheme } from '@/context/ThemeContext';

const { width } = Dimensions.get('window');

export default function ReportScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDarkMode } = useTheme();
  const [wakeUpRecords, setWakeUpRecords] = useState<WakeUpRecord[]>([]);
  const [sleepRecords, setSleepRecords] = useState<SleepRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'wakeup' | 'sleep'>('wakeup');
  const [weekRange, setWeekRange] = useState(0); // 0 = this week, -1 = last week, etc
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<WakeUpRecord | SleepRecord | null>(null);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        const wakeUp = await AlarmManager.loadWakeUpRecords();
        const sleep = await AlarmManager.loadSleepRecords();
        setWakeUpRecords(wakeUp.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setSleepRecords(sleep.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      };
      loadData();
    }, [])
  );

  const getWeekDates = (offset: number = 0) => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const firstDay = new Date(now);
    firstDay.setDate(now.getDate() - dayOfWeek + offset * 7);
    
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(firstDay);
      d.setDate(firstDay.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  };

  const weekDates = getWeekDates(weekRange);
  const weekLabel = (() => {
    const start = new Date(weekDates[0]);
    const end = new Date(weekDates[6]);
    if (weekRange === 0) return 'Tuần này';
    if (weekRange === -1) return 'Tuần trước';
    return `${start.getDate()}/${start.getMonth() + 1} - ${end.getDate()}/${end.getMonth() + 1}`;
  })();

  // Filter records for current week
  const filteredWakeUpRecords = wakeUpRecords.filter(r => weekDates.includes(r.date));
  const filteredSleepRecords = sleepRecords.filter(r => weekDates.includes(r.date));

  // Calculate stats
  const wakeUpStats = {
    total: filteredWakeUpRecords.length,
    completed: filteredWakeUpRecords.filter(r => r.taskCompleted).length,
    streak: calculateStreak(filteredWakeUpRecords),
    avgTime: calculateAvgWakeUpTime(filteredWakeUpRecords),
  };

  const sleepStats = {
    total: filteredSleepRecords.length,
    avgDuration: calculateAvgSleepDuration(filteredSleepRecords),
    avgQuality: calculateAvgQuality(filteredSleepRecords),
  };

  function calculateStreak(records: WakeUpRecord[]): number {
    let streak = 0;
    for (const date of weekDates) {
      if (records.some(r => r.date === date && r.taskCompleted)) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  function calculateAvgWakeUpTime(records: WakeUpRecord[]): string {
    if (records.length === 0) return '--:--';
    const times = records.map(r => {
      const date = new Date(r.wakeUpTime);
      return date.getHours() * 60 + date.getMinutes();
    });
    const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
    const hours = String(Math.floor(avg / 60)).padStart(2, '0');
    const mins = String(avg % 60).padStart(2, '0');
    return `${hours}:${mins}`;
  }

  function calculateAvgSleepDuration(records: SleepRecord[]): string {
    if (records.length === 0) return '0h 0m';
    const totalMins = records.reduce((sum, r) => sum + r.duration, 0);
    const avgMins = Math.round(totalMins / records.length);
    const hours = Math.floor(avgMins / 60);
    const mins = avgMins % 60;
    return `${hours}h ${mins}m`;
  }

  function calculateAvgQuality(records: SleepRecord[]): number {
    if (records.length === 0) return 0;
    return Math.round(records.reduce((sum, r) => sum + r.quality, 0) / records.length);
  }

  const getDayLabel = (dateStr: string, index: number) => {
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    return days[new Date(dateStr).getDay()];
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <SafeAreaProvider style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Báo cáo</Text>
      </View>

      {/* Week Navigation */}
      <View style={[styles.weekNav, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => setWeekRange(weekRange - 1)}>
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.weekLabel, { color: colors.text }]}>{weekLabel}</Text>
        <TouchableOpacity
          onPress={() => setWeekRange(weekRange + 1)}
          disabled={weekRange === 0}
        >
          <Ionicons name="chevron-forward" size={24} color={weekRange === 0 ? colors.textMuted : colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={[styles.tabsContainer, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'wakeup' && [styles.tabActive, { borderBottomColor: colors.primary }]]}
          onPress={() => setActiveTab('wakeup')}
        >
          <Ionicons name="sunny" size={18} color={activeTab === 'wakeup' ? '#fbbf24' : colors.textMuted} />
          <Text style={[styles.tabText, { color: colors.textSecondary }, activeTab === 'wakeup' && [styles.tabTextActive, { color: colors.text }]]}>
            Thức dậy
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'sleep' && [styles.tabActive, { borderBottomColor: colors.primary }]]}
          onPress={() => setActiveTab('sleep')}
        >
          <Ionicons name="moon" size={18} color={activeTab === 'sleep' ? '#a78bfa' : colors.textMuted} />
          <Text style={[styles.tabText, { color: colors.textSecondary }, activeTab === 'sleep' && [styles.tabTextActive, { color: colors.text }]]}>
            Giấc ngủ
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        {activeTab === 'wakeup' ? (
          <>
            {/* Wake Up Stats */}
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
                <Text style={[styles.statValue, { color: colors.text }]}>{wakeUpStats.completed}</Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Hoàn thành</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
                <Text style={[styles.statValue, { color: colors.text }]}>{wakeUpStats.streak}</Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Chuỗi</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
                <Text style={[styles.statValue, { color: colors.text }]}>{wakeUpStats.avgTime}</Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Giờ trung bình</Text>
              </View>
            </View>

            {/* Wake Up Chart */}
            <View style={styles.chartSection}>
              <Text style={[styles.chartTitle, { color: colors.text }]}>Hoạt động hàng ngày</Text>
              <View style={styles.dayChartContainer}>
                {weekDates.map((date, index) => {
                  const record = filteredWakeUpRecords.find(r => r.date === date);
                  const completed = record?.taskCompleted || false;
                  return (
                    <TouchableOpacity
                      key={date}
                      style={styles.dayChart}
                      onPress={() => {
                        if (record) {
                          setSelectedRecord(record);
                          setDetailModalVisible(true);
                        }
                      }}
                    >
                      <View
                        style={[
                          styles.dayBox,
                          completed ? styles.dayBoxCompleted : [styles.dayBoxEmpty, { backgroundColor: colors.surface }],
                        ]}
                      >
                        {completed && (
                          <Ionicons name="checkmark" size={16} color="#ffffff" />
                        )}
                      </View>
                      <Text style={[styles.dayLabel, { color: colors.textMuted }]}>{getDayLabel(date, index)}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Wake Up Records */}
            <View style={styles.recordsSection}>
              <Text style={[styles.recordsTitle, { color: colors.text }]}>Chi tiết</Text>
              {filteredWakeUpRecords.length === 0 ? (
                <View style={styles.emptyState}>
                  <MaterialCommunityIcons name="sleep" size={48} color={colors.textMuted} />
                  <Text style={[styles.emptyStateText, { color: colors.textMuted }]}>Không có dữ liệu tuần này</Text>
                </View>
              ) : (
                <FlatList
                  data={filteredWakeUpRecords}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[styles.recordItem, { backgroundColor: colors.surface }]}
                      onPress={() => {
                        setSelectedRecord(item);
                        setDetailModalVisible(true);
                      }}
                    >
                      <View style={styles.recordItemLeft}>
                        <View
                          style={[
                            styles.recordIcon,
                            item.taskCompleted
                              ? styles.recordIconCompleted
                              : styles.recordIconPending,
                          ]}
                        >
                          <Ionicons
                            name={item.taskCompleted ? 'checkmark' : 'close'}
                            size={18}
                            color="#ffffff"
                          />
                        </View>
                        <View style={styles.recordInfo}>
                          <Text style={[styles.recordDate, { color: colors.text }]}>{item.date}</Text>
                          <Text style={[styles.recordStatus, { color: colors.textSecondary }]}>
                            {item.taskCompleted ? 'Hoàn thành' : 'Chưa hoàn thành'}
                          </Text>
                        </View>
                      </View>
                      <Text style={[styles.recordTime, { color: colors.primary }]}>
                        {formatTime(item.wakeUpTime)}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              )}
            </View>
          </>
        ) : (
          <>
            {/* Sleep Stats */}
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
                <Text style={[styles.statValue, { color: colors.text }]}>{sleepStats.avgDuration}</Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Trung bình</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
                <Text style={[styles.statValue, { color: colors.text }]}>{sleepStats.avgQuality}%</Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Chất lượng</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
                <Text style={[styles.statValue, { color: colors.text }]}>{filteredSleepRecords.length}</Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Ngày</Text>
              </View>
            </View>

            {/* Sleep Chart */}
            <View style={styles.chartSection}>
              <Text style={[styles.chartTitle, { color: colors.text }]}>Hoạt động hàng ngày</Text>
              <View style={[styles.durationChartContainer, { backgroundColor: colors.surface }]}>
                {weekDates.map((date) => {
                  const record = filteredSleepRecords.find(r => r.date === date);
                  const heightPercent = record ? (record.duration / 480) * 100 : 0; // max 8 hours
                  const dayLabel = getDayLabel(date, 0);
                  return (
                    <View key={date} style={styles.durationChartBar}>
                      <TouchableOpacity
                        style={[
                          styles.bar,
                          {
                            height: `${Math.min(heightPercent, 100)}%`,
                            backgroundColor: record
                              ? `hsl(${200 + record.quality * 1.6}, 80%, 50%)`
                              : isDarkMode ? '#1e293b' : '#e2e8f0',
                          },
                        ]}
                        onPress={() => {
                          if (record) {
                            setSelectedRecord(record);
                            setDetailModalVisible(true);
                          }
                        }}
                      />
                      <Text style={[styles.durationLabel, { color: colors.textMuted }]}>{dayLabel}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Sleep Records */}
            <View style={styles.recordsSection}>
              <Text style={[styles.recordsTitle, { color: colors.text }]}>Chi tiết</Text>
              {filteredSleepRecords.length === 0 ? (
                <View style={styles.emptyState}>
                  <MaterialCommunityIcons name="sleep" size={48} color={colors.textMuted} />
                  <Text style={[styles.emptyStateText, { color: colors.textMuted }]}>Không có dữ liệu tuần này</Text>
                </View>
              ) : (
                <FlatList
                  data={filteredSleepRecords}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[styles.recordItem, { backgroundColor: colors.surface }]}
                      onPress={() => {
                        setSelectedRecord(item);
                        setDetailModalVisible(true);
                      }}
                    >
                      <View style={styles.recordItemLeft}>
                        <View style={[styles.recordIcon, styles.recordIconSleep]}>
                          <Ionicons name="moon" size={18} color="#ffffff" />
                        </View>
                        <View style={styles.recordInfo}>
                          <Text style={[styles.recordDate, { color: colors.text }]}>{item.date}</Text>
                          <Text style={[styles.recordStatus, { color: colors.textSecondary }]}>
                            {Math.floor(item.duration / 60)}h {item.duration % 60}m • Chất lượng {item.quality}%
                          </Text>
                        </View>
                      </View>
                      <View style={[styles.qualityBadge, { backgroundColor: isDarkMode ? '#1e293b' : colors.background }]}>
                        <Text style={styles.qualityBadgeText}>{item.quality}%</Text>
                      </View>
                    </TouchableOpacity>
                  )}
                />
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* Detail Modal */}
      <Modal
        visible={detailModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface, paddingTop: insets.top + 16 }]}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setDetailModalVisible(false)}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>

            {selectedRecord && (
              <View>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {activeTab === 'wakeup' ? 'Chi tiết thức dậy' : 'Chi tiết giấc ngủ'}
                </Text>

                {activeTab === 'wakeup' && selectedRecord && 'taskCompleted' in selectedRecord ? (
                  <>
                    <View style={[styles.modalDetailRow, { borderBottomColor: colors.border }]}>
                      <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Ngày</Text>
                      <Text style={[styles.modalValue, { color: colors.text }]}>{(selectedRecord as WakeUpRecord).date}</Text>
                    </View>
                    <View style={[styles.modalDetailRow, { borderBottomColor: colors.border }]}>
                      <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Giờ thức dậy</Text>
                      <Text style={[styles.modalValue, { color: colors.text }]}>
                        {formatTime((selectedRecord as WakeUpRecord).wakeUpTime)}
                      </Text>
                    </View>
                    <View style={[styles.modalDetailRow, { borderBottomColor: colors.border }]}>
                      <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Trạng thái</Text>
                      <Text
                        style={[
                          styles.modalValue,
                          (selectedRecord as WakeUpRecord).taskCompleted
                            ? { color: '#22c55e' }
                            : { color: '#ef4444' },
                        ]}
                      >
                        {(selectedRecord as WakeUpRecord).taskCompleted ? 'Hoàn thành' : 'Chưa hoàn thành'}
                      </Text>
                    </View>
                  </>
                ) : activeTab === 'sleep' && selectedRecord && 'duration' in selectedRecord ? (
                  <>
                    <View style={[styles.modalDetailRow, { borderBottomColor: colors.border }]}>
                      <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Ngày</Text>
                      <Text style={[styles.modalValue, { color: colors.text }]}>{(selectedRecord as SleepRecord).date}</Text>
                    </View>
                    <View style={[styles.modalDetailRow, { borderBottomColor: colors.border }]}>
                      <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Thời gian ngủ</Text>
                      <Text style={[styles.modalValue, { color: colors.text }]}>
                        {Math.floor((selectedRecord as SleepRecord).duration / 60)}h {(selectedRecord as SleepRecord).duration % 60}m
                      </Text>
                    </View>
                    <View style={[styles.modalDetailRow, { borderBottomColor: colors.border }]}>
                      <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Chất lượng giấc ngủ</Text>
                      <Text style={[styles.modalValue, { color: colors.text }]}>{(selectedRecord as SleepRecord).quality}%</Text>
                    </View>
                    {(selectedRecord as SleepRecord).notes && (
                      <View style={[styles.modalDetailRow, { borderBottomColor: colors.border }]}>
                        <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Ghi chú</Text>
                        <Text style={[styles.modalValue, { color: colors.text }]}>{(selectedRecord as SleepRecord).notes}</Text>
                      </View>
                    )}
                  </>
                ) : null}
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  weekNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  weekLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tabTextActive: {
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  chartSection: {
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  dayChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 8,
  },
  dayChart: {
    alignItems: 'center',
    flex: 1,
  },
  dayBox: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  dayBoxCompleted: {
    backgroundColor: '#22c55e',
  },
  dayBoxEmpty: {
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  durationChartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 160,
    borderRadius: 12,
    padding: 12,
  },
  durationChartBar: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
  },
  bar: {
    width: '80%',
    minHeight: 4,
    borderRadius: 4,
  },
  durationLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 8,
  },
  recordsSection: {
    marginBottom: 24,
  },
  recordsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  recordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  recordItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  recordIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordIconCompleted: {
    backgroundColor: '#22c55e',
  },
  recordIconPending: {
    backgroundColor: '#ef4444',
  },
  recordIconSleep: {
    backgroundColor: '#a78bfa',
  },
  recordInfo: {
    flex: 1,
  },
  recordDate: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  recordStatus: {
    fontSize: 12,
  },
  recordTime: {
    fontSize: 12,
    fontWeight: '600',
  },
  qualityBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  qualityBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#a78bfa',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  modalCloseButton: {
    alignSelf: 'flex-end',
    padding: 4,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
  },
  modalDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  modalLabel: {
    fontSize: 14,
  },
  modalValue: {
    fontSize: 14,
    fontWeight: '600',
  },
});
