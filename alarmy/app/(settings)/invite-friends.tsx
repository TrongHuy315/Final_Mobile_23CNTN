import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');

// Confetti decoration component
const Confetti = () => (
  <View style={styles.confettiContainer}>
    {/* Left side confetti */}
    <View style={[styles.confetti, styles.confettiYellow, { top: 60, left: 20 }]} />
    <View style={[styles.confetti, styles.confettiGreen, { top: 120, left: 10 }]} />
    <View style={[styles.confetti, styles.confettiPink, { top: 180, left: 25 }]} />
    <View style={[styles.confetti, styles.confettiBlue, { top: 80, left: 40 }]} />
    
    {/* Right side confetti */}
    <View style={[styles.confetti, styles.confettiPink, { top: 50, right: 15 }]} />
    <View style={[styles.confetti, styles.confettiYellow, { top: 100, right: 30 }]} />
    <View style={[styles.confetti, styles.confettiGreen, { top: 150, right: 10 }]} />
    <View style={[styles.confetti, styles.confettiBlue, { top: 180, right: 35 }]} />
    <View style={[styles.confetti, styles.confettiPink, { top: 70, right: 50 }]} />
  </View>
);

// Step item component
interface StepItemProps {
  stepNumber: number;
  icon: React.ReactNode;
  label: string;
  isLast?: boolean;
}

