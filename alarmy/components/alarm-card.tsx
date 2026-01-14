import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';

interface AlarmCardProps {
  id: string;
  time: string;
  label: string;
  days: string;
  enabled: boolean;
  onToggle: (id: string, enabled: boolean) => void;
}

export const AlarmCard: React.FC<AlarmCardProps> = ({
  id,
  time,
  label,
  days,
  enabled,
  onToggle,
}) => {
  return (
    <View style={[styles.card, { backgroundColor: enabled ? '#1a202c' : '#16213e' }]}>
      <View style={styles.content}>
        <View style={styles.timeSection}>
          <Text style={styles.time}>{time}</Text>
          {label && <Text style={styles.label}>{label}</Text>}
        </View>
        <Text style={styles.days}>{days}</Text>
      </View>
      <Switch
        style={styles.toggle}
        value={enabled}
        onValueChange={(value) => onToggle(id, value)}
        trackColor={{ false: '#4a5568', true: '#38b6ff' }}
        thumbColor={enabled ? '#ffffff' : '#cbd5e0'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
  },
  timeSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  time: {
    fontSize: 48,
    fontWeight: '200',
    color: '#ffffff',
    letterSpacing: 2,
  },
  label: {
    fontSize: 12,
    color: '#a0aec0',
    marginLeft: 8,
  },
  days: {
    fontSize: 12,
    color: '#718096',
  },
  toggle: {
    marginLeft: 12,
  },
});
