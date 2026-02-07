import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';
import { snoozeStore } from '../stores/snoozeStore';
import React, { useState, useRef, useEffect, useMemo } from 'react';
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
import { useLocalSearchParams } from 'expo-router'; // Thêm này để nhận ID khi sửa
import { AlarmManager, Alarm, AlarmTask as AlarmTaskType } from '../utils/alarm-manager';
import WheelPicker from '../components/WheelPicker';

// Number Picker Component for better performance and to avoid nested VirtualizedLists
const NumberPicker = React.memo(({ 
  data, 
  initialValue, 
  onValueChange, 
  itemHeight = 50, 
  unit = "" 
}: { 
  data: number[], 
  initialValue: number, 
  onValueChange: (val: number) => void,
  itemHeight?: number,
  unit?: string
}) => {
  return (
    <View style={styles.typingPickerWrapper}>
      <WheelPicker
        data={data}
        initialValue={initialValue}
        onValueChange={onValueChange}
        itemHeight={itemHeight}
        visibleItems={3}
        containerStyle={{ width: 100, alignItems: 'center' }}
      />
      {unit ? <Text style={styles.typingCountLabel}>{unit}</Text> : null}
    </View>
  );
});
NumberPicker.displayName = 'NumberPicker';

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
GentleWakeModal.displayName = 'GentleWakeModal';

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

