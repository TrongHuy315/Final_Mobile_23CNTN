import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface NewFeatureBannerProps {
  onPress?: () => void;
}

export const NewFeatureBanner: React.FC<NewFeatureBannerProps> = ({ onPress }) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: colors.surface }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>NEW</Text>
        </View>
      </View>
      <View style={styles.content}>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>Lại ngủ nữa à?</Text>
        <Text style={[styles.title, { color: colors.text }]}>Thử nhiệm vụ mới của chúng tôi</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color={colors.textMuted} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 16,
  },
  badge: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#ff4757',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  content: {
    flex: 1,
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
});
