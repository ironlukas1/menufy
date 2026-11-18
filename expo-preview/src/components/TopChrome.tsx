import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassIconButton } from './Glass';
import type { Palette } from '../theme';

type Props = {
  theme: Palette;
  title?: string;
  subtitle?: string;
  mapOpen: boolean;
  filtersOpen: boolean;
  searchOpen: boolean;
  filterCount: number;
  onMap: () => void;
  onFilters: () => void;
  onSearch: () => void;
};

/**
 * Native replacement for the web top bar: map · filter · search, in that order,
 * with search rightmost. Active panels are shown by tint/badge only — never an X.
 */
export function TopChrome({
  theme,
  title = 'Menufy',
  subtitle,
  mapOpen,
  filtersOpen,
  searchOpen,
  filterCount,
  onMap,
  onFilters,
  onSearch,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.row, { paddingTop: insets.top + 12 }]}>
      <View style={styles.brand}>
        <Text style={[styles.title, { color: theme.ink }]}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: theme.muted }]}>{subtitle}</Text> : null}
      </View>
      <View style={styles.actions}>
        <GlassIconButton
          icon="map"
          label={mapOpen ? 'Zavrieť mapu' : 'Otvoriť mapu'}
          theme={theme}
          active={mapOpen}
          onPress={onMap}
        />
        <GlassIconButton
          icon="slider.horizontal.3"
          label="Filtre"
          theme={theme}
          active={filtersOpen}
          badge={filterCount}
          onPress={onFilters}
        />
        <GlassIconButton
          icon="magnifyingglass"
          label="Hľadať"
          theme={theme}
          active={searchOpen}
          onPress={onSearch}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 12,
  },
  brand: { flexShrink: 1, paddingTop: 8 },
  title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.6 },
  subtitle: { fontSize: 13, marginTop: 2 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
