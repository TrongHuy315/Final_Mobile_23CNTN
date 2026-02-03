// Integration Examples and Best Practices for Alarmy App

// ============================================================================
// 1. WAKE-UP FLOW EXAMPLE
// ============================================================================

// When alarm triggers, record the wake-up event:
import { AlarmManager } from '@/utils/alarm-manager';
import { SleepTracker } from '@/utils/sleep-tracker';

async function handleAlarmTriggered(alarmId: string) {
  try {
    // 1. Record wake-up time
    const wakeUpRecord = await SleepTracker.recordWakeUp(alarmId, false);
    console.log('Wake-up recorded:', wakeUpRecord);

    // 2. Navigate to wake-up check
    router.push({
      pathname: '/wake-up-check',
      params: { 
        alarmId, 
        recordId: wakeUpRecord.id 
      }
    });
  } catch (error) {
    console.error('Error recording wake-up:', error);
  }
}

// ============================================================================
// 2. MARK WAKE-UP TASK COMPLETE
// ============================================================================

async function markWakeUpComplete(recordId: string) {
  try {
    await SleepTracker.markWakeUpTaskComplete(recordId);
    // Navigate to morning screen or home
    router.push('/(tabs)/day');
  } catch (error) {
    console.error('Error marking wake-up complete:', error);
  }
}

// ============================================================================
// 3. MORNING ROUTINE TRACKING
// ============================================================================

import { useMorningRoutines } from '@/hooks/useSleepData';

