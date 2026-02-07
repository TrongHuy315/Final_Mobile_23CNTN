import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, ThemeMode } from '@/context/ThemeContext';

export default function DisplaySettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { themeMode, setThemeMode, isDarkMode, colors } = useTheme();

  const themeOptions: { key: ThemeMode; label: string; description: string }[] = [
    { key: 'dark', label: 'Tối', description: 'Luôn sử dụng giao diện tối' },
    { key: 'light', label: 'Sáng', description: 'Luôn sử dụng giao diện sáng' },
    { key: 'system', label: 'Hệ thống', description: 'Theo cài đặt của thiết bị' },
  ];

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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Hiển thị</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Section Title */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          Chế độ hiển thị
        </Text>

        {/* Theme Options */}
        <View style={styles.themeContainer}>
          {/* Dark Mode Card */}
          <TouchableOpacity 
            style={[
              styles.themeCard,
              themeMode === 'dark' && styles.themeCardSelected
            ]}
            activeOpacity={0.7}
            onPress={() => setThemeMode('dark')}
          >
            <View style={styles.themePreviewDark}>
              <View style={styles.previewHeaderDark}>
                <View style={styles.previewTitleBarDark} />
                {themeMode === 'dark' && (
                  <View style={styles.checkmarkContainer}>
                    <Ionicons name="checkmark-circle" size={24} color="#38b6ff" />
                  </View>
                )}
              </View>
              <View style={styles.previewContentDark} />
            </View>
            <Text style={[styles.themeLabel, { color: colors.text }]}>Tối</Text>
          </TouchableOpacity>

          {/* Light Mode Card */}
          <TouchableOpacity 
            style={[
              styles.themeCard,
              themeMode === 'light' && styles.themeCardSelected
            ]}
            activeOpacity={0.7}
            onPress={() => setThemeMode('light')}
          >
            <View style={styles.themePreviewLight}>
              <View style={styles.previewHeaderLight}>
                <View style={styles.previewTitleBarLight} />
                {themeMode === 'light' && (
                  <View style={styles.checkmarkContainer}>
                    <Ionicons name="checkmark-circle" size={24} color="#38b6ff" />
                  </View>
                )}
              </View>
              <View style={styles.previewContentLight} />
            </View>
            <Text style={[styles.themeLabel, { color: colors.text }]}>Sáng</Text>
          </TouchableOpacity>
        </View>

        {/* System Option */}
        <TouchableOpacity 
          style={[
            styles.systemOption,
            { backgroundColor: colors.surface },
            themeMode === 'system' && styles.systemOptionSelected
          ]}
          activeOpacity={0.7}
          onPress={() => setThemeMode('system')}
        >
          <View style={styles.systemOptionContent}>
            <Ionicons 
              name="phone-portrait-outline" 
              size={24} 
              color={themeMode === 'system' ? '#38b6ff' : colors.textSecondary} 
            />
            <View style={styles.systemOptionText}>
              <Text style={[styles.systemOptionTitle, { color: colors.text }]}>
                Theo hệ thống
              </Text>
              <Text style={[styles.systemOptionDesc, { color: colors.textSecondary }]}>
                Tự động thay đổi theo cài đặt thiết bị
              </Text>
            </View>
          </View>
          {themeMode === 'system' && (
            <Ionicons name="checkmark-circle" size={24} color="#38b6ff" />
          )}
        </TouchableOpacity>

        {/* Current Status */}
        <View style={[styles.statusCard, { backgroundColor: colors.surface }]}>
          <Ionicons 
            name={isDarkMode ? "moon" : "sunny"} 
            size={20} 
            color={colors.primary} 
          />
          <Text style={[styles.statusText, { color: colors.textSecondary }]}>
            Đang sử dụng giao diện {isDarkMode ? 'tối' : 'sáng'}
          </Text>
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
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 16,
  },
  themeContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  themeCard: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  themeCardSelected: {
    borderColor: '#38b6ff',
  },
  themeLabel: {
    textAlign: 'center',
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: '500',
  },
  
  // Dark Theme Preview
  themePreviewDark: {
    backgroundColor: '#1e293b',
    padding: 12,
    aspectRatio: 1,
  },
  previewHeaderDark: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  previewTitleBarDark: {
    width: '60%',
    height: 10,
    backgroundColor: '#475569',
    borderRadius: 5,
  },
  previewContentDark: {
    flex: 1,
    backgroundColor: '#334155',
    borderRadius: 8,
  },
  
  // Light Theme Preview
  themePreviewLight: {
    backgroundColor: '#f1f5f9',
    padding: 12,
    aspectRatio: 1,
  },
  previewHeaderLight: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  previewTitleBarLight: {
    width: '60%',
    height: 10,
    backgroundColor: '#94a3b8',
    borderRadius: 5,
  },
  previewContentLight: {
    flex: 1,
    backgroundColor: '#e2e8f0',
    borderRadius: 8,
  },
  
  checkmarkContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  
  systemOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  systemOptionSelected: {
    borderColor: '#38b6ff',
  },
  systemOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  systemOptionText: {
    marginLeft: 12,
    flex: 1,
  },
  systemOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  systemOptionDesc: {
    fontSize: 13,
  },
  
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 10,
  },
  statusText: {
    fontSize: 14,
  },
});
