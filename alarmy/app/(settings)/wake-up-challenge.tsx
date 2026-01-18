import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Prize item data
const prizes = [
  { id: 1, emoji: '📅', label: 'Pro 30 ngày', subLabel: 'giá 0,3 USD', badge: '30' },
  { id: 2, emoji: '🗓️', label: 'Thẻ Pro 7 ngày', subLabel: '', badge: '7' },
  { id: 3, emoji: '💵', label: 'Thẻ quà tặng 100', subLabel: 'USD', badge: '' },
];

// Animated Prize Carousel Component
const PrizeCarousel = () => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const ITEM_WIDTH = 100;
  const TOTAL_WIDTH = ITEM_WIDTH * prizes.length;

  useEffect(() => {
    const animate = () => {
      scrollX.setValue(0);
      Animated.timing(scrollX, {
        toValue: -TOTAL_WIDTH,
        duration: 6000,
        useNativeDriver: true,
      }).start(() => animate());
    };
    animate();
  }, []);

  // Duplicate prizes for seamless loop
  const duplicatedPrizes = [...prizes, ...prizes, ...prizes];

  return (
    <View style={styles.carouselContainer}>
      <Animated.View
        style={[
          styles.carouselTrack,
          {
            transform: [{ translateX: scrollX }],
          },
        ]}
      >
        {duplicatedPrizes.map((prize, index) => (
          <View key={index} style={styles.prizeItem}>
            <View style={styles.prizeIconContainer}>
              {prize.badge ? (
                <View style={styles.calendarIcon}>
                  <Text style={styles.calendarBadge}>{prize.badge}</Text>
                  {prize.id === 1 && <Text style={styles.starBadge}>⭐</Text>}
                </View>
              ) : (
                <Text style={styles.prizeEmoji}>{prize.emoji}</Text>
              )}
            </View>
            <Text style={styles.prizeLabel}>{prize.label}</Text>
            {prize.subLabel ? (
              <Text style={styles.prizeSubLabel}>{prize.subLabel}</Text>
            ) : null}
          </View>
        ))}
      </Animated.View>
    </View>
  );
};

// Step item component
interface StepItemProps {
  stepNumber: number;
  icon: React.ReactNode;
  label: string;
  isLast?: boolean;
  bgColor: string;
}

const StepItem = ({ stepNumber, icon, label, isLast = false, bgColor }: StepItemProps) => (
  <View style={styles.stepItemWrapper}>
    <View style={styles.stepItemContainer}>
      <Text style={styles.stepNumber}>Bước {stepNumber}</Text>
      <View style={[styles.stepIconContainer, { backgroundColor: bgColor }]}>
        {icon}
      </View>
      <Text style={styles.stepLabel}>{label}</Text>
    </View>
    {!isLast && <View style={styles.stepLineWrapper}><View style={styles.stepLine} /></View>}
  </View>
);

// Progress dots component
const ProgressDots = () => (
  <View style={styles.progressContainer}>
    {[1, 2, 3, 4].map((_, index) => (
      <View key={index} style={styles.progressDot} />
    ))}
    <View style={styles.sunIcon}>
      <Ionicons name="sunny-outline" size={24} color="#fbbf24" />
    </View>
  </View>
);

