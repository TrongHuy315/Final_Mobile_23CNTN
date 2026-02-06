# 🧪 Alarmy App - Testing & Quick Start Guide

## 🚀 Quick Start

### 1. **Setup Environment**

```bash
cd /home/zeroentropy/Study/Mobile/Final/alarmy

# Install dependencies (already done)
npm install

# Optional: Fix vulnerabilities
npm audit fix --force
```

### 2. **Configure Google Sign In**

Before running on device, set up your Google Cloud Project:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web Client)
5. Get your Web Client ID
6. Add to `.env.local`:

```env
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_client_id_here
```

Or set as environment variable before running.

### 3. **Start Development Server**

```bash
# Start Expo development server
npm start

# Or directly:
expo start
```

### 4. **Run on Device/Emulator**

```bash
# Android
npm run android

# iOS (Mac only)
npm run ios

# Web (for testing)
npm run web
```

---

## ✅ Testing Checklist

### Basic Features
- [ ] App starts without errors
- [ ] All tabs load correctly (Báo Thức, Sáng, Giấc Ngủ, Báo Cáo)
- [ ] Navigation between tabs works smoothly
- [ ] Settings button opens settings menu

### Audio & Vibration
- [ ] Create an alarm and wait for it to trigger
- [ ] Verify sound plays from speaker (alarm_ringing.mp3)
- [ ] Verify device vibrates in pattern
- [ ] Press dismiss button to stop sound
- [ ] Verify snooze button delays alarm
- [ ] Check volume slider affects sound level

### Sleep Tracking (Giấc Ngủ Tab)
- [ ] Arc gauge displays (should show ~63 by default)
- [ ] Click "Theo dõi giấc ngủ của tôi" button
- [ ] Modal opens with time/quality inputs
- [ ] Change sleep time HH:MM format
- [ ] Change wake time HH:MM format
- [ ] Adjust quality slider (0-100%)
- [ ] Add optional notes
- [ ] Click save and verify record appears
- [ ] Check stats update (average duration, quality)
- [ ] Navigate to report tab to see data

### Morning Routine (Sáng Tab)
- [ ] Wake-up time displays (if record exists)
- [ ] Progress bar shows 0% initially
- [ ] Click routine items to mark complete
- [ ] Progress updates with each checked item
- [ ] Click "Thêm thói quen khác" to add routines
- [ ] Completion time shows for checked items
- [ ] Data persists after app restart

### Report Tab
- [ ] Two tabs visible: "Thức dậy" and "Giấc ngủ"
- [ ] Week navigation arrows work
- [ ] Week label updates correctly
- [ ] Stats cards show data
- [ ] Activity grid shows completed/empty days
- [ ] Can click on days to see details
- [ ] Records list displays with times

### Alarm Tasks

#### Math Task
- [ ] Create alarm with math task
- [ ] When alarm rings, press dismiss
- [ ] Math task screen opens
- [ ] Problem displays (e.g., "25+13=")
- [ ] Number keyboard works
- [ ] Input shows on screen
- [ ] Submit answer with checkmark
- [ ] Correct answer → success animation
- [ ] Incorrect answer → shake animation
- [ ] Timer counts down
- [ ] Multiple rounds complete (based on config)

#### Tap Challenge
- [ ] Create alarm with tap task
- [ ] Task screen shows "Bắt đầu" button
- [ ] Auto-starts after 2 seconds
- [ ] Large blue tap button appears
- [ ] Tap counter increases
- [ ] Progress fills as you tap
- [ ] Timer counts down
- [ ] Reaches goal → success

#### Shake Detection
- [ ] Create alarm with shake task
- [ ] Screen shows shake target
- [ ] Shake device vigorously
- [ ] Count increases with shakes
- [ ] Reaches target → success
- [ ] Timeout → failure screen

#### Face Detection
- [ ] Create alarm with face detection (if enabled)
- [ ] Grant camera permission when prompted
- [ ] Live camera feed shows with circle overlay
- [ ] Detection button appears
- [ ] Click detection button to simulate detection
- [ ] Counter increases
- [ ] Reaches 3 detections → success

### Google Sign In
- [ ] Go to Settings → Login
- [ ] "Tiếp tục với Google" button visible
- [ ] Click button (may open browser)
- [ ] Select/sign in with Google account
- [ ] Returns to app
- [ ] User should be logged in

### Settings
- [ ] Go to Settings tab
- [ ] Various setting options visible
- [ ] Toggle switches work
- [ ] Changes persist after restart
- [ ] Can navigate to sub-settings pages

