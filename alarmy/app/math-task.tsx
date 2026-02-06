import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Modal,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { SoundManager } from '@/utils/sound-manager';
import { TaskOrchestrator } from '@/utils/task-orchestrator';

const { width } = Dimensions.get('window');

type MathProblem = {
  question: string;
  answer: number;
};

export default function MathTaskScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Task settings from params
  const alarmId = params.alarmId as string;
  const alarmLabel = params.alarmLabel as string || 'Báo thức';
  const difficulty = parseInt(params.difficulty as string || '2');
  const totalRounds = parseInt(params.rounds as string || '3');

  // State
  const [currentRound, setCurrentRound] = useState(1);
  const [problem, setProblem] = useState<MathProblem>({ question: '', answer: 0 });
  const [userInput, setUserInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(1);
  const [timerExpired, setTimerExpired] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState<'none' | 'correct' | 'incorrect'>('none');
  const [showPreview, setShowPreview] = useState(false);
  const [previewRounds, setPreviewRounds] = useState(2);

  // Animation refs
  const timerAnim = React.useRef(new Animated.Value(1)).current;
  const feedbackAnim = React.useRef(new Animated.Value(0)).current;

  // Question Generator
  const generateProblem = useCallback((diff: number): MathProblem => {
    const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

    switch (diff) {
      case 0: { // Rất dễ: 1 + 1
        const a = rand(1, 9);
        const b = rand(1, 9);
        return { question: `${a}+${b}=`, answer: a + b };
      }
      case 1: { // Dễ: 2 + 1
        const a = rand(10, 99);
        const b = rand(1, 9);
        return { question: `${a}+${b}=`, answer: a + b };
      }
      case 2: { // Trung bình: 2 + 2
        const a = rand(10, 99);
        const b = rand(10, 99);
        return { question: `${a}+${b}=`, answer: a + b };
      }
      case 3: { // Khó: 2 + 2 + 2
        const a = rand(10, 99);
        const b = rand(10, 99);
        const c = rand(10, 99);
        return { question: `${a}+${b}+${c}=`, answer: a + b + c };
      }
      case 4: { // Rất khó: (2 * 1) + 2
        const a = rand(10, 99);
        const b = rand(2, 9);
        const c = rand(10, 99);
        return { question: `(${a}x${b})+${c}=`, answer: (a * b) + c };
      }
      case 5: { // Siêu khó: (2 * 2) + 3
        const a = rand(10, 99);
        const b = rand(10, 99);
        const c = rand(100, 999);
        return { question: `(${a}x${b})+${c}=`, answer: (a * b) + c };
      }
      case 6: { // Cực kì khó: (3 * 2) + 4
        const a = rand(100, 999);
        const b = rand(10, 99);
        const c = rand(1000, 9999);
        return { question: `(${a}x${b})+${c}=`, answer: (a * b) + c };
      }
      default:
        return { question: '1+1=', answer: 2 };
    }
  }, []);

  // Initialize first problem
  useEffect(() => {
    setProblem(generateProblem(difficulty));
    startTimer();
  }, []);

  const startTimer = () => {
    timerAnim.setValue(1);
    Animated.timing(timerAnim, {
      toValue: 0,
      duration: 30000, // 30 seconds per question
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        setTimerExpired(true);
      }
    });
  };

  useEffect(() => {
    if (timerExpired) {
      goBackToRinging();
    }
  }, [timerExpired]);

  const goBackToRinging = () => {
    router.replace({
      pathname: '/alarm-ringing',
      params: { alarmId, label: alarmLabel }
    });
  };

  const handleKeyPress = (key: string) => {
    if (feedbackStatus !== 'none') return; // Prevent input during feedback

    if (key === 'delete') {
      setUserInput(prev => prev.slice(0, -1));
    } else if (key === 'check') {
      validateAnswer();
    } else {
      if (userInput.length < 10) {
        setUserInput(prev => prev + key);
      }
    }
  };

  const validateAnswer = () => {
    if (userInput === '') return;

    if (parseInt(userInput) === problem.answer) {
      setFeedbackStatus('correct');
      // Haptic feedback for success
      SoundManager.playHaptic('success').catch(() => {});
      
      setTimeout(() => {
        if (currentRound >= totalRounds) {
          // All rounds completed - mark task as done
          SoundManager.playHaptic('success').catch(() => {});
          TaskOrchestrator.markTaskComplete('math_task');
          router.replace({
            pathname: '/alarm-ringing',
            params: { alarmId, label: alarmLabel }
          });
        } else {
          setCurrentRound(prev => prev + 1);
          setProblem(generateProblem(difficulty));
          setUserInput('');
          setFeedbackStatus('none');
          startTimer();
        }
      }, 600);
    } else {
      setFeedbackStatus('incorrect');
      // Haptic feedback for error
      SoundManager.playHaptic('error').catch(() => {});
      
      // Shake animation
      feedbackAnim.setValue(0);
      Animated.sequence([
        Animated.timing(feedbackAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(feedbackAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(feedbackAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(feedbackAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();

      setTimeout(() => {
        setUserInput('');
        setFeedbackStatus('none');
      }, 1000);
    }
  };

  const renderKey = (val: string, icon?: string, isAction?: boolean) => (
    <TouchableOpacity 
      style={[styles.key, isAction && styles.actionKey]} 
      onPress={() => handleKeyPress(val)}
    >
      {icon ? (
        <Ionicons name={icon as any} size={24} color="#ffffff" />
      ) : (
        <Text style={styles.keyText}>{val}</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" hidden={true} />
      
      {/* Background */}
      <View style={styles.background} />

      <SafeAreaView style={styles.content}>
        {/* Top Progress Bar */}
        <View style={styles.timerContainer}>
          <Animated.View 
            style={[
              styles.timerBar, 
              { 
                width: timerAnim.interpolate({
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
          <Text style={styles.progressText}>{currentRound} / {totalRounds}</Text>
          <TouchableOpacity 
            style={styles.previewButton}
            onPress={() => setShowPreview(true)}
          >
            <Ionicons name="eye-outline" size={24} color="#3b82f6" />
          </TouchableOpacity>
        </View>

        {/* Problem Display */}
        <View style={styles.problemContainer}>
          <Text style={styles.problemText}>{problem.question}</Text>
          <Animated.View style={[
            styles.inputContainer,
            feedbackStatus === 'correct' && styles.inputContainerCorrect,
            feedbackStatus === 'incorrect' && styles.inputContainerIncorrect,
            { transform: [{ translateX: feedbackAnim }] }
          ]}>
            {feedbackStatus === 'correct' && (
              <View style={styles.feedbackIconLeft}>
                <Ionicons name="ellipse-outline" size={32} color="#ffffff" />
              </View>
            )}
            {feedbackStatus === 'incorrect' && (
              <View style={styles.feedbackIconLeft}>
                <Ionicons name="close" size={40} color="#6366f1" />
              </View>
            )}
            <Text style={styles.inputText}>{userInput}</Text>
            {userInput === '' && feedbackStatus === 'none' && <View style={styles.cursor} />}
          </Animated.View>
        </View>

        {/* Keyboard */}
        <View style={styles.keyboard}>
          <View style={styles.keyRow}>
            {renderKey('7')}
            {renderKey('8')}
            {renderKey('9')}
          </View>
          <View style={styles.keyRow}>
            {renderKey('4')}
            {renderKey('5')}
            {renderKey('6')}
          </View>
          <View style={styles.keyRow}>
            {renderKey('1')}
            {renderKey('2')}
            {renderKey('3')}
          </View>
          <View style={styles.keyRow}>
            {renderKey('delete', 'backspace-outline')}
            {renderKey('0')}
            {renderKey('check', 'checkmark', true)}
          </View>
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
              <Text style={styles.previewLabel}>Nhiệm vụ: Giải toán</Text>
              <Text style={styles.previewDescription}>
                Hoàn thành {totalRounds} bài toán để dừng báo thức.
              </Text>
              <Text style={styles.previewDescription}>
                Độ khó: {['Rất dễ', 'Dễ', 'Trung bình', 'Khó', 'Rất khó', 'Siêu khó', 'Cực kỳ khó'][difficulty]}
              </Text>
              
              <View style={styles.previewExample}>
                <Text style={styles.previewExampleTitle}>Ví dụ:</Text>
                {[...Array(Math.min(previewRounds, 2))].map((_, i) => {
                  const exampleProblem = generateProblem(difficulty);
                  return (
                    <View key={i} style={styles.previewExampleItem}>
                      <Text style={styles.previewExampleText}>
                        {exampleProblem.question} <Text style={styles.previewAnswer}>{exampleProblem.answer}</Text>
                      </Text>
                    </View>
                  );
                })}
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
  timerContainer: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    width: '100%',
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
  },
  backButton: {
    padding: 5,
  },
  progressText: {
    color: '#94a3b8',
    fontSize: 18,
    fontWeight: '600',
  },
  muteButton: {
    padding: 5,
    opacity: 0.6,
  },
  problemContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
  problemText: {
    color: '#ffffff',
    fontSize: 48,
    fontWeight: '700',
    marginBottom: 20,
  },
  inputContainer: {
    width: '80%',
    height: 100,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
  },
  inputContainerCorrect: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  inputContainerIncorrect: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
  },
  feedbackIconLeft: {
    position: 'absolute',
    left: 20,
    width: 40,
    alignItems: 'center',
  },
  inputText: {
    color: '#ffffff',
    fontSize: 48,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  cursor: {
    width: 2,
    height: 40,
    backgroundColor: '#ffffff',
    marginLeft: 5,
  },
  keyboard: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  keyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  key: {
    flex: 1,
    height: 70,
    backgroundColor: '#1e293b',
    marginHorizontal: 5,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyText: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '600',
  },
  actionKey: {
    backgroundColor: '#ef4444',
  },
  previewButton: {
    padding: 8,
  },

  // Preview Modal Styles
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewContent: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    width: '85%',
    maxHeight: '70%',
    overflow: 'hidden',
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  previewBody: {
    padding: 16,
  },
  previewLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b82f6',
    marginBottom: 8,
  },
  previewDescription: {
    fontSize: 14,
    color: '#cbd5e1',
    marginBottom: 6,
    lineHeight: 20,
  },
  previewExample: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 12,
    marginVertical: 12,
  },
  previewExampleTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 8,
  },
  previewExampleItem: {
    marginBottom: 8,
  },
  previewExampleText: {
    fontSize: 16,
    color: '#cbd5e1',
    fontFamily: 'monospace',
  },
  previewAnswer: {
    color: '#22c55e',
    fontWeight: '600',
  },
  previewStartButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  previewStartButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
