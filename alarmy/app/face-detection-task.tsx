import React, { useState, useRef, useEffect } from 'react';
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
import { CameraView, useCameraPermissions } from 'expo-camera';

const { width, height } = Dimensions.get('window');

type TaskState = 'loading' | 'ready' | 'detecting' | 'cleared' | 'failed';

export default function FaceDetectionTaskScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [permission, requestPermission] = useCameraPermissions();
  
  // Task settings from params
  const alarmId = params.alarmId as string;
  const alarmLabel = params.alarmLabel as string || 'Báo thức';
  
  // State
  const [taskState, setTaskState] = useState<TaskState>('loading');
  const [detectionCount, setDetectionCount] = useState(0);
  const [detectedFaces, setDetectedFaces] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [showPreview, setShowPreview] = useState(false);
  const targetDetections = 3;
  
  // Animation refs
  const timerAnim = useRef(new Animated.Value(1)).current;
  const successAnim = useRef(new Animated.Value(0)).current;
  const cameraOpacity = useRef(new Animated.Value(1)).current;
  const confettiAnims = useRef(Array.from({ length: 20 }, () => ({
    x: new Animated.Value(Math.random() * width),
    y: new Animated.Value(-20),
    rotation: new Animated.Value(0),
    scale: new Animated.Value(Math.random() * 0.5 + 0.5),
    color: ['#ffeb3b', '#ff5722', '#e91e63', '#9c27b0', '#2196f3', '#4caf50'][Math.floor(Math.random() * 6)]
  }))).current;

  // Timer interval ref
  const timerIntervalRef = useRef<any>(null);

  // Request camera permission
  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  // Initialize task
  useEffect(() => {
    if (permission?.granted) {
      setTaskState('ready');
    }
  }, [permission?.granted]);

  // Sync animation with timeLeft
  useEffect(() => {
    if (taskState === 'detecting') {
      Animated.timing(timerAnim, {
        toValue: timeLeft / 30,
        duration: 100,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start();
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
    if (taskState !== 'ready') return;
    
    setTaskState('detecting');
    setTimeLeft(30);
    setDetectionCount(0);
    setDetectedFaces(0);
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

  // Simulate face detection (in real app, would integrate ML Kit)
  const handleSimulateDetection = () => {
    if (taskState !== 'detecting') return;

    setDetectedFaces(prev => prev + 1);
    setDetectionCount(prev => prev + 1);

    if (detectionCount + 1 >= targetDetections) {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      setTaskState('cleared');

      // Play success animation
      Animated.sequence([
        Animated.timing(successAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: false,
        }),
      ]).start();

      // Play confetti animation
      confettiAnims.forEach((anim) => {
        Animated.timing(anim.y, {
          toValue: height,
          duration: 2000,
          useNativeDriver: false,
        }).start();
      });

      setTimeout(() => {
        router.replace('/');
      }, 1500);
    }
  };

  if (!permission?.granted) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.content}>
          <Text style={styles.title}>Cần quyền camera</Text>
          <Text style={styles.description}>
            Vui lòng cấp quyền truy cập camera để sử dụng tính năng này
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Cấp quyền</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.skipButton} onPress={goBackToRinging}>
            <Text style={styles.skipButtonText}>Bỏ qua</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" hidden={true} />
      
      {/* Background */}
      <View style={styles.background} />

      {taskState === 'ready' || taskState === 'detecting' ? (
        <>
          {/* Camera Preview */}
          <Animated.View style={[styles.cameraContainer, { opacity: cameraOpacity }]}>
            <CameraView style={styles.camera} facing="front">
              {/* Face Detection Overlay */}
              <View style={styles.faceDetectionOverlay}>
                <View style={styles.detectionFrame} />
              </View>
            </CameraView>
          </Animated.View>

          <SafeAreaView style={styles.content}>
            {/* Top Progress Bar */}
            <View style={styles.timerContainer}>
              <Animated.View 
                style={[
                  styles.timerBar, 
                  { 
                    width:  timerAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%']
                    })
                  }
                ]} 
              />
            </View>

            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={goBackToRinging} style={styles.backButton}>
                <Ionicons name="chevron-back" size={24} color="#ffffff" />
              </TouchableOpacity>
              <Text style={styles.taskTitle}>Phát hiện gương mặt</Text>
              <TouchableOpacity 
                style={styles.previewButton}
                onPress={() => setShowPreview(true)}
              >
                <Ionicons name="eye-outline" size={24} color="#3b82f6" />
              </TouchableOpacity>
            </View>

            {/* Content */}
            {taskState === 'ready' ? (
              <View style={styles.centerContainer}>
                <Ionicons name="camera" size={60} color="rgba(255,255,255,0.3)" />
                <Text style={styles.instructionTitle}>Hãy nhìn vào camera</Text>
                <Text style={styles.instructionText}>
                  Ứng dụng sẽ phát hiện khuôn mặt của bạn
                </Text>
                <TouchableOpacity style={styles.startButton} onPress={startTask}>
                  <Text style={styles.startButtonText}>Bắt đầu</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.detectionContainer}>
                <View style={styles.detectionStats}>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Đã phát hiện</Text>
                    <Text style={styles.statValue}>{detectedFaces}</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Cần</Text>
                    <Text style={styles.statValue}>{targetDetections}</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Thời gian</Text>
                    <Text style={styles.statValue}>{Math.ceil(timeLeft)}s</Text>
                  </View>
                </View>

                {/* Progress Ring */}
                <View style={styles.progressRing}>
                  <Text style={styles.progressText}>
                    {Math.round((detectedFaces / targetDetections) * 100)}%
                  </Text>
                </View>

                {/* Detection Guide */}
                <Text style={styles.guideText}>
                  Nhấn nút dưới khi phát hiện khuôn mặt
                </Text>

                {/* Simulate Detection Button (for demo) */}
                <TouchableOpacity 
                  style={styles.detectButton}
                  onPress={handleSimulateDetection}
                >
                  <Ionicons name="camera-outline" size={28} color="#ffffff" />
                  <Text style={styles.detectButtonText}>Phát hiện</Text>
                </TouchableOpacity>
              </View>
            )}
          </SafeAreaView>
        </>
      ) : taskState === 'cleared' ? (
        <SafeAreaView style={styles.content}>
          <View style={styles.successContainer}>
            <Animated.View 
              style={[
                styles.successCircle,
                {
                  transform: [
                    {
                      scale: successAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.5, 1.2],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Ionicons name="checkmark" size={60} color="#22c55e" />
            </Animated.View>
            <Text style={styles.successText}>Hoàn thành!</Text>
            <Text style={styles.successSubtext}>
              Bạn đã phát hiện thành công {targetDetections} gương mặt
            </Text>
          </View>

          {/* Confetti */}
          {confettiAnims.map((anim, index) => (
            <Animated.View
              key={index}
              style={[
                styles.confetti,
                {
                  left: anim.x,
                  top: anim.y,
                  backgroundColor: anim.color,
                  transform: [
                    { scale: anim.scale },
                    { rotate: anim.rotation },
                  ],
                },
              ]}
            />
          ))}
        </SafeAreaView>
      ) : (
        <SafeAreaView style={styles.content}>
          <View style={styles.failureContainer}>
            <Ionicons name="close-circle-outline" size={60} color="#ef4444" />
            <Text style={styles.failureText}>Thất bại</Text>
            <Text style={styles.failureSubtext}>
              Hết thời gian. Vui lòng thử lại.
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={startTask}>
              <Text style={styles.retryButtonText}>Thử lại</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.backToRingingButton} onPress={goBackToRinging}>
              <Text style={styles.backToRingingButtonText}>Quay lại</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      )}

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
            <Text style={styles.previewLabel}>Nhiệm vụ: Phát hiện gương mặt</Text>
            <Text style={styles.previewDescription}>
              Cho phép ứng dụng truy cập camera để phát hiện khuôn mặt.
            </Text>
            <Text style={styles.previewDescription}>
              Mục tiêu: Phát hiện {targetDetections} lần
            </Text>
            
            <View style={styles.previewExample}>
              <Text style={styles.previewExampleTitle}>Hướng dẫn:</Text>
              <Text style={styles.previewExampleText}>
                1. Cho phép quyền truy cập camera
              </Text>
              <Text style={styles.previewExampleText}>
                2. Nhìn vào camera để được phát hiện
              </Text>
              <Text style={styles.previewExampleText}>
                3. Hoàn thành nếu phát hiện được {targetDetections} mặt
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
  title: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  permissionButton: {
    backgroundColor: '#ef4444',
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 40,
    marginBottom: 12,
  },
  permissionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  skipButton: {
    borderWidth: 2,
    borderColor: '#64748b',
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 40,
  },
  skipButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  cameraContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  camera: {
    flex: 1,
  },
  faceDetectionOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detectionFrame: {
    width: 200,
    height: 200,
    borderWidth: 3,
    borderColor: '#3b82f6',
    borderRadius: 100,
    opacity: 0.7,
  },
  timerContainer: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    width: '100%',
    zIndex: 10,
  },
  timerBar: {
    height: '100%',
    backgroundColor: '#3b82f6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    zIndex: 10,
  },
  backButton: {
    padding: 5,
  },
  taskTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 30,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    zIndex: 5,
  },
  instructionTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 20,
    textAlign: 'center',
  },
  instructionText: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 20,
  },
  startButton: {
    backgroundColor: '#ef4444',
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 40,
    marginTop: 30,
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  detectionContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 30,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    zIndex: 5,
  },
  detectionStats: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 6,
  },
  statValue: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
  },
  progressRing: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 6,
    borderColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: 30,
  },
  progressText: {
    color: '#3b82f6',
    fontSize: 36,
    fontWeight: '700',
  },
  guideText: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  detectButton: {
    backgroundColor: '#ef4444',
    borderRadius: 100,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'column',
  },
  detectButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successText: {
    color: '#22c55e',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 10,
  },
  successSubtext: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
  },
  failureContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  failureText: {
    color: '#ef4444',
    fontSize: 32,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 10,
  },
  failureSubtext: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 30,
  },
  retryButton: {
    backgroundColor: '#ef4444',
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 40,
    marginBottom: 12,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  backToRingingButton: {
    borderWidth: 2,
    borderColor: '#64748b',
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 40,
  },
  backToRingingButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  confetti: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  previewButton: {
    padding: 8,
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