import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function DebugScreen() {
  const router = useRouter();
  const [storageData, setStorageData] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const loadStorageData = async () => {
    try {
      setLoading(true);
      const data = await AsyncStorage.getItem('ALARMS_STORAGE');
      console.log('📦 Raw AsyncStorage data:', data);
      if (data) {
        const parsed = JSON.parse(data);
        setStorageData(JSON.stringify(parsed, null, 2));
      } else {
        setStorageData('No data in AsyncStorage');
      }
    } catch (error) {
      setStorageData(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const clearStorage = async () => {
    try {
      await AsyncStorage.removeItem('ALARMS_STORAGE');
      setStorageData('Storage cleared');
      loadStorageData();
    } catch (error) {
      setStorageData(`Error clearing: ${error}`);
    }
  };

  useEffect(() => {
    loadStorageData();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.title}>AsyncStorage Debug</Text>
        <View style={{ width: 24 }} />
      </View>

      <TouchableOpacity 
        style={styles.button}
        onPress={loadStorageData}
      >
        <Text style={styles.buttonText}>Reload Data</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, { backgroundColor: '#dc2626' }]}
        onPress={clearStorage}
      >
        <Text style={styles.buttonText}>Clear Storage</Text>
      </TouchableOpacity>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.dataText}>{storageData}</Text>
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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  button: {
    backgroundColor: '#3b82f6',
    marginHorizontal: 16,
    marginVertical: 8,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  dataText: {
    color: '#e2e8f0',
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 18,
  },
});
