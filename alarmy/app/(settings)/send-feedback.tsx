import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Keyboard,
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

type FeedbackType = 'request' | 'bug' | 'suggestion' | 'compliment' | null;

const FEEDBACK_OPTIONS: { key: FeedbackType; label: string }[] = [
  { key: 'request', label: 'Yêu cầu' },
  { key: 'bug', label: 'Lỗi' },
  { key: 'suggestion', label: 'Gợi ý' },
  { key: 'compliment', label: 'Compliment' },
];

export default function SendFeedbackScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedType, setSelectedType] = useState<FeedbackType>(null);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [showError, setShowError] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const totalSteps = 3;

  // Email validation helper
  const isValidEmail = (emailStr: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailStr);
  };

  const handleNext = () => {
    setShowError(false);
    
    if (currentStep === 1) {
      if (!selectedType) {
        setShowError(true);
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!message.trim()) {
        setShowError(true);
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (!email.trim() || !isValidEmail(email.trim())) {
        setShowError(true);
        return;
      }
      // Submit feedback
      setIsSubmitted(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setShowError(false);
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const handleClose = () => {
    router.back();
  };

  // Progress indicator component
  const ProgressIndicator = () => (
    <View style={styles.progressContainer}>
      {[1, 2, 3].map((step, index) => (
        <React.Fragment key={step}>
          <View
            style={[
              styles.progressDot,
              currentStep >= step && styles.progressDotActive,
            ]}
          />
          {index < 2 && (
            <View
              style={[
                styles.progressLine,
                currentStep > step && styles.progressLineActive,
              ]}
            />
          )}
        </React.Fragment>
      ))}
    </View>
  );

  // Radio button component
  const RadioButton = ({ selected }: { selected: boolean }) => (
    <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
      {selected && <View style={styles.radioInner} />}
    </View>
  );

  // Success screen
  if (isSubmitted) {
    return (
      <SafeAreaProvider style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <View style={styles.placeholder} />
          <Text style={styles.headerTitle}>Gửi phản hồi</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
          >
            <Ionicons name="close" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Success Content */}
        <View style={styles.successContainer}>
          <View style={styles.checkmarkContainer}>
            <Ionicons name="checkmark" size={80} color="#22c55e" />
          </View>
          <Text style={styles.successTitle}>
            Tin nhắn vừa được gửi đi thành công.
          </Text>
          <Text style={styles.successSubtitle}>Cảm ơn bạn.</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
        >
          <Ionicons name="chevron-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gửi phản hồi</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleClose}
        >
          <Ionicons name="close" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressWrapper}>
        <ProgressIndicator />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Step 1: Select Feedback Type */}
        {currentStep === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.question}>
              Bạn sẽ cung cấp cho chúng tôi loại phản hồi nào?
            </Text>

            <View style={styles.optionsCard}>
              {FEEDBACK_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={styles.optionItem}
                  activeOpacity={0.7}
                  onPress={() => {
                    setSelectedType(option.key);
                    setShowError(false);
                  }}
                >
                  <RadioButton selected={selectedType === option.key} />
                  <Text style={styles.optionLabel}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Step 2: Enter Message */}
        {currentStep === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.question}>
              Hãy cho chúng tôi biết tình hình hoặc suy nghĩ của bạn.
            </Text>

            <View style={styles.textInputCard}>
              <TextInput
                style={styles.textInput}
                placeholder="Hãy viết tin nhắn của bạn ở đây"
                placeholderTextColor="#64748b"
                value={message}
                onChangeText={(text) => {
                  setMessage(text);
                  setShowError(false);
                }}
                multiline
                textAlignVertical="top"
              />
            </View>
          </View>
        )}

        {/* Step 3: Enter Email */}
        {currentStep === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.question}>
              Hãy cho biết địa chỉ email của bạn để chúng tôi có thể gửi trả lời.
            </Text>

            <View style={styles.emailInputCard}>
              <TextInput
                style={styles.emailInput}
                placeholder="Hãy điền địa chỉ email của bạn"
                placeholderTextColor="#64748b"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setShowError(false);
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Hint Text - Shows above button when input is empty and no error */}
      {!showError && currentStep === 2 && !message.trim() && (
        <View style={styles.hintContainer}>
          <Text style={styles.hintText}>Xin vui lòng nhập tin nhắn</Text>
        </View>
      )}
      
      {!showError && currentStep === 3 && (!email.trim() || !isValidEmail(email.trim())) && (
        <View style={styles.hintContainer}>
          <Text style={styles.hintText}>Hãy nhập một địa chỉ email hợp lệ</Text>
        </View>
      )}

      {/* Error Message */}
      {showError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {currentStep === 1
              ? 'Vui lòng chọn một tùy chọn.'
              : currentStep === 2
              ? 'Xin vui lòng nhập tin nhắn'
              : 'Hãy nhập một địa chỉ email hợp lệ'}
          </Text>
        </View>
      )}

      {/* Next Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            (currentStep === 1 && !selectedType) || 
            (currentStep === 2 && !message.trim()) ||
            (currentStep === 3 && (!email.trim() || !isValidEmail(email.trim())))
              ? styles.nextButtonDisabled
              : styles.nextButtonActive,
          ]}
          activeOpacity={0.8}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>
            {currentStep === 3 ? 'Gửi phản hồi' : 'Tiếp theo'}
          </Text>
        </TouchableOpacity>
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
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  placeholder: {
    width: 40,
  },

  // Progress Indicator
  progressWrapper: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#334155',
  },
  progressDotActive: {
    backgroundColor: '#22c55e',
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#334155',
    marginHorizontal: 4,
  },
  progressLineActive: {
    backgroundColor: '#22c55e',
  },

  // Content
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  stepContainer: {
    flex: 1,
  },
  question: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    lineHeight: 32,
    marginBottom: 24,
  },

  // Options Card (Step 1)
  optionsCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    overflow: 'hidden',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  optionLabel: {
    fontSize: 16,
    color: '#ffffff',
    marginLeft: 16,
  },

  // Radio Button
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#475569',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: '#38b6ff',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#38b6ff',
  },

  // Text Input Card (Step 2)
  textInputCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    minHeight: 180,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
    padding: 16,
    minHeight: 180,
  },

  // Email Input (Step 3)
  emailInputCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  emailInput: {
    fontSize: 16,
    color: '#ffffff',
    padding: 16,
  },

  // Hint Text
  hintContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  hintText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },

  // Error
  errorContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  errorText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },

  // Button
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 70,
    paddingTop: 10,
  },
  nextButton: {
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextButtonActive: {
    backgroundColor: '#ef4444',
  },
  nextButtonDisabled: {
    backgroundColor: '#475569',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },

  // Success Screen
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  checkmarkContainer: {
    marginBottom: 32,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 32,
  },
  successSubtitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 8,
  },
});
