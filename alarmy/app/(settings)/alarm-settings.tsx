import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AlarmSettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  // State for toggles
  const [useSpeaker, setUseSpeaker] = useState(true);
  const [showNextAlarm, setShowNextAlarm] = useState(false);
  const [preventUninstall, setPreventUninstall] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Báo thức</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Section: Âm lượng và âm thanh */}
        <Text style={styles.sectionTitle}>Âm lượng và âm thanh</Text>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sử dụng loa điện thoại</Text>
          <Switch
            value={useSpeaker}
            onValueChange={setUseSpeaker}
            trackColor={{ false: '#4a5568', true: '#38b6ff' }}
            thumbColor={useSpeaker ? '#ffffff' : '#cbd5e0'}
          />
        </View>
        
        <Text style={styles.helperText}>Luôn reo ở loa ngoài</Text>

        {/* Section: Báo thức sắp tới */}
        <Text style={styles.sectionTitle}>Báo thức sắp tới</Text>
        
        <View style={styles.card}>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>
              Hiển thị thông báo báo thức tiếp theo trên ngăn kéo.
            </Text>
          </View>
          <Switch
            value={showNextAlarm}
            onValueChange={setShowNextAlarm}
            trackColor={{ false: '#4a5568', true: '#38b6ff' }}
            thumbColor={showNextAlarm ? '#ffffff' : '#cbd5e0'}
          />
        </View>
        
        <Text style={styles.helperText}>
          Báo thức tiếp theo sẽ xuất hiện dưới dạng thông báo
        </Text>

        {/* Section: Ngăn gian lận báo bức */}
        <Text style={styles.sectionTitle}>Ngăn gian lận báo bức</Text>
        
        {/* Disable vibration before alarm row */}
        <TouchableOpacity 
          style={styles.card}
          activeOpacity={0.7}
          onPress={() => console.log('Disable before vibration')}
        >
          <View style={styles.cardLeft}>
            <View style={styles.iconContainer}>
              <Text style={styles.medalIcon}>🏅</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>
                Vô hiệu hoá báo thức trước khi rung
              </Text>
              <Text style={styles.cardSubtitle}>Tắt</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#718096" />
        </TouchableOpacity>

        {/* Prevent uninstall toggle */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ngăn chặn gỡ bỏ ứng dụng</Text>
          <Switch
            value={preventUninstall}
            onValueChange={setPreventUninstall}
            trackColor={{ false: '#4a5568', true: '#38b6ff' }}
            thumbColor={preventUninstall ? '#ffffff' : '#cbd5e0'}
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
