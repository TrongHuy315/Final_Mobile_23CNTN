import { AccountCard } from '@/components/account-card';
import { ProCard } from '@/components/pro-card';
import { SettingsMenuItem } from '@/components/settings-menu-item';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Text style={styles.headerTitle}>Cài đặt</Text>
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
            onPress={() => router.push('/optimize-alarms')}
          />
          
          <SettingsMenuItem
            title="Báo thức"
            onPress={() => router.push('/alarm-settings')}
          />
          
          <SettingsMenuItem
            title="Tắt Báo thức hoặc Nhiệm vụ"
            onPress={() => router.push('/dismiss-alarm-task')}
          />
          
          <SettingsMenuItem
            title="Chung"
            onPress={() => router.push('/general-settings')}
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
            onPress={() => router.push('/send-feedback')}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    alignItems: 'center',
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

