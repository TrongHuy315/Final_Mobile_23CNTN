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
  const [muteWhileWorking, setMuteWhileWorking] = useState(true);
  const [autoSilence, setAutoSilence] = useState('off');
  const [showAutoSilenceModal, setShowAutoSilenceModal] = useState(false);
  const [maxMuteLimit, setMaxMuteLimit] = useState('3');
  const [showMaxMuteLimitModal, setShowMaxMuteLimitModal] = useState(false);

  const getAutoSilenceLabel = () => {
    const option = autoSilenceOptions.find(opt => opt.value === autoSilence);
    return option ? option.label : 'Tắt';
  };

  const getMaxMuteLimitLabel = () => {
    const option = maxMuteLimitOptions.find(opt => opt.value === maxMuteLimit);
    return option ? option.label : '3';
  };

  return (
    <SafeAreaProvider style={styles.container}>
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Tắt Báo thức hoặc Nhiệm vụ</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Alarm Section */}
        <Text style={styles.sectionTitle}>Tắt báo thức</Text>
        
        <TouchableOpacity 
          style={styles.card}
          activeOpacity={0.7}
          onPress={() => setShowAutoSilenceModal(true)}
        >
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Tự động im lặng</Text>
            <Text style={[styles.cardSubtitle, autoSilence !== 'off' && { color: '#38b6ff' }]}>{getAutoSilenceLabel()}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#718096" />
        </TouchableOpacity>

        <Text style={styles.description}>
          Tắt báo thức nếu bạn không trả lời trong một{'\n'}
          khoảng thời gian nhất định
        </Text>

        {/* Task Section */}
        <Text style={styles.sectionTitle}>Tắt Nhiệm vụ</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tắt tiếng trong khi làm việc</Text>
          <Switch
            value={muteWhileWorking}
            onValueChange={setMuteWhileWorking}
            trackColor={{ false: '#4a5568', true: '#38b6ff' }}
            thumbColor={muteWhileWorking ? '#ffffff' : '#cbd5e0'}
          />
        </View>

        <TouchableOpacity 
          style={styles.card}
          activeOpacity={0.7}
          onPress={() => setShowMaxMuteLimitModal(true)}
        >
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>
              Giới hạn tối đa để tắt tiếng trong{'\n'}
              khi làm nhiệm vụ
            </Text>
            <Text style={[styles.limitNumber, maxMuteLimit === 'off' && { color: '#94a3b8' }]}>{getMaxMuteLimitLabel()}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#718096" />
        </TouchableOpacity>

        <Text style={styles.description}>
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
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Tự động im lặng</Text>
                
                <ScrollView style={styles.optionsContainer} showsVerticalScrollIndicator={false}>
                  {autoSilenceOptions.map((option, index) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.optionItem,
                        index !== autoSilenceOptions.length - 1 && styles.optionItemBorder
                      ]}
                      onPress={() => {
                        setAutoSilence(option.value);
                        setShowAutoSilenceModal(false);
                      }}
                    >
                      <View style={styles.radioButton}>
                        {autoSilence === option.value ? (
                          <View style={styles.radioButtonSelected}>
                            <View style={styles.radioButtonInner} />
                          </View>
                        ) : (
                          <View style={styles.radioButtonUnselected} />
                        )}
                      </View>
                      <Text style={styles.optionLabel}>{option.label}</Text>
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
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Giới hạn tối đa để tắt tiếng{"\n"}trong khi làm nhiệm vụ</Text>
                
                <ScrollView style={styles.optionsContainer} showsVerticalScrollIndicator={false}>
                  {maxMuteLimitOptions.map((option, index) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.optionItem,
                        index !== maxMuteLimitOptions.length - 1 && styles.optionItemBorder
                      ]}
                      onPress={() => {
                        setMaxMuteLimit(option.value);
                        setShowMaxMuteLimitModal(false);
                      }}
                    >
                      <View style={styles.radioButton}>
                        {maxMuteLimit === option.value ? (
                          <View style={styles.radioButtonSelected}>
                            <View style={styles.radioButtonInner} />
                          </View>
                        ) : (
                          <View style={styles.radioButtonUnselected} />
                        )}
                      </View>
                      <Text style={styles.optionLabel}>{option.label}</Text>
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
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
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
    color: '#ffffff',
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
    color: '#94a3b8',
    marginBottom: 12,
    marginTop: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1e293b',
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
    color: '#ffffff',
    marginBottom: 4,
    lineHeight: 22,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
  },
  limitNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#38b6ff',
    marginTop: 4,
  },
  description: {
    fontSize: 13,
    color: '#94a3b8',
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
    backgroundColor: '#1e293b',
    borderRadius: 16,
    paddingTop: 24,
    paddingBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
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
    borderBottomColor: '#334155',
  },
  radioButton: {
    marginRight: 16,
  },
  radioButtonSelected: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#38b6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#38b6ff',
  },
  radioButtonUnselected: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#64748b',
  },
  optionLabel: {
    fontSize: 16,
    color: '#ffffff',
    flex: 1,
  },
});
