import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthManager } from '@/utils/auth-manager';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [useEmailAuth, setUseEmailAuth] = useState(false);

  const handleClose = () => {
    router.back();
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await AuthManager.signInWithGoogle();
      console.log('✅ Successfully signed in with Google');
      // Navigate back to settings
      router.push('/(settings)/alarm-settings');
    } catch (error: any) {
      console.error('❌ Error signing in with Google:', error);
      setShowEmailInput(true);
      Alert.alert(
        'Google đăng nhập không khả dụng',
        'Vui lòng sử dụng email để đăng nhập thay thế',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async () => {
    if (!email || !email.includes('@')) {
      Alert.alert('Lỗi', 'Vui lòng nhập email hợp lệ');
      return;
    }

    setIsLoading(true);
    try {
      await AuthManager.signInWithEmail(email);
      console.log('✅ Successfully signed in with email');
      router.push('/(settings)/alarm-settings');
    } catch (error: any) {
      console.error('❌ Error signing in with email:', error);
      Alert.alert(
        'Đăng nhập thất bại',
        error.message || 'Có lỗi xảy ra khi đăng nhập'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaProvider style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.placeholder} />
        <Text style={styles.headerTitle}>Đăng nhập</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleClose}
        >
          <Ionicons name="close" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Cloud Illustration */}
        <View style={styles.illustrationContainer}>
          {/* Decorative elements */}
          <View style={[styles.decorativeDot, styles.dotTopLeft]} />
          <View style={[styles.decorativePlus, styles.plusTopLeft]}>
            <Ionicons name="add" size={12} color="#64748b" />
          </View>
          <View style={[styles.decorativeDot, styles.dotTopRight]} />
          <View style={[styles.decorativePlus, styles.plusTopRight]}>
            <Ionicons name="add" size={14} color="#64748b" />
          </View>
          <View style={[styles.decorativeDot, styles.dotMiddleRight]} />

          {/* Cloud with sync icon */}
          <View style={styles.cloudContainer}>
            <View style={styles.cloud}>
              <View style={styles.cloudMain}>
                <View style={styles.syncIconContainer}>
                  <Ionicons name="sync" size={36} color="#ffffff" />
                </View>
              </View>
              <View style={styles.cloudBubbleLeft} />
              <View style={styles.cloudBubbleRight} />
            </View>
          </View>
        </View>

        {/* Title Text */}
        <Text style={styles.title}>
          Giữ bản ghi an toàn bằng cách đăng nhập
        </Text>
      </View>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        {/* Google Sign In Button */}
        <TouchableOpacity
          style={[styles.googleButton, isLoading && styles.googleButtonDisabled]}
          activeOpacity={0.8}
          disabled={isLoading}
          onPress={handleGoogleSignIn}
        >
          {isLoading ? (
            <>
              <ActivityIndicator size="small" color="#0f172a" style={{ marginRight: 12 }} />
              <Text style={styles.googleButtonText}>Đang đăng nhập...</Text>
            </>
          ) : (
            <>
              <View style={styles.googleIconContainer}>
                <Text style={styles.googleIcon}>G</Text>
              </View>
              <Text style={styles.googleButtonText}>Tiếp tục với Google</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Email Input (shown on fallback) */}
        {showEmailInput && (
          <View>
            <Text style={styles.alternativeText}>hoặc</Text>
            <TextInput
              style={styles.emailInput}
              placeholder="Nhập email của bạn"
              placeholderTextColor="#64748b"
              value={email}
              onChangeText={setEmail}
              editable={!isLoading}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={[styles.emailButton, isLoading && styles.emailButtonDisabled]}
              activeOpacity={0.8}
              disabled={isLoading}
              onPress={handleEmailSignIn}
            >
              {isLoading ? (
                <>
                  <ActivityIndicator size="small" color="#ffffff" style={{ marginRight: 12 }} />
                  <Text style={styles.emailButtonText}>Đang đăng nhập...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="mail" size={18} color="#ffffff" />
                  <Text style={styles.emailButtonText}>Đăng nhập bằng Email</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Terms and Privacy */}
        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>
            Bằng cách tiếp tục, bạn đồng ý với{' '}
            <Text style={styles.linkText}>Điều khoản & Điều kiện</Text>
            {' '}và{'\n'}
            <Text style={styles.linkText}>Chính sách quyền riêng tư</Text>
            {' '}của chúng tôi.
          </Text>
        </View>
      </View>
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
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  placeholder: {
    width: 40,
  },

  // Content
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },

  // Illustration
  illustrationContainer: {
    width: 200,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    position: 'relative',
  },

  // Decorative elements
  decorativeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#64748b',
    position: 'absolute',
  },
  decorativePlus: {
    position: 'absolute',
  },
  dotTopLeft: {
    top: 30,
    left: 20,
  },
  plusTopLeft: {
    top: 15,
    left: 5,
  },
  dotTopRight: {
    top: 25,
    right: 30,
  },
  plusTopRight: {
    top: 10,
    right: 5,
  },
  dotMiddleRight: {
    top: 60,
    right: 10,
  },

  // Cloud
  cloudContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cloud: {
    position: 'relative',
    alignItems: 'center',
  },
  cloudMain: {
    width: 140,
    height: 90,
    backgroundColor: '#3b82f6',
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  cloudBubbleLeft: {
    position: 'absolute',
    width: 50,
    height: 50,
    backgroundColor: '#3b82f6',
    borderRadius: 25,
    left: -10,
    bottom: 10,
  },
  cloudBubbleRight: {
    position: 'absolute',
    width: 60,
    height: 60,
    backgroundColor: '#3b82f6',
    borderRadius: 30,
    right: -15,
    bottom: 5,
  },
  syncIconContainer: {
    zIndex: 10,
  },

  // Title
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 36,
  },

  // Bottom Section
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },

  // Google Button
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 30,
    paddingVertical: 18,
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  googleButtonDisabled: {
    opacity: 0.7,
  },
  googleIconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4285F4',
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },

  // Email Section
  alternativeText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500',
  },
  emailInput: {
    backgroundColor: '#1e293b',
    borderColor: '#475569',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 12,
  },
  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    borderRadius: 30,
    paddingVertical: 18,
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  emailButtonDisabled: {
    opacity: 0.7,
  },
  emailButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 10,
  },

  // Terms
  termsContainer: {
    alignItems: 'center',
  },
  termsText: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 18,
  },
  linkText: {
    color: '#60a5fa',
    textDecorationLine: 'underline',
  },
});
