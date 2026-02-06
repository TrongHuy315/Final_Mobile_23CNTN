import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
  Modal,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Accelerometer } from 'expo-sensors';

const { width, height } = Dimensions.get('window');

type TaskState = 'playing' | 'cleared' | 'failed';

export default function ShakeTaskScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Task settings from params
  const alarmId = params.alarmId as string;
  const alarmLabel = params.alarmLabel as string || 'Báo thức';
  const targetShakes = parseInt(params.itemCount as string || '5');
  const maxSeconds = 5; // 5 second timeout, resets on shake

  // State
  const [taskState, setTaskState] = useState<TaskState>('playing');
  const [shakesRemaining, setShakesRemaining] = useState(targetShakes);
  const [timeLeft, setTimeLeft] = useState(maxSeconds);
  const [showPreview, setShowPreview] = useState(false);
  
  // Animation refs
  const timerAnim = useRef(new Animated.Value(1)).current;
  const clearTextScale = useRef(new Animated.Value(0)).current;
  const confettiAnims = useRef(Array.from({ length: 20 }, () => ({
    x: new Animated.Value(Math.random() * width),
    y: new Animated.Value(-20),
    rotation: new Animated.Value(0),
    scale: new Animated.Value(Math.random() * 0.5 + 0.5),
    color: ['#ffeb3b', '#ff5722', '#e91e63', '#9c27b0', '#2196f3', '#4caf50'][Math.floor(Math.random() * 6)]
  }))).current;

  // Timer interval ref
  const timerIntervalRef = useRef<any>(null);
  const lastShakeTime = useRef<number>(0);

  // Sync animation with timeLeft
  useEffect(() => {
    if (taskState === 'playing') {
      Animated.timing(timerAnim, {
        toValue: timeLeft / maxSeconds,
        duration: 100,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start();
    } else if (taskState === 'cleared') {
      timerAnim.setValue(timeLeft / maxSeconds);
    }
  }, [timeLeft, taskState]);

  const goBackToRinging = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    router.replace({
      pathname: '/alarm-ringing',
      params: { alarmId, label: alarmLabel }
    });
  };

  // Start timer on mount
  useEffect(() => {
    if (taskState === 'playing') {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 0.1) {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            setTaskState('failed');
            return 0;
          }
          return prev - 0.1;
        });
      }, 100);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [taskState]);

  // Handle shake detection
  useEffect(() => {
    let subscription: any;
    
    const subscribe = async () => {
      Accelerometer.setUpdateInterval(100);
      subscription = Accelerometer.addListener(({ x, y, z }) => {
        const acceleration = Math.sqrt(x * x + y * y + z * z);
        const now = Date.now();
        
        // Detect shake (threshold ~2.5g) with debounce
        if (acceleration > 2.5 && now - lastShakeTime.current > 300) {
          lastShakeTime.current = now;
          handleShake();
        }
      });
    };

    if (taskState === 'playing') {
      subscribe();
    }

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [taskState, shakesRemaining]);

  const handleShake = () => {
    if (taskState !== 'playing') return;

    const newRemaining = shakesRemaining - 1;
    setShakesRemaining(newRemaining);
    
    // Reset timer on successful shake
    setTimeLeft(maxSeconds);

    if (newRemaining <= 0) {
      completeTask();
    }
  };

  const completeTask = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setTaskState('cleared');
    
    // CLEAR! Text animation
    Animated.spring(clearTextScale, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();

    // Start Confetti
    confettiAnims.forEach((anim, i) => {
      Animated.sequence([
        Animated.delay(i * 50),
        Animated.parallel([
          Animated.timing(anim.y, {
            toValue: height + 50,
            duration: 2000 + Math.random() * 1000,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(anim.rotation, {
            toValue: 360 * 3,
            duration: 2000 + Math.random() * 1000,
            useNativeDriver: true,
          })
        ])
      ]).start();
    });
  };

  useEffect(() => {
    if (taskState === 'failed') {
      const failTimer = setTimeout(() => {
        goBackToRinging();
      }, 1500);
      return () => clearTimeout(failTimer);
    }
  }, [taskState]);

  const handleFinish = () => {
    router.replace('/');
  };

  const renderConfetti = () => {
    if (taskState !== 'cleared') return null;
    return confettiAnims.map((anim, i) => (
      <Animated.View
        key={i}
        style={{
          position: 'absolute',
          width: 10,
          height: 10,
          backgroundColor: anim.color,
          top: 0,
          transform: [
            { translateX: anim.x },
            { translateY: anim.y },
            { rotate: anim.rotation.interpolate({
                inputRange: [0, 1080],
                outputRange: ['0deg', '1080deg']
              }) 
            },
            { scale: anim.scale }
          ],
          zIndex: 100,
        }}
      />
    ));
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" hidden={true} />
      <View style={styles.background} />
      
      {renderConfetti()}

      <SafeAreaView style={styles.content} edges={['top', 'bottom']}>
        {/* Progress Bar (At the top of the screen) */}
        <View style={styles.progressBarWrapper}>
          <View style={styles.progressBarTrack}>
            <Animated.View 
              style={[
                styles.progressBar, 
                { 
                  width: timerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%']
                  })
                }
              ]} 
            />
          </View>
        </View>

        {/* Top Header (Below Progress Bar) */}
        <View style={styles.header}>
          {taskState !== 'cleared' ? (
            <TouchableOpacity onPress={goBackToRinging} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color="#ffffff" />
            </TouchableOpacity>
          ) : (
            <View style={styles.backButtonPlaceholder} />
          )}
          <View style={styles.headerCenter} />
          <TouchableOpacity 
            style={styles.muteButton}
            onPress={() => setShowPreview(true)}
          >
            <Ionicons name="eye-outline" size={24} color="#3b82f6" />
          </TouchableOpacity>
        </View>

        {/* Task Area */}
        <View style={styles.taskArea}>
          {taskState === 'playing' && (
            <View style={styles.stateContainer}>
              <Text style={styles.titleText}>Lắc điện thoại</Text>
              <Text style={styles.countText}>{shakesRemaining}</Text>
            </View>
          )}

          {taskState === 'failed' && (
            <View style={styles.stateContainer}>
              <Text style={styles.failedText}>Hết thời gian!</Text>
              <Text style={styles.failedSubText}>Đang quay về báo thức...</Text>
            </View>
          )}

          {taskState === 'cleared' && (
            <View style={styles.stateContainer}>
              <Animated.Text style={[styles.clearText, { transform: [{ scale: clearTextScale }] }]}>
                CLEAR!
              </Animated.Text>

              <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
                <Ionicons name="close" size={20} color="#ffffff" style={{ marginRight: 8 }} />
                <Text style={styles.finishButtonText}>Dừng</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </SafeAreaView>

      {/* Preview Modal */}
      <Modal
        visible={showPreview}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPreview(false)}
      >
        <View style={styles.previewOverlay}>
          <View style={styles.previewContent}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewTitle}>Xem trước</Text>
              <TouchableOpacity onPress={() => setShowPreview(false)}>
                <Ionicons name="close" size={28} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <View style={styles.previewBody}>
              <Text style={styles.previewLabel}>Nhiệm vụ: Lắc điện thoại</Text>
              <Text style={styles.previewDescription}>
                Hãy lắc điện thoại mạnh mẽ {targetShakes} lần để hoàn thành.
              </Text>
              <Text style={styles.previewDescription}>
                Bạn có {maxSeconds} giây mỗi lần lắc
              </Text>
              
              <View style={styles.previewExample}>
                <Text style={styles.previewExampleTitle}>Hướng dẫn:</Text>
                <Text style={styles.previewExampleText}>
                  1. Lắc điện thoại mạnh mẽ để phát hiện được động tác
                </Text>
                <Text style={styles.previewExampleText}>
                  2. Mỗi lần lắc sẽ được ghi lại
                </Text>
                <Text style={styles.previewExampleText}>
                  3. Hoàn thành nếu bạn đạt {targetShakes} lần lắc
                </Text>
              </View>

              <TouchableOpacity
                style={styles.previewStartButton}
                onPress={() => setShowPreview(false)}
              >
                <Text style={styles.previewStartButtonText}>Bắt đầu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0f172a',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    padding: 5,
  },
  headerCenter: {
    flex: 1,
  },
  muteButton: {
    padding: 5,
    opacity: 0.6,
  },
  taskArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  titleText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 40,
  },
  countText: {
    fontSize: 120,
    fontWeight: '300',
    color: '#ffffff',
  },
  clearText: {
    fontSize: 84,
    fontWeight: '900',
    color: '#fecc00',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
  },
  finishButton: {
    marginTop: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  finishButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
  },
  failedText: {
    color: '#ff3b30',
    fontSize: 36,
    fontWeight: '800',
    marginBottom: 10,
  },
  failedSubText: {
    color: '#ffffff',
    fontSize: 16,
    opacity: 0.6,
  },
  progressBarWrapper: {
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 5,
    marginBottom: 10,
  },
  progressBarTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    width: '100%',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#3b82f6', 
  },
  backButtonPlaceholder: {
    width: 34, 
  },
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  previewContent: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 24,
    maxHeight: '80%',
    width: '100%',
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  previewBody: {
    marginBottom: 20,
  },
  previewLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b82f6',
    marginBottom: 8,
  },
  previewDescription: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 6,
    lineHeight: 20,
  },
  previewExample: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
  },
  previewExampleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  previewExampleText: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 6,
    lineHeight: 18,
  },
  previewStartButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  previewStartButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },});