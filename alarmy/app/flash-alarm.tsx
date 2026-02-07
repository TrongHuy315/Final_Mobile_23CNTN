import { Checkbox } from "@/components/checkbox";
import { DraggableSlider } from "@/components/draggable-slider";
import { AlarmManager } from "@/utils/alarm-manager";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from '@/context/ThemeContext';

interface FlashAlarmScreenProps {
  visible: boolean;
  onClose: () => void;
}

export default function FlashAlarmScreen({ visible, onClose }: FlashAlarmScreenProps) {
  const { colors, isDarkMode } = useTheme();
  const [volume, setVolume] = useState(100);
  const [time, setTime] = useState(0); 
  const [vibration, setVibration] = useState(true);
  const [hour, setHour] = useState(0);
  const [minute, setMinute] = useState(0);

  // Cập nhật thời gian reo thực tế dựa trên số phút delay
  useEffect(() => {
    if (visible) {
      const now = new Date();
      // Làm tròn lên phút tiếp theo
      now.setMinutes(now.getMinutes() + 1);
      now.setSeconds(0);
      now.setMilliseconds(0);
      
      const totalMinutes = now.getHours() * 60 + now.getMinutes() + time;
      setHour(Math.floor((totalMinutes / 60) % 24));
      setMinute(totalMinutes % 60);
    }
  }, [time, visible]);

  const handleSave = async () => {
    if (time === 0) return;

    console.log('⚡ Saving quick alarm for:', hour, ':', minute);
    
    await AlarmManager.addAlarm({
      hour,
      minute,
      volume,
      vibration,
      enabled: true,
      label: "Báo thức nhanh",
      icon: '⏰',
      days: [],
      type: 'flash',
      gentleWake: 'off',
      tasks: [],
      snoozeSettings: {
        enabled: false,
        interval: 5,
        maxCount: 3,
      },
    });

    console.log('✅ Quick alarm saved');

    // Reset lại state sau khi lưu thành công
    setTime(0);
    onClose();
  };

  const handleClose = () => {
    setTime(0); // Reset số phút khi đóng mà không lưu
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={handleClose} />

        <View style={[styles.bottomSheet, { backgroundColor: colors.card }]}>
          <View style={[styles.sheetHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.sheetTitle, { color: colors.text }]}>Báo thức nhanh</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={[styles.content1, time === 0 && { opacity: 0.6 }]}>
            <Ionicons name="add-outline" size={24} color={colors.text} />
            <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
              {time >= 60 && (
                <>
                  <Text style={[styles.bigText, { color: colors.text }]}>{Math.floor(time / 60)}</Text>
                  <Text style={[styles.unitText, { color: colors.textSecondary }]}>giờ</Text>
                </>
              )}
              <Text style={[styles.bigText, { color: colors.text }]}>{time % 60}</Text>
              <Text style={[styles.unitText, { color: colors.textSecondary }]}>phút</Text>
            </View>
            <TouchableOpacity onPress={() => setTime(0)}>
              <Ionicons name="reload-outline" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <Text style={styles.alarmTimeText}>
            Đổ chuông lúc {hour.toString().padStart(2, '0')}:{minute.toString().padStart(2, '0')}
          </Text>

          <View style={styles.content2}>
            <TimeButton label="1 phút" onPress={() => setTime(t => Math.min(t + 1, 1440))} colors={colors} />
            <TimeButton label="5 phút" onPress={() => setTime(t => Math.min(t + 5, 1440))} colors={colors} />
            <TimeButton label="10 phút" onPress={() => setTime(t => Math.min(t + 10, 1440))} colors={colors} />
          </View>

          <View style={styles.content2}>
            <TimeButton label="15 phút" onPress={() => setTime(t => Math.min(t + 15, 1440))} colors={colors} />
            <TimeButton label="30 phút" onPress={() => setTime(t => Math.min(t + 30, 1440))} colors={colors} />
            <TimeButton label="1 giờ" onPress={() => setTime(t => Math.min(t + 60, 1440))} colors={colors} />
          </View>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={[styles.settingText, { color: colors.text }]}>Âm thanh</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[styles.settingSubText, { color: colors.textMuted }]}>Orkney</Text>
              <Ionicons name="chevron-forward-outline" size={20} color={colors.textMuted} />
            </View>
          </TouchableOpacity>

          <View style={styles.controlRow}>
            <Ionicons name={volume === 0 ? "volume-mute" : "volume-high"} size={24} color={colors.text} />
            <View style={{ flex: 1, marginHorizontal: 15 }}>
              <DraggableSlider onValueChange={setVolume}/>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialIcons name="vibration" size={24} color={colors.text} style={{ marginRight: 8 }} />
              <Checkbox checked={vibration} onChange={setVibration} />
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.saveBtn, time === 0 && { backgroundColor: '#4a1d1d' }]} 
            onPress={handleSave}
            disabled={time === 0}
          >
            <Text style={styles.saveText}>Lưu</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function TimeButton({ label, onPress, colors }: { label: string; onPress: () => void; colors: any }) {
  return (
    <TouchableOpacity style={[styles.timeCard, { backgroundColor: colors.surface }]} onPress={onPress}>
      <Text style={[styles.timeText, { color: colors.text }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, justifyContent: "flex-end" },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.5)" },
  bottomSheet: {
    height: "75%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 30,
  },
  sheetHeader: {
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
  },
  sheetTitle: { fontSize: 16, fontWeight: "600" },
  closeButton: { position: "absolute", right: 20 },
  content1: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 40,
    marginTop: 30,
  },
  bigText: { fontSize: 50, fontWeight: "700" },
  unitText: { fontSize: 20, marginLeft: 4, marginRight: 10, marginBottom: 10 },
  alarmTimeText: { color: "#38b6ff", textAlign: "center", fontSize: 18, marginVertical: 15, fontWeight: '500' },
  content2: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 10,
    marginTop: 10,
  },
  timeCard: {
    height: 45,
    width: "30%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  timeText: { fontSize: 16 },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    marginTop: 20,
  },
  settingText: { fontSize: 18 },
  settingSubText: { fontSize: 16, marginRight: 5 },
  controlRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  saveBtn: {
    backgroundColor: "#da1717",
    borderRadius: 25,
    height: 55,
    alignItems: "center",
    marginHorizontal: 20,
    justifyContent: "center",
    marginTop: "auto",
  },
  saveText: { color: "#fff", fontSize: 18, fontWeight: "700" },
});
