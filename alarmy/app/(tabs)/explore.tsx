import { ArcGauge } from '@/components/arc-gauge-props';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function SleepScreen() {
  const [score, setScore] = useState(63);

  return (
    <SafeAreaProvider style={styles.container}>
      <Text style={styles.header}>
        Giấc ngủ
      </Text>

      <View style={styles.content}>
        <Text style={{color: "#FFFFFF", fontSize: 17, fontWeight: 600, marginBottom: 20}}>
          Tìm hiểu vấn đề về giấc ngủ của bạn
        </Text>

        <View style={{marginTop: 30}}>
          <ArcGauge score={score} />
        </View>

        <Text style={{color: "#FFFFFF", marginBottom: 20}}>
          Bạn có thể ngủ 16 giờ 8 phút kể từ bây giờ
        </Text>

        <TouchableOpacity style={styles.sleepBtn}>
          <Text style={{color: "#FFFFFF", fontSize: 18, fontWeight: 600}}>
            Theo dõi giấc ngủ của tôi
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.reportBtn}>
        <Text style={{fontSize: 17, color: "#FFFFFF", fontWeight: 500}}>
          Báo cáo giấc ngủ
        </Text>

        <Ionicons name="chevron-forward-outline" style={{color: "#FFFFFF", fontSize: 20}}></Ionicons>
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
    marginTop: 150,
    fontWeight: 700,
    marginBottom: 20
  },

  content: {
    backgroundColor: "#7a7a96",
    width: "100%",
    height: "auto",
    borderRadius: 20,
    alignItems: "center",
    padding: 20,
    marginBottom: 20
  },

  sleepBtn: {
    backgroundColor: "#0909e6",
    width: "100%",
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10
  },

  reportBtn: {
    backgroundColor: "#7a7a96",
    width: "100%",
    height: 70,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20
  }
});
