import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

interface AlarmItem {
  time: string;
  isOn: boolean;
}

const INITIAL_ALARMS: AlarmItem[] = [
  { time: '6:55', isOn: true },
  { time: '7:10', isOn: true },
  { time: '7:20', isOn: true },
  { time: '7:30', isOn: true },
];

const EMOJIS = ['😴', '😔', '😣', '😠', '😡'];

export default function UpgradeProScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [alarms, setAlarms] = useState<AlarmItem[]>(INITIAL_ALARMS);
  const [emojiIndex, setEmojiIndex] = useState(0);
  const [animationPhase, setAnimationPhase] = useState(0);
  const [showFinalView, setShowFinalView] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animation sequence: toggle alarms off one by one
    const runAnimation = () => {
      const phases = [
        { delay: 1500, alarmIndex: 0, emoji: 1 }, // Turn off 6:55
        { delay: 2500, alarmIndex: 1, emoji: 2 }, // Turn off 7:10
        { delay: 3500, alarmIndex: 2, emoji: 3 }, // Turn off 7:20
        { delay: 4500, alarmIndex: 3, emoji: 4 }, // Turn off 7:30
        { delay: 6000, final: true },              // Show final view
      ];

      phases.forEach((phase, index) => {
        setTimeout(() => {
          if (phase.final) {
            // Fade to final view
            Animated.sequence([
              Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
              }),
              Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
              }),
            ]).start();
            
            setTimeout(() => {
              setShowFinalView(true);
            }, 300);
          } else {
            // Toggle alarm off
            setAlarms(prev => {
              const newAlarms = [...prev];
              if (phase.alarmIndex !== undefined) {
                newAlarms[phase.alarmIndex].isOn = false;
              }
              return newAlarms;
            });
            
            // Change emoji with bounce animation
            if (phase.emoji !== undefined) {
              Animated.sequence([
                Animated.timing(scaleAnim, {
                  toValue: 1.2,
                  duration: 150,
                  useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                  toValue: 1,
                  duration: 150,
                  useNativeDriver: true,
                }),
              ]).start();
              setEmojiIndex(phase.emoji);
            }
          }
        }, phase.delay);
      });
    };

    // Reset and run animation
    setAlarms(INITIAL_ALARMS.map(a => ({ ...a, isOn: true })));
    setEmojiIndex(0);
    setShowFinalView(false);
    
    const timer = setTimeout(runAnimation, 500);
    
    // Loop animation
    const loopTimer = setInterval(() => {
      setAlarms(INITIAL_ALARMS.map(a => ({ ...a, isOn: true })));
      setEmojiIndex(0);
      setShowFinalView(false);
      setTimeout(runAnimation, 500);
    }, 10000);

    return () => {
      clearTimeout(timer);
      clearInterval(loopTimer);
    };
  }, []);

  const handleClose = () => {
    router.back();
  };

  const handleStartTrial = () => {
    // TODO: Implement trial start
    console.log('Start free trial');
    router.back();
  };

  // Toggle Switch Component
  const ToggleSwitch = ({ isOn }: { isOn: boolean }) => (
    <View style={[styles.toggle, isOn ? styles.toggleOn : styles.toggleOff]}>
      <View style={[styles.toggleThumb, isOn ? styles.thumbOn : styles.thumbOff]} />
    </View>
  );

  return (
    <SafeAreaProvider style={styles.container}>
      {/* Close Button */}
      <TouchableOpacity
        style={[styles.closeButton, { top: insets.top + 12 }]}
        onPress={handleClose}
      >
        <Ionicons name="close" size={24} color="#ffffff" />
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.proBadge}>
          <Ionicons name="diamond" size={16} color="#ffffff" />
          <Text style={styles.proText}>PRO</Text>
        </View>
        <Text style={styles.title}>Với Alarmy Pro,{'\n'}một báo thức là đủ</Text>
      </View>

      {/* Animation Content */}
      <View style={styles.content}>
        <Animated.View style={[styles.phoneContainer, { opacity: fadeAnim }]}>
          {!showFinalView ? (
            // Phone with multiple alarms toggling off
            <View style={styles.phoneMockup}>
              <View style={styles.alarmsContainer}>
                {alarms.map((alarm, index) => (
                  <View key={index} style={styles.alarmRow}>
                    <Text style={[
                      styles.alarmTime,
                      !alarm.isOn && styles.alarmTimeOff
                    ]}>
                      AM {alarm.time}
                    </Text>
                    <ToggleSwitch isOn={alarm.isOn} />
                  </View>
                ))}
              </View>
              
              {/* Emoji */}
              <Animated.View style={[
                styles.emojiContainer,
                { transform: [{ scale: scaleAnim }] }
              ]}>
                <Text style={styles.emoji}>{EMOJIS[emojiIndex]}</Text>
              </Animated.View>
            </View>
          ) : (
            // Final view with single Pro alarm
            <View style={styles.finalViewContainer}>
              <View style={styles.proBadgeSmall}>
                <Ionicons name="diamond" size={12} color="#ffffff" />
                <Text style={styles.proTextSmall}>PRO</Text>
              </View>
              
              <View style={styles.phonesStack}>
                {/* Background phones */}
                <View style={[styles.bgPhone, styles.bgPhoneLeft]} />
                <View style={[styles.bgPhone, styles.bgPhoneRight]} />
                
                {/* Main alarm card */}
                <View style={styles.mainAlarmCard}>
                  <View style={styles.mainAlarmContent}>
                    <Text style={styles.mainAlarmTime}>AM 7:00</Text>
                    <ToggleSwitch isOn={true} />
                  </View>
                  <View style={styles.missionRow}>
                    <Text style={styles.missionLabel}>Mission</Text>
                    <View style={styles.missionIcons}>
                      <Ionicons name="apps" size={14} color="#64748b" />
                      <Ionicons name="camera" size={14} color="#64748b" />
                      <Ionicons name="walk" size={14} color="#64748b" />
                    </View>
                    <Ionicons name="ellipsis-vertical" size={16} color="#64748b" />
                  </View>
                </View>
              </View>
              
              {/* Background alarm times (faded) */}
              <View style={styles.fadedAlarms}>
                <Text style={styles.fadedAlarmText}>AM 6:50</Text>
                <Text style={styles.fadedAlarmText}>AM 7:10</Text>
                <Text style={styles.fadedAlarmText}>AM 7:20</Text>
                <Text style={styles.fadedAlarmText}>AM 7:30</Text>
              </View>
            </View>
          )}
        </Animated.View>
      </View>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={styles.ctaButton}
          activeOpacity={0.8}
          onPress={handleStartTrial}
        >
          <Text style={styles.ctaButtonText}>Bắt đầu tuần dùng thử miễn phí</Text>
        </TouchableOpacity>
        
        <Text style={styles.disclaimerText}>
          Không tính phí cho đến khi hết thời gian dùng thử
        </Text>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e3a8a',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Header
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dc2626',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 16,
    gap: 4,
  },
  proText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    lineHeight: 38,
  },
  
  // Content
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  phoneContainer: {
    width: '100%',
    alignItems: 'center',
  },
  phoneMockup: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 24,
    width: 220,
    position: 'relative',
  },
  alarmsContainer: {
    gap: 16,
  },
  alarmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  alarmTime: {
    fontSize: 22,
    fontWeight: '600',
    color: '#ffffff',
  },
  alarmTimeOff: {
    color: '#64748b',
  },
  
  // Toggle
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleOn: {
    backgroundColor: '#22c55e',
  },
  toggleOff: {
    backgroundColor: '#475569',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ffffff',
  },
  thumbOn: {
    alignSelf: 'flex-end',
  },
  thumbOff: {
    alignSelf: 'flex-start',
  },
  
  // Emoji
  emojiContainer: {
    position: 'absolute',
    bottom: -20,
    right: -20,
    backgroundColor: '#fef3c7',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  emoji: {
    fontSize: 32,
  },
  
  // Final View
  finalViewContainer: {
    alignItems: 'center',
    width: '100%',
  },
  proBadgeSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dc2626',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    gap: 3,
    marginBottom: 16,
  },
  proTextSmall: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  phonesStack: {
    position: 'relative',
    height: 200,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bgPhone: {
    position: 'absolute',
    width: 120,
    height: 180,
    backgroundColor: '#1e40af',
    borderRadius: 16,
    opacity: 0.6,
  },
  bgPhoneLeft: {
    left: 20,
    transform: [{ rotate: '-5deg' }],
  },
  bgPhoneRight: {
    right: 20,
    transform: [{ rotate: '5deg' }],
  },
  mainAlarmCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    width: 200,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  mainAlarmContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  mainAlarmTime: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
  },
  missionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  missionLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  missionIcons: {
    flexDirection: 'row',
    gap: 6,
    flex: 1,
  },
  fadedAlarms: {
    position: 'absolute',
    left: 0,
    top: 100,
    opacity: 0.3,
  },
  fadedAlarmText: {
    fontSize: 18,
    color: '#93c5fd',
    marginBottom: 24,
  },
  
  // Bottom Section
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  ctaButton: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 16,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  disclaimerText: {
    fontSize: 13,
    color: '#93c5fd',
    textAlign: 'center',
  },
});
