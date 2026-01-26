import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

const languages = [
  { code: 'system', name: 'Sử dụng ngôn ngữ hệ thống', hasDownload: false },
  { code: 'cs', name: 'čeština', hasDownload: true },
  { code: 'da', name: 'Dansk', hasDownload: true },
  { code: 'de', name: 'Deutsch', hasDownload: true },
  { code: 'en', name: 'English', hasDownload: true },
  { code: 'es', name: 'Español', hasDownload: true },
  { code: 'fr', name: 'Français', hasDownload: true },
  { code: 'fil', name: 'Filipino', hasDownload: true },
  { code: 'hr', name: 'Hrvatski', hasDownload: true },
  { code: 'id', name: 'Indonesia', hasDownload: true },
  { code: 'it', name: 'Italiano', hasDownload: true },
  { code: 'hu', name: 'Magyar', hasDownload: true },
  { code: 'nl', name: 'Nederlands', hasDownload: true },
  { code: 'nb', name: 'Norsk bokmål', hasDownload: true },
  { code: 'pl', name: 'Polski', hasDownload: true },
  { code: 'pt', name: 'Português', hasDownload: true },
  { code: 'ro', name: 'Română', hasDownload: true },
  { code: 'fi', name: 'Suomi', hasDownload: true },
  { code: 'sv', name: 'Svenska', hasDownload: true },
  { code: 'vi', name: 'Tiếng Việt', hasDownload: false },
  { code: 'tr', name: 'Türkçe', hasDownload: true },
  { code: 'el', name: 'Ελληνικά', hasDownload: true },
  { code: 'ru', name: 'русский', hasDownload: true },
  { code: 'uk', name: 'українська', hasDownload: true },
  { code: 'sr', name: 'српски', hasDownload: true },
  { code: 'he', name: 'עברית', hasDownload: true, rtl: true },
  { code: 'ar', name: 'العربية', hasDownload: true, rtl: true },
  { code: 'ar-eg', name: 'مصري', hasDownload: true, rtl: true },
  { code: 'ar-ma', name: 'الدارجة', hasDownload: true, rtl: true },
  { code: 'fa', name: 'فارسی', hasDownload: true, rtl: true },
  { code: 'hi', name: 'हिन्दी', hasDownload: true },
  { code: 'th', name: 'ภาษาไทย', hasDownload: true },
  { code: 'zh-CN', name: '简体中文', hasDownload: true },
  { code: 'zh-TW', name: '繁体中文', hasDownload: true },
  { code: 'ja', name: '日本語', hasDownload: true },
  { code: 'ko', name: '한국어', hasDownload: true },
];

export default function LanguageSettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedLanguage, setSelectedLanguage] = useState('system');

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
        <Text style={styles.headerTitle}>Ngôn ngữ (Language)</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {languages.map((language, index) => (
          <TouchableOpacity
            key={language.code}
            style={[
              styles.languageItem,
              index !== languages.length - 1 && styles.languageItemBorder
            ]}
            activeOpacity={0.7}
            onPress={() => setSelectedLanguage(language.code)}
          >
            {/* Radio Button */}
            <View style={styles.radioButton}>
              {selectedLanguage === language.code ? (
                <View style={styles.radioButtonSelected}>
                  <View style={styles.radioButtonInner} />
                </View>
              ) : (
                <View style={styles.radioButtonUnselected} />
              )}
            </View>

            {/* Language Name */}
            <Text 
              style={[
                styles.languageName,
                language.rtl && styles.languageNameRtl
              ]}
            >
              {language.name}
            </Text>

            {/* Download Icon */}
            {language.hasDownload && (
              <Ionicons name="download-outline" size={22} color="#64748b" />
            )}
          </TouchableOpacity>
        ))}
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
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  languageItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  radioButton: {
    marginRight: 16,
  },
  radioButtonSelected: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#38b6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#38b6ff',
  },
  radioButtonUnselected: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#64748b',
  },
  languageName: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
  },
  languageNameRtl: {
    textAlign: 'right',
  },
});
