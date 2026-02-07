import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '@/context/ThemeContext';

interface ArcGaugeProps {
  score: number; // 0 → 100
}

export const ArcGauge: React.FC<ArcGaugeProps> = ({ score }) => {
    const { colors, isDarkMode } = useTheme();
    const size = 220;
    const strokeWidth = 18;
    const radius = (size - strokeWidth) / 2;
    const center = size / 2;

    const startAngle = -220 / 2 - 90; // cân giữa cho đẹp
    const totalAngle = 220;
    const progressAngle = (score / 100) * totalAngle;

    const polarToCartesian = (
        cx: number,
        cy: number,
        r: number,
        angle: number
    ) => {
        const rad = (angle * Math.PI) / 180;
        
        return {
        x: cx + r * Math.cos(rad),
        y: cy + r * Math.sin(rad),
        };
    };

    const describeArc = (angle: number) => {
        const endAngle = startAngle + angle;
        const start = polarToCartesian(center, center, radius, startAngle);
        const end = polarToCartesian(center, center, radius, endAngle);
        const largeArcFlag = angle > 180 ? 1 : 0;

        return `
        M ${start.x} ${start.y}
        A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}
        `;
    };

    // Chọn màu theo score
    const getColor = (value: number) => {
        if (value >= 90) return '#22c55e';  // xanh lá
        if (value >= 70) return '#facc15';  // vàng
        return '#ef4444';                   // đỏ
    };

    const color = getColor(score);

    return (
        <View style={styles.container}>
        <Svg width={size} height={size}>
            {/* Background arc */}
            <Path
            d={describeArc(totalAngle)}
            stroke={isDarkMode ? "#1e293b" : "#e2e8f0"}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            />

            {/* Filled arc */}
            <Path
            d={describeArc(progressAngle)}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            />
        </Svg>

        {/* Điểm ở tâm */}
        <View style={styles.centerText}>
          <Text style={[styles.subText, { color: isDarkMode ? "#FFFFFF" : colors.textMuted }]}>Chất lượng giấc ngủ</Text>
          <Text style={[styles.score, { color }]}>{score}</Text>
          {/* <Text style={[styles.label, { color: colors.textSecondary }]}>POINTS</Text> */}
        </View>
        </View>
    );
};

const styles = StyleSheet.create({
  container: {
    width: 220,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerText: {
    position: 'absolute',
    alignItems: 'center',
  },
  subText: {
    fontWeight: '500',
    fontSize: 15
  },
  score: {
    fontSize: 36,
    fontWeight: '700',
  },
  label: {
    fontSize: 12,
  },
});
