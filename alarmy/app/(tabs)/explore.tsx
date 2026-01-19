import { ArcGauge } from '@/components/arc-gauge-props';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function SleepScreen() {
  return (
    <SafeAreaProvider style={styles.container}>
      <Text style={styles.header}>
        Giấc ngủ
      </Text>

      <View>
        <Text>
          Tìm hiểu vấn đề về giấc ngủ của bạn
        </Text>

        <ArcGauge score={80} />
      </View>

      <TouchableOpacity>

      </TouchableOpacity>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 20
  },
  
  header: {
    fontSize: 24,
    color: "#FFFFFF",
    marginTop: 150
  }
});
