import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const ProCard: React.FC = () => {
  const router = useRouter();
  
  return (
    <View style={styles.container}>
      {/* Pro Upgrade Section */}
      <View style={styles.proSection}>
        <View style={styles.proLeft}>
          <View style={styles.proIconContainer}>
            <Ionicons name="diamond" size={24} color="#ffffff" />
          </View>
          <Text style={styles.proText}>Pro</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.upgradeButton}
          activeOpacity={0.8}
          onPress={() => router.push('/upgrade-pro')}
        >
          <Text style={styles.upgradeText}>Upgrade</Text>
          <Ionicons name="chevron-forward" size={16} color="#000000" />
        </TouchableOpacity>
      </View>

      {/* Prevent Source Off Section */}
      <TouchableOpacity 
        style={styles.menuRow}
        activeOpacity={0.7}
        onPress={() => router.push('/prevent-power-off')}
      >
        <View style={styles.menuLeft}>
          <View style={styles.menuIconContainer}>
            <Ionicons name="shield-checkmark" size={20} color="#ffffff" />
          </View>
          <Text style={styles.menuText}>Ngăn tắt nguồn</Text>
        </View>
        
        <View style={styles.menuRight}>
          <View style={styles.offBadge}>
            <Text style={styles.offText}>OFF</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#718096" />
        </View>
      </TouchableOpacity>

      {/* Events Section */}
      <TouchableOpacity 
        style={[styles.menuRow, styles.lastRow]}
        activeOpacity={0.7}
        onPress={() => router.push('/events')}
      >
        <View style={styles.menuLeft}>
          <View style={styles.menuIconContainer}>
            <Ionicons name="gift" size={20} color="#ffffff" />
          </View>
          <Text style={styles.menuText}>Sự kiện</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2d3748',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingTop: 4,
    paddingBottom: 20,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  proSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    marginBottom: 8,
  },
  proLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  proIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#c53030',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  proText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 4,
  },
  upgradeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    width: 32,
    marginRight: 12,
  },
  menuText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#ffffff',
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  offBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  offText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#a0aec0',
  },
});
