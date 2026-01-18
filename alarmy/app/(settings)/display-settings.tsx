import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type DisplayMode = 'dark' | 'light';

export default function DisplaySettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [displayMode, setDisplayMode] = useState<DisplayMode>('dark');

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
        <Text style={styles.headerTitle}>Hiển thị</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {/* Section Title */}
        <Text style={styles.sectionTitle}>Chế độ hiển thị</Text>

        {/* Theme Options */}
        <View style={styles.themeContainer}>
          {/* Dark Mode Card */}
          <TouchableOpacity 
            style={[
              styles.themeCard,
              displayMode === 'dark' && styles.themeCardSelected
            ]}
            activeOpacity={0.7}
            onPress={() => setDisplayMode('dark')}
          >
            <View style={styles.themePreviewDark}>
              <View style={styles.previewHeaderDark}>
                <View style={styles.previewTitleBarDark} />
                {displayMode === 'dark' && (
                  <View style={styles.checkmarkContainer}>
                    <Ionicons name="checkmark-circle" size={24} color="#38b6ff" />
                  </View>
                )}
              </View>
              <View style={styles.previewContentDark} />
            </View>
          </TouchableOpacity>

          {/* Light Mode Card */}
          <TouchableOpacity 
            style={[
              styles.themeCard,
              displayMode === 'light' && styles.themeCardSelected
            ]}
            activeOpacity={0.7}
            onPress={() => setDisplayMode('light')}
          >
            <View style={styles.themePreviewLight}>
              <View style={styles.previewHeaderLight}>
                <View style={styles.previewTitleBarLight} />
                {displayMode === 'light' && (
                  <View style={styles.checkmarkContainer}>
                    <Ionicons name="checkmark-circle" size={24} color="#38b6ff" />
                  </View>
                )}
              </View>
              <View style={styles.previewContentLight} />
            </View>
          </TouchableOpacity>
        </View>
      </View>
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
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
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
    color: '#94a3b8',
    marginBottom: 16,
  },
  themeContainer: {
    flexDirection: 'row',
    gap: 16,
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
  
  // Dark Theme Preview
  themePreviewDark: {
    backgroundColor: '#1e293b',
    padding: 12,
    aspectRatio: 0.85,
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
    aspectRatio: 0.85,
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
});
