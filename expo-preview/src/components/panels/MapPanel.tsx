import { SymbolView } from 'expo-symbols';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CITY_CENTER } from '../../data/lib';
import { useMenufy } from '../../providers/MenufyProvider';
import { useMenufyTheme } from '../../theme';

export function MapPanel() {
  const { theme: themeMode, restaurants, filters, pinned, setPinned, setPanel } = useMenufy();
  const theme = useMenufyTheme(themeMode);
  const places = restaurants.filter((restaurant) => restaurant.city === filters.city);

  const latSpan = 0.09;
  const lngSpan = 0.16;
  const position = (lat: number, lng: number) => ({
    left: `${Math.min(92, Math.max(6, 50 + ((lng - CITY_CENTER.lng) / lngSpan) * 100))}%`,
    top: `${Math.min(90, Math.max(8, 50 - ((lat - CITY_CENTER.lat) / latSpan) * 100))}%`,
  });

  const pick = (slug: string) => {
    setPinned(slug);
    setPanel(null);
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={[styles.title, { color: theme.ink }]}>Mapa reštaurácií</Text>
      <Text style={[styles.hint, { color: theme.muted }]}>
        Kliknutím na marker vyfiltrujete vybranú reštauráciu.
      </Text>

      <View style={[styles.map, { backgroundColor: theme.subtle, borderColor: theme.line }]}>
        <View style={[styles.road, { backgroundColor: theme.paper, transform: [{ rotate: '18deg' }] }]} />
        <View style={[styles.river, { backgroundColor: theme.greenSoft, transform: [{ rotate: '-24deg' }] }]} />
        {places.map((restaurant) => (
          <Pressable
            key={restaurant.slug}
            accessibilityRole="button"
            accessibilityLabel={restaurant.name}
            onPress={() => pick(restaurant.slug)}
            style={[styles.pin, position(restaurant.lat, restaurant.lng)]}
          >
            <SymbolView
              name={pinned === restaurant.slug ? 'mappin.circle.fill' : 'mappin.circle'}
              size={30}
              tintColor={pinned === restaurant.slug ? theme.green : theme.ink}
            />
          </Pressable>
        ))}
      </View>

      <View style={styles.list}>
        {places.map((restaurant) => (
          <Pressable
            key={restaurant.slug}
            accessibilityRole="button"
            onPress={() => pick(restaurant.slug)}
            style={[styles.row, { borderBottomColor: theme.line }]}
          >
            <Text style={[styles.rowTitle, { color: theme.ink }]}>{restaurant.name}</Text>
            <Text style={{ color: theme.muted, fontSize: 12 }}>{restaurant.district}</Text>
          </Pressable>
        ))}
        {places.length === 0 ? (
          <Pressable accessibilityRole="button" onPress={() => setPanel(null)}>
            <Text style={[styles.retry, { color: theme.green }]}>Skúsiť znova</Text>
          </Pressable>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: '800' },
  hint: { fontSize: 13, marginTop: 4, marginBottom: 12 },
  map: {
    height: 260,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  road: { position: 'absolute', left: -40, right: -40, top: '46%', height: 18, borderRadius: 9 },
  river: { position: 'absolute', left: -60, right: -60, top: '68%', height: 26, borderRadius: 13, opacity: 0.7 },
  pin: { position: 'absolute', marginLeft: -15, marginTop: -15 },
  list: { marginTop: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  rowTitle: { fontSize: 14, fontWeight: '600' },
  retry: { fontSize: 14, fontWeight: '700', paddingVertical: 16 },
});
