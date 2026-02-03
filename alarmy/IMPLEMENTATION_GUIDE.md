# Alarmy App - Complete UI & Logic Implementation Guide

## Overview
This document describes all the completed and enhanced screens in the Alarmy alarm clock app. The app is built with React Native, Expo, and includes sleep tracking, wake-up verification, morning routines, and comprehensive reporting.

## Architecture

### Data Storage
- **Alarms**: AsyncStorage with AlarmManager
- **Sleep Records**: AsyncStorage with timestamp-based tracking
- **Wake-up Records**: Daily tracking with completion status
- **Morning Routines**: Daily routines with completion tracking

### Key Components

#### 1. AlarmManager (`utils/alarm-manager.tsx`)
Handles all alarm CRUD operations and data persistence.

**Methods:**
- `loadAlarms()` - Load all alarms
- `saveAlarms()` - Save alarms to storage
- `addAlarm()` - Add new alarm
- `updateAlarm()` - Update existing alarm
- `toggleAlarm()` - Enable/disable alarm
- `removeAlarm()` - Delete alarm
- `getNextAlarm()` - Get next scheduled alarm
- `getNextTriggerTime()` - Calculate alarm trigger timestamp
- `createFromDelay()` - Create flash/quick alarm

**New Methods for Sleep Tracking:**
- `loadSleepRecords()` - Load all sleep records
- `addSleepRecord()` - Log new sleep session
- `loadWakeUpRecords()` - Load wake-up completion records
- `addWakeUpRecord()` - Record wake-up event
- `getTodayWakeUpRecord()` - Get today's wake-up record
- `updateWakeUpRecord()` - Mark task completion

#### 2. SleepTracker (`utils/sleep-tracker.ts`)
High-level sleep tracking utilities.

**Key Methods:**
- `recordWakeUp()` - Record wake-up time
- `markWakeUpTaskComplete()` - Mark wake-up task as completed
- `getSleepStats(startDate, endDate)` - Calculate sleep statistics
- `getWakeUpStats(startDate, endDate)` - Calculate wake-up statistics
- `getThisWeekRange()` - Get current week date range
- `getLastWeekRange()` - Get previous week date range

#### 3. Custom Hooks (`hooks/useSleepData.ts`)
React hooks for easy component integration.

**useSleepData()** - Manage sleep records and wake-up data
**useMorningRoutines()** - Manage morning routines

## Complete Screens

### 1. Main Tab Screens

#### Báo Thức (Alarms) - `app/(tabs)/index.tsx`
- Display list of all alarms
- Toggle alarms on/off
- Edit alarms
- Delete alarms
- Show next scheduled alarm time
- Quick alarm creation
- Snooze settings

#### Sáng (Morning) - `app/(tabs)/day.tsx` ✨ NEW/ENHANCED
**Features:**
- Display wake-up time for today
- Track morning routines/habits
- Progress bar showing completion percentage
- Add/remove routines dynamically
- Suggested routines from predefined list
- Save routine completion to AsyncStorage
- Visual checkmarks for completed tasks
- Record completion times

**Data Flow:**
1. Load wake-up record from WakeUpRecords
2. Load today's routines from AsyncStorage (TODAY_ROUTINES)
3. Display with completion status
4. Save changes back to AsyncStorage
5. Sync with report statistics

#### Giấc Ngủ (Sleep) - `app/(tabs)/explore.tsx` ✨ NEW/ENHANCED
**Features:**
- Sleep quality score (arc gauge)
- Manual sleep tracking via modal
- Sleep time input (24-hour format)
- Wake time input
- Quality rating (0-100%)
- Optional notes
- Display last 7 days of sleep records
- Calculate average sleep duration
- Show sleep quality trends
- Modal for adding new sleep records

**Sleep Record Structure:**
```typescript
{
  id: string;
  date: string; // YYYY-MM-DD
  sleepTime: number; // timestamp
  wakeTime: number; // timestamp
  duration: number; // minutes
  quality: number; // 0-100
  notes: string;
  createdAt: number; // timestamp
}
```

#### Báo Cáo (Report) - `app/(tabs)/report.tsx` ✨ NEW/ENHANCED
**Features:**
- Two tabs: Wake-up & Sleep
- Weekly statistics with navigation
- Daily activity grid visualization
- Sleep duration bar chart
- Wake-up completion history
- Detailed record modal
- Filter by week (current, previous)
- Calculate streaks
- Average times and quality metrics

