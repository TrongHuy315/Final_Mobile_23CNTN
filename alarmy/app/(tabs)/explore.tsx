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
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AlarmManager, SleepRecord } from '@/utils/alarm-manager';
import { router } from 'expo-router';

export default function SleepScreen() {
  const insets = useSafeAreaInsets();
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
    <SafeAreaProvider style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Text style={styles.headerTitle}>Giấc ngủ</Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        {/* Sleep Score Card */}
        <View style={styles.scoreCard}>
          <Text style={styles.scoreCardTitle}>Tìm hiểu vấn đề về giấc ngủ của bạn</Text>

          <View style={{ marginTop: 30, alignItems: 'center' }}>
            <ArcGauge score={sleepScore} />
          </View>

          <Text style={styles.scoreCardText}>
            Bạn có thể ngủ {formatDuration(avgSleepDuration)} kể từ bây giờ
          </Text>

          <TouchableOpacity
            style={styles.sleepBtn}
            onPress={() => setTrackingModalVisible(true)}
          >
            <Ionicons name="add" size={20} color="#ffffff" />
            <Text style={styles.sleepBtnText}>Theo dõi giấc ngủ của tôi</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Sleep Records */}
        {sleepRecords.length > 0 && (
          <View style={styles.recordsSection}>
            <Text style={styles.recordsTitle}>Ghi lại gần đây</Text>
            {sleepRecords.slice(0, 5).map((record) => (
              <View key={record.id} style={styles.recordCard}>
                <View style={styles.recordCardLeft}>
                  <View style={styles.recordDateBadge}>
                    <Text style={styles.recordDateBadgeText}>{record.date}</Text>
                  </View>
                  <View style={styles.recordCardInfo}>
                    <Text style={styles.recordCardDuration}>
                      {formatDuration(record.duration)}
                    </Text>
                    <Text style={styles.recordCardQuality}>Chất lượng {record.quality}%</Text>
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
          <Text style={styles.statsTitle}>Thống kê 7 ngày</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Trung bình</Text>
              <Text style={styles.statValue}>
                {formatDuration(Math.round(sleepRecords.slice(-7).reduce((sum, r) => sum + r.duration, 0) / (sleepRecords.length > 0 ? sleepRecords.length : 1)))}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Chất lượng</Text>
              <Text style={styles.statValue}>
                {Math.round(sleepRecords.slice(-7).reduce((sum, r) => sum + r.quality, 0) / (sleepRecords.length > 0 ? sleepRecords.length : 1))}%
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Tổng số ngày</Text>
              <Text style={styles.statValue}>{sleepRecords.length}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sleep Report Button */}
      <TouchableOpacity style={[styles.reportBtn, { marginBottom: insets.bottom + 12, marginHorizontal: 16 }]} onPress={() => {router.push("/(tabs)/report")}}>
        <Text style={styles.reportBtnText}>Báo cáo giấc ngủ</Text>
        <Ionicons name="chevron-forward-outline" size={20} color="#ffffff" />
      </TouchableOpacity>

      {/* Tracking Modal */}
      <Modal
        visible={trackingModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setTrackingModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingTop: insets.top + 16 }]}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Theo dõi giấc ngủ</Text>
              <TouchableOpacity onPress={() => setTrackingModalVisible(false)}>
                <Ionicons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Sleep Time */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Giờ ngủ</Text>
                <TextInput
                  style={styles.timeInput}
                  value={sleepTime}
                  onChangeText={setSleepTime}
                  placeholder="23:00"
                  placeholderTextColor="#64748b"
                />
              </View>

              {/* Wake Time */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Giờ thức dậy</Text>
                <TextInput
                  style={styles.timeInput}
                  value={wakeTime}
                  onChangeText={setWakeTime}
                  placeholder="07:00"
                  placeholderTextColor="#64748b"
                />
              </View>

              {/* Quality Slider */}
              <View style={styles.formGroup}>
                <View style={styles.qualityHeader}>
                  <Text style={styles.formLabel}>Chất lượng giấc ngủ</Text>
                  <Text style={styles.qualityValue}>{quality}%</Text>
                </View>
                <View style={styles.sliderContainer}>
                  {[0, 25, 50, 75, 100].map((value) => (
                    <TouchableOpacity
                      key={value}
                      style={[
                        styles.qualityButton,
                        quality === value && styles.qualityButtonActive,
                      ]}
                      onPress={() => setQuality(value)}
                    >
                      <Text
                        style={[
                          styles.qualityButtonText,
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
                <Text style={styles.formLabel}>Ghi chú (tùy chọn)</Text>
                <TextInput
                  style={[styles.notesInput]}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Thêm ghi chú về giấc ngủ của bạn..."
                  placeholderTextColor="#64748b"
                  multiline
                  numberOfLines={4}
                />
              </View>
            </ScrollView>

            {/* Save Button */}
            <View style={[styles.modalFooter, { paddingBottom: insets.bottom + 12 }]}>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveSleepRecord}
              >
                <Text style={styles.saveButtonText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scoreCard: {
    backgroundColor: '#7a7a96',
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
    backgroundColor: '#0909e6',
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
    color: '#ffffff',
    marginBottom: 12,
  },
  recordCard: {
    backgroundColor: '#1e293b',
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
    backgroundColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
  },
  recordDateBadgeText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '500',
  },
  recordCardInfo: {
    flex: 1,
  },
  recordCardDuration: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  recordCardQuality: {
    fontSize: 12,
    color: '#64748b',
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
    color: '#ffffff',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  reportBtn: {
    backgroundColor: '#7a7a96',
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
    backgroundColor: '#1e293b',
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
    borderBottomColor: '#334155',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
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
    color: '#ffffff',
    marginBottom: 8,
  },
  timeInput: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 12,
    color: '#ffffff',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#334155',
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
    color: '#3b82f6',
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
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  qualityButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  qualityButtonText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  qualityButtonTextActive: {
    color: '#ffffff',
  },
  notesInput: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 12,
    color: '#ffffff',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#334155',
    textAlignVertical: 'top',
  },
  modalFooter: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  saveButton: {
    backgroundColor: '#3b82f6',
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
