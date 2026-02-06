import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

type TaskState = 'start' | 'playing' | 'cleared' | 'failed';

export default function TapTaskScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Task settings from params
  const alarmId = params.alarmId as string;
  const alarmLabel = params.alarmLabel as string || 'Báo thức';
  const targetTaps = parseInt(params.itemCount as string || '50');
  const maxSeconds = 10;

  // State
  const [taskState, setTaskState] = useState<TaskState>('start');
  const [tapCount, setTapCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(maxSeconds);
  const [showPreview, setShowPreview] = useState(false);
  
  // Animation refs
  const buttonScale = useRef(new Animated.Value(1)).current;
  const timerAnim = useRef(new Animated.Value(1)).current;
  const clearTextScale = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const confettiAnims = useRef(Array.from({ length: 20 }, () => ({
    x: new Animated.Value(Math.random() * width),
    y: new Animated.Value(-20),
    rotation: new Animated.Value(0),
    scale: new Animated.Value(Math.random() * 0.5 + 0.5),
    color: ['#ffeb3b', '#ff5722', '#e91e63', '#9c27b0', '#2196f3', '#4caf50'][Math.floor(Math.random() * 6)]
  }))).current;

  // Timer interval ref
  const timerIntervalRef = useRef<any>(null);

  // Auto-start timer
  useEffect(() => {
    if (taskState === 'start') {
      const autoStart = setTimeout(() => {
        startTask();
      }, 2000);
      return () => clearTimeout(autoStart);
    }
  }, [taskState]);

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

  const startTask = () => {
    if (taskState === 'playing' || taskState === 'cleared') return;
    setTaskState('playing');
    setTimeLeft(maxSeconds);
    setTapCount(0);
    timerAnim.setValue(1);
    
    // Start countdown
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
  };

  const handleTap = () => {
    if (taskState !== 'playing') return;

    const newCount = tapCount + 1;
    setTapCount(newCount);

    // Haptic-like feedback animation
    buttonScale.setValue(0.9);
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();

    if (newCount >= targetTaps) {
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
          <Text style={styles.headerTitle}>Thử thách nhấn</Text>
          <TouchableOpacity 
            style={styles.muteButton}
            onPress={() => setShowPreview(true)}
          >
            <Ionicons name="eye-outline" size={24} color="#3b82f6" />
          </TouchableOpacity>
        </View>

        {/* Task Area */}
        <View style={styles.taskArea}>
          {taskState === 'start' && (
            <View style={styles.stateContainer}>
              <Text style={styles.startText}>START</Text>
              <MaterialCommunityIcons name="gesture-tap" size={80} color="#fecc00" style={styles.handIcon} />
              <View style={styles.alarmBody}>
                <View style={styles.alarmBellLeft} />
                <View style={styles.alarmBellRight} />
                <TouchableOpacity style={styles.tapButtonStart} onPress={startTask}>
                  <Text style={styles.tapButtonText}>Tap!</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {taskState === 'playing' && (
            <View style={styles.stateContainer}>
              <View style={styles.timerDisplay}>
                <Text style={styles.secondsLeft}>{timeLeft.toFixed(1).replace('.', ',')}</Text>
                <Text style={styles.secondsLabel}>giây còn lại</Text>
              </View>
              
              <View style={styles.countContainer}>
                <Text style={styles.currentCount}>{targetTaps - tapCount > 0 ? targetTaps - tapCount : 0}</Text>
              </View>

              <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <View style={styles.alarmBody}>
                  <View style={styles.alarmBellLeft} />
                  <View style={styles.alarmBellRight} />
                  <TouchableOpacity style={styles.tapButtonStart} onPress={handleTap} activeOpacity={0.8}>
                    <Text style={styles.tapButtonText}>Tap!</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
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
              <View style={styles.timerDisplayCleared}>
                <Text style={styles.secondsLeft}>{timeLeft.toFixed(1).replace('.', ',')}</Text>
                <Text style={styles.secondsLabel}>giây còn lại</Text>
              </View>

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
              <Text style={styles.previewLabel}>Nhiệm vụ: Nhấn nút</Text>
              <Text style={styles.previewDescription}>
                Hãy nhấn vào nút càng nhiều càng tốt trong {maxSeconds} giây.
              </Text>
              <Text style={styles.previewDescription}>
                Mục tiêu: Nhấn tối thiểu {targetTaps} lần
              </Text>
              
              <View style={styles.previewExample}>
                <Text style={styles.previewExampleTitle}>Hướng dẫn:</Text>
                <Text style={styles.previewExampleText}>
                  1. Bạn sẽ có {maxSeconds} giây để nhấn nút
                </Text>
                <Text style={styles.previewExampleText}>
                  2. Mỗi lần nhấn sẽ được ghi lại
                </Text>
                <Text style={styles.previewExampleText}>
                  3. Hoàn thành nếu bạn đạt {targetTaps} lần nhấn
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
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    opacity: 0.8,
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
  startText: {
    fontSize: 72,
    fontWeight: '900',
    color: '#fecc00',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
    marginBottom: 20,
  },
  handIcon: {
    marginBottom: 40,
  },
  alarmBody: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#ff3b30',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  alarmBellLeft: {
    position: 'absolute',
    top: -10,
    left: -10,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e5e5e5',
    zIndex: -1,
  },
  alarmBellRight: {
    position: 'absolute',
    top: -10,
    right: -10,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e5e5e5',
    zIndex: -1,
  },
  tapButtonStart: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tapButtonText: {
    color: '#ffffff',
    fontSize: 40,
    fontWeight: '800',
  },
  timerDisplay: {
    position: 'absolute',
    top: -150,
    alignItems: 'center',
  },
  secondsLeft: {
    color: '#ffffff',
    fontSize: 48,
    fontWeight: '700',
  },
  secondsLabel: {
    color: '#ffffff',
    fontSize: 18,
    opacity: 0.9,
    fontWeight: '600',
  },
  countContainer: {
    marginBottom: 60,
  },
  currentCount: {
    color: '#ffffff',
    fontSize: 120,
    fontWeight: '800',
    textShadowColor: 'rgba(255, 59, 48, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
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
    position: 'absolute',
    bottom: -150,
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
    marginBottom: 30,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
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
    backgroundColor: '#fecc00', 
  },
  backButtonPlaceholder: {
    width: 34, 
  },
  failedSubText: {
    color: '#ffffff',
    fontSize: 16,
    opacity: 0.6,
    marginTop: 10,
  },
  timerDisplayCleared: {
    position: 'absolute',
    top: -150,
    alignItems: 'center',
    opacity: 0.5, 
  },
  tapButtonPlaceholder: {
    // Keep for potential reuse
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