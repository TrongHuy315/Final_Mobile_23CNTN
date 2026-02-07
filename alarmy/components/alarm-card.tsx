import React from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

interface AlarmCardProps {
  id: string;
  time: string;
  label: string;
  days: string;
  enabled: boolean;
  onToggle: (id: string) => void;
  onLongPress: (id: string) => void; // Đổi từ onDelete sang onLongPress cho đúng chuẩn event
  onPress: (id: string) => void;
}

export const AlarmCard: React.FC<AlarmCardProps> = ({
  id,
  time,
  label,
  days,
  enabled,
  onToggle,
  onLongPress,
  onPress,
}) => {
  const { colors, isDarkMode } = useTheme();
  
  // Dynamic colors based on theme and enabled state
  const cardBg = enabled 
    ? colors.surface 
    : (isDarkMode ? '#0f172a' : colors.surfaceVariant);
  const cardBorder = enabled ? colors.primary : colors.border;
  const timeColor = enabled ? colors.text : colors.textMuted;
  
  return (
    <TouchableOpacity 
      activeOpacity={0.7} 
      onPress={() => onPress(id)} 
      onLongPress={() => onLongPress(id)} // Gọi callback khi nhấn giữ
      style={[
        styles.card, 
        { 
          backgroundColor: cardBg, 
          borderColor: cardBorder,
          borderWidth: 1 
        }
      ]}
    >
      <View style={styles.content}>
        <View style={styles.timeSection}>
          <Text style={[styles.time, { color: timeColor }]}>
            {time}
          </Text>
          {label ? <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text> : null}
        </View>
        <Text style={[styles.days, { color: colors.textMuted }]}>{days}</Text>
      </View>
      
      {/* 
        Ngăn chặn sự kiện nhấn vào Card khi người dùng chỉ muốn bật/tắt Switch 
        bằng cách bọc Switch trong một View và chặn pointerEvents nếu cần, 
        nhưng React Native Switch mặc định xử lý khá tốt.
      */}
      <Switch
        style={styles.toggle}
        value={enabled}
        onValueChange={() => onToggle(id)}
        trackColor={{ false: colors.surfaceVariant, true: colors.primary }}
        thumbColor={enabled ? '#ffffff' : colors.textSecondary}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  content: {
    flex: 1,
  },
  timeSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  time: {
    fontSize: 42,
    fontWeight: '300',
    letterSpacing: -1,
  },
  label: {
    fontSize: 14,
    marginLeft: 12,
    fontWeight: '500',
  },
  days: {
    fontSize: 13,
    marginTop: 2,
  },
  toggle: {
    transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }], // Làm switch to hơn một chút cho dễ bấm
    marginLeft: 10,
  },
});
