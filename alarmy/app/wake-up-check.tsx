import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Easing,
  Modal,
  Dimensions,
  PanResponder,
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AlarmManager } from '@/utils/alarm-manager';
import { useTheme } from '@/context/ThemeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.65;

const WAKE_CHECK_OPTIONS = [
  { id: 'off', label: 'Tắt' },
  { id: '1min', label: 'trong 1 phút.' },
  { id: '3min', label: 'trong 3 phút.' },
  { id: '5min', label: 'trong 5 phút.' },
  { id: '7min', label: 'trong 7 phút.' },
  { id: '10min', label: 'trong 10 phút.' },
];

// Info Modal Component
const InfoModal = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => {
  const { colors, isDarkMode } = useTheme();
  const slideAnim = useRef(new Animated.Value(MODAL_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Modal animation values
  const modalCountdown = useRef(new Animated.Value(3)).current;
  const [countdownValue, setCountdownValue] = useState(3);
  const modalCheckmarkOpacity = useRef(new Animated.Value(0)).current;
  const modalButtonOpacity = useRef(new Animated.Value(1)).current;
  const [modalStep, setModalStep] = useState(0); // 0: countdown, 1: checkmark, 2: dismiss
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          slideAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          closeModal();
        } else {
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            friction: 8,
          }).start();
        }
      },
    })
  ).current;

  const openModal = useCallback(() => {
    slideAnim.setValue(MODAL_HEIGHT);
    backdropOpacity.setValue(0);
    setCurrentSlide(0);
    scrollX.setValue(0);
    scrollViewRef.current?.scrollTo({ x: 0, animated: false });

    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
        tension: 65,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const closeModal = useCallback(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: MODAL_HEIGHT,
        duration: 250,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  }, [onClose]);

  useEffect(() => {
    if (visible) {
      openModal();
    }
  }, [visible, openModal]);

  // Modal animation sequence
  useEffect(() => {
    if (!visible) return;

    let countdownInterval: any;
    let animationTimeout: any;

    const runModalAnimation = () => {
      // Reset state
      setModalStep(0);
      setCountdownValue(3);
      modalButtonOpacity.setValue(1);
      modalCheckmarkOpacity.setValue(0);

      // Countdown from 3 to 1
      countdownInterval = setInterval(() => {
        setCountdownValue((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            // Transition to checkmark
            setModalStep(1);
            Animated.parallel([
              Animated.timing(modalButtonOpacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
              }),
              Animated.timing(modalCheckmarkOpacity, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
              }),
            ]).start(() => {
              // Show dismiss screen
              animationTimeout = setTimeout(() => {
                setModalStep(2);
                // Start shake animation
                const shakeSequence = Animated.loop(
                  Animated.sequence([
                    Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
                    Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
                    Animated.timing(shakeAnim, { toValue: 6, duration: 50, useNativeDriver: true }),
                    Animated.timing(shakeAnim, { toValue: -6, duration: 50, useNativeDriver: true }),
                    Animated.timing(shakeAnim, { toValue: 4, duration: 50, useNativeDriver: true }),
                    Animated.timing(shakeAnim, { toValue: -4, duration: 50, useNativeDriver: true }),
                    Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
                    Animated.delay(300),
                  ]),
                  { iterations: 3 }
                );
                shakeSequence.start();
                // Loop back
                animationTimeout = setTimeout(() => {
                  shakeAnim.setValue(0);
                  runModalAnimation();
                }, 2500);
              }, 1500);
            });
            return 1;
          }
          return prev - 1;
        });
      }, 1000);
    };

    runModalAnimation();

    return () => {
      clearInterval(countdownInterval);
      clearTimeout(animationTimeout);
    };
  }, [visible]);

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const slideIndex = Math.round(offsetX / (SCREEN_WIDTH - 32));
    setCurrentSlide(slideIndex);
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" statusBarTranslucent>
      <View style={modalStyles.container}>
        {/* Backdrop */}
        <Animated.View
          style={[modalStyles.backdrop, { opacity: backdropOpacity }]}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={closeModal}
          />
        </Animated.View>

        {/* Bottom Sheet */}
        <Animated.View
          style={[
            modalStyles.sheet,
            {
              backgroundColor: colors.surface,
              transform: [{ translateY: slideAnim }],
            },
          ]}
          {...panResponder.panHandlers}
        >
          {/* Handle */}
          <View style={modalStyles.handleContainer}>
            <View style={[modalStyles.handle, { backgroundColor: colors.border }]} />
          </View>

          {/* Title */}
          <Text style={[modalStyles.title, { color: colors.text }]}>Kiểm tra thức dậy</Text>
          <Text style={[modalStyles.subtitle, { color: colors.textSecondary }]}>
            Không có phản hồi? Đổ chuông lần nữa
          </Text>

          {/* Carousel */}
          <View style={modalStyles.carouselContainer}>
            {/* Glowing background */}
            <View style={modalStyles.glowContainer}>
              <View style={modalStyles.glowOuter} />
              <View style={modalStyles.glowInner} />
            </View>
            
            {/* Phone Mockup with Animation */}
            <Animated.View style={[
              modalStyles.phoneContainer,
              modalStep === 2 && { transform: [{ translateX: shakeAnim }] }
            ]}>
              <View style={modalStyles.phoneMockup}>
                {/* Phone outer frame */}
                <View style={modalStyles.phoneOuterFrame}>
                  {/* Phone inner frame */}
                  <View style={modalStyles.phoneFrame}>
                    {/* Phone notch/dynamic island */}
                    <View style={modalStyles.phoneNotch} />
                    
                    {/* Phone screen content */}
                    <View style={modalStyles.phoneScreen}>
                      {modalStep === 2 ? (
                        // Dismiss screen with shake
                        <View style={modalStyles.dismissContainer}>
                          <Text style={modalStyles.timeText}>7:10</Text>
                          <View style={modalStyles.dismissButton}>
                            <Text style={modalStyles.dismissButtonText}>Dismiss</Text>
                          </View>
                        </View>
                      ) : modalStep === 1 ? (
                        // Checkmark screen
                        <Animated.View style={[modalStyles.checkContainer, { opacity: modalCheckmarkOpacity }]}>
                          <View style={modalStyles.checkCircle}>
                            <Ionicons name="checkmark" size={28} color="#ffffff" />
                          </View>
                        </Animated.View>
                      ) : (
                        // Countdown screen
                        <Animated.View style={[modalStyles.countdownContainer, { opacity: modalButtonOpacity }]}>
                          <Text style={modalStyles.countdownText}>
                            {countdownValue} <Text style={modalStyles.countdownUnit}>s</Text>
                          </Text>
                          <View style={modalStyles.awakeButton}>
                            <Text style={modalStyles.awakeButtonText}>I&apos;m awake!</Text>
                          </View>
                        </Animated.View>
                      )}
                    </View>
                    
                    {/* Phone home indicator */}
                    <View style={modalStyles.homeIndicator} />
                  </View>
                </View>
              </View>
            </Animated.View>

            {/* Dots indicator */}
            <View style={modalStyles.dotsContainer}>
              {[0, 1, 2].map((index) => (
                <View
                  key={index}
                  style={[
                    modalStyles.dot,
                    { backgroundColor: colors.border },
                    modalStep === index && [modalStyles.dotActive, { backgroundColor: colors.primary }],
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Try it button */}
          <TouchableOpacity 
            style={[modalStyles.tryButton, { backgroundColor: isDarkMode ? '#ffffff' : colors.primary }]} 
            onPress={closeModal}
          >
            <Text style={[modalStyles.tryButtonText, { color: isDarkMode ? colors.primary : '#ffffff' }]}>Dùng thử</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const modalStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
    minHeight: MODAL_HEIGHT,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  carouselContainer: {
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  glowContainer: {
    position: 'absolute',
    width: 250,
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowOuter: {
    position: 'absolute',
    width: 220,
    height: 240,
    borderRadius: 110,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
  },
  glowInner: {
    position: 'absolute',
    width: 180,
    height: 260,
    borderRadius: 90,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
  },
  phoneContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    zIndex: 1,
  },
  phoneMockup: {
    width: 180,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneOuterFrame: {
    padding: 6,
    borderRadius: 36,
    backgroundColor: '#1f2937',
  },
  phoneFrame: {
    width: 160,
    height: 220,
    backgroundColor: '#0f172a',
    borderRadius: 30,
    overflow: 'hidden',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#374151',
  },
  phoneNotch: {
    width: 60,
    height: 18,
    backgroundColor: '#000000',
    borderRadius: 9,
    marginTop: 8,
  },
  phoneScreen: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  homeIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#4b5563',
    borderRadius: 2,
    marginBottom: 6,
  },
  dismissContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
  },
  countdownUnit: {
    fontSize: 18,
    fontWeight: '400',
    color: '#94a3b8',
  },
  awakeButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 20,
  },
  awakeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  checkContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4bdf89',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 42,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
  },
  dismissButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 20,
  },
  dismissButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: '#3b82f6',
    width: 24,
  },
  tryButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  tryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default function WakeUpCheckScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDarkMode } = useTheme();
  const [selectedOption, setSelectedOption] = useState('off');
  const [animationStep, setAnimationStep] = useState(0);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const params = useLocalSearchParams();
  const alarmId = params.id as string;
  
  // Animation values for check screen
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(0.5)).current;
  const checkmarkOpacity = useRef(new Animated.Value(0)).current;
  const fingerOpacity = useRef(new Animated.Value(0)).current;
  const circleScale = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animationSequence = () => {
      // Step 0: Show circle growing
      setAnimationStep(0);
      Animated.parallel([
        Animated.timing(circleScale, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(buttonOpacity, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(checkmarkOpacity, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(fingerOpacity, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Step 1: Show button appearing
        setTimeout(() => {
          setAnimationStep(1);
          Animated.parallel([
            Animated.timing(buttonOpacity, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.spring(buttonScale, {
              toValue: 1,
              friction: 6,
              useNativeDriver: true,
            }),
            Animated.timing(circleScale, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start(() => {
            // Step 2: Show finger pointing
            setTimeout(() => {
              setAnimationStep(2);
              Animated.timing(fingerOpacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
              }).start(() => {
                // Step 3: Button pressed, show checkmark
                setTimeout(() => {
                  setAnimationStep(3);
                  Animated.parallel([
                    Animated.timing(buttonOpacity, {
                      toValue: 0,
                      duration: 200,
                      useNativeDriver: true,
                    }),
                    Animated.timing(fingerOpacity, {
                      toValue: 0,
                      duration: 200,
                      useNativeDriver: true,
                    }),
                    Animated.timing(checkmarkOpacity, {
                      toValue: 1,
                      duration: 400,
                      useNativeDriver: true,
                    }),
                  ]).start(() => {
                    // Reset and loop
                    setTimeout(() => {
                      buttonScale.setValue(0.5);
                      animationSequence();
                    }, 1500);
                  });
                }, 800);
              });
            }, 600);
          });
        }, 800);
      });
    };

    animationSequence();
  }, []);

  const handleBack = async () => {
    // Auto-delete flash alarm when dismissed
    if (alarmId) {
      try {
        const alarms = await AlarmManager.loadAlarms();
        const alarm = alarms.find(a => a.id === alarmId);
        if (alarm?.type === 'flash') {
          console.log('🗑️ Auto-deleting flash alarm on dismiss:', alarmId);
          await AlarmManager.removeAlarm(alarmId);
        }
      } catch (error) {
        console.error('❌ Error auto-deleting flash alarm:', error);
      }
    }
    
    router.back();
  };

  const handleInfoPress = () => {
    setInfoModalVisible(true);
  };

  return (
    <SafeAreaProvider style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Kiểm tra thức dậy</Text>
        <TouchableOpacity style={styles.infoButton} onPress={handleInfoPress}>
          <Ionicons name="information-circle-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        {/* Animation Card */}
        <View style={styles.animationCard}>
          <Text style={styles.animationTitle}>
            {animationStep === 3 
              ? "Chúng tôi kiểm tra xem bạn đã thực sự tỉnh táo chưa..."
              : "Nhấn để chắc chắn là bạn đã thức dậy"
            }
          </Text>
          
          {/* Phone Mockup */}
          <View style={styles.phoneMockup}>
            {/* Status bar */}
            <View style={styles.phoneStatusBar}>
              <Text style={styles.phoneTime}>9:41</Text>
              <View style={styles.phoneStatusIcons}>
                <View style={styles.signalIcon} />
                <Ionicons name="wifi" size={12} color="#ffffff" />
                <Ionicons name="battery-full" size={14} color="#ffffff" />
              </View>
            </View>
            
            {/* Phone content */}
            <View style={styles.phoneContent}>
              {/* Circle animation */}
              <Animated.View 
                style={[
                  styles.circleAnimation,
                  { 
                    transform: [{ scale: circleScale }],
                    opacity: animationStep === 0 ? 1 : 0,
                  }
                ]}
              />
              
              {/* I'm awake button with finger */}
              <Animated.View 
                style={[
                  styles.awakeButtonContainer,
                  { 
                    opacity: buttonOpacity,
                    transform: [{ scale: buttonScale }],
                  }
                ]}
              >
                <View style={styles.awakeButton}>
                  <Text style={styles.awakeButtonText}>I&apos;m awake!</Text>
                </View>
                <Animated.Text 
                  style={[
                    styles.fingerEmoji,
                    { opacity: fingerOpacity }
                  ]}
                >
                  👆
                </Animated.Text>
              </Animated.View>
              
              {/* Checkmark */}
              <Animated.View 
                style={[
                  styles.checkmarkContainer,
                  { opacity: checkmarkOpacity }
                ]}
              >
                <View style={styles.checkmarkCircle}>
                  <Ionicons name="checkmark" size={32} color="#ffffff" />
                </View>
                <Text style={styles.dismissText}>Dismiss</Text>
              </Animated.View>
            </View>
          </View>
        </View>

        {/* Options Section */}
        <Text style={[styles.optionsTitle, { color: colors.text }]}>
          Khi nào cần kiểm tra lại sau khi chuông tắt?
        </Text>

        {WAKE_CHECK_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={styles.optionRow}
            onPress={() => setSelectedOption(option.id)}
          >
            <View style={[
              styles.radioButton,
              { borderColor: isDarkMode ? colors.textMuted : colors.border },
              selectedOption === option.id && styles.radioButtonSelected
            ]}>
              {selectedOption === option.id && (
                <View style={[styles.radioButtonInner, { backgroundColor: colors.primary }]} />
              )}
            </View>
            <Text style={[styles.optionText, { color: colors.text }]}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Info Modal */}
      <InfoModal 
        visible={infoModalVisible} 
        onClose={() => setInfoModalVisible(false)} 
      />
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
    paddingBottom: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  infoButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  animationCard: {
    backgroundColor: '#3b82f6',
    borderRadius: 20,
    padding: 24,
    marginTop: 12,
    marginBottom: 24,
    alignItems: 'center',
    minHeight: 280,
  },
  animationTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
  },
  phoneMockup: {
    width: 140,
    height: 160,
    backgroundColor: '#1e293b',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#334155',
  },
  phoneStatusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 4,
  },
  phoneTime: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  phoneStatusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  signalIcon: {
    width: 12,
    height: 8,
    backgroundColor: '#ffffff',
    borderRadius: 2,
  },
  phoneContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  circleAnimation: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#3b82f6',
    position: 'absolute',
  },
  awakeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  checkmarkContainer: {
    alignItems: 'center',
    position: 'absolute',
  },
  checkmarkCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  dismissText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '500',
  },
  awakeButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
  awakeButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fingerEmoji: {
    fontSize: 24,
    position: 'absolute',
    bottom: -15,
    right: -10,
  },
  optionsTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 20,
    lineHeight: 26,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 16,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: '#38bdf8',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#38bdf8',
  },
  optionText: {
    fontSize: 16,
  },
});