function MorningRoutineExample() {
  const { 
    routines, 
    toggleRoutine, 
    addRoutine,
    getCompletionStats 
  } = useMorningRoutines();

  const { total, completed, percent } = getCompletionStats();

  return (
    <View>
      <Text>Progress: {completed}/{total} ({percent}%)</Text>
      
      {routines.map(routine => (
        <TouchableOpacity 
          key={routine.id}
          onPress={() => toggleRoutine(routine.id)}
        >
          <Text>
            {routine.completed ? '✓' : '○'} {routine.name}
          </Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity onPress={() => {
        addRoutine({
          id: Date.now().toString(),
          name: 'New Routine',
          completed: false
        });
      }}>
        <Text>+ Add Routine</Text>
      </TouchableOpacity>
    </View>
  );
}

// ============================================================================
// 4. SLEEP TRACKING AND REPORTING
// ============================================================================

import { useSleepData } from '@/hooks/useSleepData';

function SleepReportingExample() {
  const { 
    sleepRecords, 
    addSleepRecord,
    getWeekStats 
  } = useSleepData();

  const handleAddSleep = async (sleepTime, wakeTime, quality, notes) => {
    try {
      const durationMs = new Date(wakeTime).getTime() - new Date(sleepTime).getTime();
      const durationMins = Math.round(durationMs / (1000 * 60));

      await addSleepRecord({
        date: new Date().toISOString().split('T')[0],
        sleepTime: new Date(sleepTime).getTime(),
        wakeTime: new Date(wakeTime).getTime(),
        duration: durationMins,
        quality,
        notes,
      });

      console.log('Sleep record saved');
    } catch (error) {
      console.error('Error saving sleep record:', error);
    }
  };

  const handleGetStats = async () => {
    const { sleepStats, wakeStats } = await getWeekStats();
    console.log('This week stats:', { sleepStats, wakeStats });
  };

  return (
    <View>
      <Text>Sleep Records: {sleepRecords.length}</Text>
      
      {sleepRecords.map(record => (
        <View key={record.id}>
          <Text>{record.date}: {record.duration}m - {record.quality}%</Text>
        </View>
      ))}

      <Button 
        title="Add Sleep" 
        onPress={() => handleAddSleep(
          '2024-01-28T23:00:00',
          '2024-01-29T07:00:00',
          85,
          'Good sleep'
        )}
      />

      <Button 
        title="Get Week Stats" 
        onPress={handleGetStats}
      />
    </View>
  );
}

// ============================================================================
// 5. CREATING AND MANAGING ALARMS
// ============================================================================

async function createNewAlarm() {
  try {
    const newAlarm = await AlarmManager.addAlarm({
      hour: 7,
      minute: 0,
      enabled: true,
      label: 'Morning Wake-up',
      icon: '⏰',
      days: ['T2', 'T3', 'T4', 'T5', 'T6'], // Mon-Fri
      volume: 80,
      vibration: true,
      gentleWake: 'off',
      tasks: [],
      snoozeSettings: {
        enabled: true,
        interval: 5,
        maxCount: 3,
      },
      type: 'regular',
    });

    console.log('Alarm created:', newAlarm);
    return newAlarm;
  } catch (error) {
    console.error('Error creating alarm:', error);
  }
}

async function toggleAlarm(alarmId: string) {
  try {
    const updated = await AlarmManager.toggleAlarm(alarmId);
    console.log('Alarm toggled:', updated);
    return updated;
  } catch (error) {
    console.error('Error toggling alarm:', error);
  }
}

async function deleteAlarm(alarmId: string) {
  try {
    const updated = await AlarmManager.removeAlarm(alarmId);
    console.log('Alarm deleted:', updated);
    return updated;
  } catch (error) {
    console.error('Error deleting alarm:', error);
  }
}

// ============================================================================
// 6. WEEK NAVIGATION AND STATISTICS
// ============================================================================

import { SleepTracker } from '@/utils/sleep-tracker';

function getWeekLabel(offset: number) {
  if (offset === 0) return 'This Week';
  if (offset === -1) return 'Last Week';
  return `${offset < 0 ? 'Week of' : ''}`;
}

async function getWeekData(weekOffset: number) {
  try {
    const getRange = weekOffset === 0 
      ? () => SleepTracker.getThisWeekRange()
      : () => SleepTracker.getLastWeekRange();

    const { startDate, endDate } = getRange();

    const sleepStats = await SleepTracker.getSleepStats(startDate, endDate);
    const wakeStats = await SleepTracker.getWakeUpStats(startDate, endDate);

    return {
      sleepStats,
      wakeStats,
      startDate,
      endDate,
      label: getWeekLabel(weekOffset),
    };
  } catch (error) {
    console.error('Error getting week data:', error);
  }
}

// ============================================================================
// 7. ERROR HANDLING AND LOGGING
// ============================================================================

// Setup error logging
const errorHandler = {
  logError: (screen: string, error: any) => {
    console.error(`[${screen}] Error:`, error);
    // Could integrate with Sentry, LogRocket, etc.
  },

  logAction: (action: string, data?: any) => {
    console.log(`[Action] ${action}:`, data);
  },

  logDebug: (message: string, data?: any) => {
    if (__DEV__) {
      console.debug(`[Debug] ${message}:`, data);
    }
  },
};

// Usage:
try {
  await addSleepRecord(data);
  errorHandler.logAction('SLEEP_RECORD_ADDED', data);
} catch (error) {
  errorHandler.logError('SleepScreen', error);
}

// ============================================================================
// 8. NAVIGATION PATTERNS
// ============================================================================

// Safe navigation with error handling
async function navigateToRoutineForm(selectedRoutine) {
  try {
    if (!selectedRoutine || !selectedRoutine.id) {
      throw new Error('Invalid routine selected');
    }

    router.push({
      pathname: '/habit-form',
      params: {
        routineId: selectedRoutine.id,
        routineName: selectedRoutine.name,
        routineIcon: selectedRoutine.icon,
        routineColor: selectedRoutine.color,
      },
    });
  } catch (error) {
    console.error('Navigation error:', error);
    // Show error toast/alert to user
  }
}

// ============================================================================
// 9. DATA VALIDATION
// ============================================================================

function validateSleepRecord(record: any): boolean {
  // Validate sleep time is before wake time
  if (record.sleepTime >= record.wakeTime) {
    console.warn('Sleep time must be before wake time');
    return false;
  }

  // Validate reasonable duration (1-12 hours)
  const durationHours = record.duration / 60;
  if (durationHours < 1 || durationHours > 12) {
    console.warn('Sleep duration should be between 1-12 hours');
    return false;
  }

  // Validate quality is 0-100
  if (record.quality < 0 || record.quality > 100) {
    console.warn('Quality must be between 0-100');
    return false;
  }

  // Validate date format YYYY-MM-DD
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(record.date)) {
    console.warn('Date must be in YYYY-MM-DD format');
    return false;
  }

  return true;
}

// ============================================================================
// 10. PERFORMANCE OPTIMIZATION
// ============================================================================

// Memoize expensive calculations
import { useMemo } from 'react';

function ReportOptimizedExample({ records }) {
  // Only recalculate when records change
  const statistics = useMemo(() => {
    return records.reduce((acc, record) => {
      acc.totalDuration += record.duration;
      acc.totalQuality += record.quality;
      acc.count++;
      return acc;
    }, { totalDuration: 0, totalQuality: 0, count: 0 });
  }, [records]);

  const avgDuration = statistics.count > 0 
    ? statistics.totalDuration / statistics.count 
    : 0;

  return (
    <View>
      <Text>Average: {avgDuration.toFixed(1)} minutes</Text>
    </View>
  );
}

// ============================================================================
// 11. TESTING DATA GENERATION
// ============================================================================

async function generateTestData() {
  const today = new Date();
  
  // Generate 7 days of sleep records
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const sleepTime = new Date(date);
    sleepTime.setHours(23, 0, 0, 0);
    
    const wakeTime = new Date(date);
    wakeTime.setDate(wakeTime.getDate() + 1);
    wakeTime.setHours(7, 0, 0, 0);

    await AlarmManager.addSleepRecord({
      date: dateStr,
      sleepTime: sleepTime.getTime(),
      wakeTime: wakeTime.getTime(),
      duration: 480 + Math.random() * 60, // 8-9 hours
      quality: 60 + Math.random() * 40, // 60-100%
      notes: `Test sleep for ${dateStr}`,
    });

    // Add wake-up records
    await AlarmManager.addWakeUpRecord({
      date: dateStr,
      wakeUpTime: wakeTime.getTime(),
      taskCompleted: Math.random() > 0.3,
      completionTime: Math.random() > 0.3 ? wakeTime.getTime() : undefined,
    });
  }

  console.log('Test data generated');
}

// ============================================================================
// 12. BEST PRACTICES SUMMARY
// ============================================================================

/*
BEST PRACTICES FOR ALARMY APP:

1. ALWAYS use custom hooks (useSleepData, useMorningRoutines)
   - Handles data loading and state management
   - Automatically refreshes on screen focus

2. VALIDATE data before saving
   - Check date formats
   - Verify time ranges
   - Ensure required fields

3. USE try-catch for all async operations
   - Catch errors and log them
   - Show user-friendly error messages
   - Don't let app crash

4. LEVERAGE useFocusEffect for data updates
   - Ensures data is fresh when screen is viewed
   - Automatically called on screen focus

5. USE AsyncStorage keys consistently
   - Define as constants
   - Document what each key stores
   - Never hardcode keys

6. MAINTAIN consistent date format
   - Always use YYYY-MM-DD for dates
   - Store timestamps for times
   - Format for display

7. HANDLE edge cases
   - No data available
   - Incomplete records
   - Concurrent modifications

8. OPTIMIZE renders with React.memo
   - Memoize list items
   - Use FlatList for large lists
   - Avoid inline function definitions

9. PROVIDE visual feedback
   - Toast messages for actions
   - Loading states
   - Error messages
   - Success confirmations

10. TEST thoroughly
    - Test wake-up flow end-to-end
    - Verify data persistence
    - Check report calculations
    - Test navigation
*/

export { 
  handleAlarmTriggered,
  markWakeUpComplete,
  createNewAlarm,
  toggleAlarm,
  deleteAlarm,
  getWeekData,
  generateTestData,
};
