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
import { useTheme } from '@/context/ThemeContext';

export default function GeneralSettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [confirmExit, setConfirmExit] = useState(false);

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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Chung</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Display Card */}
        <TouchableOpacity 
          style={[styles.card, { backgroundColor: colors.surface }]}
          activeOpacity={0.7}
          onPress={() => router.push('/display-settings')}
        >
          <Text style={[styles.cardTitle, { color: colors.text }]}>Hiển thị</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        {/* Language Card */}
        <TouchableOpacity 
          style={[styles.card, { backgroundColor: colors.surface }]}
          activeOpacity={0.7}
          onPress={() => router.push('/language-settings')}
        >
          <View style={styles.cardContent}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Ngôn ngữ (Language)</Text>
            <Text style={[styles.cardSubtitle, { color: colors.primary }]}>Sử dụng ngôn ngữ hệ thống</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        {/* Confirm Exit Card */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.cardLeft}>
            <View style={styles.iconContainer}>
              <Text style={styles.warningIcon}>⚠️</Text>
            </View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Xác nhận thoát</Text>
          </View>
          <Switch
            value={confirmExit}
            onValueChange={setConfirmExit}
            trackColor={{ false: colors.surfaceVariant, true: colors.primary }}
            thumbColor={confirmExit ? '#ffffff' : colors.textSecondary}
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
    fontSize: 15,
    fontWeight: '600',
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
    marginBottom: 0,
  },
  cardSubtitle: {
    fontSize: 14,
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
