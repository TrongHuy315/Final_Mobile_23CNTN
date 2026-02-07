import { AccountCard } from '@/components/account-card';
import { ProCard } from '@/components/pro-card';
import { SettingsMenuItem } from '@/components/settings-menu-item';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  
  return (
    <SafeAreaProvider style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Cài đặt</Text>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Account & Pro Card */}
        <View style={styles.cardContainer}>
          <AccountCard />
          <ProCard />
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <SettingsMenuItem
            iconComponent={
              <View style={styles.rocketIcon}>
                <Text style={styles.rocketEmoji}>🚀</Text>
              </View>
            }
            title="Tối ưu hóa báo thức"
            onPress={() => router.push('/(settings)/optimize-alarms')}
          />
          
          <SettingsMenuItem
            title="Báo thức"
            onPress={() => router.push('/(settings)/alarm-settings')}
          />
          
          <SettingsMenuItem
            title="Tắt Báo thức hoặc Nhiệm vụ"
            onPress={() => router.push('/(settings)/dismiss-alarm-task')}
          />
          
          <SettingsMenuItem
            title="Chung"
            onPress={() => router.push('/(settings)/general-settings')}
          />
          
          <SettingsMenuItem
            title="Bảng ghi chú"
            onPress={() => console.log('Notes')}
          />
          
          <SettingsMenuItem
            title="Các câu hỏi thường gặp"
            onPress={() => console.log('FAQ')}
          />
          
          <SettingsMenuItem
            title="Gửi phản hồi"
            onPress={() => router.push('/(settings)/send-feedback')}
          />
          
          <SettingsMenuItem
            title="Báo cáo vi phạm bản quyền"
            onPress={() => console.log('Report copyright')}
          />
          
          <SettingsMenuItem
            title="Thông tin về ứng dụng"
            onPress={() => console.log('About app')}
          />
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
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  cardContainer: {
    marginTop: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  menuSection: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  rocketIcon: {
    width: 32,
    marginRight: 12,
    justifyContent: 'center',
  },
  rocketEmoji: {
    fontSize: 20,
  },
});

