import { router } from 'expo-router';
import { SymbolView, type SFSymbol } from 'expo-symbols';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { EmptyState, PageHead, Panel, PrimaryButton, Screen, SecondaryButton } from '../../components/NativeUi';
import { supabase, supabaseConfigured } from '../../lib/supabase';
import { useMenufy } from '../../providers/MenufyProvider';
import { useMenufyTheme } from '../../theme';

type Notice = {
  id: string;
  kind: 'menu' | 'offer' | 'system';
  title: string;
  body: string;
  time_label: string;
  restaurant_slug: string | null;
  notification_reads: { dismissed_at: string | null }[];
};

const kinds: Record<Notice['kind'], { icon: SFSymbol; label: string }> = {
  menu: { icon: 'calendar', label: 'Denné menu' },
  offer: { icon: 'star', label: 'Ponuka' },
  system: { icon: 'bell', label: 'Systém' },
};

export default function NotificationsScreen() {
  const { theme: themeMode, userId, loggedIn } = useMenufy();
  const theme = useMenufyTheme(themeMode);
  const [items, setItems] = useState<Notice[] | null>(null);

  useEffect(() => {
    if (!userId || !supabaseConfigured) {
      setItems([]);
      return;
    }
    let live = true;
    void supabase
      .from('notifications')
      .select('id, kind, title, body, time_label, restaurant_slug, notification_reads(dismissed_at)')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (!live) return;
        const notices = ((data ?? []) as Notice[]).filter(
          (notice) => !notice.notification_reads.some((read) => read.dismissed_at),
        );
        setItems(notices);
      });
    return () => {
      live = false;
    };
  }, [userId]);

  const dismiss = (gone: Notice[]) => {
    if (!userId || !gone.length) return;
    const previous = items ?? [];
    const ids = new Set(gone.map((notice) => notice.id));
    setItems((current) => current?.filter((notice) => !ids.has(notice.id)) ?? []);
    void supabase
      .from('notification_reads')
      .upsert(gone.map((notice) => ({ notification_id: notice.id, user_id: userId, dismissed_at: new Date().toISOString() })))
      .then(({ error }) => {
        if (error) setItems(previous);
      });
  };

  return (
    <Screen theme={theme}>
      <PageHead
        theme={theme}
        kicker="Centrum upozornení"
        title="Upozornenia"
        right={
          items && items.length > 0 ? (
            <Pressable accessibilityRole="button" onPress={() => dismiss(items)} hitSlop={6}>
              <Text style={[styles.link, { color: theme.green }]}>Vymazať všetky</Text>
            </Pressable>
          ) : null
        }
      />

      {!loggedIn ? (
        <EmptyState
          theme={theme}
          title="Nie ste prihlásený"
          message="Prihláste sa a uvidíte svoje upozornenia a denné súhrny menu."
          action={<PrimaryButton theme={theme} title="Prihlásiť sa" onPress={() => router.push('/login')} />}
        />
      ) : null}

      {loggedIn && items && items.length === 0 ? (
        <EmptyState
          theme={theme}
          title="Žiadne upozornenia"
          message="Keď bude niečo nové, uvidíte to tu."
        />
      ) : null}

      {loggedIn && items?.map((notice) => (
        <Panel theme={theme} key={notice.id}>
          <View style={styles.noticeTop}>
            <View style={[styles.iconWrap, { backgroundColor: theme.greenSoft }]}>
              <SymbolView name={kinds[notice.kind]?.icon ?? 'bell'} size={17} tintColor={theme.green} />
            </View>
            <View style={{ flexShrink: 1 }}>
              <View style={styles.metaRow}>
                <Text style={[styles.tag, { color: theme.tagFg, backgroundColor: theme.tagBg }]}>
                  {kinds[notice.kind]?.label ?? 'Systém'}
                </Text>
                <Text style={[styles.time, { color: theme.faint }]}>{notice.time_label}</Text>
              </View>
              <Text style={[styles.title, { color: theme.ink }]}>{notice.title}</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Odstrániť upozornenie: ${notice.title}`}
              onPress={() => dismiss([notice])}
              hitSlop={8}
            >
              <SymbolView name="trash" size={16} tintColor={theme.faint} />
            </Pressable>
          </View>
          <Text style={[styles.body, { color: theme.muted }]}>{notice.body}</Text>
          {notice.restaurant_slug ? (
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                router.push({ pathname: '/restaurant/[slug]', params: { slug: notice.restaurant_slug! } })
              }
            >
              <Text style={[styles.link, { color: theme.green }]}>Zobraziť menu</Text>
            </Pressable>
          ) : null}
        </Panel>
      ))}

      <SecondaryButton
        theme={theme}
        title="Nastaviť upozornenia"
        onPress={() => router.push('/settings')}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  link: { fontSize: 13, fontWeight: '700' },
  noticeTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  iconWrap: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  tag: { fontSize: 11, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, overflow: 'hidden' },
  time: { fontSize: 11 },
  title: { fontSize: 14, fontWeight: '800' },
  body: { fontSize: 13, lineHeight: 19, marginTop: 8, marginBottom: 6 },
});
