import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SnoozeSettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [snoozeEnabled, setSnoozeEnabled] = useState(true);
  const [snoozeInterval, setSnoozeInterval] = useState('5'); // in minutes
  const [maxSnoozeCount, setMaxSnoozeCount] = useState('3');
  const [showMoreIntervals, setShowMoreIntervals] = useState(false);
  const [showMoreCounts, setShowMoreCounts] = useState(false);

  const getIntervalLabel = (value: string) => {
    return `${value} phút`;
  };

  const getCountLabel = (value: string) => {
    if (value === 'unlimited') return 'Vô hạn';
    return `${value} lần`;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Báo lại</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Snooze Toggle */}
        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleText}>Báo lại</Text>
            <Switch
              value={snoozeEnabled}
              onValueChange={setSnoozeEnabled}
              trackColor={{ false: '#334155', true: '#0ea5e9' }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        {/* Interval Section */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Khoảng nghỉ</Text>
            <Text style={styles.sectionValue}>{getIntervalLabel(snoozeInterval)}</Text>
          </View>

          {/* Default options */}
          <TouchableOpacity 
            style={styles.radioRow}
            onPress={() => setSnoozeInterval('1')}
          >
            <View style={[
              styles.radioButton,
              snoozeInterval === '1' && styles.radioButtonSelected
            ]}>
              {snoozeInterval === '1' && <View style={styles.radioButtonInner} />}
            </View>
            <Text style={styles.radioText}>1 phút</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.radioRow}
            onPress={() => setSnoozeInterval('5')}
          >
            <View style={[
              styles.radioButton,
              snoozeInterval === '5' && styles.radioButtonSelected
            ]}>
              {snoozeInterval === '5' && <View style={styles.radioButtonInner} />}
            </View>
            <Text style={styles.radioText}>5 phút</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.radioRow}
            onPress={() => setSnoozeInterval('10')}
          >
            <View style={[
              styles.radioButton,
              snoozeInterval === '10' && styles.radioButtonSelected
            ]}>
              {snoozeInterval === '10' && <View style={styles.radioButtonInner} />}
            </View>
            <Text style={styles.radioText}>10 phút</Text>
          </TouchableOpacity>

          {/* More options */}
          {showMoreIntervals && (
            <>
              <TouchableOpacity 
                style={styles.radioRow}
                onPress={() => setSnoozeInterval('15')}
              >
                <View style={[
                  styles.radioButton,
                  snoozeInterval === '15' && styles.radioButtonSelected
                ]}>
                  {snoozeInterval === '15' && <View style={styles.radioButtonInner} />}
                </View>
                <Text style={styles.radioText}>15 phút</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.radioRow}
                onPress={() => setSnoozeInterval('20')}
              >
                <View style={[
                  styles.radioButton,
                  snoozeInterval === '20' && styles.radioButtonSelected
                ]}>
                  {snoozeInterval === '20' && <View style={styles.radioButtonInner} />}
                </View>
                <Text style={styles.radioText}>20 phút</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.radioRow}
                onPress={() => setSnoozeInterval('25')}
              >
                <View style={[
                  styles.radioButton,
                  snoozeInterval === '25' && styles.radioButtonSelected
                ]}>
                  {snoozeInterval === '25' && <View style={styles.radioButtonInner} />}
                </View>
                <Text style={styles.radioText}>25 phút</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.radioRow}
                onPress={() => setSnoozeInterval('30')}
              >
                <View style={[
                  styles.radioButton,
                  snoozeInterval === '30' && styles.radioButtonSelected
                ]}>
                  {snoozeInterval === '30' && <View style={styles.radioButtonInner} />}
                </View>
                <Text style={styles.radioText}>30 phút</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Toggle button */}
          <TouchableOpacity 
            style={styles.toggleButton}
            onPress={() => setShowMoreIntervals(!showMoreIntervals)}
          >
            <Text style={styles.toggleButtonText}>
              {showMoreIntervals ? 'Ẩn bớt' : 'Lựa chọn khác'}
            </Text>
            <Ionicons 
              name={showMoreIntervals ? "chevron-up" : "chevron-down"} 
              size={16} 
              color="#64748b" 
            />
          </TouchableOpacity>
        </View>

        {/* Max Count Section */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Số lần hoãn báo thức tối đa</Text>
            <Text style={styles.sectionValue}>{getCountLabel(maxSnoozeCount)}</Text>
          </View>

          {/* Default options */}
          <TouchableOpacity 
            style={styles.radioRow}
            onPress={() => setMaxSnoozeCount('unlimited')}
          >
            <View style={[
              styles.radioButton,
              maxSnoozeCount === 'unlimited' && styles.radioButtonSelected
            ]}>
              {maxSnoozeCount === 'unlimited' && <View style={styles.radioButtonInner} />}
            </View>
            <Text style={styles.radioText}>Vô hạn</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.radioRow}
            onPress={() => setMaxSnoozeCount('1')}
          >
            <View style={[
              styles.radioButton,
              maxSnoozeCount === '1' && styles.radioButtonSelected
            ]}>
              {maxSnoozeCount === '1' && <View style={styles.radioButtonInner} />}
            </View>
            <Text style={styles.radioText}>1 lần</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.radioRow}
            onPress={() => setMaxSnoozeCount('2')}
          >
            <View style={[
              styles.radioButton,
              maxSnoozeCount === '2' && styles.radioButtonSelected
            ]}>
              {maxSnoozeCount === '2' && <View style={styles.radioButtonInner} />}
            </View>
            <Text style={styles.radioText}>2 lần</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.radioRow}
            onPress={() => setMaxSnoozeCount('3')}
          >
            <View style={[
              styles.radioButton,
              maxSnoozeCount === '3' && styles.radioButtonSelected
            ]}>
              {maxSnoozeCount === '3' && <View style={styles.radioButtonInner} />}
            </View>
            <Text style={styles.radioText}>3 lần</Text>
          </TouchableOpacity>

          {/* More options */}
          {showMoreCounts && (
            <>
              <TouchableOpacity 
                style={styles.radioRow}
                onPress={() => setMaxSnoozeCount('5')}
              >
                <View style={[
                  styles.radioButton,
                  maxSnoozeCount === '5' && styles.radioButtonSelected
                ]}>
                  {maxSnoozeCount === '5' && <View style={styles.radioButtonInner} />}
                </View>
                <Text style={styles.radioText}>5 lần</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.radioRow}
                onPress={() => setMaxSnoozeCount('10')}
              >
                <View style={[
                  styles.radioButton,
                  maxSnoozeCount === '10' && styles.radioButtonSelected
                ]}>
                  {maxSnoozeCount === '10' && <View style={styles.radioButtonInner} />}
                </View>
                <Text style={styles.radioText}>10 lần</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Toggle button */}
          <TouchableOpacity 
            style={styles.toggleButton}
            onPress={() => setShowMoreCounts(!showMoreCounts)}
          >
            <Text style={styles.toggleButtonText}>
              {showMoreCounts ? 'Ẩn bớt' : 'Lựa chọn khác'}
            </Text>
            <Ionicons 
              name={showMoreCounts ? "chevron-up" : "chevron-down"} 
              size={16} 
              color="#64748b" 
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
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
  backButton: {
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
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  sectionValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0ea5e9',
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
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
    borderColor: '#0ea5e9',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0ea5e9',
  },
  radioText: {
    fontSize: 16,
    color: '#ffffff',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
    gap: 8,
  },
  toggleButtonText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
});
