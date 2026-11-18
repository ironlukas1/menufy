import { router } from 'expo-router';
import { useMemo } from 'react';

import { PageHead, Panel, PrimaryButton, Screen } from '../components/NativeUi';
import { useMenufy } from '../providers/MenufyProvider';
import { useMenufyTheme } from '../theme';

export default function VerifiedScreen() {
  const { theme: themeMode, loggedIn, refreshProfile } = useMenufy();
  const theme = useMenufyTheme(themeMode);
  const title = useMemo(() => (loggedIn ? 'E-mail overený' : 'Overujeme e-mail…'), [loggedIn]);

  return (
    <Screen theme={theme}>
      <PageHead theme={theme} kicker="Overenie" title={title} />
      <Panel theme={theme}>
        <PrimaryButton
          theme={theme}
          title={loggedIn ? 'Pokračovať' : 'Skontrolovať prihlásenie'}
          onPress={() => {
            void refreshProfile().then(() => {
              if (loggedIn) router.replace('/');
            });
          }}
        />
      </Panel>
    </Screen>
  );
}
