import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { MenufyProvider } from '../providers/MenufyProvider';

/** Root stack: tabs live under it, detail and account flows push above the tab bar. */
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <MenufyProvider>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="restaurant/[slug]" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false, presentation: 'modal' }} />
          <Stack.Screen name="settings" options={{ headerShown: false }} />
          <Stack.Screen name="verified" options={{ headerShown: false, presentation: 'modal' }} />
          <Stack.Screen name="legal/[doc]" options={{ headerShown: false }} />
          <Stack.Screen name="owners" options={{ headerShown: false }} />
        </Stack>
      </MenufyProvider>
    </SafeAreaProvider>
  );
}
