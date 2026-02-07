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
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

type TaskState = 'memorize' | 'playing' | 'correct' | 'incorrect' | 'cleared' | 'failed';

// Grid sizes based on difficulty (3x3 to 6x6)
const getGridSize = (difficulty: number): number => {
  return Math.min(6, Math.max(3, difficulty + 2)); // difficulty 1 = 3x3, difficulty 4 = 6x6
};

// Number of cells to highlight based on difficulty
const getHighlightCount = (difficulty: number, gridSize: number): number => {
  const minCells = Math.floor(gridSize * gridSize * 0.2); // 20% of cells
  const maxCells = Math.floor(gridSize * gridSize * 0.4); // 40% of cells
  return Math.min(maxCells, Math.max(minCells, difficulty + 2));
};

export default function ColorGridTaskScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Task settings from params
  const alarmId = params.alarmId as string;
  const alarmLabel = params.alarmLabel as string || 'Báo thức';
  const difficulty = parseInt(params.difficulty as string || '2');
  const totalRounds = parseInt(params.rounds as string || '3');
  
  const gridSize = getGridSize(difficulty);
  const highlightCount = getHighlightCount(difficulty, gridSize);
  const memorizeTime = 3; // 3 seconds to memorize
  const maxPlayingTime = 5; // 5 seconds for playing phase, resets on correct cell

  // State
  const [taskState, setTaskState] = useState<TaskState>('memorize');
  const [currentRound, setCurrentRound] = useState(1);
  const [highlightedCells, setHighlightedCells] = useState<number[]>([]);
  const [selectedCells, setSelectedCells] = useState<number[]>([]);
  const [memorizeCountdown, setMemorizeCountdown] = useState(memorizeTime);
  const [timeLeft, setTimeLeft] = useState(maxPlayingTime);
  
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

  // Sync animation with timeLeft
  useEffect(() => {
    if (taskState === 'playing') {
      Animated.timing(timerAnim, {
        toValue: timeLeft / maxPlayingTime,
        duration: 100,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start();
    } else {
      timerAnim.setValue(1);
    }
  }, [timeLeft, taskState]);

  // Timer refs
  const timerIntervalRef = useRef<any>(null);

  // Generate random highlighted cells
  const generateHighlightedCells = () => {
    const totalCells = gridSize * gridSize;
    const cells: number[] = [];
    while (cells.length < highlightCount) {
      const randomCell = Math.floor(Math.random() * totalCells);
      if (!cells.includes(randomCell)) {
        cells.push(randomCell);
      }
    }
    return cells;
  };

  // Initialize round
  const initializeRound = () => {
    const newHighlightedCells = generateHighlightedCells();
    setHighlightedCells(newHighlightedCells);
    setSelectedCells([]);
    setMemorizeCountdown(memorizeTime);
    setTaskState('memorize');
  };

  // Start memorize phase
  useEffect(() => {
    initializeRound();
  }, [currentRound]);

  // Memorize and Playing countdown
  useEffect(() => {
    if (taskState === 'memorize') {
      timerIntervalRef.current = setInterval(() => {
        setMemorizeCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            setTimeLeft(maxPlayingTime);
            setTaskState('playing');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (taskState === 'playing') {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 0.1) {
            clearInterval(timerIntervalRef.current);
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

  const goBackToRinging = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    router.replace({
      pathname: '/alarm-ringing',
      params: { alarmId, label: alarmLabel }
    });
  };

  // Handle cell tap
  const handleCellTap = (cellIndex: number) => {
    if (taskState !== 'playing') return;
    if (selectedCells.includes(cellIndex)) return;
    
    const newSelectedCells = [...selectedCells, cellIndex];
    setSelectedCells(newSelectedCells);
    
    // Check if this cell is correct
    if (!highlightedCells.includes(cellIndex)) {
      // Wrong cell tapped
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      setTaskState('incorrect');
      setTimeout(() => {
        // Reset round
        initializeRound();
      }, 1500);
      return;
    }
    
    // Correct cell selection - reset timer
    setTimeLeft(maxPlayingTime);
    
    // Check if all cells found
    if (newSelectedCells.length === highlightedCells.length) {
      // All correct!
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      setTaskState('correct');
      setTimeout(() => {
        if (currentRound >= totalRounds) {
          // Task completed!
          completeTask();
        } else {
          // Next round
          setCurrentRound(prev => prev + 1);
        }
      }, 1000);
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
            toValue: 600,
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

  // Calculate cell size based on grid
  const gridPadding = 20;
  const gridContainerPadding = 12;
  const gridGap = 6;
  const maxGridWidth = Math.min(width - gridPadding * 2, 350); // Limit max grid width
  const availableWidth = maxGridWidth - gridContainerPadding * 2;
  const cellSize = (availableWidth - (gridSize - 1) * gridGap) / gridSize;

  // Get cell style based on state
  const getCellStyle = (cellIndex: number) => {
    const isHighlighted = highlightedCells.includes(cellIndex);
    const isSelected = selectedCells.includes(cellIndex);
    
    if (taskState === 'memorize') {
      // Show highlighted cells during memorize phase
      return isHighlighted ? styles.cellHighlighted : styles.cellDefault;
    }
    
    if (taskState === 'incorrect') {
      // Show all highlighted cells in orange, wrong selection in bright orange
      if (isHighlighted) return styles.cellCorrectReveal;
      if (isSelected && !isHighlighted) return styles.cellWrong;
      return styles.cellDefault;
    }
    
    if (taskState === 'correct' || taskState === 'playing') {
      // Show selected cells
      if (isSelected) return styles.cellSelected;
      return styles.cellDefault;
    }
    
    return styles.cellDefault;
  };

  // Get status text
  const getStatusText = () => {
    if (taskState === 'memorize') {
      return `Hãy ghi nhớ! ${memorizeCountdown}`;
    }
    if (taskState === 'playing') {
      const remainingCount = highlightCount - selectedCells.length;
      return `Phát hiện ${remainingCount} ô màu`;
    }
    if (taskState === 'correct') {
      return 'Chính xác!';
    }
    if (taskState === 'incorrect') {
      return 'Không chính xác';
    }
    return '';
  };

  // Get status text color
  const getStatusTextColor = () => {
    if (taskState === 'correct') return '#4caf50';
    if (taskState === 'incorrect') return '#ff5722';
    return '#ffffff';
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

        {/* Header */}
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
        <View style={styles.taskArea}>
          {taskState === 'failed' ? (
            <View style={styles.stateContainer}>
              <Text style={styles.failedText}>Hết thời gian!</Text>
              <Text style={styles.failedSubText}>Đang quay về báo thức...</Text>
            </View>
          ) : taskState !== 'cleared' ? (
            <>
              {/* Status Text */}
              <Text style={[styles.statusText, { color: getStatusTextColor() }]}>
                {getStatusText()}
              </Text>

              {/* Grid */}
              <View style={[styles.gridContainer, { 
                width: maxGridWidth,
                backgroundColor: taskState === 'incorrect' ? '#c24e2b' : '#1e293b'
              }]}>
                <View style={styles.grid}>
                  {Array.from({ length: gridSize * gridSize }).map((_, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.cell,
                        getCellStyle(index),
                        { 
                          width: cellSize, 
                          height: cellSize,
                          marginRight: (index + 1) % gridSize === 0 ? 0 : gridGap,
                          marginBottom: index < gridSize * (gridSize - 1) ? gridGap : 0,
                        }
                      ]}
                      onPress={() => handleCellTap(index)}
                      disabled={taskState !== 'playing'}
                      activeOpacity={0.7}
                    />
                  ))}
                </View>
              </View>
            </>
          ) : (
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statusText: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 40,
    fontStyle: 'italic',
  },
  gridContainer: {
    padding: 12,
    borderRadius: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    borderRadius: 8,
  },
  cellDefault: {
    backgroundColor: '#334155',
  },
  cellHighlighted: {
    backgroundColor: '#94a3b8',
  },
  cellSelected: {
    backgroundColor: '#94a3b8',
  },
  cellWrong: {
    backgroundColor: '#ff6b35',
  },
  cellCorrectReveal: {
    backgroundColor: '#ff6b35',
  },
  stateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
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
