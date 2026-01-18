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
            contentStyle: { backgroundColor: '#0f172a' },
            animation: 'fade',
            animationDuration: 100,
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen 
            name="events" 
            options={{ 
              headerShown: false,
              contentStyle: { backgroundColor: '#0f172a' },
            }} 
          />
          <Stack.Screen 
            name="optimize-alarms" 
            options={{ 
              headerShown: false,
              contentStyle: { backgroundColor: '#0f172a' },
            }} 
          />
          <Stack.Screen 
            name="dismiss-alarm-task" 
            options={{ 
              headerShown: false,
              contentStyle: { backgroundColor: '#0f172a' },
            }} 
          />
          <Stack.Screen 
            name="general-settings" 
            options={{ 
              headerShown: false,
              contentStyle: { backgroundColor: '#0f172a' },
            }} 
          />
          <Stack.Screen 
            name="prevent-power-off" 
            options={{ 
              headerShown: false,
              contentStyle: { backgroundColor: '#0f172a' },
            }} 
          />
          <Stack.Screen 
            name="prevent-power-off-info" 
            options={{ 
              headerShown: false,
              presentation: 'modal',
              contentStyle: { backgroundColor: '#0f172a' },
            }} 
          />
          <Stack.Screen 
            name="alarm-settings" 
            options={{ 
              headerShown: false,
              contentStyle: { backgroundColor: '#0f172a' },
            }} 
          />
          <Stack.Screen 
            name="invite-friends" 
            options={{ 
              headerShown: false,
              contentStyle: { backgroundColor: '#0f172a' },
            }} 
          />
          <Stack.Screen 
            name="wake-up-challenge" 
            options={{ 
              headerShown: false,
              contentStyle: { backgroundColor: '#0f172a' },
            }} 
          />
          <Stack.Screen 
            name="display-settings" 
            options={{ 
              headerShown: false,
              contentStyle: { backgroundColor: '#0f172a' },
            }} 
          />
          <Stack.Screen 
            name="language-settings" 
            options={{ 
              headerShown: false,
              contentStyle: { backgroundColor: '#0f172a' },
            }} 
          />
          <Stack.Screen 
            name="send-feedback" 
            options={{ 
              headerShown: false,
              contentStyle: { backgroundColor: '#0f172a' },
            }} 
          />
          <Stack.Screen 
            name="login" 
            options={{ 
              headerShown: false,
              contentStyle: { backgroundColor: '#0f172a' },
            }} 
          />
          <Stack.Screen 
            name="upgrade-pro" 
            options={{ 
              headerShown: false,
              contentStyle: { backgroundColor: '#1e3a8a' },
            }} 
          />
        </Stack>
        <StatusBar style="light" />
      </ThemeProvider>
    </View>
  );
}