export default function WakeUpChallengeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thử thách thức dậy</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>
            Thức dậy mỗi ngày{'\n'}bằng đồng hồ báo thức{'\n'}và nhận quà
          </Text>
          <Text style={styles.heroSubtitle}>
            Thói quen thức dậy trong 5 ngày{'\n'}chính là một phần thưởng!
          </Text>
          
          {/* Progress Dots */}
          <ProgressDots />
          
          {/* Gift Box */}
          <Text style={styles.giftEmoji}>🎁</Text>
        </View>

        {/* Prize Card Section */}
        <View style={styles.prizeCardSection}>
          <View style={styles.prizeCard}>
            <Text style={styles.prizeCardTitle}>Phần thưởng ngẫu nhiên chiến thắng 100%</Text>
            <PrizeCarousel />
          </View>
        </View>

        {/* How It Works Section */}
        <View style={styles.howItWorksSection}>
          <Text style={styles.sectionTitle}>Cách hoạt động</Text>
          
          <View style={styles.stepsContainer}>
            <StepItem
              stepNumber={1}
              icon={<MaterialCommunityIcons name="clock-check-outline" size={26} color="#ffffff" />}
              label="Bắt đầu thử thách"
              bgColor="#6366f1"
            />
            <StepItem
              stepNumber={2}
              icon={<Ionicons name="notifications" size={26} color="#ffffff" />}
              label="Thức dậy bằng báo thức"
              bgColor="#f59e0b"
            />
            <StepItem
              stepNumber={3}
              icon={<Ionicons name="gift" size={26} color="#ffffff" />}
              label="Nhận quà tặng"
              bgColor="#ef4444"
            />
            <StepItem
              stepNumber={4}
              icon={<Ionicons name="refresh" size={26} color="#ffffff" />}
              label="Tiếp tục thử thách"
              bgColor="#22c55e"
              isLast
            />
          </View>

          {/* Instructions */}
          <View style={styles.instructionsList}>
            <Text style={styles.instructionItem}>
              • Bạn có thể tham gia thử thách bằng cách nhấn vào nút [Bắt đầu thử thách].
            </Text>
            <Text style={styles.instructionItem}>
              • Bạn phải tắt báo thức ít nhất một lần mỗi ngày dựa trên ngày để duy trì hồ sơ thành công.
            </Text>
            <Text style={styles.instructionItem}>
              • Sau khi hoàn thành thử thách, hãy nhấn vào nút quà tặng để nhận phần thưởng ngẫu nhiên.
            </Text>
            <Text style={styles.instructionItem}>
              • Khi phần thưởng hết hạn, bạn có thể thử lại.
            </Text>
          </View>
        </View>

        {/* Important Notice Section */}
        <View style={styles.importantNoticeSection}>
          <Text style={styles.importantNoticeTitle}>Thông báo quan trọng</Text>
          <View style={styles.noticesList}>
            <Text style={styles.noticeItem}>
              Bạn phải tắt báo thức trong vòng 24 giờ sau khi nhấn vào [Bắt đầu thử thách] để Ngày 1 được ghi lại.
            </Text>
            <Text style={styles.noticeItem}>
              Thử thách chỉ coi hồ sơ báo thức bị tắt là thành công.
            </Text>
            <Text style={styles.noticeItem}>
              Thử thách kết thúc nếu có một ngày báo thức không được sử dụng.
            </Text>
            <Text style={styles.noticeItem}>
              Nếu bạn xóa ứng dụng, tất cả hồ sơ và quyền lợi sẽ biến mất, vì vậy hãy đừng xóa và hãy tận hưởng lợi ích cho đến cuối cùng.
            </Text>
            <Text style={styles.noticeItem}>
              Sự kiện này có thể kết thúc mà không cần thông báo trước.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={[styles.bottomButtonSection, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity style={styles.startButton} activeOpacity={0.8}>
          <Text style={styles.startButtonText}>Bắt đầu thử thách</Text>
        </TouchableOpacity>
        <Text style={styles.footerNote}>Kết quả này được tính dựa trên hồ sơ báo thức</Text>
      </View>
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
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  
  // Hero Section
  heroSection: {
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 38,
    marginBottom: 16,
  },
  heroSubtitle: {
    fontSize: 15,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  giftEmoji: {
    fontSize: 120,
    marginTop: 16,
  },
  
  // Progress Dots
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: '#1e293b',
    borderRadius: 30,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#64748b',
  },
  sunIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#fbbf24',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Prize Card Section
  prizeCardSection: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  prizeCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    paddingVertical: 16,
  },
  prizeCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
  },
  
  // Carousel
  carouselContainer: {
    height: 110,
    overflow: 'hidden',
  },
  carouselTrack: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  prizeItem: {
    width: 100,
    alignItems: 'center',
  },
  prizeIconContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  calendarIcon: {
    width: 50,
    height: 55,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  calendarBadge: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ef4444',
  },
  starBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    fontSize: 20,
  },
  prizeEmoji: {
    fontSize: 50,
  },
  prizeLabel: {
    fontSize: 12,
    color: '#ffffff',
    textAlign: 'center',
  },
  prizeSubLabel: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'center',
  },
  
  // How It Works Section - Dark Theme
  howItWorksSection: {
    paddingVertical: 24,
    paddingHorizontal: 24,
    backgroundColor: '#1e293b',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 20,
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  stepItemWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepItemContainer: {
    alignItems: 'center',
    width: 70,
    height: 140,
  },
  stepNumber: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 8,
  },
  stepIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepLineWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 52,
    marginTop: -45,
  },
  stepLine: {
    width: 20,
    height: 2,
    backgroundColor: '#475569',
  },
  stepLabel: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 16,
    height: 32,
  },
  
  // Instructions - Dark Theme
  instructionsList: {
    gap: 16,
  },
  instructionItem: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 22,
  },
  
  // Important Notice Section - Dark Theme
  importantNoticeSection: {
    backgroundColor: '#0f172a',
    paddingVertical: 24,
    paddingHorizontal: 24,
  },
  importantNoticeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  noticesList: {
    gap: 16,
  },
  noticeItem: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 22,
  },
  
  // Fixed Bottom Button Section
  bottomButtonSection: {
    paddingHorizontal: 24,
    paddingTop: 12,
    backgroundColor: '#0f172a',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  startButton: {
    backgroundColor: '#ef4444',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  footerNote: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
});
