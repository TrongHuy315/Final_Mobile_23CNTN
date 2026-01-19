import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import 'react-native-reanimated';

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

export default function RootLayout() {
  return (
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
        </Stack>
        <StatusBar style="light" />
      </ThemeProvider>
    </View>
  );
}