const StepItem = ({ stepNumber, icon, label, isLast = false }: StepItemProps) => {
  const { colors } = useTheme();
  return (
    <View style={styles.stepItemWrapper}>
      <View style={styles.stepItemContainer}>
        <Text style={[styles.stepNumber, { color: colors.textMuted }]}>Bước {stepNumber}</Text>
        <View style={[styles.stepIconContainer, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
          {icon}
        </View>
        <Text style={[styles.stepLabel, { color: colors.textSecondary }]}>{label}</Text>
      </View>
      {!isLast && (
        <View style={styles.stepLineWrapper}>
          <View style={[styles.stepLine, { backgroundColor: colors.border }]} />
        </View>
      )}
    </View>
  );
};

export default function InviteFriendsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDarkMode } = useTheme();

  const inviteCode = "ALARMY2026"; // invite code

  return (
    <SafeAreaProvider style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top, borderBottomColor: colors.border }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Mời bạn bè</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section with Blue Background */}
        <View style={styles.heroSection}>
          <Confetti />
          
          {/* Main Title */}
          <Text style={[styles.heroTitle, { color: colors.text }]}>
            Mời bạn bè và{'\n'}Mở khóa gói Pro cho tất cả mọi người!
          </Text>
          <Text style={[styles.heroSubtitle, { color: colors.text }]}>
            Mời bạn bè và{'\n'}Mở khóa gói Pro cho tất cả mọi người!
          </Text>
          
          {/* Clapping Hands Emoji */}
          <Text style={styles.handsEmoji}>🙏</Text>
        </View>

        {/* My Invite Code Section */}
        <View style={styles.inviteCodeSection}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Mã mời của tôi</Text>
          <View style={[styles.codeBox, { backgroundColor: isDarkMode ? '#1e293b' : colors.surface, borderColor: colors.border, borderWidth: isDarkMode ? 0 : 1 }]}>
            <Text style={[styles.codeText, { color: colors.text }]}>{inviteCode}</Text>
          </View>
          <TouchableOpacity 
            style={[styles.shareButton, { backgroundColor: isDarkMode ? '#ffffff' : colors.primary }]} 
            activeOpacity={0.8}
          >
            <Text style={[styles.shareButtonText, { color: isDarkMode ? '#0f172a' : '#ffffff' }]}>Chia sẻ mã của tôi</Text>
          </TouchableOpacity>
        </View>

        {/* My Friend Rewards Section */}
        <View style={styles.rewardsSection}>
          <Text style={[styles.sectionTitleDark, { color: colors.text }]}>Phần thưởng mời bạn bè của tôi</Text>
          
          <View style={[styles.giftCard, { backgroundColor: isDarkMode ? '#1e293b' : colors.surface, borderColor: colors.border, borderWidth: isDarkMode ? 0 : 1 }]}>
            <Text style={styles.giftEmoji}>🎁</Text>
            <Text style={[styles.giftQuestion, { color: colors.textSecondary }]}>Bạn của bạn đã gửi mã chưa?</Text>
            <TouchableOpacity style={[styles.upgradeButton, { backgroundColor: isDarkMode ? '#ffffff' : colors.primary }]} activeOpacity={0.8}>
              <Text style={[styles.upgradeButtonText, { color: isDarkMode ? '#0f172a' : '#ffffff' }]}>Nâng cấp lên gói Pro trong 7 ngày</Text>
            </TouchableOpacity>
          </View>

          {/* Rewards Received */}
          <View style={[styles.rewardsReceivedCard, { backgroundColor: isDarkMode ? '#1e293b' : colors.surface, borderColor: colors.border, borderWidth: isDarkMode ? 0 : 1 }]}>
            <View style={styles.rewardsReceivedHeader}>
              <Text style={[styles.rewardsReceivedTitle, { color: colors.text }]}>Phần thưởng đã nhận được cho đến nay</Text>
              <Text style={[styles.rewardsReceivedLabel, { color: colors.textMuted }]}>Tổng cộng</Text>
            </View>
            <View style={styles.rewardsStats}>
              <Text style={[styles.rewardsStatsValue, { color: colors.text }]}>0</Text>
              <Text style={[styles.rewardsStatsUnit, { color: colors.textSecondary }]}>ngày</Text>
            </View>
          </View>
        </View>

        {/* How It Works Section */}
        <View style={[styles.howItWorksSection, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitleDark, { color: colors.text }]}>Cách hoạt động</Text>
          
          <View style={styles.stepsContainer}>
            <StepItem
              stepNumber={1}
              icon={<Ionicons name="copy-outline" size={25} color={colors.textSecondary} />}
              label="sao chép mã"
            />
            <StepItem
              stepNumber={2}
              icon={<MaterialCommunityIcons name="share-variant" size={25} color={colors.textSecondary} />}
              label="chia sẻ mã"
            />
            <StepItem
              stepNumber={3}
              icon={<Ionicons name="people-outline" size={25} color={colors.textSecondary} />}
              label="gửi mã"
            />
            <StepItem
              stepNumber={4}
              icon={<Ionicons name="star" size={25} color={colors.textSecondary} />}
              label="nhận phần thưởng"
              isLast
            />
          </View>

          {/* Instructions */}
          <View style={styles.instructionsList}>
            <Text style={[styles.instructionItem, { color: colors.textSecondary }]}>• Chia sẻ mã với bạn bè.</Text>
            <Text style={[styles.instructionItem, { color: colors.textSecondary }]}>• Người bạn được mời của bạn gửi mã sau khi đăng ký.</Text>
            <Text style={[styles.instructionItem, { color: colors.textSecondary }]}>• Sau khi hoàn tất lời mời, vui lòng nhấn vào nút &quot;Nhận gói Pro&quot;.</Text>
            <Text style={[styles.instructionItem, { color: colors.textSecondary }]}>• Tận hưởng gói Pro của Alarmy miễn phí với bạn bè.</Text>
          </View>
        </View>

        {/* Important Notice Section */}
        <View style={[styles.importantNoticeSection, { backgroundColor: colors.background }]}>
          <Text style={[styles.importantNoticeTitle, { color: colors.text }]}>Thông báo quan trọng</Text>
          <View style={styles.noticesList}>
            <Text style={[styles.noticeItem, { color: colors.textSecondary }]}>• Phần thưởng sẽ biến mất sau khi bạn xóa Alarmy. Tiếp tục cài đặt ứng dụng và tận hưởng trọn vẹn phần thưởng của bạn.</Text>
            <Text style={[styles.noticeItem, { color: colors.textSecondary }]}>• Bạn chỉ có thể nhận được phần thưởng sau khi người bạn mời gửi mã.</Text>
            <Text style={[styles.noticeItem, { color: colors.textSecondary }]}>• Bạn càng mời nhiều bạn bè, bạn càng nhận được nhiều phần thưởng.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
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
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  
  // Hero Section
  heroSection: {
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  handsEmoji: {
    fontSize: 100,
    marginTop: 10,
  },
  
  // Confetti styles
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  confetti: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  confettiYellow: {
    backgroundColor: '#fbbf24',
  },
  confettiGreen: {
    backgroundColor: '#22c55e',
  },
  confettiPink: {
    backgroundColor: '#ec4899',
  },
  confettiBlue: {
    backgroundColor: '#06b6d4',
  },
  
  // Invite Code Section
  inviteCodeSection: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  codeBox: {
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  codeText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 2,
  },
  shareButton: {
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Rewards Section
  rewardsSection: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  sectionTitleDark: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  giftCard: {
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  giftEmoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  giftQuestion: {
    fontSize: 15,
    marginBottom: 20,
    textAlign: 'center',
  },
  upgradeButton: {
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 28,
    width: '100%',
    alignItems: 'center',
  },
  upgradeButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  
  // Rewards Received Card
  rewardsReceivedCard: {
    borderRadius: 16,
    padding: 20,
  },
  rewardsReceivedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  rewardsReceivedTitle: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  rewardsReceivedLabel: {
    fontSize: 13,
    textAlign: 'right',
  },
  rewardsStats: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'flex-end',
  },
  rewardsStatsValue: {
    fontSize: 32,
    fontWeight: '700',
    marginRight: 4,
  },
  rewardsStatsUnit: {
    fontSize: 14,
  },
  
  // How It Works Section
  howItWorksSection: {
    marginTop: 24,
    paddingVertical: 24,
    paddingHorizontal: 24,
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
  },
  stepNumber: {
    fontSize: 11,
    marginBottom: 8,
  },
  stepIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  stepLineWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -12,
  },
  stepLine: {
    width: 20,
    height: 2,
  },
  stepLabel: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  
  // Instructions
  instructionsList: {
    gap: 12,
  },
  instructionItem: {
    fontSize: 14,
    lineHeight: 22,
  },
  
  // Important Notice Section
  importantNoticeSection: {
    paddingVertical: 24,
    paddingHorizontal: 24,
  },
  importantNoticeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  noticesList: {
    gap: 12,
  },
  noticeItem: {
    fontSize: 14,
    lineHeight: 22,
  },
});