**Wake-up Tab:**
- Completed count
- Streak calculation
- Average wake-up time
- Daily completion grid
- Detailed records list

**Sleep Tab:**
- Average sleep duration
- Average sleep quality
- Sleep duration distribution chart
- Detailed sleep records with quality badges

#### Cài đặt (Settings) - `app/(tabs)/settings.tsx`
- Account info card
- Pro features card
- Settings menu items
- Navigation to detailed settings screens

### 2. Flow Screens (Alarm Ringing)

#### Kiểm Tra Thức Dậy (Wake-up Check) - `app/wake-up-check.tsx`
Interactive verification that user is awake.

**Features:**
- "I'm awake" button with animation
- Countdown options (1, 3, 5, 7, 10 minutes)
- Phone mockup showing notification
- Dismiss alert if sleeping through it
- Info modal with instructions

#### Đếm Ngược Hoãn (Snooze Countdown) - `app/snooze-countdown.tsx`
Countdown display during snooze.

**Features:**
- Large timer display
- Circular progress indicator
- Pause/resume snooze
- Dismiss alarm early
- Auto-trigger alarm when countdown ends
- Snooze count indicator

#### Báo Thức Đang Reo (Alarm Ringing) - `app/alarm-ringing.tsx`
Main alarm ringing interface.

**Features:**
- Large time display
- Alarm label
- Snooze button
- Dismiss button
- Vibration feedback
- Sound playing

### 3. Routine/Habit Screens

#### Chọn Thói Quen (Routine Selection) - `app/routine-selection.tsx`
Select routine to create.

**Features:**
- Predefined routine recommendations
- Custom routine input
- Icon and color selection
- Route to habit form for configuration

#### Biểu Mẫu Thói Quen (Habit Form) - `app/habit-form.tsx`
Configure routine/habit for alarm.

**Features:**
- Set routine time
- Select days of week
- Configure volume, vibration
- Gentle wake options
- Add tasks (math, tap challenge, etc.)
- Snooze settings
- Preview

### 4. Task Screens

#### Nhiệm Vụ Toán (Math Task) - `app/math-task.tsx`
Solve math problems to dismiss alarm.

**Features:**
- Multiple difficulty levels
- Configurable rounds
- Timer per question
- Feedback (correct/incorrect)
- Progress tracking

#### Nhanh (Flash Alarm) - `app/flash-alarm.tsx`
Quick alarm creation widget.

**Features:**
- Time delay selector
- Volume control
- Vibration toggle
- Quick save
- Shown in modal

## Integration Points

### 1. Wake-up Flow
```
Alarm triggers
  ↓
Alarm ringing screen
  ↓
Wake-up check (optional)
  ↓
Record WakeUpRecord if task completed
  ↓
Update today's routine status
  ↓
Redirect to home or morning screen
```

### 2. Sleep Tracking Flow
```
User opens Giấc Ngủ screen
  ↓
Load last 7 sleep records
  ↓
Display stats and records
  ↓
User taps "Theo dõi giấc ngủ"
  ↓
Modal opens for manual entry
  ↓
Save to SleepRecords
  ↓
Update UI with new record
```

### 3. Morning Routine Flow
```
User wakes up (WakeUpRecord created)
  ↓
Opens Sáng screen
  ↓
Load today's routines from AsyncStorage
  ↓
Display with completion status
  ↓
User completes routines
  ↓
Check off each item
  ↓
Save to AsyncStorage
  ↓
Show progress and completion time
```

## Data Models

### Alarm
```typescript
{
  id: string;
  hour: number;
  minute: number;
  enabled: boolean;
  label: string;
  icon: string;
  days: string[]; // ['T2', 'T3']
  volume: number; // 0-100
  vibration: boolean;
  gentleWake: string;
  tasks: AlarmTask[];
  snoozeSettings: {
    enabled: boolean;
    interval: number;
    maxCount: number | 'unlimited';
  };
  type: 'regular' | 'flash';
  createdAt: number;
}
```

### SleepRecord
```typescript
{
  id: string;
  date: string; // YYYY-MM-DD
  sleepTime: number; // timestamp
  wakeTime: number; // timestamp
  duration: number; // minutes
  quality: number; // 0-100
  notes: string;
  createdAt: number;
}
```

### WakeUpRecord
```typescript
{
  id: string;
  date: string; // YYYY-MM-DD
  wakeUpTime: number; // timestamp
  taskCompleted: boolean;
  completionTime?: number; // timestamp
  createdAt: number;
}
```

