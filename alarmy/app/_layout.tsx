import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import 'react-native-reanimated';
// eslint-disable-next-line import/namespace
import { AuthProvider } from '@/hooks/useAuth';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

import { useAlarmTrigger } from '../hooks/useAlarmTrigger';

function RootLayoutContent() {
  useAlarmTrigger();
  const { isDarkMode, colors } = useTheme();

  const CustomTheme = {
    ...(isDarkMode ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDarkMode ? DarkTheme : DefaultTheme).colors,
      background: colors.background,
      card: colors.card,
    },
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <NavigationThemeProvider value={CustomTheme}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
            animation: 'fade',
            animationDuration: 100,
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(settings)" />
          <Stack.Screen name="add-alarm" />
          <Stack.Screen name="wake-up-check" />
          <Stack.Screen name="snooze-settings" />
          <Stack.Screen name="debug" />
        </Stack>
        <StatusBar style={isDarkMode ? "light" : "dark"} />
      </NavigationThemeProvider>
    </View>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <RootLayoutContent />
      </ThemeProvider>
    </AuthProvider>
  );
}

