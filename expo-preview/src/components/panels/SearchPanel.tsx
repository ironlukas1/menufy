import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { dailyFor, formatPrice } from '../../data/restaurants';
import { useMenufy } from '../../providers/MenufyProvider';
import { useMenufyTheme } from '../../theme';

export function SearchPanel() {
  const { theme: themeMode, query, setQuery, restaurants, setPanel } = useMenufy();
  const theme = useMenufyTheme(themeMode);
  const q = query.trim().toLocaleLowerCase('sk');
  const restaurantHits = q
    ? restaurants.filter((restaurant) => restaurant.name.toLocaleLowerCase('sk').includes(q)).slice(0, 8)
    : [];
  const mealHits = q
    ? restaurants
        .flatMap((restaurant) =>
          dailyFor(restaurant, 0).map((item) => ({ restaurant, item })),
        )
        .filter(({ item }) => item.name.toLocaleLowerCase('sk').includes(q))
        .slice(0, 12)
    : [];

  const openRestaurant = (slug: string) => {
    setPanel(null);
    router.push({ pathname: '/restaurant/[slug]', params: { slug } });
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <View style={[styles.inputWrap, { backgroundColor: theme.subtle, borderColor: theme.line }]}>
        <SymbolView name="magnifyingglass" size={18} tintColor={theme.muted} />
        <TextInput
          autoFocus
          value={query}
          onChangeText={setQuery}
          placeholder="Hľadať jedlo (napr. sviečková) alebo reštauráciu…"
          placeholderTextColor={theme.faint}
          style={[styles.input, { color: theme.ink }]}
          returnKeyType="search"
        />
        {query ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Vymazať vyhľadávanie" onPress={() => setQuery('')}>
            <SymbolView name="xmark.circle.fill" size={18} tintColor={theme.faint} />
          </Pressable>
        ) : null}
      </View>

      {!q ? (
        <Text style={[styles.empty, { color: theme.muted }]}>Hľadať</Text>
      ) : null}

      {q ? (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.ink }]}>Reštaurácie</Text>
          {restaurantHits.map((restaurant) => (
            <Pressable
              key={restaurant.slug}
              accessibilityRole="button"
              onPress={() => openRestaurant(restaurant.slug)}
              style={[styles.row, { borderBottomColor: theme.line }]}
            >
              <View style={styles.rowCopy}>
                <Text style={[styles.rowTitle, { color: theme.ink }]}>{restaurant.name}</Text>
                <Text style={[styles.rowSub, { color: theme.muted }]}>
                  {restaurant.city} · {restaurant.district}
                </Text>
              </View>
              <SymbolView name="chevron.right" size={15} tintColor={theme.faint} />
            </Pressable>
          ))}
          {restaurantHits.length === 0 ? (
            <Text style={[styles.empty, { color: theme.muted }]}>Nenašli sme vhodné menu</Text>
          ) : null}
        </View>
      ) : null}

      {q ? (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.ink }]}>Jedlá</Text>
          {mealHits.map(({ restaurant, item }, index) => (
            <Pressable
              key={`${restaurant.slug}-${item.name}-${index}`}
              accessibilityRole="button"
              onPress={() => {
                setQuery(item.name);
                setPanel(null);
              }}
              style={[styles.row, { borderBottomColor: theme.line }]}
            >
              <View style={styles.rowCopy}>
                <Text style={[styles.rowTitle, { color: theme.ink }]}>{item.name}</Text>
                <Text style={[styles.rowSub, { color: theme.muted }]}>{restaurant.name}</Text>
              </View>
              <Text style={[styles.price, { color: theme.green }]}>{formatPrice(item.price)}</Text>
            </Pressable>
          ))}
          {mealHits.length === 0 ? (
            <Text style={[styles.empty, { color: theme.muted }]}>
              Skúste upraviť vyhľadávanie alebo zrušiť niektoré filtre.
            </Text>
          ) : null}
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  input: { flex: 1, fontSize: 15 },
  section: { marginTop: 18 },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 6 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  rowCopy: { flexShrink: 1 },
  rowTitle: { fontSize: 14, fontWeight: '600' },
  rowSub: { fontSize: 12, marginTop: 2 },
  price: { fontSize: 14, fontWeight: '700' },
  empty: { fontSize: 14, textAlign: 'center', paddingVertical: 24 },
});
