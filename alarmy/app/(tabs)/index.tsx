import { AlarmCard } from '@/components/alarm-card';
import { FloatingActionButton } from '@/components/floating-action-button';
import { NewFeatureBanner } from '@/components/new-feature-banner';
import { Alarm, AlarmManager } from '@/utils/alarm-manager';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FlashAlarmScreen from '../flash-alarm';

export default function AlarmsScreen() {
  const insets = useSafeAreaInsets();
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [menu, setMenu] = useState(false);
  const [quickAlarmVisible, setQuickAlarmVisible] = useState(false);
  const [nextAlarmText, setNextAlarmText] = useState('Đang tải...');

  // 1. Hàm Load dữ liệu từ AsyncStorage
  const loadAlarms = async () => {
    try {
      const data = await AlarmManager.loadAlarms();
      // Sắp xếp báo thức theo thời gian (giờ rồi đến phút)
      const sortedData = [...data].sort((a, b) => {
        if (a.hour !== b.hour) return a.hour - b.hour;
        return a.minute - b.minute;
      });
      setAlarms(sortedData);
      await updateNextAlarmStatus();
    } catch (error) {
      console.error("Lỗi khi load alarm:", error);
    }
  };

  // 2. Tính toán thời gian còn lại đến báo thức tiếp theo
  const updateNextAlarmStatus = async () => {
    const next = await AlarmManager.getNextAlarm();
    if (!next) {
      setNextAlarmText('Tất cả báo thức đang tắt');
      return;
    }
    
    const triggerTime = AlarmManager.getNextTriggerTime(next);
    const diffMs = triggerTime - Date.now();
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    let text = 'Đổ chuông sau ';
    if (diffHours > 0) text += `${diffHours} giờ `;
    text += `${diffMins} phút`;
    setNextAlarmText(text);
  };

  // Tự động làm mới dữ liệu mỗi khi màn hình được focus (quay lại từ màn hình khác)
  useFocusEffect(
    useCallback(() => {
      loadAlarms();
    }, [])
  );

  // 3. Xử lý Bật/Tắt báo thức
  const handleToggleAlarm = async (id: string) => {
    const updated = await AlarmManager.toggleAlarm(id);
    setAlarms(updated.sort((a, b) => (a.hour * 60 + a.minute) - (b.hour * 60 + b.minute)));
    updateNextAlarmStatus();
  };

  // 4. Xử lý Xóa báo thức (Nhấn giữ)
  const handleDeleteAlarm = (id: string) => {
    Alert.alert("Xóa báo thức", "Bạn có chắc chắn muốn xóa báo thức này?", [
      { text: "Hủy", style: "cancel" },
      { 
        text: "Xóa", 
        style: "destructive", 
        onPress: async () => {
          const updated = await AlarmManager.removeAlarm(id);
          setAlarms(updated.sort((a, b) => (a.hour * 60 + a.minute) - (b.hour * 60 + b.minute)));
          updateNextAlarmStatus();
        } 
      }
    ]);
  };

  // 5. Xử lý Chỉnh sửa (Nhấn vào card)
  const handleEditAlarm = (alarm: Alarm) => {
    // Nếu là loại flash thì chặn không cho sửa
    if (alarm.type === 'flash') {
      Alert.alert(
        "Thông báo",
        "Báo thức nhanh không hỗ trợ chỉnh sửa chi tiết. Bạn có thể bật/tắt hoặc xóa nó.",
        [{ text: "Đã hiểu" }]
      );
      return;
    }

    // Nếu là loại thường, mở logic chỉnh sửa tại đây
    console.log("Mở màn hình chỉnh sửa cho báo thức:", alarm.id);
    // navigation.navigate('EditAlarm', { alarmId: alarm.id });
  };

  const formatTime = (h: number, m: number) => {
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
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

        {/* Thông báo thời gian */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{nextAlarmText}</Text>
        </View>

        {/* Danh sách báo thức */}
        <View style={styles.alarmsList}>
          {alarms.map(alarm => (
            <AlarmCard
              key={alarm.id}
              id={alarm.id}
              time={formatTime(alarm.hour, alarm.minute)}
              label={alarm.label || (alarm.type === 'flash' ? 'Báo thức nhanh' : 'Báo thức')}
              days={alarm.type === 'flash' ? 'Một lần' : 'Hàng ngày'}
              enabled={alarm.enabled}
              onToggle={() => handleToggleAlarm(alarm.id)}
              onLongPress={() => handleDeleteAlarm(alarm.id)}
              onPress={() => handleEditAlarm(alarm)}
            />
          ))}
          
          {alarms.length === 0 && (
            <View style={styles.emptyContainer}>
              <Ionicons name="alarm-outline" size={60} color="#334155" />
              <Text style={styles.emptyText}>Chưa có báo thức nào</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* FAB Button */}
      <FloatingActionButton onPress={() => setMenu(!menu)} />

      {/* FAB Menu Overlay */}
      {menu && (
        <View style={styles.overlay}>
          <TouchableOpacity 
            style={styles.backdrop} 
            activeOpacity={1} 
            onPress={() => setMenu(false)} 
          />
          <View style={styles.menu}>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuText}>Báo thức thói quen</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                setMenu(false);
                setQuickAlarmVisible(true);
              }}
            >
              <Text style={styles.menuText}>Báo thức nhanh</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuText}>Báo thức thường</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Modal Báo thức nhanh */}
      <FlashAlarmScreen
        visible={quickAlarmVisible}
        onClose={() => {
          setQuickAlarmVisible(false);
          loadAlarms(); // Refresh lại danh sách sau khi thêm mới
        }}
      />
    </View>
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
    paddingBottom: 100, // Để không bị FAB đè
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#38b6ff', // Màu xanh nổi bật cho thời gian tiếp theo
    marginLeft: 4,
  },
  alarmsList: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyText: {
    color: '#64748b',
    textAlign: 'center',
    marginTop: 12,
    fontSize: 16,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  menu: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    backgroundColor: '#1e293b',
    borderRadius: 16,
    paddingVertical: 8,
    width: 200,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  menuText: {
    color: '#ffffff',
    fontSize: 15,
  },
  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  }
});
