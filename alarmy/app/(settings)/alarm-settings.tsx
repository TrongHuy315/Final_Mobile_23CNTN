import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SettingsManager } from '@/utils/settings-manager';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';

export default function AlarmSettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  
  // State for toggles
  const [useSpeaker, setUseSpeaker] = useState(true);
  const [showNextAlarm, setShowNextAlarm] = useState(false);
  const [preventUninstall, setPreventUninstall] = useState(false);

  React.useEffect(() => {
    const loadSettings = async () => {
      const settings = await SettingsManager.loadSettings();
      setPreventUninstall(settings.preventUninstall);
      setShowNextAlarm(settings.showNextAlarmNotification);
      // Other settings can be loaded here if needed
    };
    loadSettings();
  }, []);

  const handleShowNextAlarmToggle = async (value: boolean) => {
    setShowNextAlarm(value);
    await SettingsManager.updateSetting('showNextAlarmNotification', value);
    
    if (value) {
      // Logic to trigger the persistent notification could go here
      // For now, we just persist the setting
      console.log('Next alarm notification enabled');
    } else {
      // Logic to remove the persistent notification could go here
      console.log('Next alarm notification disabled');
    }
  };

  const handlePreventUninstall = async (value: boolean) => {
    if (value) {
      // Show confirmation alert
      Alert.alert(
        'Ngăn chặn gỡ bỏ ứng dụng',
        'Tính năng này sẽ yêu cầu quyền Quản trị viên thiết bị để ngăn chặn việc gỡ bỏ ứng dụng trái phép. Bạn có muốn tiếp tục?',
        [
          { 
            text: 'Hủy', 
            style: 'cancel',
            onPress: () => setPreventUninstall(false) 
          },
          { 
            text: 'Đồng ý', 
            onPress: async () => {
              setPreventUninstall(true);
              await SettingsManager.updateSetting('preventUninstall', true);
              // Mock redirection to Device Admin settings
              Alert.alert(
                'Hướng dẫn',
                'Vui lòng tìm mục [Quản trị viên thiết bị] trong cài đặt Bảo mật và kích hoạt Alarmy.',
                [
                  { 
                    text: 'Đi đến cài đặt', 
                    onPress: () => Linking.openSettings().catch(() => {
                      Alert.alert('Lỗi', 'Không thể mở cài đặt. Vui lòng mở thủ công.');
                    })
                  }
                ]
              );
            }
          }
        ]
      );
    } else {
      setPreventUninstall(false);
      await SettingsManager.updateSetting('preventUninstall', false);
    }
  };

  return (
    <SafeAreaProvider style={[styles.container, { backgroundColor: colors.background }]}>
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top, borderBottomColor: colors.border }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Báo thức</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Section: Âm lượng và âm thanh */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Âm lượng và âm thanh</Text>
        
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Sử dụng loa điện thoại</Text>
          <Switch
            value={useSpeaker}
            onValueChange={setUseSpeaker}
            trackColor={{ false: '#4a5568', true: '#38b6ff' }}
            thumbColor={useSpeaker ? '#ffffff' : '#cbd5e0'}
          />
        </View>
        
        <Text style={[styles.helperText, { color: colors.textMuted }]}>Luôn reo ở loa ngoài</Text>

        {/* Section: Báo thức sắp tới */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Báo thức sắp tới</Text>
        
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.cardContent}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Hiển thị thông báo báo thức tiếp theo trên ngăn kéo.
            </Text>
          </View>
          <Switch
            value={showNextAlarm}
            onValueChange={handleShowNextAlarmToggle}
            trackColor={{ false: '#4a5568', true: '#38b6ff' }}
            thumbColor={showNextAlarm ? '#ffffff' : '#cbd5e0'}
          />
        </View>
        
        <Text style={[styles.helperText, { color: colors.textMuted }]}>
          Báo thức tiếp theo sẽ xuất hiện dưới dạng thông báo
        </Text>

        {/* Section: Ngăn gian lận báo bức */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Ngăn gian lận báo bức</Text>
        
        {/* Disable vibration before alarm row */}
        <TouchableOpacity 
          style={[styles.card, { backgroundColor: colors.surface }]}
          activeOpacity={0.7}
          onPress={() => console.log('Disable before vibration')}
        >
          <View style={styles.cardLeft}>
            <View style={styles.iconContainer}>
              <Text style={styles.medalIcon}>🏅</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Vô hiệu hoá báo thức trước khi rung
              </Text>
              <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>Tắt</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        {/* Prevent uninstall toggle */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Ngăn chặn gỡ bỏ ứng dụng</Text>
          <Switch
            value={preventUninstall}
            onValueChange={handlePreventUninstall}
            trackColor={{ false: '#4a5568', true: '#38b6ff' }}
            thumbColor={preventUninstall ? '#ffffff' : '#cbd5e0'}
          />
        </View>

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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
    textAlign: 'center',
    marginRight: 40,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 12,
    marginTop: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1e293b',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 8,
  },
  cardContent: {
    flex: 1,
    paddingRight: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    marginRight: 12,
  },
  medalIcon: {
    fontSize: 24,
  },
  helperText: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 20,
    marginLeft: 4,
  },
});
