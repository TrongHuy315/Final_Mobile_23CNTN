import { Stack } from 'expo-router';

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0f172a' },
        animation: 'fade',
        animationDuration: 100,
      }}
    >
      <Stack.Screen name="alarm-settings" />
      <Stack.Screen name="dismiss-alarm-task" />
      <Stack.Screen name="display-settings" />
      <Stack.Screen name="general-settings" />
      <Stack.Screen name="language-settings" />
      <Stack.Screen name="optimize-alarms" />
      <Stack.Screen name="prevent-power-off" />
      <Stack.Screen 
        name="prevent-power-off-info" 
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen name="send-feedback" />
      <Stack.Screen name="login" />
      <Stack.Screen 
        name="upgrade-pro" 
        options={{ contentStyle: { backgroundColor: '#1e3a8a' } }}
      />
      <Stack.Screen name="invite-friends" />
      <Stack.Screen name="events" />
      <Stack.Screen name="wake-up-challenge" />
    </Stack>
  );
}
