import { router } from 'expo-router';
import { SymbolView, type SFSymbol } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PageHead, Panel, SecondaryButton, Screen } from '../../components/NativeUi';
import { useMenufy } from '../../providers/MenufyProvider';
import { useMenufyTheme } from '../../theme';

function initials(name: string, email: string) {
  const source = name && name !== 'Člen menufy' ? name : email.split('@')[0] || 'M';
  const parts = source.trim().split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[1][0] : source.slice(0, 2);
  return letters.toLocaleUpperCase('sk');
}

function AccountLink({
  icon,
  title,
  subtitle,
  onPress,
  theme,
}: {
  icon: SFSymbol;
  title: string;
  subtitle: string;
  onPress: () => void;
  theme: ReturnType<typeof useMenufyTheme>;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.linkRow}>
      <View style={[styles.linkIcon, { backgroundColor: theme.greenSoft }]}>
        <SymbolView name={icon} size={18} tintColor={theme.green} />
      </View>
      <View style={{ flexShrink: 1 }}>
        <Text style={[styles.linkTitle, { color: theme.ink }]}>{title}</Text>
        <Text style={[styles.linkSubtitle, { color: theme.muted }]}>{subtitle}</Text>
      </View>
      <SymbolView name="chevron.right" size={15} tintColor={theme.faint} />
    </Pressable>
  );
}

export default function AccountScreen() {
  const { theme: themeMode, loggedIn, email, displayName, signOut } = useMenufy();
  const theme = useMenufyTheme(themeMode);

  return (
    <Screen theme={theme}>
      <PageHead theme={theme} kicker="Môj profil" title="Účet" />

      <Panel theme={theme}>
        <View style={styles.profileRow}>
          <View style={[styles.avatar, { backgroundColor: loggedIn ? theme.green : theme.line }]}>
            <Text style={styles.avatarText}>{loggedIn ? initials(displayName, email) : '?'}</Text>
          </View>
          <View style={{ flexShrink: 1 }}>
            <Text style={[styles.name, { color: theme.ink }]}>
              {loggedIn ? displayName : 'Nie ste prihlásený'}
            </Text>
            <Text style={[styles.email, { color: theme.muted }]}>
              {loggedIn
                ? email
                : 'Prihláste sa a majte obľúbené, upozornenia aj nastavenia na jednom mieste.'}
            </Text>
          </View>
        </View>
        {!loggedIn ? (
          <SecondaryButton theme={theme} title="Prihlásiť sa" onPress={() => router.push('/login')} />
        ) : null}
      </Panel>

      <Panel theme={theme}>
        <AccountLink
          theme={theme}
          icon="gearshape"
          title="Nastavenia"
          subtitle="Meno, e-mail, heslo, vzhľad a upozornenia"
          onPress={() => router.push('/settings')}
        />
        <AccountLink
          theme={theme}
          icon="heart"
          title="Obľúbené"
          subtitle="Reštaurácie, ktoré ste si uložili"
          onPress={() => router.push('/saved')}
        />
        <AccountLink
          theme={theme}
          icon="bell"
          title="Upozornenia"
          subtitle="Novinky a denné súhrny menu"
          onPress={() => router.push('/notifications')}
        />
        <AccountLink
          theme={theme}
          icon="storefront"
          title="Vlastníš reštauráciu?"
          subtitle="Spravujte menu a profil podniku"
          onPress={() => router.push('/owners')}
        />
      </Panel>

      {loggedIn ? (
        <SecondaryButton theme={theme} title="Odhlásiť sa" onPress={signOut} />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 17 },
  name: { fontSize: 17, fontWeight: '800' },
  email: { fontSize: 12, marginTop: 3, lineHeight: 17 },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 11 },
  linkIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  linkTitle: { fontSize: 14, fontWeight: '700' },
  linkSubtitle: { fontSize: 12, marginTop: 2 },
});
