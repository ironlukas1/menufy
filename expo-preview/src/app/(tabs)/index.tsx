import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { EmptyState, PrimaryButton, SecondaryButton } from '../../components/NativeUi';
import { GlassOverlay } from '../../components/GlassOverlay';
import { FilterPanel } from '../../components/panels/FilterPanel';
import { MapPanel } from '../../components/panels/MapPanel';
import { SearchPanel } from '../../components/panels/SearchPanel';
import { RestaurantCard } from '../../components/RestaurantCard';
import { TopChrome } from '../../components/TopChrome';
import { dailyFor } from '../../data/restaurants';
import { useMenufy } from '../../providers/MenufyProvider';
import { useMenufyTheme } from '../../theme';

export default function HomeScreen() {
  const {
    theme: themeMode,
    panel,
    setPanel,
    togglePanel,
    activeCount,
    results,
    filters,
    query,
    pinned,
    setPinned,
    geo,
    locationError,
    requestLocation,
    resetFilters,
  } = useMenufy();
  const theme = useMenufyTheme(themeMode);

  const [bannerOff, setBannerOff] = useState(false);
  const [allOpen, setAllOpen] = useState(false);
  const [expandedBySlug, setExpandedBySlug] = useState<Record<string, boolean>>({});

  const count = results.length;
  const noun = count === 1 ? 'reštaurácia' : count >= 2 && count <= 4 ? 'reštaurácie' : 'reštaurácií';
  const q = query.trim().toLocaleLowerCase('sk');
  const searchExpanded = (slug: string) =>
    Boolean(q) &&
    results.some(
      ({ r }) =>
        r.slug === slug &&
        dailyFor(r, filters.day).some((item) => item.name.toLocaleLowerCase('sk').includes(q)),
    );

  const expandedFor = (slug: string) =>
    allOpen || (expandedBySlug[slug] ?? searchExpanded(slug));

  const toggleCard = (slug: string) => {
    if (allOpen) {
      setAllOpen(false);
      setExpandedBySlug({});
      return;
    }
    setExpandedBySlug((current) => ({
      ...current,
      [slug]: !(current[slug] ?? searchExpanded(slug)),
    }));
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.canvas }]}>
      <TopChrome
        theme={theme}
        title="Menufy"
        subtitle="Každý deň dobrá voľba."
        mapOpen={panel === 'map'}
        filtersOpen={panel === 'filters'}
        searchOpen={panel === 'search'}
        filterCount={activeCount}
        onMap={() => togglePanel('map')}
        onFilters={() => togglePanel('filters')}
        onSearch={() => togglePanel('search')}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        scrollEnabled={!panel}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.resultsHead}>
          <View style={{ flexShrink: 1 }}>
            <Text style={[styles.resultsTitle, { color: theme.ink }]}>Menu vo vašom okolí</Text>
            <Text style={[styles.resultsCount, { color: theme.muted }]}>
              {count} {noun}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setAllOpen((value) => !value);
              setExpandedBySlug({});
            }}
            hitSlop={6}
          >
            <Text style={[styles.link, { color: theme.green }]}>
              {allOpen ? 'Skryť všetky menu' : 'Zobraziť všetky menu'}
            </Text>
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => setPanel('filters')}
          style={[styles.cityRow, { backgroundColor: theme.paper, borderColor: theme.line }]}
        >
          <View style={{ flexShrink: 1 }}>
            <Text style={[styles.cityTitle, { color: theme.ink }]}>Zmeniť mesto</Text>
            <Text style={[styles.cityHint, { color: theme.muted }]}>
              {filters.city} · {filters.district}. Mestskú časť viete doladiť vo Filtroch.
            </Text>
          </View>
          <Text style={[styles.link, { color: theme.green }]}>Vybrať</Text>
        </Pressable>

        {!bannerOff && geo !== 'granted' ? (
          <View style={[styles.banner, { backgroundColor: theme.greenSoft, borderColor: theme.greenLine }]}>
            <Text style={[styles.bannerTitle, { color: theme.ink }]}>Polohu nemáme k dispozícii</Text>
            <Text style={[styles.bannerText, { color: theme.muted }]}>
              {locationError || 'Zobrazujeme okolie centra mesta. Vyberte mesto a mestskú časť vo Filtroch.'}
            </Text>
            <View style={styles.bannerActions}>
              <Pressable accessibilityRole="button" onPress={() => void requestLocation()}>
                <Text style={[styles.link, { color: theme.green }]}>Skúsiť znova</Text>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={() => setBannerOff(true)}>
                <Text style={[styles.bannerDismiss, { color: theme.muted }]}>Skryť</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        {pinned ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => setPinned(null)}
            style={[styles.pinned, { backgroundColor: theme.greenSoft, borderColor: theme.greenLine }]}
          >
            <Text style={[styles.pinnedText, { color: theme.green }]}>
              Vybraná reštaurácia · {pinned} · zrušiť výber
            </Text>
          </Pressable>
        ) : null}

        {count === 0 ? (
          <EmptyState
            theme={theme}
            title="Nenašli sme vhodné menu"
            message="Skúste upraviť vyhľadávanie alebo zrušiť niektoré filtre."
            action={
              <PrimaryButton theme={theme} title="Zrušiť filtre" onPress={resetFilters} />
            }
          />
        ) : (
          results.map(({ r, distance }) => (
            <RestaurantCard
              key={r.slug}
              restaurant={r}
              day={filters.day}
              excluded={filters.excluded}
              maxPrice={filters.maxPrice}
              query={query}
              distance={distance}
              selected={pinned === r.slug}
              expanded={expandedFor(r.slug)}
              onToggleMenu={() => toggleCard(r.slug)}
            />
          ))
        )}

        <SecondaryButton
          theme={theme}
          title={activeCount ? `Zrušiť filtre (${activeCount})` : 'Zrušiť filtre'}
          onPress={resetFilters}
        />
      </ScrollView>

      <GlassOverlay
        visible={panel === 'filters'}
        title="Filtrovať ponuku"
        theme={theme}
        tall
        onClose={() => setPanel(null)}
      >
        <FilterPanel />
      </GlassOverlay>

      <GlassOverlay
        visible={panel === 'search'}
        title="Hľadať"
        theme={theme}
        tall
        onClose={() => setPanel(null)}
      >
        <SearchPanel />
      </GlassOverlay>

      <GlassOverlay
        visible={panel === 'map'}
        title="Mapa reštaurácií"
        theme={theme}
        tall
        onClose={() => setPanel(null)}
      >
        <MapPanel />
      </GlassOverlay>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 40 },
  resultsHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  resultsTitle: { fontSize: 21, fontWeight: '800' },
  resultsCount: { fontSize: 13, marginTop: 3 },
  link: { fontSize: 13, fontWeight: '700' },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    borderWidth: 1,
    borderRadius: 16,
    padding: 13,
    marginBottom: 12,
  },
  cityTitle: { fontSize: 14, fontWeight: '700' },
  cityHint: { fontSize: 12, marginTop: 3 },
  banner: { borderWidth: 1, borderRadius: 16, padding: 13, marginBottom: 12 },
  bannerTitle: { fontSize: 14, fontWeight: '700' },
  bannerText: { fontSize: 12, marginTop: 4, lineHeight: 17 },
  bannerActions: { flexDirection: 'row', gap: 16, marginTop: 9 },
  bannerDismiss: { fontSize: 13 },
  pinned: { borderWidth: 1, borderRadius: 14, paddingVertical: 10, paddingHorizontal: 12, marginBottom: 12 },
  pinnedText: { fontSize: 13, fontWeight: '700' },
});
