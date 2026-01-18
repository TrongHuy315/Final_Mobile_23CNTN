import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function EventsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Tham gia & nhận phần thưởng</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Gift Box Illustration */}
        <View style={styles.giftContainer}>
          <Text style={styles.giftEmoji}>🎁</Text>
        </View>

        {/* Title and Description */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>
            Tham gia vào các sự kiện{'\n'}
            tôi muốn và nhận những{'\n'}
            phần thưởng thú vị!
          </Text>
          <Text style={styles.subtitle}>
            Tận hưởng Alarmy với quà tặng hấp dẫn
          </Text>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          <TouchableOpacity 
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => router.push('/invite-friends')}
          >
            <View style={styles.menuLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="people" size={20} color="#ffffff" />
              </View>
              <Text style={styles.menuText}>Mời bạn bè và nhận phần{'\n'}thưởng</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#718096" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => router.push('/wake-up-challenge')}
          >
            <View style={styles.menuLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="sunny" size={20} color="#ffffff" />
              </View>
              <Text style={styles.menuText}>Thử thách thức dậy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#718096" />
          </TouchableOpacity>
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
    marginRight: 40, // Balance the back button
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  giftContainer: {
    marginBottom: 32,
  },
  giftEmoji: {
    fontSize: 120,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  menuContainer: {
    width: '100%',
    gap: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1e293b',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    marginRight: 12,
  },
  menuText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#ffffff',
    flex: 1,
    lineHeight: 20,
  },
});
