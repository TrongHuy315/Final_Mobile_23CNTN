import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    id: '1',
    question: 'Báo thức có kêu khi tôi đã tắt ứng dụng không?',
    answer: 'Có, báo thức sẽ kêu ngay cả khi bạn đã đóng ứng dụng. Ứng dụng sử dụng hệ thống thông báo của hệ điều hành để đảm bảo báo thức luôn hoạt động.'
  },
  {
    id: '2',
    question: 'Điều gì xảy ra nếu điện thoại của tôi bị tắt?',
    answer: 'Báo thức sẽ kêu lại sau khi bạn bật điện thoại (nếu vẫn còn thời gian báo thức). Để đảm bảo báo thức không bao giờ bị miss, hãy giữ điện thoại bật.'
  },
  {
    id: '3',
    question: 'Làm cách nào để thay đổi âm lượng báo thức?',
    answer: 'Vào Cài đặt báo thức -> Chọn báo thức -> Chỉnh sửa âm lượng. Bạn cũng có thể điều chỉnh âm lượng chung trong cài đặt hệ thống.'
  },
  {
    id: '4',
    question: 'Tính năng snooze hoạt động như thế nào?',
    answer: 'Cài đặt snooze cho phép bạn lặp lại báo thức sau một khoảng thời gian (ví dụ: 5 phút) với số lần giới hạn. Bạn có thể tùy chỉnh trong cài đặt báo thức.'
  },
  {
    id: '5',
    question: 'Có bao nhiêu loại thử thách khi báo thức kêu?',
    answer: 'Hiện có 5 loại thử thách: Nhập toán học, Nhấn nút, Lắc điện thoại, Quét mặt, và Flash đèn. Bạn có thể chọn kết hợp các thử thách này.'
  },
  {
    id: '6',
    question: 'Tôi có thể xem dữ liệu giấc ngủ của mình ở đâu?',
    answer: 'Dữ liệu giấc ngủ của bạn hiển thị trong tab "Báo cáo". Bạn có thể xem thống kê hàng ngày, hàng tuần và hàng tháng.'
  },
  {
    id: '7',
    question: 'Làm cách nào để sử dụng tính năng quy trình buổi sáng?',
    answer: 'Vào tab "Sáng" để tạo danh sách quy trình hàng ngày của bạn. Ứng dụng sẽ nhắc nhở bạn hoàn thành từng bước.'
  },
  {
    id: '8',
    question: 'Dữ liệu của tôi có an toàn không?',
    answer: 'Có, dữ liệu của bạn được lưu trữ cuc an toàn trên thiết bị của bạn. Nếu đăng nhập Google, dữ liệu sẽ được sao lưu trên đám mây.'
  },
];

export default function FAQScreen() {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Các câu hỏi thường gặp</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* FAQ List */}
      <FlatList
        data={FAQ_DATA}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.faqItem}
            onPress={() => toggleExpand(item.id)}
            activeOpacity={0.7}
          >
            <View style={styles.questionContainer}>
              <Text style={styles.question} numberOfLines={expandedId === item.id ? undefined : 2}>
                {item.question}
              </Text>
              <Ionicons
                name={expandedId === item.id ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#3b82f6"
              />
            </View>

            {expandedId === item.id && (
              <View style={styles.answerContainer}>
                <Text style={styles.answer}>{item.answer}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
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
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
    textAlign: 'center',
  },

  // List
  listContainer: {
    padding: 16,
  },
  faqItem: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  questionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    justifyContent: 'space-between',
  },
  question: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
    marginRight: 12,
  },
  answerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  answer: {
    fontSize: 14,
    color: '#cbd5e1',
    lineHeight: 20,
  },
});
