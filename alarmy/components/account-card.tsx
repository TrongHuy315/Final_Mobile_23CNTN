import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const AccountCard: React.FC = () => {
  const router = useRouter();

  return (
    <TouchableOpacity 
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => router.push('/login')}
    >
      <View style={styles.content}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle-outline" size={60} color="#718096" />
        </View>
        
        <Text style={styles.text}>Đăng nhập vào tài{'\n'}khoản của bạn</Text>
      </View>
      
      <Ionicons name="chevron-forward" size={20} color="#718096" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2d3748',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#1a2332',
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
    color: '#ffffff',
    lineHeight: 24,
  },
});
