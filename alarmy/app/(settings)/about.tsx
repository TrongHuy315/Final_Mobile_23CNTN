import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Linking,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';

interface AboutItem {
  title: string;
  description: string;
  icon: string;
}

const ABOUT_ITEMS: AboutItem[] = [
  {
    title: 'Phiên bản',
    description: '1.0.0',
    icon: 'information-circle',
  },
  {
    title: 'Nhà phát triển',
    description: 'Alarmy Team',
    icon: 'build',
  },
  {
    title: 'Nền tảng',
    description: 'React Native + Expo',
    icon: 'logo-react',
  },
];

const LINKS = [
  { title: 'Trang web chính thức', url: 'https://alarmy.app', icon: 'globe' },
  { title: 'Chính sách bảo mật', url: 'https://alarmy.app/privacy', icon: 'shield' },
  { title: 'Điều khoản dịch vụ', url: 'https://alarmy.app/terms', icon: 'document-text' },
  { title: 'Liên hệ chúng tôi', url: 'mailto:support@alarmy.app', icon: 'mail' },
];

export default function AboutScreen() {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();

  const handleOpenLink = (url: string) => {
    Linking.openURL(url).catch((err) =>
      console.error('Error opening link:', err)
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Thông tin về ứng dụng</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={[styles.iconContainer, { backgroundColor: colors.surface }]}>
            <Ionicons name="time" size={64} color={colors.primary} />
          </View>
          <Text style={[styles.appName, { color: colors.text }]}>Alarmy</Text>
          <Text style={[styles.appTagline, { color: colors.textMuted }]}>Đánh thức một cách thông minh</Text>
        </View>

        {/* About Info */}
        <View style={[styles.infoSection, { backgroundColor: colors.surface }]}>
          {ABOUT_ITEMS.map((item, index) => (
            <View key={index} style={[styles.infoItem, { borderBottomColor: colors.border }]}>
              <View style={[styles.infoIconContainer, { backgroundColor: colors.background }]}>
                <Ionicons name={item.icon as any} size={20} color={colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={[styles.infoTitle, { color: colors.textMuted }]}>{item.title}</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{item.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Description */}
        <View style={styles.descriptionSection}>
          <Text style={[styles.descriptionTitle, { color: colors.text }]}>Về Alarmy</Text>
          <Text style={[styles.descriptionText, { color: colors.textSecondary }]}>
            Alarmy là một ứng dụng báo thức thông minh được thiết kế để giúp bạn thức dậy kịp thời và bắt đầu ngày mới một cách tốt nhất. Với các tính năng như:
          </Text>
          <Text style={[styles.featureItem, { color: colors.textSecondary }]}>• Nhiều loại thử thách để đảm bảo bạn thực sự thức dậy</Text>
          <Text style={[styles.featureItem, { color: colors.textSecondary }]}>• Quản lý giấc ngủ và phân tích dữ liệu ngủ</Text>
          <Text style={[styles.featureItem, { color: colors.textSecondary }]}>• Quy trình buổi sáng tùy chỉnh</Text>
          <Text style={[styles.featureItem, { color: colors.textSecondary }]}>• Đồng bộ hóa trên đám mây</Text>
          <Text style={[styles.featureItem, { color: colors.textSecondary }]}>• Giao diện đẹp và dễ sử dụng</Text>
        </View>

        {/* Links Section */}
        <View style={styles.linksSection}>
          <Text style={[styles.linksTitle, { color: colors.text }]}>Liên kết hữu ích</Text>
          {LINKS.map((link, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.linkItem, { backgroundColor: colors.surface }]}
              onPress={() => handleOpenLink(link.url)}
            >
              <View style={[styles.linkIconContainer, { backgroundColor: colors.background }]}>
                <Ionicons name={link.icon as any} size={18} color={colors.primary} />
              </View>
              <Text style={[styles.linkText, { color: colors.text }]}>{link.title}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Credits Section */}
        <View style={[styles.creditsSection, { backgroundColor: colors.surface }]}>
          <Text style={[styles.creditsTitle, { color: colors.text }]}>Cảm ơn bạn</Text>
          <Text style={[styles.creditsText, { color: colors.textSecondary }]}>
            Cảm ơn bạn đã sử dụng Alarmy. Nếu bạn thích ứng dụng này, vui lòng nhận 5 sao trên cửa hàng ứng dụng để giúp chúng tôi phát triển hơn.
          </Text>
        </View>

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <Text style={[styles.footerText, { color: colors.textMuted }]}>
            © 2024 Alarmy. Tất cả quyền được bảo lưu.
          </Text>
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

  // Content
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },

  // Logo Section
  logoSection: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  appTagline: {
    fontSize: 14,
    color: '#94a3b8',
    fontStyle: 'italic',
  },

  // Info Section
  infoSection: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    marginBottom: 24,
    overflow: 'hidden',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
  },

  // Description Section
  descriptionSection: {
    marginBottom: 24,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: '#cbd5e1',
    lineHeight: 20,
    marginBottom: 12,
  },
  featureItem: {
    fontSize: 14,
    color: '#cbd5e1',
    lineHeight: 20,
    marginBottom: 6,
    marginLeft: 4,
  },

  // Links Section
  linksSection: {
    marginBottom: 24,
  },
  linksTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  linkIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  linkText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#ffffff',
  },

  // Credits Section
  creditsSection: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  creditsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  creditsText: {
    fontSize: 14,
    color: '#cbd5e1',
    lineHeight: 20,
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  footerText: {
    fontSize: 12,
    color: '#64748b',
  },
});
