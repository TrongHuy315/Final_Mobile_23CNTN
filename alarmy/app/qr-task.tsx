import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { CameraView, useCameraPermissions } from 'expo-camera';

const { width, height } = Dimensions.get('window');

type TaskState = 'playing' | 'cleared' | 'failed';

export default function QRTaskScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Task settings from params
  const alarmId = params.alarmId as string;
  const alarmLabel = params.alarmLabel as string || 'Báo thức';
  const targetCode = params.code as string || '';
  const taskName = params.taskName as string || 'Mã QR';

  // State
  const [taskState, setTaskState] = useState<TaskState>('playing');
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  
  // Animation refs
  const clearTextScale = useRef(new Animated.Value(0)).current;
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const confettiAnims = useRef(Array.from({ length: 20 }, () => ({
    x: new Animated.Value(Math.random() * width),
    y: new Animated.Value(-20),
    rotation: new Animated.Value(0),
    scale: new Animated.Value(Math.random() * 0.5 + 0.5),
    color: ['#ffeb3b', '#ff5722', '#e91e63', '#9c27b0', '#2196f3', '#4caf50'][Math.floor(Math.random() * 6)]
  }))).current;

  // Scan line animation
  useEffect(() => {
    if (taskState === 'playing') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 1500,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [taskState]);

  const goBackToRinging = () => {
    router.replace({
      pathname: '/alarm-ringing',
      params: { alarmId, label: alarmLabel }
    });
  };

  // Request permission on mount
  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, []);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scanned || taskState !== 'playing') return;
    
    console.log('Scanned code:', data, 'Target:', targetCode);
    
    // Check if the scanned code matches the target
    if (data === targetCode) {
      setScanned(true);
      completeTask();
    } else {
      // Wrong code - show feedback and allow retry
      setScanned(true);
      setTimeout(() => setScanned(false), 2000);
    }
  };

  const completeTask = () => {
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

  // Scan area dimensions
  const scanAreaSize = width * 0.7;

  if (!permission) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" hidden={true} />
        <View style={styles.background} />
        <SafeAreaView style={styles.content}>
          <Text style={styles.permissionText}>Đang yêu cầu quyền camera...</Text>
        </SafeAreaView>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" hidden={true} />
        <View style={styles.background} />
        <SafeAreaView style={styles.content}>
          <View style={styles.permissionContainer}>
            <MaterialCommunityIcons name="camera-off" size={80} color="#ffffff" />
            <Text style={styles.permissionText}>Cần quyền truy cập Camera</Text>
            <Text style={styles.permissionSubText}>
              Vui lòng cấp quyền camera để quét mã QR
            </Text>
            <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
              <Text style={styles.permissionButtonText}>Cấp quyền</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.backToAlarmButton} onPress={goBackToRinging}>
              <Text style={styles.backToAlarmText}>Quay lại báo thức</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" hidden={true} />
      <View style={styles.background} />
      
      {renderConfetti()}

      <SafeAreaView style={styles.content} edges={['top', 'bottom']}>
        {/* Top Header */}
        <View style={styles.header}>
          {taskState !== 'cleared' ? (
            <TouchableOpacity onPress={goBackToRinging} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color="#ffffff" />
            </TouchableOpacity>
          ) : (
            <View style={styles.backButtonPlaceholder} />
          )}
          <Text style={styles.headerTitle}>{taskName}</Text>
          <TouchableOpacity style={styles.muteButton}>
            <Ionicons name="volume-mute-outline" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Task Area */}
        <View style={styles.taskArea}>
          {taskState === 'playing' && (
            <View style={styles.stateContainer}>
              <Text style={styles.titleText}>Quét mã QR</Text>
              
              {/* Camera View */}
              <View style={[styles.cameraContainer, { width: scanAreaSize, height: scanAreaSize }]}>
                <CameraView
                  style={StyleSheet.absoluteFillObject}
                  facing="back"
                  onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                  barcodeScannerSettings={{
                    barcodeTypes: ['qr', 'ean13', 'ean8', 'code128', 'code39', 'code93', 'upc_a', 'upc_e'],
                  }}
                />
                
                {/* Scan frame corners */}
                <View style={[styles.corner, styles.cornerTL]} />
                <View style={[styles.corner, styles.cornerTR]} />
                <View style={[styles.corner, styles.cornerBL]} />
                <View style={[styles.corner, styles.cornerBR]} />
                
                {/* Scan line animation */}
                <Animated.View 
                  style={[
                    styles.scanLine,
                    {
                      transform: [{
                        translateY: scanLineAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, scanAreaSize - 4]
                        })
                      }]
                    }
                  ]} 
                />
              </View>
              
              <Text style={styles.instructionText}>
                Hướng camera vào mã QR đã đăng ký
              </Text>
              
              {scanned && taskState === 'playing' && (
                <Text style={styles.wrongCodeText}>Sai mã! Thử lại...</Text>
              )}
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
  backButtonPlaceholder: {
    width: 34,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  muteButton: {
    padding: 5,
    opacity: 0.6,
  },
  taskArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
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
  cameraContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#3b82f6',
    borderWidth: 4,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 16,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 16,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 16,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 16,
  },
  scanLine: {
    position: 'absolute',
    left: 10,
    right: 10,
    height: 2,
    backgroundColor: '#3b82f6',
  },
  instructionText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 30,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  wrongCodeText: {
    fontSize: 16,
    color: '#ff5722',
    marginTop: 20,
    fontWeight: '600',
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
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  permissionText: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: '600',
    marginTop: 20,
    textAlign: 'center',
  },
  permissionSubText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 10,
    textAlign: 'center',
  },
  permissionButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 30,
  },
  permissionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  backToAlarmButton: {
    marginTop: 20,
  },
  backToAlarmText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
  },
});
