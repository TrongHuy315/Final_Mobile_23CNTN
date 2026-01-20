import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { snoozeStore } from '../stores/snoozeStore';
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Switch,
  Animated,
  FlatList,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  TextInput,
  LogBox,
  Modal,
  PanResponder,
  Easing,
  TouchableWithoutFeedback,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

// Suppress VirtualizedLists warning - we're using nestedScrollEnabled
LogBox.ignoreLogs([
  'VirtualizedLists should never be nested',
]);

// Memoized GentleWakeModal component for performance
const GentleWakeModal = React.memo(({
  visible,
  currentValue,
  onClose,
  onSelect,
}: {
  visible: boolean;
  currentValue: string;
  onClose: () => void;
  onSelect: (value: string) => void;
}) => {
  const handleSelect = (value: string) => {
    onSelect(value);
    setTimeout(() => onClose(), 300);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={modalStyles.gentleWakeModalOverlay} />
      </TouchableWithoutFeedback>
      <View style={modalStyles.gentleWakeModalContent}>
        <View style={modalStyles.gentleWakeModalHeader}>
          <Text style={modalStyles.gentleWakeModalTitle}>Thức giấc nhẹ nhàng</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <Text style={modalStyles.gentleWakeDescription}>
          Âm lượng tăng dần trong thời gian đã đặt
        </Text>

        <ScrollView showsVerticalScrollIndicator={false}>
          <TouchableOpacity 
            style={modalStyles.gentleWakeOption}
            onPress={() => handleSelect('off')}
          >
            <View style={[
              modalStyles.radioButton,
              currentValue === 'off' && modalStyles.radioButtonSelected
            ]}>
              {currentValue === 'off' && <View style={modalStyles.radioButtonInner} />}
            </View>
            <Text style={[
              modalStyles.gentleWakeOptionText,
              currentValue === 'off' && modalStyles.gentleWakeOffText
            ]}>Tắt</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={modalStyles.gentleWakeOption}
            onPress={() => handleSelect('15s')}
          >
            <View style={[
              modalStyles.radioButton,
              currentValue === '15s' && modalStyles.radioButtonSelected
            ]}>
              {currentValue === '15s' && <View style={modalStyles.radioButtonInner} />}
            </View>
            <Text style={modalStyles.gentleWakeOptionText}>15 giây</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={modalStyles.gentleWakeOption}
            onPress={() => handleSelect('30s')}
          >
            <View style={[
              modalStyles.radioButton,
              currentValue === '30s' && modalStyles.radioButtonSelected
            ]}>
              {currentValue === '30s' && <View style={modalStyles.radioButtonInner} />}
            </View>
            <Text style={modalStyles.gentleWakeOptionText}>30 giây</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={modalStyles.gentleWakeOption}
            onPress={() => handleSelect('60s')}
          >
            <View style={[
              modalStyles.radioButton,
              currentValue === '60s' && modalStyles.radioButtonSelected
            ]}>
              {currentValue === '60s' && <View style={modalStyles.radioButtonInner} />}
            </View>
            <Text style={modalStyles.gentleWakeOptionText}>60 giây</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={modalStyles.gentleWakeOption}
            onPress={() => handleSelect('5m')}
          >
            <View style={[
              modalStyles.radioButton,
              currentValue === '5m' && modalStyles.radioButtonSelected
            ]}>
              {currentValue === '5m' && <View style={modalStyles.radioButtonInner} />}
            </View>
            <Text style={modalStyles.gentleWakeOptionText}>5 phút</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={modalStyles.gentleWakeOption}
            onPress={() => handleSelect('10m')}
          >
            <View style={[
              modalStyles.radioButton,
              currentValue === '10m' && modalStyles.radioButtonSelected
            ]}>
              {currentValue === '10m' && <View style={modalStyles.radioButtonInner} />}
            </View>
            <Text style={modalStyles.gentleWakeOptionText}>10 phút</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
});

// Modal styles
const modalStyles = StyleSheet.create({
  gentleWakeModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  gentleWakeModalContent: {
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
    maxHeight: '70%',
  },
  gentleWakeModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  gentleWakeModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
  },
  gentleWakeDescription: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 24,
    lineHeight: 20,
  },
  gentleWakeOption: {
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
    borderColor: '#64748b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: '#3b82f6',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3b82f6',
  },
  gentleWakeOptionText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  gentleWakeOffText: {
    color: '#64748b',
  },
});

// Suppress VirtualizedLists warning - we're using nestedScrollEnabled
LogBox.ignoreLogs(['VirtualizedLists should never be nested']);

const DAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const ITEM_HEIGHT = 60;
const VISIBLE_ITEMS = 3;

// Task type definition
type AlarmTask = {
  id: string;
  type: 'find_household' | 'tap_challenge' | 'find_colors' | 'typing' | 'math' | 'steps' | 'qr_code' | 'shake' | 'photo' | 'squat';
  name: string;
  icon: string;
  iconColor: string;
  settings?: {
    itemCount?: number;
  };
};

// Get current time rounded up to next minute
const getDefaultTime = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 1);
  now.setSeconds(0);
  now.setMilliseconds(0);
  return {
    hour: now.getHours(),
    minute: now.getMinutes(),
  };
};

