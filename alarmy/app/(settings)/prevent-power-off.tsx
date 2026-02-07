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
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { SettingsManager } from '@/utils/settings-manager';

export default function PreventPowerOffScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDarkMode } = useTheme();
  const [preventPowerOff, setPreventPowerOff] = useState(false);

  React.useEffect(() => {
    const loadSettings = async () => {
      const settings = await SettingsManager.loadSettings();
      setPreventPowerOff(settings.preventPowerOff);
    };
    loadSettings();
  }, []);

  const handleToggle = async (value: boolean) => {
    if (value) {
      Alert.alert(
        'Ngăn tắt nguồn',
        'Tính năng này cần quyền Khả năng truy cập để phát hiện khi bạn cố gắng tắt nguồn điện thoại trong lúc báo thức đang reo. Tiếp tục?',
        [
          { text: 'Hủy', style: 'cancel', onPress: () => setPreventPowerOff(false) },
          { 
            text: 'Đồng ý', 
            onPress: async () => {
              setPreventPowerOff(true);
              await SettingsManager.updateSetting('preventPowerOff', true);
              Alert.alert(
                'Hướng dẫn',
                'Vui lòng tìm mục [Ứng dụng đã cài đặt] hoặc [Dịch vụ đã tải xuống] trong cài đặt Khả năng truy cập và bật Alarmy.',
                [
                  { text: 'Đi đến cài đặt', onPress: () => Linking.openSettings() }
                ]
              );
            } 
          }
        ]
      );
    } else {
      setPreventPowerOff(false);
      await SettingsManager.updateSetting('preventPowerOff', false);
    }
  };

  const openAccessibilitySettings = () => {
    Alert.alert(
      'Khả năng truy cập',
      'Bạn sẽ được đưa đến cài đặt hệ thống. Vui lòng tìm Alarmy trong phần dịch vụ và bật nó lên.',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Đi đến cài đặt', onPress: () => Linking.openSettings() }
      ]
    );
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
        <View style={styles.headerCenter} />
        <TouchableOpacity 
          style={styles.infoButton}
          onPress={() => router.push('/prevent-power-off-info')}
        >
          <Ionicons name="information-circle-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text style={[styles.title, { color: colors.text }]}>Ngăn tắt nguồn</Text>

        {/* Success Counter */}
        <View style={styles.counterContainer}>
          <Text style={[styles.counterLabel, { color: colors.text }]}>Số lần chặn thành công</Text>
          <Text style={styles.counterValue}>0 lần</Text>
        </View>

        {/* Prevent Power Off Toggle Card */}
        <View style={[styles.toggleCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.toggleTitle, { color: colors.text }]}>Ngăn tắt nguồn</Text>
          <Switch
            value={preventPowerOff}
            onValueChange={handleToggle}
            trackColor={{ false: isDarkMode ? '#4a5568' : '#cbd5e1', true: colors.primary }}
            thumbColor="#ffffff"
          />
        </View>

        {/* Permissions Section */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          Cho phép cả hai quyền{'\n'}để kích hoạt
        </Text>

        {/* Permission Cards */}
        <View style={styles.permissionsContainer}>
          {/* Display Overlay Permission */}
          <View style={[styles.permissionCard, { backgroundColor: colors.surface }]}>
            <View style={styles.permissionLeft}>
              <View style={styles.checkmarkContainer}>
                <Ionicons name="checkmark" size={20} color="#ffffff" />
              </View>
              <View style={styles.permissionContent}>
                <Text style={[styles.permissionTitle, { color: colors.text }]}>Hiển thị trên ứng dụng</Text>
                <Text style={[styles.permissionDescription, { color: colors.textSecondary }]}>
                  Cho phép Alarmy tiếp tục hiển thị màn
                  hình hủy, ngay cả khi đang hoãn bảo
                  thức!
                </Text>
              </View>
            </View>
          </View>

          {/* Accessibility Permission */}
          <TouchableOpacity 
            style={[styles.permissionCard, { backgroundColor: colors.surface }]}
            activeOpacity={0.7}
            onPress={openAccessibilitySettings}
          >
            <View style={styles.permissionLeft}>
              <View style={[styles.numberBadge, { backgroundColor: isDarkMode ? '#ffffff' : colors.primary }]}>
                <Text style={[styles.badgeNumber, { color: isDarkMode ? '#0f172a' : '#ffffff' }]}>2</Text>
              </View>
              <View style={styles.permissionContent}>
                <Text style={[styles.permissionTitle, { color: colors.text }]}>Khả năng truy cập</Text>
                <Text style={[styles.permissionDescription, { color: colors.textSecondary }]}>
                  Chúng tôi có thể phát hiện hành động{'\n'}
                  tắt nguồn của bạn
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerCenter: {
    flex: 1,
  },
  infoButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
  },
  counterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  counterLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  counterValue: {
    fontSize: 15,
    color: '#10b981',
    fontWeight: '600',
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 32,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 16,
    lineHeight: 22,
  },
  permissionsContainer: {
    gap: 12,
  },
  permissionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  permissionLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  checkmarkContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  numberBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  badgeNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  permissionContent: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  permissionDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
});
