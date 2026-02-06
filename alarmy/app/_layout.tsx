import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import 'react-native-reanimated';
// eslint-disable-next-line import/namespace
import { AuthProvider } from '@/hooks/useAuth';

export const unstable_settings = {
  anchor: '(tabs)',
};

const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#0f172a',
    card: '#0f172a',
  },
};

import { useAlarmTrigger } from '../hooks/useAlarmTrigger';

export default function RootLayout() {
  useAlarmTrigger();

  return (
    <AuthProvider>
      <View style={{ flex: 1, backgroundColor: '#0f172a' }}>
        <ThemeProvider value={CustomDarkTheme}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#0f172a' },
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
          <StatusBar style="light" />
        </ThemeProvider>
      </View>
    </AuthProvider>
  );
}