### RoutineTask
```typescript
{
  id: string;
  name: string;
  completed: boolean;
  completedAt?: number;
}
```

## Styling Consistency

### Color Scheme
- **Primary Background**: `#0f172a` (dark slate)
- **Secondary Background**: `#1e293b` (lighter slate)
- **Border Color**: `#334155` (medium slate)
- **Primary Color**: `#3b82f6` (blue)
- **Success Color**: `#22c55e` (green)
- **Warning Color**: `#f59e0b` (amber)
- **Error Color**: `#ef4444` (red)
- **Text Primary**: `#ffffff` (white)
- **Text Secondary**: `#94a3b8` (light gray)
- **Text Tertiary**: `#64748b` (medium gray)

### Typography
- **Headers**: 28px, fontWeight: '700'
- **Section Titles**: 16px, fontWeight: '600'
- **Body Text**: 14px, fontWeight: '500'
- **Small Text**: 12px, fontWeight: '400'

### Components
- **Border Radius**: 12px (cards), 8px (buttons)
- **Padding**: 16px (standard)
- **Gap**: 8-12px (between elements)

## State Management

The app uses:
1. **React Hooks** - Local component state
2. **AsyncStorage** - Persistent storage
3. **Custom Hooks** - Reusable logic (useSleepData, useMorningRoutines)
4. **AlarmManager/SleepTracker** - Utility classes for data operations

## Testing Data

To test the app with sample data:

```typescript
// Add test sleep record
await AlarmManager.addSleepRecord({
  date: '2024-01-28',
  sleepTime: Date.now() - 8 * 60 * 60 * 1000,
  wakeTime: Date.now(),
  duration: 480,
  quality: 85,
  notes: 'Good sleep',
});

// Add test wake-up record
await AlarmManager.addWakeUpRecord({
  date: '2024-01-28',
  wakeUpTime: Date.now(),
  taskCompleted: true,
  completionTime: Date.now(),
});
```

## Performance Optimizations

1. **Memoization**: React.memo on list items
2. **Lazy Loading**: Load data on screen focus (useFocusEffect)
3. **FlatList**: For efficient list rendering
4. **ScrollView**: With proper contentContainerStyle
5. **State Batching**: Group related updates

## Known Limitations & Future Improvements

1. **Backup/Restore**: Consider implementing cloud sync
2. **Push Notifications**: Implement native notification scheduling
3. **Sleep Analytics**: Add trend analysis and predictions
4. **Habit Gamification**: Add streaks, badges, achievements
5. **Accessibility**: Enhanced screen reader support
6. **Performance**: Consider Redux for complex state management

## Troubleshooting

### Sleep data not persisting
- Check AsyncStorage permissions
- Verify AlarmManager.loadSleepRecords() is being called
- Check device storage availability

### Morning routine not updating
- Ensure AsyncStorage is saving via TODAY_ROUTINES key
- Check useFocusEffect is triggering on screen focus
- Verify date formatting is consistent

### Report statistics showing wrong data
- Confirm date range filtering logic
- Check SleepTracker calculation methods
- Verify record dates are in YYYY-MM-DD format

## File Structure

```
app/
  ├── (tabs)/
  │   ├── index.tsx (Alarms) ✓
  │   ├── explore.tsx (Sleep) ✨
  │   ├── day.tsx (Morning) ✨
  │   ├── report.tsx (Report) ✨
  │   └── settings.tsx (Settings) ✓
  ├── (settings)/
  │   ├── alarm-settings.tsx
  │   ├── general-settings.tsx
  │   ├── optimize-alarms.tsx
  │   └── ... (other settings)
  ├── wake-up-check.tsx
  ├── alarm-ringing.tsx
  ├── snooze-countdown.tsx
  ├── flash-alarm.tsx
  ├── math-task.tsx
  ├── habit-form.tsx
  └── routine-selection.tsx
utils/
  ├── alarm-manager.tsx (Enhanced with sleep tracking)
  └── sleep-tracker.ts (New utility class)
hooks/
  └── useSleepData.ts (New custom hooks)
components/
  └── ... (reusable components)
```

## Next Steps

1. Test all flows end-to-end
2. Add error handling and user feedback
3. Implement proper logging
4. Add haptic feedback
5. Optimize animations
6. Add onboarding/tutorial
7. Implement pro features (premium functionality)
