import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
  TextInput,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

type TaskState = 'playing' | 'cleared' | 'failed';

// Sample phrases for typing
const SAMPLE_PHRASES = [
  "Tôi sẽ thức dậy ngay bây giờ",
  "Hôm nay là một ngày tuyệt vời",
  "Đừng ngủ nướng nữa",
  "Dậy đi làm thôi nào",
  "Một ngày mới bắt đầu",
  "Tôi đã sẵn sàng cho ngày mới",
  "Thức dậy và toả sáng",
  "Năng lượng tích cực cho ngày mới",
  "Không có gì là không thể",
  "Hãy cố gắng hết mình",
  "Dậy sớm và thành công",
  "Một ngày mới tốt lành",
];

export default function TypingTaskScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Task settings from params
  const alarmId = params.alarmId as string;
  const alarmLabel = params.alarmLabel as string || 'Báo thức';
  const totalRounds = parseInt(params.itemCount as string || '3');
  const maxSeconds = 30; // 30 seconds per phrase

  // State
  const [taskState, setTaskState] = useState<TaskState>('playing');
  const [currentRound, setCurrentRound] = useState(1);
  const [targetPhrase, setTargetPhrase] = useState('');
  const [userInput, setUserInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(maxSeconds);
  
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
  const inputRef = useRef<TextInput>(null);

  // Generate random phrase
  const getRandomPhrase = () => {
    const randomIndex = Math.floor(Math.random() * SAMPLE_PHRASES.length);
    return SAMPLE_PHRASES[randomIndex];
  };

  // Initialize round
  const initializeRound = () => {
    setTargetPhrase(getRandomPhrase());
    setUserInput('');
    setTimeLeft(maxSeconds);
  };

  // Start first round
  useEffect(() => {
    initializeRound();
    // Focus input after a short delay
    setTimeout(() => {
      inputRef.current?.focus();
    }, 500);
  }, []);

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
    Keyboard.dismiss();
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
  }, [taskState, currentRound]);

  // Check if input matches target
  useEffect(() => {
    if (taskState !== 'playing') return;
    
    // Normalize both strings for comparison (trim, lowercase)
    const normalizedInput = userInput.trim().toLowerCase();
    const normalizedTarget = targetPhrase.trim().toLowerCase();
    
    if (normalizedInput === normalizedTarget && normalizedInput.length > 0) {
      // Correct! Move to next round or complete
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      
      if (currentRound >= totalRounds) {
        completeTask();
      } else {
        // Next round
        setCurrentRound(prev => prev + 1);
        initializeRound();
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      }
    }
  }, [userInput, targetPhrase, taskState, currentRound, totalRounds]);

  const completeTask = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    Keyboard.dismiss();
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
      Keyboard.dismiss();
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

  // Render character comparison
  const renderTargetPhrase = () => {
    return targetPhrase.split('').map((char, index) => {
      let color = '#ffffff';
      if (index < userInput.length) {
        // Check if this character matches
        if (userInput[index].toLowerCase() === char.toLowerCase()) {
          color = '#4caf50'; // Green for correct
        } else {
          color = '#ff5722'; // Red for incorrect
        }
      }
      return (
        <Text key={index} style={[styles.targetChar, { color }]}>
          {char}
        </Text>
      );
    });
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
          <Text style={styles.roundText}>{currentRound} / {totalRounds}</Text>
          <TouchableOpacity style={styles.muteButton}>
            <Ionicons name="volume-mute-outline" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Task Area */}
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.taskArea}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.stateContainer}>
              {taskState === 'playing' && (
                <>
                  <Text style={styles.titleText}>Gõ văn bản</Text>
                  
                  {/* Target phrase with character highlighting */}
                  <View style={styles.targetPhraseContainer}>
                    <Text style={styles.targetPhraseWrapper}>
                      {renderTargetPhrase()}
                    </Text>
                  </View>
                  
                  {/* Input field */}
                  <TextInput
                    ref={inputRef}
                    style={styles.textInput}
                    value={userInput}
                    onChangeText={setUserInput}
                    placeholder="Gõ văn bản ở trên..."
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoFocus={true}
                  />
                  
                  <Text style={styles.instructionText}>
                    Gõ chính xác văn bản hiển thị ở trên
                  </Text>
                </>
              )}

              {taskState === 'failed' && (
                <>
                  <Text style={styles.failedText}>Hết thời gian!</Text>
                  <Text style={styles.failedSubText}>Đang quay về báo thức...</Text>
                </>
              )}

              {taskState === 'cleared' && (
                <>
                  <Animated.Text style={[styles.clearText, { transform: [{ scale: clearTextScale }] }]}>
                    CLEAR!
                  </Animated.Text>

                  <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
                    <Ionicons name="close" size={20} color="#ffffff" style={{ marginRight: 8 }} />
                    <Text style={styles.finishButtonText}>Dừng</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
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
  roundText: {
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
    paddingHorizontal: 20,
  },
  stateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 60,
    width: '100%',
  },
  titleText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 30,
  },
  targetPhraseContainer: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    minHeight: 80,
    justifyContent: 'center',
    marginBottom: 20,
  },
  targetPhraseWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  targetChar: {
    fontSize: 20,
    fontWeight: '500',
  },
  textInput: {
    width: '100%',
    backgroundColor: '#334155',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 20,
  },
  instructionText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 40,
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
});
