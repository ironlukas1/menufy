import { NativeTabs } from 'expo-router/native-tabs';
import { DynamicColorIOS, Platform } from 'react-native';

/** UIKit draws the tab bar; on iOS 26+ it uses real Liquid Glass. */
const tint =
  Platform.OS === 'ios'
    ? DynamicColorIOS({ light: '#176b43', dark: '#7bdcaa' })
    : '#176b43';

export default function TabLayout() {
  return (
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
  );
}
