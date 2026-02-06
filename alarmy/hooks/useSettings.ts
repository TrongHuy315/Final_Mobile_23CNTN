import { useState, useEffect } from 'react';
import { SettingsManager, AppSettings } from '@/utils/settings-manager';

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const loadedSettings = await SettingsManager.loadSettings();
      setSettings(loadedSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = async <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    try {
      const updated = await SettingsManager.updateSetting(key, value);
      setSettings(updated);
    } catch (error) {
      console.error('Error updating setting:', error);
      throw error;
    }
  };

  const resetToDefault = async () => {
    try {
      const defaultSettings = await SettingsManager.resetToDefault();
      setSettings(defaultSettings);
    } catch (error) {
      console.error('Error resetting settings:', error);
      throw error;
    }
  };

  return {
    settings,
    isLoading,
    updateSetting,
    resetToDefault,
    reload: loadSettings,
  };
}