export default function AddAlarmScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const defaultTime = getDefaultTime();

  // States
  const [alarmIcon, setAlarmIcon] = useState('🌤️');
  const [alarmName, setAlarmName] = useState('');
  const [selectedHour, setSelectedHour] = useState(defaultTime.hour);
  const [selectedMinute, setSelectedMinute] = useState(defaultTime.minute);
  const [selectedDays, setSelectedDays] = useState<string[]>(['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']);
  const [alarmTasks, setAlarmTasks] = useState<(AlarmTask | null)[]>([null, null, null, null, null]);
  const [volume, setVolume] = useState(0.5);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [timePressure, setTimePressure] = useState(false);
  const [weatherReminder, setWeatherReminder] = useState(false);
  const [labelReminder, setLabelReminder] = useState(false);
  const [backupSound, setBackupSound] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showFindHouseholdModal, setShowFindHouseholdModal] = useState(false);
  const [showTapChallengeModal, setShowTapChallengeModal] = useState(false);
  const [showGentleWakeModal, setShowGentleWakeModal] = useState(false);
  const [gentleWake, setGentleWake] = useState('30s'); // 'off', '15s', '30s', '60s', '5m', '10m'
  const [isDragging, setIsDragging] = useState(false);
  const [selectedTaskSlot, setSelectedTaskSlot] = useState(0);
  const [findHouseholdItemCount, setFindHouseholdItemCount] = useState(20);
  const [tapChallengeCount, setTapChallengeCount] = useState(50);
  const [scanComplete, setScanComplete] = useState(false);
  const [tapAnimCount, setTapAnimCount] = useState(0);
  const [tapCleared, setTapCleared] = useState(false);
  
  // Animation refs
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const checkmarkScale = useRef(new Animated.Value(0)).current;
  const tapButtonScale = useRef(new Animated.Value(1)).current;
  const clearTextScale = useRef(new Animated.Value(0)).current;
  
  // Start tap animation when modal opens
  useEffect(() => {
    if (showTapChallengeModal) {
      setTapAnimCount(0);
      setTapCleared(false);
      clearTextScale.setValue(0);
      
      // Simulate 50 taps in 5 seconds (100ms per tap)
      let currentCount = 0;
      const tapInterval = setInterval(() => {
        currentCount++;
        setTapAnimCount(currentCount);
        
        // Button pulse animation
        Animated.sequence([
          Animated.timing(tapButtonScale, {
            toValue: 0.85,
            duration: 40,
            useNativeDriver: true,
          }),
          Animated.timing(tapButtonScale, {
            toValue: 1,
            duration: 40,
            useNativeDriver: true,
          }),
        ]).start();
        
        if (currentCount >= 50) {
          clearInterval(tapInterval);
          setTapCleared(true);
          // Animate CLEAR text appearance
          Animated.spring(clearTextScale, {
            toValue: 1,
            useNativeDriver: true,
            friction: 4,
          }).start();
        }
      }, 100); // 50 taps in 5000ms = 100ms per tap
      
      return () => {
        clearInterval(tapInterval);
      };
    }
  }, [showTapChallengeModal]);
  
  // Start scan animation when modal opens
  useEffect(() => {
    if (showFindHouseholdModal) {
      setScanComplete(false);
      checkmarkScale.setValue(0);
      
      // Scanning animation loop
      const scanAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
            easing: Easing.linear,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
            easing: Easing.linear,
          }),
        ])
      );
      scanAnimation.start();
      
      // Complete scan after 3 seconds
      const completeTimer = setTimeout(() => {
        scanAnimation.stop();
        setScanComplete(true);
        Animated.spring(checkmarkScale, {
          toValue: 1,
          useNativeDriver: true,
          friction: 4,
        }).start();
      }, 3000);
      
      return () => {
        scanAnimation.stop();
        clearTimeout(completeTimer);
      };
    }
  }, [showFindHouseholdModal]);
  
  // Snooze settings state - initialize from store
  const [snoozeEnabled, setSnoozeEnabled] = useState(snoozeStore.getSettings().snoozeEnabled);
  const [snoozeInterval, setSnoozeInterval] = useState(snoozeStore.getSettings().snoozeInterval);
  const [maxSnoozeCount, setMaxSnoozeCount] = useState(snoozeStore.getSettings().maxSnoozeCount);
  
  // Subscribe to snooze store changes
  useEffect(() => {
    const unsubscribe = snoozeStore.subscribe(() => {
      const settings = snoozeStore.getSettings();
      setSnoozeEnabled(settings.snoozeEnabled);
      setSnoozeInterval(settings.snoozeInterval);
      setMaxSnoozeCount(settings.maxSnoozeCount);
    });
    return unsubscribe;
  }, []);
  
  // Get snooze display text
  const getSnoozeDisplayText = () => {
    if (!snoozeEnabled) return 'Tắt';
    const countText = maxSnoozeCount === 'unlimited' ? 'Vô hạn' : `${maxSnoozeCount} lần`;
    return `${snoozeInterval} phút, ${countText}`;
  };
  const sliderWidthRef = useRef(0);
  const startVolumeRef = useRef(0);
  const volumeRef = useRef(volume);

  // Keep volumeRef in sync with volume state
  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  const volumePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (evt) => {
        setIsDragging(true);
        const width = sliderWidthRef.current;
        if (width > 0) {
          const initialVolume = Math.max(0, Math.min(1, evt.nativeEvent.locationX / width));
          setVolume(initialVolume);
          startVolumeRef.current = initialVolume;
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        const width = sliderWidthRef.current;
        if (width > 0) {
          const delta = gestureState.dx / width;
          const newVolume = Math.max(0, Math.min(1, startVolumeRef.current + delta));
          setVolume(newVolume);
        }
      },
      onPanResponderRelease: () => {
        setIsDragging(false);
      },
      onPanResponderTerminate: () => {
        setIsDragging(false);
      },
    })
  ).current;

  const handleSliderLayout = (event: any) => {
    sliderWidthRef.current = event.nativeEvent.layout.width;
  };


  // Refs for FlatList and emoji input
  const hourListRef = useRef<FlatList>(null);
  const minuteListRef = useRef<FlatList>(null);
  const emojiInputRef = useRef<TextInput>(null);

  // Update current time every second for accurate time diff
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Generate arrays for hours and minutes
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  // Calculate time until alarm
  const timeUntilAlarm = useMemo(() => {
    const now = currentTime;
    const alarmTime = new Date();
    alarmTime.setHours(selectedHour, selectedMinute, 0, 0);
    
    // If alarm time is before current time, set it to tomorrow
    if (alarmTime <= now) {
      alarmTime.setDate(alarmTime.getDate() + 1);
    }
    
    const diffMs = alarmTime.getTime() - now.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const remainingMinutes = diffMinutes % 60;
    
    if (diffMinutes < 1) {
      return 'Đổ chuông sau chưa đầy một phút';
    } else if (diffMinutes < 60) {
      return `Đổ chuông sau ${diffMinutes} phút`;
    } else if (diffHours >= 24) {
      return 'Đổ chuông sau 1 ngày';
    } else if (remainingMinutes === 0) {
      return `Đổ chuông sau ${diffHours} giờ`;
    } else {
      return `Đổ chuông sau ${diffHours} giờ ${remainingMinutes} phút`;
    }
  }, [selectedHour, selectedMinute, currentTime]);

  // Scroll to initial position on mount
  useEffect(() => {
    setTimeout(() => {
      hourListRef.current?.scrollToOffset({
        offset: selectedHour * ITEM_HEIGHT,
        animated: false,
      });
      minuteListRef.current?.scrollToOffset({
        offset: selectedMinute * ITEM_HEIGHT,
        animated: false,
      });
    }, 100);
  }, []);

  const handleHourScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    if (index >= 0 && index < 24) {
      setSelectedHour(index);
    }
  };

  const handleMinuteScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    if (index >= 0 && index < 60) {
      setSelectedMinute(index);
    }
  };

  const snapToHour = () => {
    hourListRef.current?.scrollToOffset({
      offset: selectedHour * ITEM_HEIGHT,
      animated: true,
    });
  };

  // Calculate day label dynamically
  const dayLabel = useMemo(() => {
    if (selectedDays.length === 0) {
      return 'Một lần';
    } else if (selectedDays.length === 7) {
      return 'Hằng ngày';
    } else {
      return selectedDays.join(', ');
    }
  }, [selectedDays]);

  // Check if all days are selected
  const isEveryday = selectedDays.length === 7;

  const snapToMinute = () => {
    minuteListRef.current?.scrollToOffset({
      offset: selectedMinute * ITEM_HEIGHT,
      animated: true,
    });
  };

  const handleClose = () => {
    router.back();
  };

  const handleSave = () => {
    // Save alarm logic here
    router.back();
  };

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const toggleEveryday = () => {
    if (isEveryday) {
      // Uncheck all
      setSelectedDays([]);
    } else {
      // Check all
      setSelectedDays(['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']);
    }
  };

  const renderHourItem = ({ item }: { item: number }) => {
    const isSelected = item === selectedHour;
    return (
      <View style={styles.timePickerItem}>
        <Text style={[
          styles.timePickerText,
          isSelected && styles.timePickerTextSelected,
          !isSelected && styles.timePickerTextFaded,
        ]}>
          {String(item).padStart(2, '0')}
        </Text>
      </View>
    );
  };

  const renderMinuteItem = ({ item }: { item: number }) => {
    const isSelected = item === selectedMinute;
    return (
      <View style={styles.timePickerItem}>
        <Text style={[
          styles.timePickerText,
          isSelected && styles.timePickerTextSelected,
          !isSelected && styles.timePickerTextFaded,
        ]}>
          {String(item).padStart(2, '0')}
        </Text>
      </View>
    );
  };

  // Count actual tasks
  const getTaskCount = () => alarmTasks.filter(task => task !== null).length;
  
  // Add task to a specific slot
  const addTaskToSlot = (task: AlarmTask) => {
    const newTasks = [...alarmTasks];
    newTasks[selectedTaskSlot] = task;
    setAlarmTasks(newTasks);
  };
  
  // Remove task from slot
  const removeTask = (index: number) => {
    const newTasks = [...alarmTasks];
    newTasks[index] = null;
    setAlarmTasks(newTasks);
  };
  
  // Handle opening task modal from a specific slot
  const handleOpenTaskModal = (slotIndex: number) => {
    setSelectedTaskSlot(slotIndex);
    setShowTaskModal(true);
  };
  
  // Handle selecting "Tìm đồ gia dụng" task
  const handleSelectFindHousehold = () => {
    setShowTaskModal(false);
    setShowFindHouseholdModal(true);
  };
  
  // Handle completing the find household task
  const handleCompleteFindHousehold = () => {
    const newTask: AlarmTask = {
      id: `find_household_${Date.now()}`,
      type: 'find_household',
      name: 'Tìm đồ v...',
      icon: 'search',
      iconColor: '#7d3a3a',
      settings: {
        itemCount: findHouseholdItemCount,
      },
    };
    addTaskToSlot(newTask);
    setShowFindHouseholdModal(false);
  };
  
  // Handle selecting "Thử thách lượt nhấn" task
  const handleSelectTapChallenge = () => {
    setShowTaskModal(false);
    setShowTapChallengeModal(true);
  };
  
  // Handle completing the tap challenge task
  const handleCompleteTapChallenge = () => {
    const newTask: AlarmTask = {
      id: `tap_challenge_${Date.now()}`,
      type: 'tap_challenge',
      name: `${tapChallengeCount} lần`,
      icon: 'hand-left',
      iconColor: '#7d3a3a',
      settings: {
        itemCount: tapChallengeCount,
      },
    };
    addTaskToSlot(newTask);
    setShowTapChallengeModal(false);
  };

  // Render Find Household Items Modal
  const renderFindHouseholdModal = () => (
    <Modal
      visible={showFindHouseholdModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowFindHouseholdModal(false)}
    >
      <View style={styles.taskModalOverlay}>
        <View style={styles.findHouseholdModalContent}>
          {/* Header */}
          <View style={styles.findHouseholdHeader}>
            <TouchableOpacity onPress={() => {
              setShowFindHouseholdModal(false);
              setShowTaskModal(true);
            }}>
              <Ionicons name="chevron-back" size={24} color="#ffffff" />
            </TouchableOpacity>
            <Text style={styles.findHouseholdTitle}>Tìm đồ gia dụng</Text>
            <TouchableOpacity onPress={() => setShowFindHouseholdModal(false)}>
              <Ionicons name="close" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {/* Description */}
          <Text style={styles.findHouseholdDescription}>
            Tìm đồ vật trên màn hình để tắt báo thức
          </Text>

          {/* Preview Image Area */}
          <View style={styles.findHouseholdPreview}>
            <View style={styles.previewImageContainer}>
              {/* Scanning Frame with corners */}
              <View style={styles.scanFrame}>
                {/* Cup Icon */}
                <View style={styles.cupContainer}>
                  <MaterialCommunityIcons name="coffee" size={80} color="#f59e0b" />
                </View>
                
                {/* Label above cup */}
                <View style={styles.objectLabel}>
                  <Text style={styles.objectLabelText}>Cup</Text>
                </View>
                
                {/* Corner markers */}
                <View style={[styles.cornerMarker, styles.cornerTopLeft]} />
                <View style={[styles.cornerMarker, styles.cornerTopRight]} />
                <View style={[styles.cornerMarker, styles.cornerBottomLeft]} />
                <View style={[styles.cornerMarker, styles.cornerBottomRight]} />
                
                {/* Scanning line animation */}
                {!scanComplete && (
                  <Animated.View 
                    style={[
                      styles.scanLine,
                      {
                        transform: [{
                          translateY: scanLineAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [-60, 60],
                          }),
                        }],
                      },
                    ]}
                  />
                )}
                
                {/* Success checkmark overlay */}
                {scanComplete && (
                  <Animated.View 
                    style={[
                      styles.scanSuccessOverlay,
                      {
                        transform: [{ scale: checkmarkScale }],
                      },
                    ]}
                  >
                    <View style={styles.successCheckmark}>
                      <Ionicons name="checkmark" size={32} color="#ffffff" />
                    </View>
                  </Animated.View>
                )}
              </View>
              
              {/* Camera needed badge */}
              <View style={styles.cameraNeededBadge}>
                <Ionicons name="camera" size={14} color="#ffffff" />
                <Text style={styles.cameraNeededText}>Camera needed</Text>
              </View>
            </View>
          </View>

          {/* Hint Text */}
          <Text style={styles.findHouseholdHint}>
            Bạn không có đồ vật đó? Nhấn thử lại để nhận đồ vật mới!
          </Text>

          {/* Select Items Row */}
          <TouchableOpacity style={styles.selectItemsRow}>
            <Text style={styles.selectItemsLabel}>Chọn đồ vật</Text>
            <View style={styles.selectItemsRight}>
              <Text style={styles.selectItemsValue}>{findHouseholdItemCount} đồ vật</Text>
              <Ionicons name="chevron-forward" size={20} color="#0ea5e9" />
            </View>
          </TouchableOpacity>

          {/* Bottom Buttons */}
          <View style={styles.findHouseholdButtons}>
            <TouchableOpacity style={styles.previewButton}>
              <Text style={styles.previewButtonText}>Xem trước</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.completeButton}
              onPress={handleCompleteFindHousehold}
            >
              <Text style={styles.completeButtonText}>Hoàn tất</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Render Tap Challenge Modal
  const renderTapChallengeModal = () => (
    <Modal
      visible={showTapChallengeModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowTapChallengeModal(false)}
    >
      <View style={styles.taskModalOverlay}>
        <View style={styles.tapChallengeModalContent}>
          {/* Header */}
          <View style={styles.findHouseholdHeader}>
            <TouchableOpacity onPress={() => {
              setShowTapChallengeModal(false);
              setShowTaskModal(true);
            }}>
              <Ionicons name="chevron-back" size={24} color="#ffffff" />
            </TouchableOpacity>
            <Text style={styles.findHouseholdTitle}>Thử thách lượt nhấn</Text>
            <TouchableOpacity onPress={() => setShowTapChallengeModal(false)}>
              <Ionicons name="close" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {/* Preview Image Area */}
          <View style={styles.tapChallengePreview}>
            <View style={styles.tapPreviewContainer}>
              {/* Background sparkle effect */}
              <View style={styles.sparkleBackground}>
                <MaterialCommunityIcons name="shimmer" size={120} color="rgba(255, 215, 0, 0.3)" />
              </View>
              
              {/* Tap count display during animation */}
              {!tapCleared && (
                <View style={styles.tapProgressContainer}>
                  <Text style={styles.tapProgressNumber}>{tapAnimCount}</Text>
                  <Text style={styles.tapProgressLabel}>/ 50</Text>
                </View>
              )}
              
              {/* CLEAR text - only show when completed */}
              {tapCleared && (
                <Animated.Text 
                  style={[
                    styles.clearText,
                    { transform: [{ scale: clearTextScale }] }
                  ]}
                >
                  CLEAR!
                </Animated.Text>
              )}
              
              {/* Tap button with pulse animation */}
              <Animated.View 
                style={[
                  styles.tapButton,
                  { transform: [{ scale: tapButtonScale }] }
                ]}
              >
                <Text style={styles.tapButtonText}>Tap!</Text>
              </Animated.View>
            </View>
          </View>

          {/* Tap Count Card */}
          <View style={styles.tapCountCard}>
            <Text style={styles.tapCountNumber}>{tapChallengeCount}</Text>
            <Text style={styles.tapCountLabel}>lần</Text>
          </View>

          {/* Bottom Buttons */}
          <View style={styles.findHouseholdButtons}>
            <TouchableOpacity style={styles.previewButton}>
              <Text style={styles.previewButtonText}>Xem trước</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.completeButton}
              onPress={handleCompleteTapChallenge}
            >
              <Text style={styles.completeButtonText}>Hoàn tất</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderTaskModal = () => (
    <Modal
      visible={showTaskModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowTaskModal(false)}
    >
      <View style={styles.taskModalOverlay}>
        <View style={styles.taskModalContent}>
          {/* Header */}
          <View style={styles.taskModalHeader}>
            <Text style={styles.taskModalTitle}>Nhiệm vụ</Text>
            <TouchableOpacity onPress={() => setShowTaskModal(false)}>
              <Ionicons name="close" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Popular Tasks */}
            <Text style={styles.taskCategoryTitle}>Nhiệm vụ phổ biến</Text>
            <TouchableOpacity style={styles.taskItem} onPress={handleSelectFindHousehold}>
              <View style={[styles.taskIcon, { backgroundColor: '#7d3a3a' }]}>
                <Ionicons name="search" size={24} color="#ffffff" />
              </View>
              <Text style={styles.taskItemText}>Tìm đồ gia dụng</Text>
              <View style={styles.taskBadgeAI}>
                <Text style={styles.taskBadgeText}>AI</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.taskItem} onPress={handleSelectTapChallenge}>
              <View style={[styles.taskIcon, { backgroundColor: '#7d3a3a' }]}>
                <Ionicons name="hand-left" size={24} color="#ffffff" />
              </View>
              <Text style={styles.taskItemText}>Thử thách lượt nhấn</Text>
            </TouchableOpacity>

            {/* Brain Tasks */}
            <Text style={styles.taskCategoryTitle}>Đánh thức bộ não của bạn</Text>
            <TouchableOpacity style={styles.taskItem}>
              <View style={[styles.taskIcon, { backgroundColor: '#3a5a5f' }]}>
                <Ionicons name="grid" size={24} color="#ffffff" />
              </View>
              <Text style={styles.taskItemText}>Tìm các ô màu</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.taskItem}>
              <View style={[styles.taskIcon, { backgroundColor: '#3a5a5f' }]}>
                <Ionicons name="keypad" size={24} color="#ffffff" />
              </View>
              <Text style={styles.taskItemText}>Gõ vấn bàn</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.taskItem}>
              <View style={[styles.taskIcon, { backgroundColor: '#3a5a5f' }]}>
                <Ionicons name="calculator" size={24} color="#ffffff" />
              </View>
              <Text style={styles.taskItemText}>Giải toán</Text>
              <View style={styles.taskBadgeBest}>
                <Text style={styles.taskBadgeText}>BEST</Text>
              </View>
            </TouchableOpacity>

            {/* Body Tasks */}
            <Text style={styles.taskCategoryTitle}>Đánh thức cơ thể của bạn</Text>
            <TouchableOpacity style={styles.taskItem}>
              <View style={[styles.taskIcon, { backgroundColor: '#4a3a6e' }]}>
                <MaterialCommunityIcons name="foot-print" size={24} color="#ffffff" />
              </View>
              <View style={styles.taskItemLeft}>
                <Text style={styles.taskItemText}>Bước</Text>
                <View style={styles.taskBadgePro}>
                  <Text style={styles.taskBadgeTextPro}>PRO</Text>
                </View>
              </View>
              <View style={styles.taskBadgeHot}>
                <Text style={styles.taskBadgeText}>HOT</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.taskItem}>
              <View style={[styles.taskIcon, { backgroundColor: '#4a3a6e' }]}>
                <Ionicons name="qr-code" size={24} color="#ffffff" />
              </View>
              <Text style={styles.taskItemText}>Mã QR/Mã vạch</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.taskItem}>
              <View style={[styles.taskIcon, { backgroundColor: '#4a3a6e' }]}>
                <MaterialCommunityIcons name="vibrate" size={24} color="#ffffff" />
              </View>
              <Text style={styles.taskItemText}>Lắc điện thoại</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.taskItem}>
              <View style={[styles.taskIcon, { backgroundColor: '#4a3a6e' }]}>
                <Ionicons name="camera" size={24} color="#ffffff" />
              </View>
              <Text style={styles.taskItemText}>Ảnh chụp</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.taskItem}>
              <View style={[styles.taskIcon, { backgroundColor: '#4a3a6e' }]}>
                <MaterialCommunityIcons name="arm-flex" size={24} color="#ffffff" />
              </View>
              <View style={styles.taskItemLeft}>
                <Text style={styles.taskItemText}>Squat</Text>
                <View style={styles.taskBadgePro}>
                  <Text style={styles.taskBadgeTextPro}>PRO</Text>
                </View>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaProvider style={styles.container}>
      <GentleWakeModal
        visible={showGentleWakeModal}
        currentValue={gentleWake}
        onClose={() => setShowGentleWakeModal(false)}
        onSelect={setGentleWake}
      />
      {renderTaskModal()}
      {renderFindHouseholdModal()}
      {renderTapChallengeModal()}      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chuông báo thức</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={!isDragging}
      >
        {/* Alarm Name Input */}
        <View style={styles.nameInputContainer}>
          <TouchableOpacity 
            style={styles.emojiInputWrapper}
            onPress={() => emojiInputRef.current?.focus()}
          >
            <Text style={styles.sunIcon}>{alarmIcon}</Text>
            <TextInput
              ref={emojiInputRef}
              style={styles.hiddenEmojiInput}
              value=""
              onChangeText={(text: string) => {
                // Get the last emoji from input
                if (text.length > 0) {
                  // Extract emoji (emojis can be multiple characters)
                  const emojiMatch = text.match(/(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/gu);
                  if (emojiMatch && emojiMatch.length > 0) {
                    setAlarmIcon(emojiMatch[emojiMatch.length - 1]);
                  }
                }
              }}
              maxLength={2}
              autoCorrect={false}
            />
          </TouchableOpacity>
          <TextInput
            style={styles.nameInputText}
            value={alarmName}
            onChangeText={setAlarmName}
            placeholder="Vui lòng điền tên báo thức"
            placeholderTextColor="#94a3b8"
          />
          <TouchableOpacity>
            <Ionicons name="pencil" size={20} color="#64748b" />
          </TouchableOpacity>
        </View>

        {/* Time Picker */}
        <View style={styles.timePickerContainer}>
          <View style={styles.timePickerWrapper}>
            {/* Hour Picker */}
            <View style={styles.pickerColumn}>
              <FlatList
                ref={hourListRef}
                data={hours}
                renderItem={renderHourItem}
                keyExtractor={(item) => `hour-${item}`}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                onScroll={handleHourScroll}
                onMomentumScrollEnd={snapToHour}
                getItemLayout={(_, index) => ({
                  length: ITEM_HEIGHT,
                  offset: ITEM_HEIGHT * index,
                  index,
                })}
                contentContainerStyle={{
                  paddingVertical: ITEM_HEIGHT,
                }}
              />
            </View>

            <Text style={styles.timeSeparatorMain}>:</Text>

            {/* Minute Picker */}
            <View style={styles.pickerColumn}>
              <FlatList
                ref={minuteListRef}
                data={minutes}
                renderItem={renderMinuteItem}
                keyExtractor={(item) => `minute-${item}`}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                onScroll={handleMinuteScroll}
                onMomentumScrollEnd={snapToMinute}
                getItemLayout={(_, index) => ({
                  length: ITEM_HEIGHT,
                  offset: ITEM_HEIGHT * index,
                  index,
                })}
                contentContainerStyle={{
                  paddingVertical: ITEM_HEIGHT,
                }}
              />
            </View>
          </View>

          {/* Selection Indicator */}
          <View style={styles.selectionIndicator} pointerEvents="none" />
        </View>

        {/* Time Until Alarm */}
        <Text style={styles.timeUntilText}>{timeUntilAlarm}</Text>

        {/* Day Selection */}
        <View style={styles.daySelectionContainer}>
          <Text style={styles.dayLabel}>{dayLabel}</Text>
          <TouchableOpacity 
            style={styles.checkboxContainer}
            onPress={toggleEveryday}
          >
            <View style={[styles.checkbox, isEveryday && styles.checkboxChecked]}>
              {isEveryday && <Ionicons name="checkmark" size={16} color="#ffffff" />}
            </View>
            <Text style={styles.checkboxText}>Hằng ngày</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.daysContainer}>
          {DAYS.map((day) => (
            <TouchableOpacity
              key={day}
              style={[
                styles.dayButton,
                selectedDays.includes(day) && styles.dayButtonSelected,
              ]}
              onPress={() => toggleDay(day)}
            >
              <Text style={[
                styles.dayButtonText,
                selectedDays.includes(day) && styles.dayButtonTextSelected,
              ]}>
                {day}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Alarm Tasks Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nhiệm vụ báo thức</Text>
            <Text style={styles.sectionCount}>{getTaskCount()}/5</Text>
          </View>
          
          <View style={{ height: 92, marginBottom: 0 }}>
            <ScrollView 
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.taskButtonsContainer}
              nestedScrollEnabled={true}
            >
              {alarmTasks.map((task, index) => (
                <View key={index} style={styles.taskSlotWrapper}>
                  {task ? (
                    // Task is added - show task info
                    <TouchableOpacity
                      style={[styles.taskButton, styles.taskButtonFilled]}
                      onPress={() => handleOpenTaskModal(index)}
                    >
                      <TouchableOpacity 
                        style={styles.taskRemoveButton}
                        onPress={() => removeTask(index)}
                      >
                        <Ionicons name="close" size={12} color="#ffffff" />
                      </TouchableOpacity>
                      <View style={[styles.taskIconSmall, { backgroundColor: task.iconColor }]}>
                        <Ionicons name={task.icon as any} size={18} color="#ffffff" />
                      </View>
                      <Text style={styles.taskButtonLabel} numberOfLines={1}>{task.name}</Text>
                    </TouchableOpacity>
                  ) : (
                    // Empty slot - show add button
                    <TouchableOpacity
                      style={[
                        styles.taskButton,
                        index === 0 && getTaskCount() === 0 && styles.taskButtonFirst,
                      ]}
                      onPress={() => handleOpenTaskModal(index)}
                    >
                      <Ionicons 
                        name={index > 0 ? "lock-closed" : "add"} 
                        size={index > 0 ? 20 : 28} 
                        color={index === 0 && getTaskCount() === 0 ? "#ffffff" : "#64748b"} 
                      />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Wake Up Check */}
          <TouchableOpacity 
            style={[styles.settingRow, { borderTopWidth: 1, borderTopColor: '#334155' }]}
            onPress={() => router.push('/wake-up-check')}
          >
            <View style={styles.settingRowLeft}>
              <Text style={styles.settingText}>Kiểm tra thức dậy</Text>
              <Ionicons name="lock-closed" size={14} color="#64748b" style={styles.lockIcon} />
              <View style={styles.hotBadge}>
                <Text style={styles.hotBadgeText}>HOT</Text>
              </View>
            </View>
            <View style={styles.settingRowRight}>
              <Text style={styles.settingValue}>Tắt</Text>
              <Ionicons name="chevron-forward" size={20} color="#64748b" />
            </View>
          </TouchableOpacity>



        </View>

        {/* Alarm Sound Section */}
        <Text style={styles.sectionLabel}>Âm thanh báo thức</Text>
        <View style={styles.sectionCard}>
          <TouchableOpacity style={styles.soundRow}>
            <View style={styles.playButton}>
              <Ionicons name="play" size={20} color="#ffffff" />
            </View>
            <Text style={styles.soundName}>Giờ Nghỉ Cà Phê</Text>
            <Ionicons name="chevron-forward" size={24} color="#64748b" />
          </TouchableOpacity>

          {/* Volume Slider */}
          <View style={styles.sliderContainer}>
            <View style={styles.sliderTrack} />
          </View>

          <View style={styles.volumeRow}>
            <Ionicons 
              name={volume === 0 ? "volume-mute" : "volume-medium"} 
              size={24} 
              color={volume === 0 ? "#64748b" : "#ffffff"} 
            />
            <Slider
              style={styles.volumeSlider}
              minimumValue={0}
              maximumValue={1}
              value={volume}
              onValueChange={setVolume}
              minimumTrackTintColor="#ffffff"
              maximumTrackTintColor="#334155"
              thumbTintColor="#ffffff"
            />
            <TouchableOpacity 
              style={styles.vibrationButton}
              onPress={() => setVibrationEnabled(!vibrationEnabled)}
            >
              <MaterialCommunityIcons 
                name="vibrate" 
                size={24} 
                color={vibrationEnabled ? "#ffffff" : "#64748b"} 
              />
            </TouchableOpacity>
            <View style={[styles.vibrationCheckbox, vibrationEnabled && styles.vibrationCheckboxChecked]}>
              {vibrationEnabled && <Ionicons name="checkmark" size={14} color="#ffffff" />}
            </View>
          </View>

          {/* Gentle Wake */}
          <TouchableOpacity 
            style={[styles.settingRow, { borderTopWidth: 1, borderTopColor: '#334155', marginTop: 8 }]}
            onPress={() => setShowGentleWakeModal(true)}
          >
            <Text style={styles.settingText}>Thức giấc nhẹ nhàng</Text>
            <View style={styles.settingRowRight}>
              <Text style={[
                styles.settingValue,
                gentleWake === 'off' && { color: '#64748b' }
              ]}>
                {gentleWake === 'off' ? 'Tắt' : 
                 gentleWake === '15s' ? '15 giây' :
                 gentleWake === '30s' ? '30 giây' :
                 gentleWake === '60s' ? '60 giây' :
                 gentleWake === '5m' ? '5 phút' : '10 phút'}
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#64748b" />
            </View>
          </TouchableOpacity>

          {/* Time Pressure */}
          <View style={[styles.settingRow, { borderTopWidth: 1, borderTopColor: '#334155' }]}>
            <View style={styles.settingRowLeft}>
              <Text style={styles.settingText}>Áp lực thời gian</Text>
              <TouchableOpacity style={styles.exampleButton}>
                <Ionicons name="play" size={12} color="#9ca3af" />
                <Text style={styles.exampleText}>Ví dụ</Text>
              </TouchableOpacity>
            </View>
            <Switch
              value={timePressure}
              onValueChange={setTimePressure}
              trackColor={{ false: '#3e3e3e', true: '#22c55e' }}
              thumbColor="#ffffff"
            />
          </View>

          {/* Weather Reminder */}
          <View style={[styles.settingRow, { borderTopWidth: 1, borderTopColor: '#334155' }]}>
            <View style={styles.settingRowLeft}>
              <Text style={styles.settingText}>Lời nhắc thời tiết</Text>
              <TouchableOpacity style={styles.exampleButton}>
                <Ionicons name="play" size={12} color="#9ca3af" />
                <Text style={styles.exampleText}>Ví dụ</Text>
              </TouchableOpacity>
            </View>
            <Switch
              value={weatherReminder}
              onValueChange={setWeatherReminder}
              trackColor={{ false: '#3e3e3e', true: '#22c55e' }}
              thumbColor="#ffffff"
            />
          </View>

          {/* Label Reminder */}
          <View style={[styles.settingRow, { borderTopWidth: 1, borderTopColor: '#334155' }]}>
            <View style={styles.settingRowLeft}>
              <Text style={styles.settingText}>Lời nhắc nhãn</Text>
              <Ionicons name="lock-closed" size={14} color="#64748b" style={styles.lockIcon} />
            </View>
            <Switch
              value={labelReminder}
              onValueChange={setLabelReminder}
              trackColor={{ false: '#3e3e3e', true: '#22c55e' }}
              thumbColor="#ffffff"
            />
          </View>

          {/* Backup Sound */}
          <View style={[styles.settingRow, { borderTopWidth: 1, borderTopColor: '#334155' }]}>
            <View style={styles.settingRowLeft}>
              <Text style={styles.settingText}>Âm thanh dự phòng</Text>
              <Ionicons name="lock-closed" size={14} color="#64748b" style={styles.lockIcon} />
            </View>
            <Switch
              value={backupSound}
              onValueChange={setBackupSound}
              trackColor={{ false: '#3e3e3e', true: '#22c55e' }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        {/* Custom Settings Section */}
        <Text style={styles.sectionLabel}>Cài đặt tùy chỉnh</Text>
        <View style={styles.sectionCard}>
          <TouchableOpacity 
            style={styles.settingRow}
            onPress={() => router.push('/snooze-settings')}
          >
            <Text style={styles.settingText}>Báo lại</Text>
            <View style={styles.settingRowRight}>
              <Text style={[
                styles.settingValue,
                snoozeEnabled ? { color: '#ffffff' } : { color: '#64748b' }
              ]}>{getSnoozeDisplayText()}</Text>
              <Ionicons name="chevron-forward" size={20} color="#64748b" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.settingRow, { borderTopWidth: 1, borderTopColor: '#334155' }]}>
            <Text style={styles.settingText}>Cài đặt hình nền</Text>
            <View style={styles.wallpaperThumbnail}>
              <Text style={styles.wallpaperText}>IT'S{'\n'}YOU VS YOU</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={[styles.saveButtonContainer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Lưu</Text>
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
    paddingBottom: 16,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  nameInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  sunIcon: {
    fontSize: 28,
  },
  nameInputText: {
    flex: 1,
    fontSize: 16,
    color: '#94a3b8',
  },
  timePickerContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingHorizontal: 40,
    paddingVertical: 16,
    marginVertical: 8,
  },
  timeTextFaded: {
    fontSize: 36,
    fontWeight: '300',
    color: '#475569',
  },
  timeSeparatorFaded: {
    fontSize: 36,
    fontWeight: '300',
    color: '#475569',
    marginHorizontal: 16,
  },
  timeTextSelected: {
    fontSize: 42,
    fontWeight: '500',
    color: '#ffffff',
  },
  timeSeparatorSelected: {
    fontSize: 42,
    fontWeight: '500',
    color: '#ffffff',
    marginHorizontal: 16,
  },
  timeUntilText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  daySelectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  dayLabel: {
    fontSize: 14,
    color: '#94a3b8',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#64748b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  checkboxText: {
    fontSize: 14,
    color: '#ffffff',
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 24,
    gap: 2,
  },
  dayButton: {
    width: 42,
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayButtonSelected: {
    backgroundColor: '#44c1efaa',
    borderColor: '#44c1efff',
  },
  dayButtonText: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
  },
  dayButtonTextSelected: {
    color: '#ffffff',
  },
  sectionCard: {
    backgroundColor: '#1e293b',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  sectionCount: {
    fontSize: 14,
    color: '#64748b',
  },
  taskButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  taskButton: {
    width: 72,
    height: 72,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskButtonFirst: {
    backgroundColor: '#334155',
    borderStyle: 'solid',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  settingRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  settingText: {
    fontSize: 15,
    color: '#ffffff',
  },
  settingValue: {
    fontSize: 14,
    color: '#64748b',
  },
  lockIcon: {
    marginLeft: 4,
  },
  hotBadge: {
    backgroundColor: '#ef4444',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  hotBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  sectionLabel: {
    fontSize: 14,
    color: '#64748b',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  soundRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  soundName: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
  },
  sliderContainer: {
    paddingVertical: 8,
  },
  sliderTrack: {
    height: 4,
    backgroundColor: '#334155',
    borderRadius: 2,
  },
  volumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  volumeSlider: {
    flex: 1,
    height: 40,
  },
  vibrationButton: {
    padding: 4,
  },
  vibrationCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#64748b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vibrationCheckboxChecked: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  exampleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  exampleText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  wallpaperThumbnail: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wallpaperText: {
    fontSize: 6,
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: '600',
  },
  saveButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: '#0f172a',
  },
  saveButton: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  // Emoji input styles
  emojiInputWrapper: {
    position: 'relative',
  },
  hiddenEmojiInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  // Time picker styles
  timePickerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
  },
  pickerColumn: {
    width: 80,
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
  },
  timePickerItem: {
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timePickerText: {
    fontSize: 36,
    fontWeight: '400',
  },
  timePickerTextSelected: {
    fontSize: 42,
    fontWeight: '600',
    color: '#ffffff',
  },
  timePickerTextFaded: {
    color: '#475569',
  },
  timeSeparatorMain: {
    fontSize: 42,
    fontWeight: '500',
    color: '#ffffff',
    marginHorizontal: 16,
  },
  selectionIndicator: {
    position: 'absolute',
    top: ITEM_HEIGHT + 22,
    left: 40,
    right: 40,
    height: ITEM_HEIGHT,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    zIndex: -1,
  },
  // Task Modal Styles
  taskModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  taskModalContent: {
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '85%',
  },
  taskModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  taskModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
  },
  taskCategoryTitle: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 12,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  taskIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskItemText: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  taskItemLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  taskBadgeAI: {
    backgroundColor: '#fbbf24',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  taskBadgeBest: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  taskBadgeHot: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  taskBadgePro: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 3,
  },
  taskBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1e293b',
  },
  taskBadgeTextPro: {
    fontSize: 8,
    fontWeight: '700',
    color: '#ffffff',
  },
  // Gentle Wake Modal Styles
  gentleWakeModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  gentleWakeModalContent: {
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
    maxHeight: '70%',
  },
  gentleWakeModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  gentleWakeHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#64748b',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  gentleWakeModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
  },
  gentleWakeDescription: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 24,
    lineHeight: 20,
  },
  gentleWakeOption: {
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
    borderColor: '#64748b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: '#3b82f6',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3b82f6',
  },
  gentleWakeOptionText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  gentleWakeOffText: {
    color: '#64748b',
  },
  // Find Household Modal styles
  findHouseholdModalContent: {
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
    marginTop: 'auto',
  },
  findHouseholdHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  findHouseholdTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  findHouseholdDescription: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
  },
  findHouseholdPreview: {
    alignItems: 'center',
    marginBottom: 20,
  },
  previewImageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
    backgroundColor: '#334155',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewLabel: {
    fontSize: 16,
    color: '#ffffff',
    backgroundColor: 'rgba(59, 130, 246, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 10,
  },
  previewCheckmark: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraNeededBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  cameraNeededText: {
    fontSize: 12,
    color: '#ffffff',
  },
  findHouseholdHint: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 24,
  },
  selectItemsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 24,
  },
  selectItemsLabel: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  selectItemsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectItemsValue: {
    fontSize: 16,
    color: '#0ea5e9',
    fontWeight: '500',
  },
  findHouseholdButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  previewButton: {
    flex: 1,
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  previewButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  completeButton: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#64748b',
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  // Task slot styles
  taskSlotWrapper: {
    position: 'relative',
  },
  taskButtonFilled: {
    backgroundColor: '#7d3a3a',
    borderStyle: 'solid',
    borderColor: '#7d3a3a',
    padding: 8,
    paddingTop: 16,
  },
  taskRemoveButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  taskIconSmall: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  taskButtonLabel: {
    fontSize: 10,
    color: '#ffffff',
    textAlign: 'center',
    width: 56,
  },
  // Scanning animation styles
  scanFrame: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cupContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  objectLabel: {
    position: 'absolute',
    top: 10,
    backgroundColor: 'rgba(59, 130, 246, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  objectLabelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  cornerMarker: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#22c55e',
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 4,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 4,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 4,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 4,
  },
  scanLine: {
    position: 'absolute',
    width: '100%',
    height: 3,
    backgroundColor: '#22c55e',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
  scanSuccessOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successCheckmark: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  // Tap Challenge Modal styles
  tapChallengeModalContent: {
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
    marginTop: 'auto',
  },
  tapChallengePreview: {
    alignItems: 'center',
    marginBottom: 20,
  },
  tapPreviewContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#334155',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  sparkleBackground: {
    position: 'absolute',
    opacity: 0.5,
  },
  clearText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fde047',
    textShadowColor: 'rgba(253, 224, 71, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    marginBottom: 16,
  },
  tapButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  tapButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  tapCountCard: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingVertical: 24,
    paddingHorizontal: 48,
    marginBottom: 24,
    gap: 8,
  },
  tapCountNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  tapCountLabel: {
    fontSize: 20,
    color: '#94a3b8',
    fontWeight: '500',
  },
  // Tap progress animation styles
  tapProgressContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  tapProgressNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  tapProgressLabel: {
    fontSize: 24,
    color: '#94a3b8',
    fontWeight: '500',
    marginLeft: 4,
  },
});
