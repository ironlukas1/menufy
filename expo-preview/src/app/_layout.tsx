import { StatusBar } from 'expo-status-bar';
import { NativeTabs } from 'expo-router/native-tabs';
import { DynamicColorIOS, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

/**
 * The tab bar is drawn by UIKit (`UITabBarController`). On iOS 26+ the system
 * gives it the real Liquid Glass material — refraction, highlights and all —
 * and orchestrates the floating, translucent bar over the WebView content.
 */
const tint =
  Platform.OS === 'ios'
    ? DynamicColorIOS({ light: '#176b43', dark: '#7bdcaa' })
    : '#176b43';

/**
 * Tabs: Domov, Uložené, Upozornenia and Účet. Settings are reached from the
 * account page (the native tab opens the web app's /account route).
 */
export default function TabLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <NativeTabs tintColor={tint} minimizeBehavior="never">
        <NativeTabs.Trigger name="index">
          <NativeTabs.Trigger.Label>Domov</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf="magnifyingglass" md="search" />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="saved">
          <NativeTabs.Trigger.Label>Uložené</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            sf={{ default: 'heart', selected: 'heart.fill' }}
            md={{ default: 'favorite_border', selected: 'favorite' }}
          />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="notifications">
          <NativeTabs.Trigger.Label>Upozornenia</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            sf={{ default: 'bell', selected: 'bell.fill' }}
            md={{ default: 'notifications_none', selected: 'notifications' }}
          />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="account">
          <NativeTabs.Trigger.Label>Účet</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            sf={{ default: 'person.crop.circle', selected: 'person.crop.circle.fill' }}
            md={{ default: 'account_circle', selected: 'account_circle' }}
          />
        </NativeTabs.Trigger>
      </NativeTabs>
    </SafeAreaProvider>
  );
}
