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

export default function GeneralSettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [confirmExit, setConfirmExit] = useState(false);

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
        <Text style={styles.headerTitle}>Chung</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Display Card */}
        <TouchableOpacity 
          style={styles.card}
          activeOpacity={0.7}
          onPress={() => router.push('/display-settings')}
        >
          <Text style={styles.cardTitle}>Hiển thị</Text>
          <Ionicons name="chevron-forward" size={20} color="#718096" />
        </TouchableOpacity>

        {/* Language Card */}
        <TouchableOpacity 
          style={styles.card}
          activeOpacity={0.7}
          onPress={() => router.push('/language-settings')}
        >
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Ngôn ngữ (Language)</Text>
            <Text style={styles.cardSubtitle}>Sử dụng ngôn ngữ hệ thống</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#718096" />
        </TouchableOpacity>

        {/* Confirm Exit Card */}
        <View style={styles.card}>
          <View style={styles.cardLeft}>
            <View style={styles.iconContainer}>
              <Text style={styles.warningIcon}>⚠️</Text>
            </View>
            <Text style={styles.cardTitle}>Xác nhận thoát</Text>
          </View>
          <Switch
            value={confirmExit}
            onValueChange={setConfirmExit}
            trackColor={{ false: '#4a5568', true: '#38b6ff' }}
            thumbColor={confirmExit ? '#ffffff' : '#cbd5e0'}
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
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1e293b',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 0,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#38b6ff',
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
  warningIcon: {
    fontSize: 24,
  },
});
