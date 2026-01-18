import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SettingsMenuItemProps {
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  title: string;
  badge?: string;
  onPress?: () => void;
  iconComponent?: React.ReactNode;
}

export const SettingsMenuItem: React.FC<SettingsMenuItemProps> = ({
  icon,
  iconColor,
  title,
  badge,
  onPress,
  iconComponent,
}) => {
  return (
    <TouchableOpacity 
      style={styles.menuItem} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.leftContent}>
        {iconComponent ? (
          iconComponent
        ) : icon ? (
          <View style={styles.iconContainer}>
            <Ionicons name={icon} size={20} color={iconColor || '#ffffff'} />
          </View>
        ) : null}
        
        <Text style={styles.title}>{title}</Text>
        
        {badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
      </View>
      
      <Ionicons name="chevron-forward" size={20} color="#718096" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a2332',
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 2,
    minHeight: 60,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
    flex: 1,
  },
  badge: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    paddingHorizontal: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
});
