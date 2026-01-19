import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PreventPowerOffScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [preventPowerOff, setPreventPowerOff] = useState(false);

  return (
    <SafeAreaProvider style={styles.container}>
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.headerCenter} />
        <TouchableOpacity 
          style={styles.infoButton}
          onPress={() => router.push('/prevent-power-off-info')}
        >
          <Ionicons name="information-circle-outline" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text style={styles.title}>Ngăn tắt nguồn</Text>

        {/* Success Counter */}
        <View style={styles.counterContainer}>
          <Text style={styles.counterLabel}>Số lần chặn thành công</Text>
          <Text style={styles.counterValue}>0 lần</Text>
        </View>

        {/* Prevent Power Off Toggle Card */}
        <View style={styles.toggleCard}>
          <Text style={styles.toggleTitle}>Ngăn tắt nguồn</Text>
          <Switch
            value={preventPowerOff}
            onValueChange={setPreventPowerOff}
            trackColor={{ false: '#4a5568', true: '#38b6ff' }}
            thumbColor={preventPowerOff ? '#ffffff' : '#cbd5e0'}
          />
        </View>

        {/* Permissions Section */}
        <Text style={styles.sectionTitle}>
          Cho phép cả hai quyền{'\n'}để kích hoạt
        </Text>

        {/* Permission Cards */}
        <View style={styles.permissionsContainer}>
          {/* Display Overlay Permission */}
          <View style={styles.permissionCard}>
            <View style={styles.permissionLeft}>
              <View style={styles.checkmarkContainer}>
                <Ionicons name="checkmark" size={20} color="#ffffff" />
              </View>
              <View style={styles.permissionContent}>
                <Text style={styles.permissionTitle}>Hiển thị trên ứng dụng</Text>
                <Text style={styles.permissionDescription}>
                  Cho phép Alarmy tiếp tục hiển thị màn
                  hình hủy, ngay cả khi đang hoãn bảo
                  thức!
                </Text>
              </View>
            </View>
          </View>

          {/* Accessibility Permission */}
          <TouchableOpacity 
            style={styles.permissionCard}
            activeOpacity={0.7}
            onPress={() => console.log('Accessibility settings')}
          >
            <View style={styles.permissionLeft}>
              <View style={styles.numberBadge}>
                <Text style={styles.badgeNumber}>2</Text>
              </View>
              <View style={styles.permissionContent}>
                <Text style={styles.permissionTitle}>Khả năng truy cập</Text>
                <Text style={styles.permissionDescription}>
                  Chúng tôi có thể phát hiện hành động{'\n'}
                  tắt nguồn của bạn
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#718096" />
          </TouchableOpacity>
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
    color: '#ffffff',
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
    color: '#ffffff',
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
    backgroundColor: '#2d3748',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 32,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
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
    backgroundColor: '#1e293b',
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
    color: '#ffffff',
    marginBottom: 6,
  },
  permissionDescription: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 18,
  },
});
