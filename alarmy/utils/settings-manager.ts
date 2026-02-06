import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AppSettings {
  theme: 'dark' | 'light';
  language: 'vi' | 'en';
  notifications: boolean;
  soundEnabled: boolean;
  hapticFeedback: boolean;
  doNotDisturb: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
  alarmVolume: number;
  displayFormat: '12hour' | '24hour';
  sleepGoal: number; // in hours
  wakeUpReminderEnabled: boolean;
  wakeUpReminderTime: number; // minutes before alarm
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  language: 'vi',
  notifications: true,
  soundEnabled: true,
  hapticFeedback: true,
  doNotDisturb: {
    enabled: false,
    startTime: '22:00',
    endTime: '07:00',
  },
  alarmVolume: 80,
  displayFormat: '24hour',
  sleepGoal: 8,
  wakeUpReminderEnabled: true,
  wakeUpReminderTime: 15,
};

const SETTINGS_KEY = 'APP_SETTINGS';

export class SettingsManager {
  /**
   * Load all settings
   */
  static async loadSettings(): Promise<AppSettings> {
    try {
      const data = await AsyncStorage.getItem(SETTINGS_KEY);
      if (!data) {
        // Save default settings
        await this.saveSettings(DEFAULT_SETTINGS);
        return DEFAULT_SETTINGS;
      }
      return JSON.parse(data) as AppSettings;
    } catch (error) {
      console.error('Error loading settings:', error);
      return DEFAULT_SETTINGS;
    }
  }

  /**
   * Save all settings
   */
  static async saveSettings(settings: AppSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      console.log('✅ Settings saved');
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  /**
   * Update a specific setting
   */
  static async updateSetting<K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ): Promise<AppSettings> {
    const settings = await this.loadSettings();
    settings[key] = value;
    await this.saveSettings(settings);
    return settings;
  }

  /**
   * Reset settings to default
   */
  static async resetToDefault(): Promise<AppSettings> {
    await this.saveSettings(DEFAULT_SETTINGS);
    console.log('✅ Settings reset to default');
    return DEFAULT_SETTINGS;
  }

  /**
   * Get setting by key
   */
  static async getSetting<K extends keyof AppSettings>(key: K): Promise<AppSettings[K]> {
    const settings = await this.loadSettings();
    return settings[key];
  }

  /**
   * Export settings for backup
   */
  static async exportSettings(): Promise<string> {
    const settings = await this.loadSettings();
    return JSON.stringify(settings, null, 2);
  }

  /**
   * Import settings from backup
   */
  static async importSettings(jsonString: string): Promise<AppSettings> {
    try {
      const settings = JSON.parse(jsonString) as AppSettings;
      await this.saveSettings(settings);
      console.log('✅ Settings imported');
      return settings;
    } catch (error) {
      console.error('Error importing settings:', error);
      throw error;
    }
  }

  /**
   * Clear all settings
   */
  static async clearAll(): Promise<void> {
    try {
      await AsyncStorage.removeItem(SETTINGS_KEY);
      console.log('✅ Settings cleared');
    } catch (error) {
      console.error('Error clearing settings:', error);
    }
  }
}