// Type alias for alarm task
type AlarmTask = AlarmTaskType;

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
  const params = useLocalSearchParams();
  const alarmId = params.id as string | undefined;
  const defaultTime = getDefaultTime();

  // Main alarm states
  const [alarmIcon, setAlarmIcon] = useState('🌤️');
  const [alarmName, setAlarmName] = useState('');
  const [selectedHour, setSelectedHour] = useState(defaultTime.hour);
  const [selectedMinute, setSelectedMinute] = useState(defaultTime.minute);
  const [selectedDays, setSelectedDays] = useState<string[]>(['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']);
  const [alarmTasks, setAlarmTasks] = useState<(AlarmTask | null)[]>([null, null, null, null, null]);
  const [volume, setVolume] = useState(0.5);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [gentleWake, setGentleWake] = useState('30s');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Task-specific and UI states
  const [isDragging, setIsDragging] = useState(false);
  const [selectedTaskSlot, setSelectedTaskSlot] = useState(0);
  const [timePressure, setTimePressure] = useState(false);
  const [weatherReminder, setWeatherReminder] = useState(false);
  const [labelReminder, setLabelReminder] = useState(false);
  const [backupSound, setBackupSound] = useState(false);

  // Modal visibility states
  const [modalStates, setModalStates] = useState({
    taskModal: false,
    findHousehold: false,
    tapChallenge: false,
    typing: false,
    findColors: false,
    math: false,
    shake: false,
    steps: false,
    squat: false,
    qrCode: false,
    qrScanner: false,
    photoModal: false,
    photoCamera: false,
    gentleWake: false,
  });

  // Task configuration states
  const [taskConfigs, setTaskConfigs] = useState({
    findHouseholdItemCount: 20,
    tapChallengeCount: 50,
    typingCount: 5,
    typingPhraseCount: 40,
    findColorsDifficulty: 4,
    findColorsRoundCount: 5,
    mathDifficulty: 6,
    mathRoundCount: 5,
    shakeCount: 5,
    stepsCount: 5,
    squatCount: 5,
  });

  // Task data states
  const [scanComplete, setScanComplete] = useState(false);
  const [tapAnimCount, setTapAnimCount] = useState(0);
  const [tapCleared, setTapCleared] = useState(false);
  const [qrCodes, setQrCodes] = useState<{id: string, name: string, code: string}[]>([]);
  const [selectedQRCodeId, setSelectedQRCodeId] = useState<string | null>(null);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [photos, setPhotos] = useState<{id: string, uri: string}[]>([]);
  const [selectedPhotoUri, setSelectedPhotoUri] = useState<string | null>(null);
  const [qrContextMenu, setQrContextMenu] = useState<{visible: boolean, targetId: string | null}>({
    visible: false,
    targetId: null
  });

  const [permission, requestPermission] = useCameraPermissions();

  // Modal convenience setters
  const setShowTaskModal = (v: boolean) => setModalStates(s => ({ ...s, taskModal: v }));
  const setShowFindHouseholdModal = (v: boolean) => setModalStates(s => ({ ...s, findHousehold: v }));
  const setShowTapChallengeModal = (v: boolean) => setModalStates(s => ({ ...s, tapChallenge: v }));
  const setShowTypingModal = (v: boolean) => setModalStates(s => ({ ...s, typing: v }));
  const setShowFindColorsModal = (v: boolean) => setModalStates(s => ({ ...s, findColors: v }));
  const setShowMathModal = (v: boolean) => setModalStates(s => ({ ...s, math: v }));
  const setShowShakeModal = (v: boolean) => setModalStates(s => ({ ...s, shake: v }));
  const setShowStepsModal = (v: boolean) => setModalStates(s => ({ ...s, steps: v }));
  const setShowSquatModal = (v: boolean) => setModalStates(s => ({ ...s, squat: v }));
  const setShowQRCodeModal = (v: boolean) => setModalStates(s => ({ ...s, qrCode: v }));
  const setShowQRScanner = (v: boolean) => setModalStates(s => ({ ...s, qrScanner: v }));
  const setShowPhotoModal = (v: boolean) => setModalStates(s => ({ ...s, photoModal: v }));
  const setShowPhotoCamera = (v: boolean) => setModalStates(s => ({ ...s, photoCamera: v }));
  const setShowGentleWakeModal = (v: boolean) => setModalStates(s => ({ ...s, gentleWake: v }));

  // Task config convenience getters and setters
  const findHouseholdItemCount = taskConfigs.findHouseholdItemCount;
  const tapChallengeCount = taskConfigs.tapChallengeCount;
  const typingCount = taskConfigs.typingCount;
  const typingPhraseCount = taskConfigs.typingPhraseCount;
  const findColorsDifficulty = taskConfigs.findColorsDifficulty;
  const findColorsRoundCount = taskConfigs.findColorsRoundCount;
  const mathDifficulty = taskConfigs.mathDifficulty;
  const mathRoundCount = taskConfigs.mathRoundCount;
  const shakeCount = taskConfigs.shakeCount;
  const stepsCount = taskConfigs.stepsCount;
  const squatCount = taskConfigs.squatCount;

  // Helper to update taskConfigs
  const updateTaskConfig = (key: keyof typeof taskConfigs, value: any) => {
    setTaskConfigs(prev => ({ ...prev, [key]: value }));
  };

  // Modal state getters
  const showTaskModal = modalStates.taskModal;
  const showFindHouseholdModal = modalStates.findHousehold;
  const showTapChallengeModal = modalStates.tapChallenge;
  const showTypingModal = modalStates.typing;
  const showFindColorsModal = modalStates.findColors;
  const showMathModal = modalStates.math;
  const showShakeModal = modalStates.shake;
  const showStepsModal = modalStates.steps;
  const showSquatModal = modalStates.squat;
  const showQRCodeModal = modalStates.qrCode;
  const showQRScanner = modalStates.qrScanner;
  const showPhotoModal = modalStates.photoModal;
  const showPhotoCamera = modalStates.photoCamera;
  const showGentleWakeModal = modalStates.gentleWake;

  // Task config setter functions
  const setFindColorsDifficulty = (v: number) => updateTaskConfig('findColorsDifficulty', v);
  const setFindColorsRoundCount = (v: number) => updateTaskConfig('findColorsRoundCount', v);
  const setMathDifficulty = (v: number) => updateTaskConfig('mathDifficulty', v);
  const setMathRoundCount = (v: number) => updateTaskConfig('mathRoundCount', v);
  const setTypingCount = (v: number) => updateTaskConfig('typingCount', v);
  const setShakeCount = (v: number) => updateTaskConfig('shakeCount', v);
  const setStepsCount = (v: number) => updateTaskConfig('stepsCount', v);
  const setSquatCount = (v: number) => updateTaskConfig('squatCount', v);
  
  // Animation refs
  const animRefs = useRef({
    scanLine: new Animated.Value(0),
    checkmarkScale: new Animated.Value(0),
    tapButtonScale: new Animated.Value(1),
    clearTextScale: new Animated.Value(0),
    shakeAnim: new Animated.Value(0),
    stepsAnim: new Animated.Value(0),
    squatAnim: new Animated.Value(0),
  }).current;

  const cameraRef = useRef<any>(null);

  // UI and scroll refs
  const emojiInputRef = useRef<TextInput>(null);
  const sliderWidthRef = useRef(0);
  const startVolumeRef = useRef(0);
  const volumeRef = useRef(volume);
  
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

  // Load existing alarm when editing
  useEffect(() => {
    if (alarmId) {
      const loadAlarm = async () => {
        const alarms = await AlarmManager.loadAlarms();
        const alarm = alarms.find(a => a.id === alarmId);
        if (alarm) {
          setSelectedHour(alarm.hour);
          setSelectedMinute(alarm.minute);
          setAlarmName(alarm.label);
          setAlarmIcon(alarm.icon);
          setSelectedDays(alarm.days);
          setVolume(alarm.volume / 100);
          setVibrationEnabled(alarm.vibration);
          setGentleWake(alarm.gentleWake);
          setSnoozeEnabled(alarm.snoozeSettings.enabled);
          setSnoozeInterval(alarm.snoozeSettings.interval);
          setMaxSnoozeCount(alarm.snoozeSettings.maxCount);

          // Load tasks into slots
          const newTasks: (AlarmTask | null)[] = [null, null, null, null, null];
          alarm.tasks.forEach((t, i) => {
            if (i < 5) newTasks[i] = t;
          });
          setAlarmTasks(newTasks);
        }
      };
      loadAlarm();
    }
  }, [alarmId]);

  // Start tap animation when modal opens
  useEffect(() => {
    if (showTapChallengeModal) {
      setTapAnimCount(0);
      setTapCleared(false);
      animRefs.clearTextScale.setValue(0);
      
      // Simulate 50 taps in 5 seconds (100ms per tap)
      let currentCount = 0;
      const tapInterval = setInterval(() => {
        currentCount++;
        setTapAnimCount(currentCount);
        
        // Button pulse animation
        Animated.sequence([
          Animated.timing(animRefs.tapButtonScale, {
            toValue: 0.85,
            duration: 40,
            useNativeDriver: true,
          }),
          Animated.timing(animRefs.tapButtonScale, {
            toValue: 1,
            duration: 40,
            useNativeDriver: true,
          }),
        ]).start();
        
        if (currentCount >= 50) {
          clearInterval(tapInterval);
          setTapCleared(true);
          // Animate CLEAR text appearance
          Animated.spring(animRefs.clearTextScale, {
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

  // Start shake animation when modal opens
  useEffect(() => {
    if (showShakeModal) {
      const shakeAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(animRefs.shakeAnim, {
            toValue: 1,
            duration: 80,
            useNativeDriver: true,
          }),
          Animated.timing(animRefs.shakeAnim, {
            toValue: -1,
            duration: 80,
            useNativeDriver: true,
          }),
        ])
      );
      shakeAnimation.start();
      return () => shakeAnimation.stop();
    } else {
      animRefs.shakeAnim.setValue(0);
    }
  }, [showShakeModal]);

  // Start walking animation when steps modal opens
  useEffect(() => {
    if (showStepsModal) {
      animRefs.stepsAnim.setValue(0);
      const walkAnimation = Animated.loop(
        Animated.timing(animRefs.stepsAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      walkAnimation.start();
      return () => walkAnimation.stop();
    } else {
      animRefs.stepsAnim.setValue(0);
    }
  }, [showStepsModal]);

  // Start squat animation when modal opens
  useEffect(() => {
    if (showSquatModal) {
      const squatAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(animRefs.squatAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(animRefs.squatAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      squatAnimation.start();
      return () => squatAnimation.stop();
    } else {
      animRefs.squatAnim.setValue(0);
    }
  }, [showSquatModal]);
  
  // Start scan animation when modal opens
  useEffect(() => {
    if (showFindHouseholdModal) {
      setScanComplete(false);
      animRefs.checkmarkScale.setValue(0);
      
      // Scanning animation loop
      const scanAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(animRefs.scanLine, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
            easing: Easing.linear,
          }),
          Animated.timing(animRefs.scanLine, {
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
        Animated.spring(animRefs.checkmarkScale, {
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
  
  // Get snooze display text
  const getSnoozeDisplayText = () => {
    if (!snoozeEnabled) return 'Tắt';
    const countText = maxSnoozeCount === 'unlimited' ? 'Vô hạn' : `${maxSnoozeCount} lần`;
    return `${snoozeInterval} phút, ${countText}`;
  };

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

  const handleClose = () => {
    router.replace('/');
  };

  const handleSave = async () => {
    // Filter out empty task slots
    const activeTasks = alarmTasks.filter(t => t !== null) as AlarmTask[];

    const alarmData: Omit<Alarm, 'id' | 'createdAt'> = {
      hour: selectedHour,
      minute: selectedMinute,
      enabled: true,
      label: alarmName || 'Báo thức',
      icon: alarmIcon,
      days: selectedDays.length === 0 ? [] : selectedDays,
      volume: Math.round(volume * 100),
      vibration: vibrationEnabled,
      gentleWake: gentleWake,
      tasks: activeTasks,
      snoozeSettings: {
        enabled: snoozeEnabled,
        interval: snoozeInterval,
        maxCount: maxSnoozeCount,
      },
      type: 'regular',
    };

    console.log('💾 Saving alarm:', alarmData);

    if (alarmId) {
      // Update existing alarm
      console.log('✏️ Updating alarm with ID:', alarmId);
      await AlarmManager.updateAlarm(alarmId, alarmData);
    } else {
      // Add new alarm
      console.log('➕ Adding new alarm');
      await AlarmManager.addAlarm(alarmData);
    }

    console.log('✅ Alarm saved, navigating back to home');
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
  
  // Handle selecting "Gõ văn bản" task
  const handleSelectTyping = () => {
    setShowTaskModal(false);
    setShowTypingModal(true);
  };
  
  // Handle completing the typing task
  const handleCompleteTyping = () => {
    const newTask: AlarmTask = {
      id: `typing_${Date.now()}`,
      type: 'typing',
      name: `${typingCount} vòng...`,
      icon: 'keypad',
      iconColor: '#3a5a5f',
      settings: {
        itemCount: typingCount,
      },
    };
    addTaskToSlot(newTask);
    setShowTypingModal(false);
  };
  
  // Handle selecting "Tìm các ô màu" task
  const handleSelectFindColors = () => {
    setShowTaskModal(false);
    setShowFindColorsModal(true);
  };
  
  // Get difficulty label
  const getDifficultyLabel = (level: number) => {
    const labels = ['Rất dễ', 'Dễ', 'Trung bình', 'Khó', 'Rất khó'];
    return labels[level] || 'Trung bình';
  };
  
  // Handle completing the find colors task
  const handleCompleteFindColors = () => {
    const newTask: AlarmTask = {
      id: `find_colors_${Date.now()}`,
      type: 'find_colors',
      name: `${findColorsRoundCount} vòng...`,
      icon: 'grid',
      iconColor: '#3a5a5f',
      settings: {
        itemCount: findColorsRoundCount,
        difficulty: findColorsDifficulty,
      },
    };
    addTaskToSlot(newTask);
    setShowFindColorsModal(false);
  };
  
  // Handle selecting "Giải toán" task
  const handleSelectMath = () => {
    setShowTaskModal(false);
    setShowMathModal(true);
  };
  
  // Get math difficulty label
  const getMathDifficultyLabel = (level: number) => {
    const labels = ['Rất dễ', 'Dễ', 'Trung bình', 'Khó', 'Rất khó', 'Siêu khó', 'Cực kì khó'];
    return labels[level] || 'Trung bình';
  };
  
  // Get math example based on difficulty
  const getMathExample = (level: number) => {
    const examples = [
      '3+4=',           // Rất dễ
      '14+2=',          // Dễ
      '23+17=',         // Trung bình
      '43+23+34=',      // Khó
      '(72x6)+32=',     // Rất khó
      '(37x11)+321=',   // Siêu khó
      '(167x87)+1878=', // Cực kì khó
    ];
    return examples[level] || examples[2];
  };
  
  // Handle completing the math task
  const handleCompleteMath = () => {
    const newTask: AlarmTask = {
      id: `math_${Date.now()}`,
      type: 'math',
      name: `${mathRoundCount} vòng...`,
      icon: 'calculator',
      iconColor: '#3a5a5f',
      settings: {
        itemCount: mathRoundCount,
        difficulty: mathDifficulty,
      },
    };
    addTaskToSlot(newTask);
    setShowMathModal(false);
  };

  // Handle selecting "Lắc điện thoại" task
  const handleSelectShake = () => {
    setShowTaskModal(false);
    setShowShakeModal(true);
  };

  // Handle completing the shake task
  const handleCompleteShake = () => {
    const newTask: AlarmTask = {
      id: `shake_${Date.now()}`,
      type: 'shake',
      name: `${shakeCount} lần`,
      icon: 'vibrate',
      iconColor: '#4a3a6e',
      settings: {
        itemCount: shakeCount,
      },
    };
    addTaskToSlot(newTask);
    setShowShakeModal(false);
  };

  // Handle selecting "Bước" task
  const handleSelectSteps = () => {
    setShowTaskModal(false);
    setShowStepsModal(true);
  };

  // Handle completing the steps task
  const handleCompleteSteps = () => {
    const newTask: AlarmTask = {
      id: `steps_${Date.now()}`,
      type: 'steps',
      name: `${stepsCount} bước`,
      icon: 'walk',
      iconColor: '#4a3a6e',
      settings: {
        itemCount: stepsCount,
      },
    };
    addTaskToSlot(newTask);
    setShowStepsModal(false);
  };

  // Handle selecting "Squat" task
  const handleSelectSquat = () => {
    setShowTaskModal(false);
    setShowSquatModal(true);
  };

  // Handle completing the squat task
  const handleCompleteSquat = () => {
    const newTask: AlarmTask = {
      id: `squat_${Date.now()}`,
      type: 'squat',
      name: `${squatCount} lần`,
      icon: 'arm-flex',
      iconColor: '#e11d48',
      settings: {
        itemCount: squatCount,
      },
    };
    addTaskToSlot(newTask);
    setShowSquatModal(false);
  };

  // Handle selecting "Mã QR/Mã vạch" task
  const handleSelectQRCode = () => {
    setShowTaskModal(false);
    setShowQRCodeModal(true);
  };

  // Handle completing the QR code task
  const handleCompleteQRCodeTask = () => {
    if (selectedQRCodeId) {
      const selectedCode = qrCodes.find(c => c.id === selectedQRCodeId);
      if (selectedCode) {
        const newTask: AlarmTask = {
          id: `qrcode_${Date.now()}`,
          type: 'qr_code',
          name: selectedCode.name,
          icon: 'qr-code',
          iconColor: '#6366f1',
          settings: {
            code: selectedCode.code,
          },
        };
        addTaskToSlot(newTask);
        setShowQRCodeModal(false);
      }
    }
  };

  // Handle deleting a QR code
  const handleDeleteQRCode = (id: string) => {
    setQrCodes(prev => prev.filter(c => c.id !== id));
    if (selectedQRCodeId === id) {
      setSelectedQRCodeId(null);
    }
    setQrContextMenu({ visible: false, targetId: null });
  };

  // Handle barcode scanned
  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (showQRScanner) {
      const newItem = { id: Date.now().toString(), name: data, code: data };
      setQrCodes(prev => [...prev, newItem]);
      setSelectedQRCodeId(newItem.id);
      setShowQRScanner(false);
      setShowQRCodeModal(true);
      setIsTorchOn(false); // Turn off flash after scan
      animRefs.scanLine.stopAnimation();
    }
  };

  // Handle start scan
  const handleStartScan = async () => {
    if (!permission || !permission.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        alert('Cần quyền truy cập camera để quét mã');
        return;
      }
    }

    setShowQRCodeModal(false);
    setShowQRScanner(true);
    setIsTorchOn(false);
    
    // Reset and start scan animation
    animRefs.scanLine.setValue(0);
    Animated.loop(
      Animated.sequence([
        Animated.timing(animRefs.scanLine, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(animRefs.scanLine, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        })
      ])
    ).start();
  };

  // Handle selecting "Ảnh chụp" task
  const handleSelectPhoto = () => {
    setShowTaskModal(false);
    setShowPhotoModal(true);
  };

  // Handle start photo camera
  const handleStartPhotoCamera = async () => {
    if (!permission || !permission.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        alert('Cần quyền truy cập camera để chụp ảnh');
        return;
      }
    }
    setShowPhotoModal(false);
    setShowPhotoCamera(true);
  };

  // Handle completing the photo task
  const handleCompletePhotoTask = () => {
    if (selectedPhotoUri) {
      const newTask: AlarmTask = {
        id: `photo_${Date.now()}`,
        type: 'photo',
        name: 'Ảnh chụp',
        icon: 'camera',
        iconColor: '#a855f7',
        settings: {
          uri: selectedPhotoUri,
        },
      };
      addTaskToSlot(newTask);
      setShowPhotoModal(false);
    }
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
                          translateY: animRefs.scanLine.interpolate({
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
                        transform: [{ scale: animRefs.checkmarkScale }],
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
                    { transform: [{ scale: animRefs.clearTextScale }] }
                  ]}
                >
                  CLEAR!
                </Animated.Text>
              )}
              
              {/* Tap button with pulse animation */}
              <Animated.View 
                style={[
                  styles.tapButton,
                  { transform: [{ scale: animRefs.tapButtonScale }] }
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

  // Render Typing Task Modal
  const renderTypingModal = () => {
    // Generate typing count array for picker (1-99)
    const typingCountArray = Array.from({ length: 10 }, (_, i) => i + 1);
    
    return (
      <Modal
        visible={showTypingModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTypingModal(false)}
      >
        <View style={styles.taskModalOverlay}>
          <View style={styles.typingModalContent}>
            {/* Header */}
            <View style={styles.findHouseholdHeader}>
              <TouchableOpacity onPress={() => {
                setShowTypingModal(false);
                setShowTaskModal(true);
              }}>
                <Ionicons name="chevron-back" size={24} color="#ffffff" />
              </TouchableOpacity>
              <Text style={styles.findHouseholdTitle}>Gõ văn bản</Text>
              <TouchableOpacity onPress={() => setShowTypingModal(false)}>
                <Ionicons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>

            {/* Preview Area */}
            <View style={styles.typingPreviewArea}>
              {/* Example badge */}
              <View style={styles.typingExampleBadge}>
                <Text style={styles.typingExampleText}>Ví dụ</Text>
              </View>
              
              {/* Example Text */}
              <Text style={styles.typingExamplePhrase}>Choose hope</Text>
            </View>

            {/* Count Picker Card */}
            <View style={styles.typingCountCard}>
              <NumberPicker 
                data={typingCountArray}
                initialValue={typingCount}
                onValueChange={setTypingCount}
                unit="lần"
              />
            </View>

            {/* Choose Phrase Row */}
            <TouchableOpacity style={styles.selectItemsRow}>
              <Text style={styles.selectItemsLabel}>Chọn cụm từ</Text>
              <View style={styles.selectItemsRight}>
                <Text style={styles.selectItemsValue}>{typingPhraseCount} cụm từ</Text>
              </View>
            </TouchableOpacity>

            {/* Bottom Buttons */}
            <View style={styles.findHouseholdButtons}>
              <TouchableOpacity style={styles.previewButton}>
                <Text style={styles.previewButtonText}>Xem trước</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.completeButton}
                onPress={handleCompleteTyping}
              >
                <Text style={styles.completeButtonText}>Hoàn tất</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // Render Find Colors Modal
  const renderFindColorsModal = () => {
    // Grid configuration based on difficulty
    const getGridConfig = (level: number) => {
      switch (level) {
        case 0: return { rows: 3, cols: 3, highlighted: [[0, 0], [1, 0], [1, 1]] }; // Rất dễ
        case 1: return { rows: 4, cols: 4, highlighted: [[0, 0], [1, 1], [2, 2], [3, 0], [3, 1]] }; // Dễ
        case 2: return { rows: 4, cols: 4, highlighted: [[0, 1], [0, 2], [1, 0], [1, 1], [1, 3], [2, 2], [3, 0], [3, 1]] }; // Trung bình
        case 3: return { rows: 5, cols: 5, highlighted: [[0, 1], [0, 2], [1, 0], [1, 1], [2, 2], [3, 2], [3, 3], [4, 0], [4, 1]] }; // Khó
        case 4: return { rows: 6, cols: 5, highlighted: [[0, 0], [0, 1], [1, 2], [1, 3], [2, 1], [2, 2], [3, 2], [3, 3], [4, 0], [4, 1], [5, 2]] }; // Rất khó
        default: return { rows: 4, cols: 4, highlighted: [[0, 1], [1, 0], [1, 1], [2, 2]] };
      }
    };

    const gridConfig = getGridConfig(findColorsDifficulty);
    
    const isHighlighted = (row: number, col: number) => {
      return gridConfig.highlighted.some(([r, c]) => r === row && c === col);
    };

    const renderGrid = () => {
      const rows = [];
      for (let r = 0; r < gridConfig.rows; r++) {
        const cols = [];
        for (let c = 0; c < gridConfig.cols; c++) {
          cols.push(
            <View 
              key={`${r}-${c}`}
              style={[
                styles.colorGridCell,
                isHighlighted(r, c) && styles.colorGridCellHighlighted,
              ]}
            />
          );
        }
        rows.push(
          <View key={r} style={styles.colorGridRow}>
            {cols}
          </View>
        );
      }
      return rows;
    };

    return (
      <Modal
        visible={showFindColorsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFindColorsModal(false)}
      >
        <View style={styles.taskModalOverlay}>
          <View style={styles.findColorsModalContent}>
            {/* Header */}
            <View style={styles.findHouseholdHeader}>
              <TouchableOpacity onPress={() => {
                setShowFindColorsModal(false);
                setShowTaskModal(true);
              }}>
                <Ionicons name="chevron-back" size={24} color="#ffffff" />
              </TouchableOpacity>
              <Text style={styles.findHouseholdTitle}>Tìm các ô màu</Text>
              <TouchableOpacity onPress={() => setShowFindColorsModal(false)}>
                <Ionicons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {/* Preview Area */}
              <View style={styles.findColorsPreviewArea}>
                {/* Example badge */}
                <View style={styles.typingExampleBadge}>
                  <Text style={styles.typingExampleText}>Ví dụ</Text>
                </View>
                
                {/* Color Grid */}
                <View style={styles.colorGrid}>
                  {renderGrid()}
                </View>
              </View>

              {/* Difficulty Card */}
              <View style={styles.difficultyCard}>
                <Text style={styles.difficultyTitle}>{getDifficultyLabel(findColorsDifficulty)}</Text>
                
                {/* Slider */}
                <View style={styles.difficultySliderContainer}>
                  <Slider
                    style={styles.difficultySlider}
                    minimumValue={0}
                    maximumValue={4}
                    step={1}
                    value={findColorsDifficulty}
                    onValueChange={setFindColorsDifficulty}
                    minimumTrackTintColor="#3b82f6"
                    maximumTrackTintColor="#475569"
                    thumbTintColor="#ffffff"
                  />
                  {/* Dots */}
                  <View style={styles.difficultyDots}>
                    {[0, 1, 2, 3, 4].map((i) => (
                      <View 
                        key={i} 
                        style={[
                          styles.difficultyDot,
                          i <= findColorsDifficulty && styles.difficultyDotActive,
                        ]} 
                      />
                    ))}
                  </View>
                </View>
                
                <View style={styles.difficultyLabels}>
                  <Text style={styles.difficultyLabelText}>Dễ</Text>
                  <Text style={styles.difficultyLabelText}>Khó</Text>
                </View>
              </View>

              {/* Round Count Picker Card */}
              <View style={styles.typingCountCard}>
                <NumberPicker 
                  data={Array.from({ length: 10 }, (_, i) => i + 1)}
                  initialValue={findColorsRoundCount}
                  onValueChange={setFindColorsRoundCount}
                  unit="vòng"
                />
              </View>

              {/* Bottom Buttons */}
              <View style={styles.findHouseholdButtons}>
                <TouchableOpacity style={styles.previewButton}>
                  <Text style={styles.previewButtonText}>Xem trước</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.completeButton}
                  onPress={handleCompleteFindColors}
                >
                  <Text style={styles.completeButtonText}>Hoàn tất</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  // Render Math Task Modal
  const renderMathModal = () => {
    return (
      <Modal
        visible={showMathModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowMathModal(false)}
      >
        <View style={styles.taskModalOverlay}>
          <View style={styles.findColorsModalContent}>
            {/* Header */}
            <View style={styles.findHouseholdHeader}>
              <TouchableOpacity onPress={() => {
                setShowMathModal(false);
                setShowTaskModal(true);
              }}>
                <Ionicons name="chevron-back" size={24} color="#ffffff" />
              </TouchableOpacity>
              <Text style={styles.findHouseholdTitle}>Giải toán</Text>
              <TouchableOpacity onPress={() => setShowMathModal(false)}>
                <Ionicons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {/* Preview Area with Math Example */}
              <View style={styles.mathPreviewArea}>
                {/* Example badge */}
                <View style={styles.typingExampleBadge}>
                  <Text style={styles.typingExampleText}>Ví dụ</Text>
                </View>
                
                {/* Math Example */}
                <Text style={styles.mathExample}>{getMathExample(mathDifficulty)}</Text>
              </View>

              {/* Difficulty Card */}
              <View style={styles.difficultyCard}>
                <Text style={styles.difficultyTitle}>{getMathDifficultyLabel(mathDifficulty)}</Text>
                
                {/* Slider */}
                <View style={styles.difficultySliderContainer}>
                  <Slider
                    style={styles.difficultySlider}
                    minimumValue={0}
                    maximumValue={6}
                    step={1}
                    value={mathDifficulty}
                    onValueChange={setMathDifficulty}
                    minimumTrackTintColor="#3b82f6"
                    maximumTrackTintColor="#475569"
                    thumbTintColor="#ffffff"
                  />
                  {/* Dots */}
                  <View style={styles.difficultyDots}>
                    {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                      <View 
                        key={i} 
                        style={[
                          styles.difficultyDot,
                          i <= mathDifficulty && styles.difficultyDotActive,
                        ]} 
                      />
                    ))}
                  </View>
                </View>
                
                <View style={styles.difficultyLabels}>
                  <Text style={styles.difficultyLabelText}>Dễ</Text>
                  <Text style={styles.difficultyLabelText}>Khó</Text>
                </View>
              </View>

              {/* Round Count Picker Card */}
              <View style={styles.typingCountCard}>
                <NumberPicker 
                  data={Array.from({ length: 10 }, (_, i) => i + 1)}
                  initialValue={mathRoundCount}
                  onValueChange={setMathRoundCount}
                  unit="vòng"
                />
              </View>

              {/* Bottom Buttons */}
              <View style={styles.findHouseholdButtons}>
                <TouchableOpacity style={styles.previewButton}>
                  <Text style={styles.previewButtonText}>Xem trước</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.completeButton}
                  onPress={handleCompleteMath}
                >
                  <Text style={styles.completeButtonText}>Hoàn tất</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  // Render Shake phone modal
  const renderShakeModal = () => {
    return (
      <Modal
        visible={showShakeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowShakeModal(false)}
      >
        <View style={styles.taskModalOverlay}>
          <View style={styles.findColorsModalContent}>
            {/* Header */}
            <View style={styles.findHouseholdHeader}>
              <TouchableOpacity onPress={() => {
                setShowShakeModal(false);
                setShowTaskModal(true);
              }}>
                <Ionicons name="chevron-back" size={24} color="#ffffff" />
              </TouchableOpacity>
              <Text style={styles.findHouseholdTitle}>Lắc điện thoại</Text>
              <TouchableOpacity onPress={() => setShowShakeModal(false)}>
                <Ionicons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {/* Preview Area with Shake Animation */}
              <View style={styles.shakePreviewArea}>
                <Animated.View style={{
                  transform: [
                    { translateX: animRefs.shakeAnim.interpolate({
                        inputRange: [-1, 1],
                        outputRange: [-20, 20]
                      })
                    },
                    { rotate: animRefs.shakeAnim.interpolate({
                        inputRange: [-1, 1],
                        outputRange: ['-15deg', '15deg']
                      })
                    }
                  ]
                }}>
                  <MaterialCommunityIcons name="cellphone" size={120} color="#ffffff" />
                </Animated.View>
              </View>

              {/* Shake Count Picker Card */}
              <View style={styles.typingCountCard}>
                <NumberPicker 
                  data={Array.from({ length: 20 }, (_, i) => (i + 1) * 5)}
                  initialValue={shakeCount}
                  onValueChange={setShakeCount}
                  unit="lần"
                />
              </View>

              {/* Bottom Buttons */}
              <View style={styles.findHouseholdButtons}>
                <TouchableOpacity style={styles.previewButton}>
                  <Text style={styles.previewButtonText}>Xem trước</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.completeButton}
                  onPress={handleCompleteShake}
                >
                  <Text style={styles.completeButtonText}>Hoàn tất</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  // Render Steps modal
  const renderStepsModal = () => {
    return (
      <Modal
        visible={showStepsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowStepsModal(false)}
      >
        <View style={styles.taskModalOverlay}>
          <View style={styles.findColorsModalContent}>
            {/* Header */}
            <View style={styles.findHouseholdHeader}>
              <TouchableOpacity onPress={() => {
                setShowStepsModal(false);
                setShowTaskModal(true);
              }}>
                <Ionicons name="chevron-back" size={24} color="#ffffff" />
              </TouchableOpacity>
              <Text style={styles.findHouseholdTitle}>Bước</Text>
              <TouchableOpacity onPress={() => setShowStepsModal(false)}>
                <Ionicons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {/* Preview Area with Walking Animation */}
              <View style={styles.shakePreviewArea}>
                {/* Moving Ground (Road) */}
                <View style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 60,
                  backgroundColor: '#293547',
                  zIndex: 0,
                }}>
                   {/* Moving Stripes */}
                   <Animated.View style={{
                     flexDirection: 'row',
                     position: 'absolute',
                     top: 20,
                     left: 0,
                     transform: [{
                       translateX: animRefs.stepsAnim.interpolate({
                         inputRange: [0, 1],
                         outputRange: [0, -50] // Pattern width: 20 (width) + 30 (margin)
                       })
                     }]
                   }}>
                     {Array.from({length: 20}).map((_, i) => (
                       <View key={i} style={{
                         width: 20,
                         height: 4,
                         borderRadius: 2,
                         backgroundColor: '#475569',
                         marginRight: 30,
                       }} />
                     ))}
                   </Animated.View>
                </View>

                {/* Walking Person */}
                <Animated.View style={{
                  zIndex: 10,
                  marginBottom: 10,
                  transform: [
                    { translateY: animRefs.stepsAnim.interpolate({
                        inputRange: [0, 0.25, 0.5, 0.75, 1],
                        outputRange: [0, -10, 0, -10, 0]
                      })
                    },
                    { rotate: animRefs.stepsAnim.interpolate({
                        inputRange: [0, 0.25, 0.5, 0.75, 1],
                        outputRange: ['5deg', '0deg', '5deg', '10deg', '5deg'] // Lean forward
                      })
                    }
                  ]
                }}>
                  {/* Walking Person - Frame Animation */}
                  <View>
                    <Animated.View style={{
                      opacity: animRefs.stepsAnim.interpolate({
                        inputRange: [0, 0.49, 0.5, 1],
                        outputRange: [1, 1, 0, 0]
                      })
                    }}>
                      <MaterialCommunityIcons name="walk" size={120} color="#ffffff" />
                    </Animated.View>
                    <Animated.View style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      opacity: animRefs.stepsAnim.interpolate({
                        inputRange: [0, 0.49, 0.5, 1],
                        outputRange: [0, 0, 1, 1]
                      })
                    }}>
                      <MaterialCommunityIcons name="run" size={120} color="#ffffff" />
                    </Animated.View>
                  </View>
                  
                  {/* Phone in hand (simulated) */}
                  <Animated.View style={{
                    position: 'absolute',
                    top: 40,
                    right: 45,
                    transform: [
                      { rotate: animRefs.stepsAnim.interpolate({
                          inputRange: [0, 0.25, 0.5, 0.75, 1],
                          outputRange: ['0deg', '25deg', '0deg', '25deg', '0deg']
                        })
                      }
                    ]
                  }}>
                    <MaterialCommunityIcons name="cellphone" size={30} color="#ffffff" />
                  </Animated.View>
                </Animated.View>
              </View>

              {/* Steps Count Picker Card */}
              <View style={styles.typingCountCard}>
                <NumberPicker 
                  data={Array.from({ length: 20 }, (_, i) => (i + 1) * 5)}
                  initialValue={stepsCount}
                  onValueChange={setStepsCount}
                  unit="bước"
                />
              </View>

              {/* Bottom Buttons */}
              <View style={styles.findHouseholdButtons}>
                <TouchableOpacity style={styles.previewButton}>
                  <Text style={styles.previewButtonText}>Xem trước</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.completeButton}
                  onPress={handleCompleteSteps}
                >
                  <Text style={styles.completeButtonText}>Hoàn tất</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  // Render Squat modal
  const renderSquatModal = () => {
    return (
      <Modal
        visible={showSquatModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSquatModal(false)}
      >
        <View style={styles.taskModalOverlay}>
          <View style={styles.findColorsModalContent}>
            {/* Header */}
            <View style={styles.findHouseholdHeader}>
              <TouchableOpacity onPress={() => {
                setShowSquatModal(false);
                setShowTaskModal(true);
              }}>
                <Ionicons name="chevron-back" size={24} color="#ffffff" />
              </TouchableOpacity>
              <Text style={styles.findHouseholdTitle}>Squat</Text>
              <TouchableOpacity onPress={() => setShowSquatModal(false)}>
                <Ionicons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {/* Preview Area with Squat Animation */}
              <View style={styles.shakePreviewArea}>
                <View style={styles.stickFigureOuterContainer}>
                  {/* The Hip is the main pivot and base for the whole figure */}
                  <Animated.View style={[
                    styles.hipJoint,
                    {
                      transform: [
                        { translateY: animRefs.squatAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 50] 
                          }) 
                        },
                        { translateX: animRefs.squatAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, -20]
                          })
                        }
                      ]
                    }
                  ]}>
                    {/* TORSO UNIT - Rotates from the hip */}
                    <Animated.View style={[
                      styles.jointContainer,
                      {
                        transform: [{
                          rotate: animRefs.squatAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', '25deg']
                          })
                        }]
                      }
                    ]}>
                      {/* Visual Torso - anchored at the joint container (hip) */}
                      <View style={[styles.torso, { bottom: 0 }]} />
                      
                      {/* Head - relative to torso top */}
                      <View style={[styles.head, { top: -81, position: 'absolute' }]} />

                      {/* ARMS - rotating from the shoulder area (top of torso) */}
                      <View style={{ position: 'absolute', top: -50, width: 0, height: 0, alignItems: 'center' }}>
                        {/* Back Arm */}
                        <Animated.View style={[
                          styles.jointContainer,
                          { 
                            opacity: 0.4,
                            transform: [{ 
                              rotate: animRefs.squatAnim.interpolate({ 
                                inputRange: [0, 1], 
                                outputRange: ['15deg', '-80deg'] 
                              }) 
                            }] 
                          }
                        ]}>
                          <View style={styles.arm} />
                        </Animated.View>
                        
                        {/* Front Arm */}
                        <Animated.View style={[
                          styles.jointContainer,
                          { 
                            transform: [{ 
                              rotate: animRefs.squatAnim.interpolate({ 
                                inputRange: [0, 1], 
                                outputRange: ['15deg', '-95deg'] 
                              }) 
                            }] 
                          }
                        ]}>
                          <View style={styles.arm} />
                        </Animated.View>
                      </View>
                    </Animated.View>

                    {/* LEGS UNIT - Both pivot from the hip */}
                    
                    {/* Back Leg (dimmer) */}
                    <Animated.View style={[
                      styles.jointContainer,
                      {
                        opacity: 0.4,
                        transform: [{ rotate: animRefs.squatAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['10deg', '-70deg']
                        }) }]
                      }
                    ]}>
                      <View style={[styles.limb, styles.thigh]} />
                      {/* Back Knee */}
                      <Animated.View style={[
                        styles.jointContainer,
                        {
                          top: 40,
                          transform: [{ rotate: animRefs.squatAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', '80deg']
                          }) }]
                        }
                      ]}>
                        <View style={[styles.limb, styles.shin]} />
                      </Animated.View>
                    </Animated.View>

                    {/* Front Leg */}
                    <Animated.View style={[
                      styles.jointContainer,
                      {
                        transform: [{ rotate: animRefs.squatAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['10deg', '-80deg']
                        }) }]
                      }
                    ]}>
                      <View style={[styles.limb, styles.thigh]} />
                      {/* Front Knee */}
                      <Animated.View style={[
                        styles.jointContainer,
                        {
                          top: 40,
                          transform: [{ rotate: animRefs.squatAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', '95deg']
                          }) }]
                        }
                      ]}>
                        <View style={[styles.limb, styles.shin]} />
                      </Animated.View>
                    </Animated.View>
                  </Animated.View>
                  
                  {/* Ground Line */}
                  <View style={styles.squatGroundLine} />
                </View>
              </View>

              {/* Squat Count Picker Card */}
              <View style={styles.typingCountCard}>
                <NumberPicker 
                  data={Array.from({ length: 20 }, (_, i) => (i + 1) * 5)}
                  initialValue={squatCount}
                  onValueChange={setSquatCount}
                  unit="lần"
                />
              </View>

              {/* Bottom Buttons */}
              <View style={styles.findHouseholdButtons}>
                <TouchableOpacity style={styles.previewButton}>
                  <Text style={styles.previewButtonText}>Xem trước</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.completeButton}
                  onPress={handleCompleteSquat}
                >
                  <Text style={styles.completeButtonText}>Hoàn tất</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  // Render QR Code Management Modal
  const renderQRCodeModal = () => {
    return (
      <Modal
        visible={showQRCodeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowQRCodeModal(false)}
      >
        <View style={styles.taskModalOverlay}>
          <View style={styles.qrCodeModalContent}>
            {/* Header */}
            <View style={styles.findHouseholdHeader}>
              <TouchableOpacity onPress={() => {
                setShowQRCodeModal(false);
                setShowTaskModal(true);
              }}>
                <Ionicons name="chevron-back" size={24} color="#ffffff" />
              </TouchableOpacity>
              <Text style={styles.findHouseholdTitle}>Mã QR/Mã vạch</Text>
              <TouchableOpacity onPress={() => setShowQRCodeModal(false)}>
                <Ionicons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              {/* Add Button */}
              <TouchableOpacity style={styles.qrAddButton} onPress={handleStartScan}>
                <Ionicons name="add" size={24} color="#ffffff" />
                <Text style={styles.qrAddButtonText}>Thêm</Text>
              </TouchableOpacity>

              {/* QR Code List */}
              {qrCodes.map(item => (
                <TouchableOpacity 
                  key={item.id} 
                  style={[
                    styles.qrItem,
                    selectedQRCodeId === item.id && styles.qrItemSelected
                  ]}
                  onPress={() => setSelectedQRCodeId(item.id)}
                >
                  <View style={styles.qrItemLeft}>
                    {selectedQRCodeId === item.id && (
                      <View style={styles.qrItemCheck}>
                        <Ionicons name="checkmark-circle" size={24} color="#00f2ff" />
                      </View>
                    )}
                    <Text style={[
                      styles.qrItemText,
                      selectedQRCodeId === item.id && styles.qrItemTextSelected
                    ]}>
                      {item.name}
                    </Text>
                  </View>
                  <TouchableOpacity 
                    onPress={() => setQrContextMenu({ visible: true, targetId: item.id })}
                  >
                    <Ionicons name="ellipsis-vertical" size={20} color="#94a3b8" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Bottom Buttons */}
            <View style={styles.findHouseholdButtons}>
              <TouchableOpacity style={styles.previewButton}>
                <Text style={styles.previewButtonText}>Xem trước</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.completeButton,
                  !selectedQRCodeId && { opacity: 0.5 }
                ]}
                onPress={handleCompleteQRCodeTask}
                disabled={!selectedQRCodeId}
              >
                <Text style={styles.completeButtonText}>Hoàn tất</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Context Menu Overlay */}
        {qrContextMenu.visible && (
          <Modal transparent visible={true} animationType="fade">
            <TouchableWithoutFeedback onPress={() => setQrContextMenu({ visible: false, targetId: null })}>
              <View style={styles.qrContextMenuOverlay}>
                <View style={styles.qrContextMenu}>
                  <TouchableOpacity 
                    style={styles.qrContextItem}
                    onPress={() => handleDeleteQRCode(qrContextMenu.targetId!)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#ffffff" />
                    <Text style={styles.qrContextText}>Xóa</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.qrContextItem}>
                    <Ionicons name="create-outline" size={20} color="#ffffff" />
                    <Text style={styles.qrContextText}>Đổi tên</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        )}
      </Modal>
    );
  };

  // Render QR Scanner Modal (Simulated)
  const renderQRCodeScanner = () => {
    return (
      <Modal
        visible={showQRScanner}
        transparent={false}
        animationType="fade"
        onRequestClose={() => setShowQRScanner(false)}
      >
        <View style={styles.qrScannerContainer}>
          <CameraView 
            style={StyleSheet.absoluteFillObject}
            onBarcodeScanned={handleBarCodeScanned}
            enableTorch={isTorchOn}
            barcodeScannerSettings={{
              barcodeTypes: ['qr', 'ean13', 'ean8', 'code128', 'code39', 'upc_a', 'upc_e'],
            }}
          />
          {/* Header */}
          <View style={styles.qrScannerHeader}>
            <TouchableOpacity onPress={() => {
              setShowQRScanner(false);
              setShowQRCodeModal(true);
              setIsTorchOn(false);
            }}>
              <Ionicons name="close" size={28} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsTorchOn(!isTorchOn)}>
              <Ionicons name={isTorchOn ? "flash" : "flash-off"} size={24} color={isTorchOn ? "#00f2ff" : "#ffffff"} />
            </TouchableOpacity>
          </View>

          {/* Instructions Overlay */}
          <View style={styles.qrScannerOverlayInstructions}>
            <Text style={styles.qrScannerTypeTitle}>Mã QR/Mã vạch</Text>
            <Text style={styles.qrScannerInstruction}>
              Đặt QR/Mã vạch bên trong hình chữ nhật
            </Text>
          </View>

          {/* Scan Area */}
          <View style={styles.qrScanArea}>
            <View style={styles.qrScanFrame}>
              <Animated.View 
                style={[
                  styles.qrScanLine,
                  {
                    transform: [{
                      translateY: animRefs.scanLine.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 180]
                      })
                    }]
                  }
                ]}
              />
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // Render Photo Management Modal
  const renderPhotoModal = () => {
    return (
      <Modal
        visible={showPhotoModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPhotoModal(false)}
      >
        <View style={styles.taskModalOverlay}>
          <View style={styles.photoModalContent}>
            {/* Header */}
            <View style={styles.findHouseholdHeader}>
              <TouchableOpacity onPress={() => {
                setShowPhotoModal(false);
                setShowTaskModal(true);
              }}>
                <Ionicons name="chevron-back" size={24} color="#ffffff" />
              </TouchableOpacity>
              <Text style={styles.findHouseholdTitle}>Ảnh chụp</Text>
              <TouchableOpacity onPress={() => setShowPhotoModal(false)}>
                <Ionicons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              <View style={styles.photoGrid}>
                {/* Add Button Box */}
                <TouchableOpacity style={styles.photoAddBox} onPress={handleStartPhotoCamera}>
                  <Ionicons name="add" size={32} color="#ffffff" />
                  <Text style={styles.photoAddText}>Thêm</Text>
                </TouchableOpacity>

                {/* Photo List */}
                {photos.map(item => (
                  <TouchableOpacity 
                    key={item.id} 
                    style={[
                      styles.photoItemBox,
                      selectedPhotoUri === item.uri && styles.photoItemBoxSelected
                    ]}
                    onPress={() => setSelectedPhotoUri(item.uri)}
                  >
                    <Image 
                      source={{ uri: item.uri }} 
                      style={styles.photoThumbnail} 
                      contentFit="cover"
                    />
                    {selectedPhotoUri === item.uri && (
                      <View style={styles.photoItemCheck}>
                        <Ionicons name="checkmark-sharp" size={40} color="#00f2ff" />
                      </View>
                    )}
                    <TouchableOpacity 
                      style={styles.photoRemoveButton}
                      onPress={() => {
                        setPhotos(prev => prev.filter(p => p.id !== item.id));
                        if (selectedPhotoUri === item.uri) setSelectedPhotoUri(null);
                      }}
                    >
                      <Ionicons name="close-circle" size={20} color="rgba(255,255,255,0.7)" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Bottom Buttons */}
            <View style={styles.findHouseholdButtons}>
              <TouchableOpacity style={styles.previewButton}>
                <Text style={styles.previewButtonText}>Xem trước</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.completeButton,
                  !selectedPhotoUri && { opacity: 0.5 }
                ]}
                onPress={handleCompletePhotoTask}
                disabled={!selectedPhotoUri}
              >
                <Text style={styles.completeButtonText}>Hoàn tất</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // Render Photo Camera Modal
  const renderPhotoCamera = () => {
    const takePicture = async () => {
      if (cameraRef.current) {
        try {
          const photo = await cameraRef.current.takePictureAsync();
          const newItem = { id: Date.now().toString(), uri: photo.uri };
          setPhotos(prev => [...prev, newItem]);
          setSelectedPhotoUri(photo.uri);
          setShowPhotoCamera(false);
          setShowPhotoModal(true);
        } catch (e) {
          console.error("Failed to take picture", e);
        }
      }
    };

    return (
      <Modal
        visible={showPhotoCamera}
        transparent={false}
        animationType="fade"
        onRequestClose={() => setShowPhotoCamera(false)}
      >
        <View style={styles.qrScannerContainer}>
          <CameraView 
            ref={cameraRef}
            style={StyleSheet.absoluteFillObject}
            enableTorch={isTorchOn}
            mode="picture"
          />
          {/* Header */}
          <View style={styles.qrScannerHeader}>
            <TouchableOpacity onPress={() => {
              setShowPhotoCamera(false);
              setShowPhotoModal(true);
              setIsTorchOn(false);
            }}>
              <Ionicons name="close" size={28} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {/* Camera Bottom Controls */}
          <View style={styles.cameraControls}>
            <TouchableOpacity style={styles.cameraSubButton}>
              <Ionicons name="refresh-outline" size={32} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.shutterButton} onPress={takePicture}>
              <View style={styles.shutterButtonInner} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.cameraSubButton} onPress={() => setIsTorchOn(!isTorchOn)}>
              <Ionicons name={isTorchOn ? "flash" : "flash-off"} size={32} color={isTorchOn ? "#00f2ff" : "#ffffff"} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

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
            <TouchableOpacity style={styles.taskItem} onPress={handleSelectFindColors}>
              <View style={[styles.taskIcon, { backgroundColor: '#3a5a5f' }]}>
                <Ionicons name="grid" size={24} color="#ffffff" />
              </View>
              <Text style={styles.taskItemText}>Tìm các ô màu</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.taskItem} onPress={handleSelectTyping}>
              <View style={[styles.taskIcon, { backgroundColor: '#3a5a5f' }]}>
                <Ionicons name="keypad" size={24} color="#ffffff" />
              </View>
              <Text style={styles.taskItemText}>Gõ văn bản</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.taskItem} onPress={handleSelectMath}>
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
            <TouchableOpacity style={styles.taskItem} onPress={handleSelectSteps}>
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

            <TouchableOpacity style={styles.taskItem} onPress={handleSelectQRCode}>
              <View style={[styles.taskIcon, { backgroundColor: '#4a3a6e' }]}>
                <Ionicons name="qr-code" size={24} color="#ffffff" />
              </View>
              <Text style={styles.taskItemText}>Mã QR/Mã vạch</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.taskItem} onPress={handleSelectShake}>
              <View style={[styles.taskIcon, { backgroundColor: '#4a3a6e' }]}>
                <MaterialCommunityIcons name="vibrate" size={24} color="#ffffff" />
              </View>
              <Text style={styles.taskItemText}>Lắc điện thoại</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.taskItem} onPress={handleSelectPhoto}>
              <View style={[styles.taskIcon, { backgroundColor: '#4a3a6e' }]}>
                <Ionicons name="camera" size={24} color="#ffffff" />
              </View>
              <Text style={styles.taskItemText}>Ảnh chụp</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.taskItem} onPress={handleSelectSquat}>
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
      {renderTypingModal()}
      {renderFindColorsModal()}
      {renderMathModal()}
      {renderShakeModal()}
      {renderStepsModal()}
      {renderSquatModal()}
      {renderQRCodeModal()}
      {renderQRCodeScanner()}
      {renderPhotoModal()}
      {renderPhotoCamera()}
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
            <WheelPicker 
              data={hours}
              initialValue={selectedHour}
              onValueChange={setSelectedHour}
            />
            <Text style={styles.timeSeparatorMain}>:</Text>
            <WheelPicker 
              data={minutes}
              initialValue={selectedMinute}
              onValueChange={setSelectedMinute}
            />
          </View>
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
                        {['shake', 'steps', 'squat'].includes(task.type) ? (
                          <MaterialCommunityIcons name={task.icon as any} size={18} color="#ffffff" />
                        ) : (
                          <Ionicons name={task.icon as any} size={18} color="#ffffff" />
                        )}
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
              <Text style={styles.wallpaperText}>IT&apos;S{'\n'}YOU VS YOU</Text>
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
  // Typing Modal styles
  typingModalContent: {
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
    marginTop: 'auto',
  },
  typingPreviewArea: {
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  typingExampleBadge: {
    backgroundColor: '#3b5998',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 24,
  },
  typingExampleText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
  typingExamplePhrase: {
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
  },
  typingCountCard: {
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  typingPickerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typingPickerColumn: {
    width: 100,
    height: 150,
    position: 'relative',
  },
  typingFlatList: {
    flex: 1,
  },
  typingPickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 150,
  },
  typingPickerItem: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typingPickerText: {
    fontSize: 36,
    fontWeight: '400',
    color: '#475569',
  },
  typingPickerTextSelected: {
    fontSize: 42,
    fontWeight: '600',
    color: '#ffffff',
  },
  typingPickerTextFaded: {
    color: '#475569',
  },
  typingCountLabel: {
    fontSize: 20,
    color: '#94a3b8',
    fontWeight: '500',
    marginLeft: 16,
  },
  typingPickerLineTop: {
    position: 'absolute',
    top: 50,
    left: 10,
    right: 10,
    height: 1,
    backgroundColor: '#64748b',
  },
  typingPickerLineBottom: {
    position: 'absolute',
    top: 100,
    left: 10,
    right: 10,
    height: 1,
    backgroundColor: '#64748b',
  },
  typingPickerIndicator: {
    position: 'absolute',
    top: '50%',
    left: 20,
    right: 20,
    height: 2,
    backgroundColor: '#64748b',
    marginTop: -1,
  },
  // Find Colors Modal styles
  findColorsModalContent: {
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
    marginTop: 'auto',
  },
  findColorsPreviewArea: {
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  colorGrid: {
    marginTop: 16,
  },
  colorGridRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  colorGridCell: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: '#475569',
  },
  colorGridCellHighlighted: {
    backgroundColor: '#f59e0b',
  },
  difficultyCard: {
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 24,
    marginBottom: 20,
    alignItems: 'center',
  },
  difficultyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  difficultySliderContainer: {
    width: '100%',
    position: 'relative',
    marginBottom: 8,
  },
  difficultySlider: {
    width: '100%',
    height: 40,
  },
  difficultyDots: {
    position: 'absolute',
    top: 18,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    pointerEvents: 'none',
  },
  difficultyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#475569',
  },
  difficultyDotActive: {
    backgroundColor: '#3b82f6',
  },
  difficultyLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 4,
  },
  difficultyLabelText: {
    fontSize: 14,
    color: '#94a3b8',
  },
  // Math Modal styles
  mathPreviewArea: {
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  mathExample: {
    fontSize: 32,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 16,
  },
  // Shake Modal styles
  shakePreviewArea: {
    backgroundColor: '#334155',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    height: 220,
    overflow: 'hidden',
    position: 'relative',
  },
  // Squat Animation Styles
  stickFigureOuterContainer: {
    width: 200,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginTop: 20,
  },
  hipJoint: {
    position: 'absolute',
    top: 60,
    width: 0,
    height: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  jointContainer: {
    position: 'absolute',
    width: 0,
    height: 0,
    alignItems: 'center',
  },
  shoulderJoint: {
    position: 'absolute',
    top: 5,
    width: 0,
    height: 0,
    alignItems: 'center',
    zIndex: 5,
  },
  limb: {
    position: 'absolute',
    width: 6,
    backgroundColor: '#ffffff',
    borderRadius: 3,
  },
  thigh: {
    height: 40,
    top: 0,
  },
  shin: {
    height: 45,
    top: 0,
  },
  torso: {
    position: 'absolute',
    bottom: 0,
    width: 8,
    height: 55,
    backgroundColor: '#ffffff',
    borderRadius: 4,
    alignItems: 'center',
  },
  head: {
    position: 'absolute',
    top: -30,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#ffffff',
  },
  arm: {
    width: 6,
    height: 35,
    backgroundColor: '#ffffff',
    borderRadius: 3,
  },
  squatGroundLine: {
    position: 'absolute',
    bottom: 25,
    width: 140,
    height: 3,
    backgroundColor: '#475569',
    borderRadius: 2,
  },
  // QR Code Task Styles
  qrCodeModalContent: {
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    height: '60%',
  },
  qrAddButton: {
    backgroundColor: '#334155',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#475569',
  },
  qrAddButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  qrItem: {
    backgroundColor: '#1e293b',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  qrItemSelected: {
    borderColor: '#00f2ff',
    backgroundColor: '#1e293b',
  },
  qrItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  qrItemCheck: {
    marginRight: 10,
  },
  qrItemText: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: '500',
  },
  qrItemTextSelected: {
    color: '#ffffff',
  },
  qrContextMenuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrContextMenu: {
    backgroundColor: '#334155',
    width: 200,
    borderRadius: 12,
    padding: 8,
    elevation: 5,
  },
  qrContextItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  qrContextText: {
    color: '#ffffff',
    fontSize: 16,
    marginLeft: 15,
  },
  qrScannerContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  qrScannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    zIndex: 10,
  },
  qrScannerOverlayInstructions: {
    position: 'absolute',
    top: 120,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  qrScannerTypeTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 40,
    display: 'none', // Based on image 2, title is not always shown or different
  },
  qrScannerInstruction: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  qrScanArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrScanFrame: {
    width: 280,
    height: 180,
    borderWidth: 2,
    borderColor: '#ffffff',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    position: 'relative',
    overflow: 'hidden',
  },
  qrScanLine: {
    width: '100%',
    height: 2,
    backgroundColor: '#00f2ff',
    shadowColor: '#00f2ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
  },
  // Photo Task Styles
  photoModalContent: {
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    height: '60%',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    marginTop: 10,
  },
  photoAddBox: {
    width: (Dimensions.get('window').width - 40 - 15) / 2,
    height: 180,
    backgroundColor: '#334155',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#475569',
  },
  photoAddText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  photoItemBox: {
    width: (Dimensions.get('window').width - 40 - 15) / 2,
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#334155',
  },
  photoItemBoxSelected: {
    borderWidth: 0,
  },
  photoThumbnail: {
    width: '100%',
    height: '100%',
    opacity: 0.6,
  },
  photoItemCheck: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  photoRemoveButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    zIndex: 10,
  },
  cameraControls: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  shutterButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ff4b5c', // Red shutter button like in image 1
  },
  cameraSubButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
