import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SLIDES = [
  {
    image: require('@/assets/images/time.png'),
    title: 'Không thể tắt',
    subtitle: 'Không có gian lận trên đồng hồ của Alarmy',
  },
  {
    image: require('@/assets/images/prevent1.png'),
    title: 'Tận hưởng những buổi sáng ít phải tự chủ hơn',
    subtitle: 'Cho phép quyền chặn chính bạn',
  },
  {
    image: require('@/assets/images/prevent2.png'),
    title: 'Luôn hoạt động: chúng tôi sẽ không để bạn lười biếng',
    subtitle: 'Màn hình hủy sẽ tiếp tục xuất hiện khi bạn cố gắng tắt',
  },
  {
    image: require('@/assets/images/gm.png'),
    title: 'Chỉ còn một điều nữa đó là hủy báo thức của bạn!',
    subtitle: 'Chúng tôi luôn sẵn sàng hỗ trợ bạn. Hãy tập trung vào báo thức của bạn.',
  },
];

export default function PreventPowerOffInfoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleScroll = (event: any) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentSlide(slideIndex);
  };

  return (
    <View style={styles.container}>
      {/* Close Button */}
      <TouchableOpacity
        style={[styles.closeButton, { top: insets.top + 16 }]}
        onPress={() => router.back()}
      >
        <Ionicons name="close" size={28} color="#ffffff" />
      </TouchableOpacity>

      {/* Carousel */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {SLIDES.map((slide, index) => (
          <View key={index} style={styles.slide}>
            <View style={styles.slideContent}>
              {/* Title */}
              {index === 0 }
              
              <Text style={styles.title}>{slide.title}</Text>
              
              {/* Image */}
              <View style={styles.imageContainer}>
                <View style={styles.imageBg}>
                  <Image
                    source={slide.image}
                    style={styles.image}
                    resizeMode="contain"
                  />
                </View>
              </View>
              
              {/* Subtitle */}
              <Text style={styles.subtitle}>{slide.subtitle}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Pagination Dots */}
      <View style={[styles.pagination, { bottom: insets.bottom + 40 }]}>
        {SLIDES.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              currentSlide === index && styles.activeDot,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  slideContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  firstSlideHeader: {
    fontSize: 15,
    color: '#94a3b8',
    marginBottom: 8,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 32,
    paddingHorizontal: 10,
  },
  imageContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
  },
  imageBg: {
    width: SCREEN_WIDTH * 0.85,
    height: SCREEN_WIDTH * 0.6,
    backgroundColor: '#b794f6',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  image: {
    width: '80%',
    height: '80%',
  },
  subtitle: {
    fontSize: 15,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  pagination: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4a5568',
  },
  activeDot: {
    backgroundColor: '#ffffff',
    width: 24,
  },
});
