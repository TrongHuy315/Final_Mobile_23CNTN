import { ArcGauge } from '@/components/arc-gauge-props';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Modal,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AlarmManager, SleepRecord } from '@/utils/alarm-manager';
import { router } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';

export default function SleepScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDarkMode } = useTheme();
  const [sleepScore, setSleepScore] = useState(63);
  const [sleepRecords, setSleepRecords] = useState<SleepRecord[]>([]);
  const [trackingModalVisible, setTrackingModalVisible] = useState(false);
  const [sleepTime, setSleepTime] = useState('23:00');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [quality, setQuality] = useState(70);
  const [notes, setNotes] = useState('');
  const [avgSleepDuration, setAvgSleepDuration] = useState(0);

  useFocusEffect(
    useCallback(() => {
      const loadSleepData = async () => {
        const records = await AlarmManager.loadSleepRecords();
        setSleepRecords(records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        
        // Calculate average sleep duration from last 7 days
        const last7 = records.slice(-7);
        if (last7.length > 0) {
          const avgDuration = Math.round(last7.reduce((sum, r) => sum + r.duration, 0) / last7.length);
          const hours = Math.floor(avgDuration / 60);
          const mins = avgDuration % 60;
          setAvgSleepDuration(avgDuration);
          
          // Calculate sleep score (0-100)
          const avgQuality = Math.round(last7.reduce((sum, r) => sum + r.quality, 0) / last7.length);
          const score = Math.round((avgDuration / 480) * 50 + (avgQuality / 100) * 50);
          setSleepScore(Math.min(score, 100));
        }
      };
      loadSleepData();
    }, [])
  );

  const handleSaveSleepRecord = async () => {
    try {
      // Parse times
      const [sleepHour, sleepMin] = sleepTime.split(':').map(Number);
      const [wakeHour, wakeMin] = wakeTime.split(':').map(Number);

      let sleepDate = new Date();
      sleepDate.setHours(sleepHour, sleepMin, 0, 0);

      let wakeDate = new Date();
      wakeDate.setHours(wakeHour, wakeMin, 0, 0);

      // If wake time is earlier than sleep time, assume it's next day
      if (wakeDate < sleepDate) {
        wakeDate.setDate(wakeDate.getDate() + 1);
      }

      const durationMs = wakeDate.getTime() - sleepDate.getTime();
      const durationMins = Math.round(durationMs / (1000 * 60));

      const record: Omit<SleepRecord, 'id' | 'createdAt'> = {
        date: new Date().toISOString().split('T')[0],
        sleepTime: sleepDate.getTime(),
        wakeTime: wakeDate.getTime(),
        duration: durationMins,
        quality: quality,
        notes: notes,
      };

      await AlarmManager.addSleepRecord(record);
      
      // Reload data
      const records = await AlarmManager.loadSleepRecords();
      setSleepRecords(records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      
      // Reset form
      setSleepTime('23:00');
      setWakeTime('07:00');
      setQuality(70);
      setNotes('');
      setTrackingModalVisible(false);
    } catch (error) {
      console.error('Error saving sleep record:', error);
    }
  };

  const calculateRemainingTime = () => {
    const now = new Date();
    const hours = 23 - now.getHours();
    const minutes = 60 - now.getMinutes();
    const formattedHours = String(Math.max(0, hours === 23 ? 0 : hours)).padStart(2, '0');
    const formattedMins = String(Math.max(0, minutes === 60 ? 0 : minutes - 1)).padStart(2, '0');
    return `${formattedHours}:${formattedMins}`;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getTodayRecord = () => {
    const today = new Date().toISOString().split('T')[0];
    return sleepRecords.find(r => r.date === today);
  };

  const todayRecord = getTodayRecord();

  return (
    <SafeAreaProvider style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Giấc ngủ</Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        {/* Sleep Score Card */}
        <View style={[styles.scoreCard, { backgroundColor: isDarkMode ? '#7a7a96' : '#e2e8f0' }]}>
          <Text style={[styles.scoreCardTitle, { color: isDarkMode ? '#ffffff' : colors.text }]}>Tìm hiểu vấn đề về giấc ngủ của bạn</Text>

          <View style={{ marginTop: 30, alignItems: 'center' }}>
            <ArcGauge score={sleepScore} />
          </View>

          <Text style={[styles.scoreCardText, { color: isDarkMode ? '#ffffff' : colors.textSecondary }]}>
            Bạn có thể ngủ {formatDuration(avgSleepDuration)} kể từ bây giờ
          </Text>

          <TouchableOpacity
            style={[styles.sleepBtn, { backgroundColor: isDarkMode ? '#0909e6' : '#2563eb' }]}
            onPress={() => setTrackingModalVisible(true)}
          >
            <Ionicons name="add" size={20} color="#ffffff" />
            <Text style={styles.sleepBtnText}>Theo dõi giấc ngủ của tôi</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Sleep Records */}
        {sleepRecords.length > 0 && (
          <View style={styles.recordsSection}>
            <Text style={[styles.recordsTitle, { color: colors.text }]}>Ghi lại gần đây</Text>
            {sleepRecords.slice(0, 5).map((record) => (
              <View key={record.id} style={[styles.recordCard, { backgroundColor: colors.surface }]}>
                <View style={styles.recordCardLeft}>
                  <View style={[styles.recordDateBadge, { backgroundColor: isDarkMode ? '#334155' : '#e2e8f0' }]}>
                    <Text style={[styles.recordDateBadgeText, { color: colors.textSecondary }]}>{record.date}</Text>
                  </View>
                  <View style={styles.recordCardInfo}>
                    <Text style={[styles.recordCardDuration, { color: colors.text }]}>
                      {formatDuration(record.duration)}
                    </Text>
                    <Text style={[styles.recordCardQuality, { color: colors.textMuted }]}>Chất lượng {record.quality}%</Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.recordQualityBadge,
                    {
                      backgroundColor: `hsl(${200 + record.quality * 1.6}, 80%, 50%)`,
                    },
                  ]}
                >
                  <Text style={styles.recordQualityText}>{record.quality}%</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Stats */}
        <View style={styles.statsSection}>
          <Text style={[styles.statsTitle, { color: colors.text }]}>Thống kê 7 ngày</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statItem, { backgroundColor: colors.surface }]}>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Trung bình</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {formatDuration(Math.round(sleepRecords.slice(-7).reduce((sum, r) => sum + r.duration, 0) / (sleepRecords.length > 0 ? sleepRecords.length : 1)))}
              </Text>
            </View>
            <View style={[styles.statItem, { backgroundColor: colors.surface }]}>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Chất lượng</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {Math.round(sleepRecords.slice(-7).reduce((sum, r) => sum + r.quality, 0) / (sleepRecords.length > 0 ? sleepRecords.length : 1))}%
              </Text>
            </View>
            <View style={[styles.statItem, { backgroundColor: colors.surface }]}>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Tổng số ngày</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>{sleepRecords.length}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sleep Report Button */}
      <TouchableOpacity 
        style={[
          styles.reportBtn, 
          { 
            backgroundColor: isDarkMode ? '#7a7a96' : '#e2e8f0', 
            marginBottom: insets.bottom + 12, 
            marginHorizontal: 16 
          }
        ]} 
        onPress={() => {router.push("/(tabs)/report")}}
      >
        <Text style={[styles.reportBtnText, { color: isDarkMode ? '#ffffff' : colors.text }]}>Báo cáo giấc ngủ</Text>
        <Ionicons name="chevron-forward-outline" size={20} color={isDarkMode ? '#ffffff' : colors.text} />
      </TouchableOpacity>

      {/* Tracking Modal */}
      <Modal
        visible={trackingModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setTrackingModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.background, paddingTop: insets.top + 16 }]}>
              {/* Header */}
              <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Theo dõi giấc ngủ</Text>
                <TouchableOpacity onPress={() => setTrackingModalVisible(false)}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                {/* Sleep Time */}
                <View style={styles.formGroup}>
                  <Text style={[styles.formLabel, { color: colors.text }]}>Giờ ngủ</Text>
                  <TextInput
                    style={[styles.timeInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                    value={sleepTime}
                    onChangeText={setSleepTime}
                    placeholder="23:00"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>

                {/* Wake Time */}
                <View style={styles.formGroup}>
                  <Text style={[styles.formLabel, { color: colors.text }]}>Giờ thức dậy</Text>
                  <TextInput
                    style={[styles.timeInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                    value={wakeTime}
                    onChangeText={setWakeTime}
                    placeholder="07:00"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>

                {/* Quality Slider */}
                <View style={styles.formGroup}>
                  <View style={styles.qualityHeader}>
                    <Text style={[styles.formLabel, { color: colors.text }]}>Chất lượng giấc ngủ</Text>
                    <Text style={[styles.qualityValue, { color: colors.primary }]}>{quality}%</Text>
                  </View>
                  <View style={styles.sliderContainer}>
                    {[0, 25, 50, 75, 100].map((value) => (
                      <TouchableOpacity
                        key={value}
                        style={[
                          styles.qualityButton,
                          { backgroundColor: colors.surface, borderColor: colors.border },
                          quality === value && [styles.qualityButtonActive, { backgroundColor: colors.primary, borderColor: colors.primary }],
                        ]}
                        onPress={() => setQuality(value)}
                      >
                        <Text
                          style={[
                            styles.qualityButtonText,
                            { color: colors.textSecondary },
                            quality === value && styles.qualityButtonTextActive,
                          ]}
                        >
                          {value}%
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Notes */}
                <View style={styles.formGroup}>
                  <Text style={[styles.formLabel, { color: colors.text }]}>Ghi chú (tùy chọn)</Text>
                  <TextInput
                    style={[styles.notesInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Thêm ghi chú về giấc ngủ của bạn..."
                    placeholderTextColor={colors.textMuted}
                    multiline
                    numberOfLines={4}
                  />
                </View>
              </ScrollView>

              {/* Save Button */}
              <View style={[styles.modalFooter, { borderTopColor: colors.border, paddingBottom: insets.bottom + 12 }]}>
                <TouchableOpacity
                  style={[styles.saveButton, { backgroundColor: colors.primary }]}
                  onPress={handleSaveSleepRecord}
                >
                  <Text style={styles.saveButtonText}>Lưu</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
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
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scoreCard: {
    width: '100%',
    borderRadius: 20,
    alignItems: 'center',
    padding: 20,
    marginTop: 16,
    marginBottom: 20,
  },
  scoreCardTitle: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  scoreCardText: {
    color: '#ffffff',
    marginTop: 20,
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 14,
  },
  sleepBtn: {
    width: '100%',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    flexDirection: 'row',
    gap: 8,
  },
  sleepBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  recordsSection: {
    marginBottom: 24,
  },
  recordsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  recordCard: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  recordDateBadge: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
  },
  recordDateBadgeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  recordCardInfo: {
    flex: 1,
  },
  recordCardDuration: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  recordCardQuality: {
    fontSize: 12,
  },
  recordQualityBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  recordQualityText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  statsSection: {
    marginBottom: 24,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 6,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  reportBtn: {
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  reportBtnText: {
    fontSize: 17,
    color: '#ffffff',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    flex: 0.9,
    paddingHorizontal: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalBody: {
    flex: 1,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  timeInput: {
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
  },
  qualityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  qualityValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  sliderContainer: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  qualityButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
  },
  qualityButtonActive: {
  },
  qualityButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  qualityButtonTextActive: {
    color: '#ffffff',
  },
  notesInput: {
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    textAlignVertical: 'top',
  },
  modalFooter: {
    paddingTop: 16,
    borderTopWidth: 1,
  },
  saveButton: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
