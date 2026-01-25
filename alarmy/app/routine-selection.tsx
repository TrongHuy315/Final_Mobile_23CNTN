import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

const recommendations = [
  { id: '1', name: 'Thức dậy sớm', icon: 'bird', iconType: 'material-community', color: '#ffcc00' },
  { id: '2', name: 'Uống nước', icon: 'water', iconType: 'material-community', color: '#3b82f6' },
  { id: '3', name: 'Giãn cơ 5 phút', icon: 'weight-lifter', iconType: 'material-community', color: '#64748b' },
  { id: '4', name: 'Thiền 1 phút', icon: 'meditation', iconType: 'material-community', color: '#a855f7' },
  { id: '5', name: 'Đọc lời cầu nguyện', icon: 'hands-pray', iconType: 'material-community', color: '#f59e0b' },
];

export default function RoutineSelectionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [goal, setGoal] = useState('');

  const handleSelectRecommendation = (item: any) => {
    router.push({
      pathname: '/habit-form',
      params: { 
        name: item.name, 
        icon: item.icon, 
        iconColor: item.color,
        type: 'recommendation'
      }
    });
  };

  const handleSubmitCustomGoal = () => {
    if (goal.trim()) {
      Keyboard.dismiss();
      router.push({
        pathname: '/habit-form',
        params: { 
          name: goal, 
          icon: 'star', 
          iconColor: '#a855f7',
          type: 'custom'
        }
      });
    }
  };

  return (
    <SafeAreaProvider style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={28} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Báo thức thói quen</Text>
        <View style={styles.placeholder} />
      </View>

      <TouchableWithoutFeedback onPress={handleSubmitCustomGoal}>
        <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
          {/* Goal Input */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons name="star" size={24} color="#64748b" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nhập mục tiêu thói quen của bạn"
                placeholderTextColor="#64748b"
                value={goal}
                onChangeText={setGoal}
                onSubmitEditing={handleSubmitCustomGoal}
                autoFocus
              />
              {goal.length > 0 && (
                <TouchableOpacity onPress={() => setGoal('')}>
                  <Ionicons name="close-circle" size={20} color="#64748b" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Recommendations Section */}
          <Text style={styles.sectionTitle}>Được khuyến nghị</Text>
          <View style={styles.grid}>
            {recommendations.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.gridItem}
                onPress={() => handleSelectRecommendation(item)}
              >
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons name={item.icon as any} size={28} color={item.color} />
                </View>
                <Text style={styles.itemText}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
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
    height: 100,
    backgroundColor: '#0f172a',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 44,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  inputContainer: {
    marginTop: 20,
    marginBottom: 30,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
  },
  sectionTitle: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    width: (Dimensions.get('window').width - 32 - 12) / 2,
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
});
