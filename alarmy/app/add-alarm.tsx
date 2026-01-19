import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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
  const [alarmTasks, setAlarmTasks] = useState<string[]>([]);
  const [volume, setVolume] = useState(0.5);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [timePressure, setTimePressure] = useState(false);
  const [weatherReminder, setWeatherReminder] = useState(false);
  const [labelReminder, setLabelReminder] = useState(false);
  const [backupSound, setBackupSound] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showGentleWakeModal, setShowGentleWakeModal] = useState(false);
  const [gentleWake, setGentleWake] = useState('30s'); // 'off', '15s', '30s', '60s', '5m', '10m'
  const [isDragging, setIsDragging] = useState(false);
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
            <TouchableOpacity style={styles.taskItem}>
              <View style={[styles.taskIcon, { backgroundColor: '#7d3a3a' }]}>
                <Ionicons name="search" size={24} color="#ffffff" />
              </View>
              <Text style={styles.taskItemText}>Tìm đồ gia dụng</Text>
              <View style={styles.taskBadgeAI}>
                <Text style={styles.taskBadgeText}>AI</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.taskItem}>
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
            <Text style={styles.sectionCount}>{alarmTasks.length}/5</Text>
          </View>
          
          <View style={{ height: 92, marginBottom: 0 }}>
            <ScrollView 
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.taskButtonsContainer}
              nestedScrollEnabled={true}
            >
              {[0, 1, 2, 3, 4].map((index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.taskButton,
                    index === 0 && styles.taskButtonFirst,
                  ]}
                  onPress={() => setShowTaskModal(true)}
                >
                  <Ionicons name="add" size={28} color={index === 0 ? "#ffffff" : "#64748b"} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Wake Up Check */}
          <TouchableOpacity 
            style={styles.settingRow}
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

          {/* Snooze / Báo lại */}
          <TouchableOpacity 
            style={styles.settingRow}
            activeOpacity={0.5}
            onPress={() => {
              router.push('/snooze-settings');
            }}
          >
            <Text style={styles.settingText}>Báo lại</Text>
            <View style={styles.settingRowRight}>
              <Text style={styles.settingValue}>3 lần</Text>
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
            style={styles.settingRow}
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
          <View style={styles.settingRow}>
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
          <View style={styles.settingRow}>
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
          <View style={styles.settingRow}>
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
          <View style={styles.settingRow}>
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
          <TouchableOpacity style={styles.settingRow}>
            <Text style={styles.settingText}>Báo lại</Text>
            <View style={styles.settingRowRight}>
              <Text style={styles.settingValue}>5 phút, 3 lần</Text>
              <Ionicons name="chevron-forward" size={20} color="#64748b" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingRow}>
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
    borderTopWidth: 1,
    borderTopColor: '#334155',
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
});
