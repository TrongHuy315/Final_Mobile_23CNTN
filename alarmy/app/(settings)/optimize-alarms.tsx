import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  LayoutAnimation,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ExpandableCardProps {
  title: string;
  icon: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const ExpandableCard = ({ title, icon, isExpanded, onToggle, children }: ExpandableCardProps) => {
  return (
    <View style={styles.expandableCard}>
      <TouchableOpacity 
        style={styles.cardHeader}
        activeOpacity={0.7}
        onPress={onToggle}
      >
        <View style={styles.cardLeft}>
          {icon}
          <Text style={styles.cardText}>{title}</Text>
        </View>
        <Ionicons 
          name={isExpanded ? "chevron-up" : "chevron-down"} 
          size={20} 
          color="#718096" 
        />
      </TouchableOpacity>
      
      {isExpanded && (
        <View style={styles.cardContent}>
          {children}
        </View>
      )}
    </View>
  );
};

export default function OptimizeAlarmsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  const toggleCard = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedCard(expandedCard === index ? null : index);
  };

  return (
    <SafeAreaView style={styles.container}>
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Tối ưu hóa báo thức</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text style={styles.title}>Báo thức của bạn không reo?</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Báo thức có thể sẽ bị hệ thống điện thoại chặn. 😢{'\n'}
          Vui lòng xem các hướng dẫn sau đây!
        </Text>

        {/* Permission Cards */}
        <View style={styles.cardsContainer}>
          {/* Card 1: 2 Quyền cần thiết */}
          <ExpandableCard
            title="2 Quyền cần thiết"
            icon={
              <View style={[styles.iconContainer, styles.pinkIcon]}>
                <Ionicons name="shield-checkmark" size={20} color="#ffffff" />
              </View>
            }
            isExpanded={expandedCard === 0}
            onToggle={() => toggleCard(0)}
          >
            <Text style={styles.contentDescription}>
              Hãy cho phép 2 quyền sau để đảm bảo báo thức của bạn kêu.
            </Text>
            
            {/* Screenshot placeholder */}
            <View style={styles.screenshotContainer}>
              <View style={styles.screenshotBox}>
                <View style={styles.appInfoHeader}>
                  <Ionicons name="chevron-back" size={16} color="#94a3b8" />
                  <Text style={styles.appInfoTitle}>App info</Text>
                  <View style={styles.headerDots}>
                    <View style={styles.dot} /><View style={styles.dot} /><View style={styles.dotTriangle} />
                  </View>
                </View>
                
                <View style={styles.appRow}>
                  <View style={styles.appIconPlaceholder}>
                    <Ionicons name="alarm" size={20} color="#ffffff" />
                  </View>
                  <View>
                    <Text style={styles.appName}>Alarmy</Text>
                    <Text style={styles.appSubtext}>Version info</Text>
                  </View>
                </View>
                
                <View style={styles.permissionRow}>
                  <Text style={styles.permissionLabel}>Auto Start</Text>
                  <View style={[styles.toggleSwitch, styles.toggleOn]}>
                    <View style={styles.toggleThumb} />
                  </View>
                </View>
                
                <View style={styles.permissionRow}>
                  <View>
                    <Text style={styles.permissionLabel}>display over apps</Text>
                    <Text style={styles.permissionSubtext}>display pop-up windows</Text>
                  </View>
                  <View style={[styles.toggleSwitch, styles.toggleOn]}>
                    <View style={styles.toggleThumb} />
                  </View>
                </View>
              </View>
            </View>
            
            <Text style={styles.noteText}>
              ※ Vị trí cài đặt có thể khác nhau tùy theo model máy và phiên bản hệ điều hành.
            </Text>
            
            <TouchableOpacity style={styles.outlineButton}>
              <Text style={styles.outlineButtonText}>Xem chi tiết</Text>
            </TouchableOpacity>
          </ExpandableCard>

          {/* Card 2: Cho phép Alarmy ở chế độ Không làm phiền */}
          <ExpandableCard
            title={"Cho phép Alarmy ở chế độ\nKhông làm phiền"}
            icon={
              <View style={[styles.iconContainer, styles.blueIcon]}>
                <Ionicons name="remove-circle" size={20} color="#ffffff" />
              </View>
            }
            isExpanded={expandedCard === 1}
            onToggle={() => toggleCard(1)}
          >
            <Text style={styles.contentDescription}>
              Cho phép Alarmy đổ chuông khi ở chế độ DND.
            </Text>
            
            {/* DND illustration */}
            <View style={styles.illustrationContainer}>
              <View style={styles.dndIllustration}>
                <View style={styles.moonIcon}>
                  <Ionicons name="moon" size={40} color="#ffffff" />
                </View>
                <View style={styles.plusBadge}>
                  <Ionicons name="add" size={16} color="#ffffff" />
                </View>
                <View style={styles.alarmBadge}>
                  <Ionicons name="alarm" size={28} color="#ec4899" />
                </View>
              </View>
            </View>
            
            <Text style={styles.instructionText}>
              Đi đến [Cài đặt {'>'} Thông báo {'>'} Không làm phiền {'>'} Ứng dụng] và thêm Alarmy vào danh sách.
            </Text>
            
            <Text style={styles.noteText}>
              ※ Vị trí cài đặt có thể khác nhau tùy theo model máy và phiên bản hệ điều hành.
            </Text>
            
            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Đi đến cài đặt</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.linkButton}>
              <Text style={styles.linkButtonText}>Xem chi tiết</Text>
            </TouchableOpacity>
          </ExpandableCard>

          {/* Card 3: Loại trừ khỏi tính năng tối ưu hóa pin */}
          <ExpandableCard
            title={"Loại trừ khỏi tính năng tối ưu\nhóa pin"}
            icon={
              <View style={[styles.iconContainer, styles.blueIcon]}>
                <Ionicons name="battery-charging" size={20} color="#ffffff" />
              </View>
            }
            isExpanded={expandedCard === 2}
            onToggle={() => toggleCard(2)}
          >
            <Text style={styles.contentDescription}>
              Nếu bạn đang sử dụng tính năng tiết kiệm pin hoặc tối ưu hóa pin, Alarmy có thể bị bắt buộc chấm dứt. Khi đó, báo thức của bạn không thể đổ chuông.
            </Text>
            
            {/* Battery illustration */}
            <View style={styles.illustrationContainer}>
              <View style={styles.batteryIllustration}>
                <View style={styles.phoneWithBattery}>
                  <View style={styles.phonePlaceholder}>
                    <Ionicons name="phone-portrait" size={40} color="#3b82f6" />
                  </View>
                  <View style={styles.batteryBadge}>
                    <Ionicons name="battery-half" size={20} color="#f59e0b" />
                  </View>
                </View>
                <View style={styles.bellCrossed}>
                  <Ionicons name="notifications-off" size={36} color="#f59e0b" />
                </View>
              </View>
            </View>
            
            <Text style={styles.instructionText}>
              Đi đến [Cài đặt {'>'} Ứng dụng {'>'} Alarmy {'>'} Pin] và chọn "Không hạn chế".
            </Text>
            
            <Text style={styles.noteText}>
              ※ Đối với một số thiết bị, hãy thêm Alarmy vào danh sách trong [Quản lý thiết bị {'>'} Pin {'>'} Ứng dụng chưa được tối ưu hóa].
            </Text>
            
            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Đi đến cài đặt</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.linkButton}>
              <Text style={styles.linkButtonText}>Xem chi tiết</Text>
            </TouchableOpacity>
          </ExpandableCard>
        </View>

        {/* Feedback Section */}
        <View style={styles.feedbackSection}>
          <Text style={styles.feedbackText}>
            Nếu bạn đang gặp bất kỳ vấn đề nào, vui lòng liên{'\n'}
            hệ với chúng tôi!
          </Text>
          
          <TouchableOpacity 
            style={styles.feedbackButton}
            activeOpacity={0.8}
            onPress={() => router.push('/send-feedback')}
          >
            <Text style={styles.feedbackButtonText}>Gửi phản hồi</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
    textAlign: 'center',
    marginRight: 40,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20,
    marginBottom: 32,
  },
  cardsContainer: {
    gap: 12,
    marginBottom: 32,
  },
  expandableCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  pinkIcon: {
    backgroundColor: '#ec4899',
  },
  blueIcon: {
    backgroundColor: '#3b82f6',
  },
  cardText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#ffffff',
    flex: 1,
    lineHeight: 20,
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  contentDescription: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20,
    marginTop: 16,
    marginBottom: 20,
  },
  screenshotContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  screenshotBox: {
    backgroundColor: '#1a3a4a',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    borderWidth: 2,
    borderColor: '#2d4a5a',
  },
  appInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  appInfoTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  headerDots: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#94a3b8',
  },
  dotTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#94a3b8',
  },
  appRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  appIconPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#ec4899',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  appSubtext: {
    color: '#94a3b8',
    fontSize: 12,
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2d4a5a',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  permissionLabel: {
    color: '#ffffff',
    fontSize: 14,
  },
  permissionSubtext: {
    color: '#94a3b8',
    fontSize: 12,
  },
  toggleSwitch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4a5568',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 2,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ffffff',
  },
  toggleOn: {
    backgroundColor: '#38b6ff',
    alignItems: 'flex-end',
  },
  illustrationContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  dndIllustration: {
    backgroundColor: '#1a3a4a',
    borderRadius: 16,
    padding: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  moonIcon: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#1e3a5f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: -10,
    zIndex: 1,
  },
  alarmBadge: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  batteryIllustration: {
    backgroundColor: '#1a3a4a',
    borderRadius: 16,
    padding: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    gap: 20,
  },
  phoneWithBattery: {
    alignItems: 'center',
  },
  phonePlaceholder: {
    width: 60,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#1e3a5f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  batteryBadge: {
    position: 'absolute',
    bottom: -5,
    right: -10,
    backgroundColor: '#1a3a4a',
    borderRadius: 10,
    padding: 4,
  },
  bellCrossed: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 14,
    color: '#ffffff',
    lineHeight: 20,
    marginBottom: 12,
  },
  noteText: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ffffff',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ffffff',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  outlineButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  linkButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  linkButtonText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  feedbackSection: {
    alignItems: 'center',
    marginTop: 8,
  },
  feedbackText: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  feedbackButton: {
    borderWidth: 1,
    borderColor: '#ffffff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  feedbackButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
});
