import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
  Modal,
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { SettingsManager } from '@/utils/settings-manager';
import { StatusBar } from 'expo-status-bar';

const autoSilenceOptions = [
  { value: 'off', label: 'Tắt' },
  { value: '1', label: '1 phút' },
  { value: '5', label: '5 phút' },
  { value: '10', label: '10 phút' },
  { value: '20', label: '20 phút' },
  { value: '25', label: '25 phút' },
  { value: '30', label: '30 phút' },
];

const maxMuteLimitOptions = [
  { value: 'off', label: 'Tắt' },
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '4' },
  { value: '5', label: '5' },
];

export default function DismissAlarmTaskScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDarkMode } = useTheme();
  const [muteWhileWorking, setMuteWhileWorking] = useState(true);
  const [autoSilence, setAutoSilence] = useState('off');
  const [showAutoSilenceModal, setShowAutoSilenceModal] = useState(false);
  const [maxMuteLimit, setMaxMuteLimit] = useState('3');
  const [showMaxMuteLimitModal, setShowMaxMuteLimitModal] = useState(false);

  React.useEffect(() => {
    const loadSettings = async () => {
      const settings = await SettingsManager.loadSettings();
      setMuteWhileWorking(settings.muteWhileWorking);
      setAutoSilence(settings.autoSilence);
      setMaxMuteLimit(settings.maxMuteLimit);
    };
    loadSettings();
  }, []);

  const handleMuteWhileWorkingChange = async (value: boolean) => {
    setMuteWhileWorking(value);
    await SettingsManager.updateSetting('muteWhileWorking', value);
  };

  const handleAutoSilenceChange = async (value: string) => {
    setAutoSilence(value);
    await SettingsManager.updateSetting('autoSilence', value);
    setShowAutoSilenceModal(false);
  };

  const handleMaxMuteLimitChange = async (value: string) => {
    setMaxMuteLimit(value);
    await SettingsManager.updateSetting('maxMuteLimit', value);
    setShowMaxMuteLimitModal(false);
  };

  const getAutoSilenceLabel = () => {
    const option = autoSilenceOptions.find(opt => opt.value === autoSilence);
    return option ? option.label : 'Tắt';
  };

  const getMaxMuteLimitLabel = () => {
    const option = maxMuteLimitOptions.find(opt => opt.value === maxMuteLimit);
    return option ? option.label : '3';
  };

  return (
    <SafeAreaProvider style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top, borderBottomColor: colors.border }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>Tắt Báo thức hoặc Nhiệm vụ</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Alarm Section */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Tắt báo thức</Text>
        
        <TouchableOpacity 
          style={[styles.card, { backgroundColor: colors.surface }]}
          activeOpacity={0.7}
          onPress={() => setShowAutoSilenceModal(true)}
        >
          <View style={styles.cardContent}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Tự động im lặng</Text>
            <Text style={[styles.cardSubtitle, { color: autoSilence === 'off' ? colors.textSecondary : colors.primary }]}>{getAutoSilenceLabel()}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        <Text style={[styles.description, { color: colors.textSecondary }]}>
          Tắt báo thức nếu bạn không trả lời trong một{'\n'}
          khoảng thời gian nhất định
        </Text>

        {/* Task Section */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Tắt Nhiệm vụ</Text>

        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Tắt tiếng trong khi làm việc</Text>
          <Switch
            value={muteWhileWorking}
            onValueChange={handleMuteWhileWorkingChange}
            trackColor={{ false: isDarkMode ? '#4a5568' : '#cbd5e1', true: colors.primary }}
            thumbColor="#ffffff"
          />
        </View>

        <TouchableOpacity 
          style={[styles.card, { backgroundColor: colors.surface }]}
          activeOpacity={0.7}
          onPress={() => setShowMaxMuteLimitModal(true)}
        >
          <View style={styles.cardContent}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Giới hạn tối đa để tắt tiếng trong{'\n'}
              khi làm nhiệm vụ
            </Text>
            <Text style={[styles.limitNumber, { color: maxMuteLimit === 'off' ? colors.textSecondary : colors.primary }]}>{getMaxMuteLimitLabel()}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        <Text style={[styles.description, { color: colors.textSecondary }]}>
          Nếu vượt quá giới hạn tối đa, không thể tắt tiếng âm{'\n'}
          thanh.
        </Text>
      </ScrollView>

      {/* Auto Silence Modal */}
      <Modal
        visible={showAutoSilenceModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAutoSilenceModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowAutoSilenceModal(false)}
        >
          <View style={styles.modalContainer}>
            <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
              <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Tự động im lặng</Text>
                
                <ScrollView style={styles.optionsContainer} showsVerticalScrollIndicator={false}>
                  {autoSilenceOptions.map((option, index) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.optionItem,
                        index !== autoSilenceOptions.length - 1 && [styles.optionItemBorder, { borderBottomColor: colors.border }]
                      ]}
                      onPress={() => handleAutoSilenceChange(option.value)}
                    >
                      <View style={styles.radioButton}>
                        {autoSilence === option.value ? (
                          <View style={[styles.radioButtonSelected, { borderColor: colors.primary }]}>
                            <View style={[styles.radioButtonInner, { backgroundColor: colors.primary }]} />
                          </View>
                        ) : (
                          <View style={[styles.radioButtonUnselected, { borderColor: isDarkMode ? colors.textMuted : colors.textMuted }]} />
                        )}
                      </View>
                      <Text style={[styles.optionLabel, { color: colors.text }]}>{option.label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Max Mute Limit Modal */}
      <Modal
        visible={showMaxMuteLimitModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMaxMuteLimitModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMaxMuteLimitModal(false)}
        >
          <View style={styles.modalContainer}>
            <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
              <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Giới hạn tối đa để tắt tiếng{"\n"}trong khi làm nhiệm vụ</Text>
                
                <ScrollView style={styles.optionsContainer} showsVerticalScrollIndicator={false}>
                  {maxMuteLimitOptions.map((option, index) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.optionItem,
                        index !== maxMuteLimitOptions.length - 1 && [styles.optionItemBorder, { borderBottomColor: colors.border }]
                      ]}
                      onPress={() => handleMaxMuteLimitChange(option.value)}
                    >
                      <View style={styles.radioButton}>
                        {maxMuteLimit === option.value ? (
                          <View style={[styles.radioButtonSelected, { borderColor: colors.primary }]}>
                            <View style={[styles.radioButtonInner, { backgroundColor: colors.primary }]} />
                          </View>
                        ) : (
                          <View style={[styles.radioButtonUnselected, { borderColor: isDarkMode ? colors.textMuted : colors.textMuted }]} />
                        )}
                      </View>
                      <Text style={[styles.optionLabel, { color: colors.text }]}>{option.label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginRight: 40,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 12,
    marginTop: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 22,
  },
  cardSubtitle: {
    fontSize: 14,
  },
  limitNumber: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 24,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    maxHeight: '70%',
  },
  modalContent: {
    borderRadius: 16,
    paddingTop: 24,
    paddingBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  optionsContainer: {
    maxHeight: 400,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  optionItemBorder: {
    borderBottomWidth: 1,
  },
  radioButton: {
    marginRight: 16,
  },
  radioButtonSelected: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  radioButtonUnselected: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
  },
  optionLabel: {
    fontSize: 16,
    flex: 1,
  },
});
