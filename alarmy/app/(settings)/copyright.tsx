import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  SafeAreaView,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CopyrightReport {
  id: string;
  email: string;
  content: string;
  type: string;
  createdAt: number;
  status: 'pending' | 'reviewed';
}

export default function CopyrightScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [reportType, setReportType] = useState('copyright');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reports, setReports] = useState<CopyrightReport[]>([]);

  const REPORTS_STORAGE_KEY = 'COPYRIGHT_REPORTS_STORAGE';

  const handleSubmit = async () => {
    if (!email.trim() || !content.trim()) {
      Alert.alert('Lỗi', 'Vui lòng điền hết tất cả các trường');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Lỗi', 'Vui lòng nhập email hợp lệ');
      return;
    }

    setIsSubmitting(true);
    try {
      const newReport: CopyrightReport = {
        id: Date.now().toString(),
        email,
        content,
        type: reportType,
        createdAt: Date.now(),
        status: 'pending',
      };

      const existingReports = await AsyncStorage.getItem(REPORTS_STORAGE_KEY);
      const allReports = existingReports ? JSON.parse(existingReports) : [];
      allReports.push(newReport);

      await AsyncStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(allReports));

      Alert.alert(
        'Cảm ơn bạn',
        'Báo cáo của bạn đã được gửi. Chúng tôi sẽ xem xét trong vòng 24 giờ.',
        [
          {
            text: 'OK',
            onPress: () => {
              setEmail('');
              setContent('');
              setReportType('copyright');
            },
          },
        ]
      );
    } catch (err) {
      console.error('Error submitting report:', err);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi gửi báo cáo');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Báo cáo vi phạm bản quyền</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.iconBackground}>
            <Ionicons name="shield" size={32} color="#ef4444" />
          </View>
          <Text style={styles.infoTitle}>Báo cáo vi phạm bản quyền</Text>
          <Text style={styles.infoText}>
            Nếu bạn tin rằng nội dung trong ứng dụng này vi phạm bản quyền của bạn, vui lòng gửi báo cáo chi tiết.
          </Text>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          {/* Email */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Email liên hệ *</Text>
            <TextInput
              style={styles.input}
              placeholder="example@email.com"
              placeholderTextColor="#64748b"
              value={email}
              onChangeText={setEmail}
              editable={!isSubmitting}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Type */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Loại báo cáo *</Text>
            <View style={styles.typeContainer}>
              {[
                { id: 'copyright', label: 'Vi phạm bản quyền' },
                { id: 'trademark', label: 'Vi phạm nhãn hiệu' },
                { id: 'other', label: 'Khác' },
              ].map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeButton,
                    reportType === type.id && styles.typeButtonActive,
                  ]}
                  onPress={() => setReportType(type.id)}
                  disabled={isSubmitting}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      reportType === type.id && styles.typeButtonTextActive,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Content */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Chi tiết báo cáo *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Mô tả chi tiết về vi phạm..."
              placeholderTextColor="#64748b"
              value={content}
              onChangeText={setContent}
              editable={!isSubmitting}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Text style={styles.submitButtonText}>Đang gửi...</Text>
            ) : (
              <Text style={styles.submitButtonText}>Gửi báo cáo</Text>
            )}
          </TouchableOpacity>

          {/* Info Text */}
          <Text style={styles.infoNote}>
            Chúng tôi sẽ xem xét báo cáo của bạn trong vòng 24 giờ và liên hệ với bạn qua email nếu cần thêm thông tin.
          </Text>
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
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
    textAlign: 'center',
  },

  // Content
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },

  // Info Section
  infoSection: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 16,
  },
  iconBackground: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Form Section
  formSection: {
    paddingBottom: 32,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1e293b',
    borderColor: '#475569',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#ffffff',
    fontSize: 16,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },

  // Type Selector
  typeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#475569',
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  typeButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#94a3b8',
  },
  typeButtonTextActive: {
    color: '#ffffff',
  },

  // Submit Button
  submitButton: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },

  // Info Note
  infoNote: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 8,
  },
});
