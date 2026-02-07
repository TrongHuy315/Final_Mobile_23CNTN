import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export const AccountCard: React.FC = () => {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}
      activeOpacity={0.8}
      onPress={() => router.push('/login')}
    >
      <View style={styles.content}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle-outline" size={60} color={colors.textSecondary} />
        </View>
        
        <Text style={[styles.text, { color: colors.text }]}>Đăng nhập vào tài{'\n'}khoản của bạn</Text>
      </View>
      
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    marginRight: 16,
  },
  text: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },
});