### Data Persistence
- [ ] Close and reopen app
- [ ] All alarms still there
- [ ] Sleep records still there
- [ ] Routines still checked
- [ ] Settings preserved
- [ ] Authentication persists

---

## 🐛 Known Issues & Workarounds

### Audio Not Playing
**Issue**: No sound when alarm triggers  
**Cause**: Audio permissions not granted or system in silent mode  
**Fix**:
- Check device volume is not on silent/vibrate
- Go to Settings → Apps → Permissions → Microphone/Audio
- Grant requested permissions
- Restart app

### Face Detection Not Working  
**Issue**: Camera shows but detection doesn't work  
**Cause**: ML model weights not loaded  
**Workaround**: Use the "Phát hiện" button to simulate detection

### Google Sign In Fails
**Issue**: "Client ID is invalid" error  
**Cause**: Environment variable not set or wrong ID  
**Fix**:
```bash
# Set before running
export EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID="your_id"
expo start
```

### Data Not Persisting
**Issue**: Data disappears after restart  
**Cause**: AsyncStorage not initialized or permissions issue  
**Fix**:
- Clear app cache: Settings → Apps → Alarmy → Clear Cache
- Reinstall app: `expo prebuild --clean` then rebuild

---

## 📊 Performance Testing

### Memory Usage
```bash
# Monitor while running
adb shell dumpsys meminfo com.example.alarmy

# On iOS
Use Xcode's Memory Debugger
```

### Battery Usage
- Keep app running for 1+ hour
- Check battery consumption in Settings
- Should be minimal when idle

### Animation Smoothness
- Navigate between tabs repeatedly
- Should maintain 60 FPS
- No stuttering or lag

---

## 🔍 Debugging Tips

### React Native Debugger
```bash
# Install if not already
npm install -g react-native-debugger

# Open debugger
react-native-debugger
```

### Expo Logs
```bash
# Show detailed logs
expo start --clear

# View specific logs
expo logs
```

### Console Logs
Look for these prefixes in console:
- `✅` - Success messages
- `❌` - Error messages  
- `🔊` - Audio system
- `📋` - Alarm operations
- `💤` - Sleep tracking

---

## 📝 Test Report Template

Use this template to document test results:

```markdown
## Test Results - [Date]

### Environment
- Device: [iPhone/Android]
- OS Version: [Version]
- App Version: [Version]
- Build Date: [Date]

### Test Results
| Feature | Status | Notes |
|---------|--------|-------|
| Audio Playback | ✅/❌ | |
| Sleep Tracking | ✅/❌ | |
| Morning Routine | ✅/❌ | |
| ... | | |

### Issues Found
1. [Issue description]
   - Severity: [Low/Medium/High]
   - Steps: [How to reproduce]
   - Expected: [What should happen]
   - Actual: [What actually happened]

### Recommendations
- [Suggestion 1]
- [Suggestion 2]
```

---

## 🎯 Important Notes

### For Real Alarm Testing
To avoid constant alarm triggers during development:
1. Create alarms in the future
2. Use fast-forward in emulator to reach alarm time
3. Or manually trigger by opening alarm-ringing screen directly

### Storage Access
All data stored in:
- **AsyncStorage**: `/data/data/com.example.alarmy/files/RCTAsyncLocalStorage_V1`
- **SecureStore**: Device secure storage (encrypted)

Can view with:
```bash
adb shell cat /data/data/com.example.alarmy/files/RCTAsyncLocalStorage_V1
```

### Permissions to Grant
When prompting appears, grant:
- Camera (for face detection)
- Microphone (for audio)
- Vibration (for haptics)
- Contacts (if social features added)

---

## ✨ Pro Tips

1. **Faster Development**:
   - Use Expo Go on your phone (no rebuild needed)
   - Changes hot-reload in seconds

2. **Multi-Device Testing**:
   - Scan QR code on multiple devices
   - Test simultaneously

3. **Network Inspection**:
   - Open Expo DevTools Network tab
   - Watch API calls (when backend added)

4. **Storage Inspection**:
   - React Native Debugger shows Redux/state
   - Check AsyncStorage directly in console

---

## 📞 Support

If you encounter issues:

1. **Check logs**: Look for error messages with ❌
2. **Restart**: Often fixes temporary issues
3. **Clear cache**: `npx expo-cli r -c`
4. **Full rebuild**: `expo prebuild --clean`
5. **Check docs**: Review comments in code

---

**Last Updated**: February 6, 2026  
**Version**: 1.0.0  
**Ready for**: QA Testing
