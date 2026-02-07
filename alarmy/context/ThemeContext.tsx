import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  themeMode: ThemeMode;
  isDarkMode: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  colors: typeof darkColors;
}

// Dark theme colors
export const darkColors = {
  background: '#0f172a',
  surface: '#1e293b',
  surfaceVariant: '#334155',
  text: '#ffffff',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',
  primary: '#38b6ff',
  primaryVariant: '#0ea5e9',
  border: '#1e293b',
  error: '#ef4444',
  success: '#22c55e',
  warning: '#f59e0b',
  card: '#1e293b',
  // Specific UI colors
  headerBackground: '#0f172a',
  tabBar: '#0f172a',
  tabIconDefault: '#64748b',
  tabIconSelected: '#38b6ff',
};

// Light theme colors
export const lightColors = {
  background: '#f8fafc',
  surface: '#ffffff',
  surfaceVariant: '#f1f5f9',
  text: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#94a3b8',
  primary: '#0ea5e9',
  primaryVariant: '#0284c7',
  border: '#e2e8f0',
  error: '#dc2626',
  success: '#16a34a',
  warning: '#d97706',
  card: '#ffffff',
  // Specific UI colors
  headerBackground: '#ffffff',
  tabBar: '#ffffff',
  tabIconDefault: '#94a3b8',
  tabIconSelected: '#0ea5e9',
};

const THEME_STORAGE_KEY = '@alarmy_theme_mode';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('dark');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved theme on mount
  useEffect(() => {
    loadSavedTheme();
  }, []);

  const loadSavedTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        setThemeModeState(savedTheme as ThemeMode);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      setThemeModeState(mode);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  // Determine if dark mode based on themeMode setting
  const isDarkMode = 
    themeMode === 'dark' || 
    (themeMode === 'system' && systemColorScheme === 'dark');

  const colors = isDarkMode ? darkColors : lightColors;

  // Don't render until theme is loaded to prevent flash
  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ themeMode, isDarkMode, setThemeMode, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export default ThemeContext;
