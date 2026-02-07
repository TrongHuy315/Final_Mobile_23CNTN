import { Audio, AVPlaybackStatus, AVPlaybackSource } from 'expo-av';
import * as Haptics from 'expo-haptics';

export interface SoundConfig {
  name: string;
  file: AVPlaybackSource;
  duration: number; // in milliseconds
}

export const ALARM_SOUNDS: Record<string, SoundConfig> = {
  ringing: {
    name: 'Giờ Nghỉ Cà Phê',
    file: require('@/assets/sounds/alarm_ringing.mp3'),
    duration: 3000,
  },
  gentle: {
    name: 'Thức Dậy Nhẹ',
    file: require('@/assets/sounds/gentle_wake.mp3'),
    duration: 4000,
  },
  bell: {
    name: 'Chuông Mềm',
    file: require('@/assets/sounds/soft_bell.mp3'),
    duration: 2000,
  },
};

export class SoundManager {
  private static sound: Audio.Sound | null = null;
  private static isPlaying = false;
  private static playbackInstance: Audio.Sound | null = null;

  /**
   * Initialize audio for the app
   */
  static async initialize() {
    try {
      // Suppress expo-av deprecation warning
      const originalWarn = console.warn;
      console.warn = (...args: any[]) => {
        const message = args[0]?.toString?.() || '';
        if (message.includes('expo-av') || message.includes('deprecat')) {
          return; // Suppress deprecation warnings
        }
        originalWarn(...args);
      };

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });

      // Restore console.warn
      console.warn = originalWarn;

      console.log('🔊 Audio system initialized');
    } catch (error) {
      console.error('Error initializing audio:', error);
    }
  }

  /**
   * Play alarm sound
   * @param soundKey - Key of the sound to play (e.g., 'ringing', 'gentle')
   * @param volume - Volume level (0-1)
   * @param loop - Whether to loop the sound
   */
  static async playAlarmSound(
    soundKey: string = 'ringing',
    volume: number = 1,
    loop: boolean = true
  ) {
    try {
      // Stop current sound if playing
      if (this.isPlaying) {
        await this.stopAlarm();
      }

      const soundConfig = ALARM_SOUNDS[soundKey] || ALARM_SOUNDS.ringing;
      this.sound = new Audio.Sound();
      await this.sound.loadAsync(soundConfig.file);

      this.isPlaying = true;

      if (this.sound) {
        // Set volume
        await this.sound.setVolumeAsync(Math.max(0, Math.min(1, volume)));

        // Set looping
        await this.sound.setIsLoopingAsync(loop);

        // Set status callback for continuous looping
        if (loop) {
          this.sound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
            if (status.isLoaded && !status.isPlaying && status.didJustFinish) {
              // Restart the sound when it finishes
              this.sound?.playAsync().catch(() => {
                // Ignore errors from re-playing
              });
            }
          });
        }

        // Play the sound
        await this.sound.playAsync();
      }
      console.log(`🔊 Playing alarm sound: ${soundConfig.name}`);
    } catch (error) {
      console.error('Error playing alarm sound:', error);
    }
  }

  /**
   * Play a single beep (notification sound)
   */
  static async playBeep(volume: number = 0.5) {
    try {
      const sound = new Audio.Sound();
      const status = await sound.loadAsync(ALARM_SOUNDS.bell.file);
      
      if (status.isLoaded) {
        await sound.setVolumeAsync(Math.max(0, Math.min(1, volume)));
        await sound.playAsync();

        // Clean up after playing
        setTimeout(() => {
          sound.unloadAsync().catch(() => {});
        }, ALARM_SOUNDS.bell.duration);
      }
    } catch (error) {
      console.error('Error playing beep:', error);
    }
  }

  /**
   * Stop the alarm sound
   */
  static async stopAlarm() {
    try {
      if (this.sound) {
        const status = await this.sound.getStatusAsync();
        if (status.isLoaded) {
          await this.sound.stopAsync();
          await this.sound.unloadAsync();
        }
        this.sound = null;
      }
      this.isPlaying = false;
      console.log('🛑 Alarm stopped');
    } catch (error) {
      console.error('Error stopping alarm:', error);
    }
  }

  /**
   * Check if sound is currently playing
   */
  static isAlarmPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Play vibration feedback
   * @param type - Type of haptic feedback
   */
  static async playHaptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'error' = 'medium') {
    try {
      switch (type) {
        case 'light':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'medium':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'heavy':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case 'success':
          // Double tap pattern for success
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          await this.delay(150);
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'error':
          // Triple tap pattern for error
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          await this.delay(100);
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          await this.delay(100);
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
      }
    } catch (error) {
      console.error('Error playing haptic feedback:', error);
    }
  }

  /**
   * Play continuous vibration pattern for alarm
   */
  static async playAlarmVibration() {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      // Schedule continuous vibration with varied pattern
      const vibrationInterval = setInterval(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {
          clearInterval(vibrationInterval);
        });
      }, 600);

      // Return interval ID so caller can stop it
      return vibrationInterval;
    } catch (error) {
      console.error('Error playing alarm vibration:', error);
      return null;
    }
  }

  /**
   * Stop vibration pattern
   */
  static stopVibration(intervalId: NodeJS.Timeout | null) {
    if (intervalId) {
      clearInterval(intervalId);
    }
  }

  /**
   * Helper delay function
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Cleanup resources
   */
  static async cleanup() {
    try {
      await this.stopAlarm();
      if (this.playbackInstance) {
        await this.playbackInstance.unloadAsync();
        this.playbackInstance = null;
      }
    } catch (error) {
      console.error('Error during sound manager cleanup:', error);
    }
  }
}
