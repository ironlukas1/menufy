import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { DAYS, dailyFor, formatPrice, type MenuItem, type Restaurant } from '../data/restaurants';
import { fmtKm, openStatus } from '../data/lib';
import { useMenufy } from '../providers/MenufyProvider';
import { useMenufyTheme } from '../theme';
import { HeartButton } from './HeartButton';

function MenuRow({ item, hit }: { item: MenuItem; hit?: boolean }) {
  const { theme: themeMode } = useMenufy();
  const theme = useMenufyTheme(themeMode);
  return (
    <View style={[styles.menuRow, hit && { backgroundColor: theme.greenSoft }]}>
      <View style={styles.menuCopy}>
        <Text style={[styles.mealName, { color: theme.ink }]}>{item.name}</Text>
        <Text style={[styles.mealDesc, { color: theme.muted }]}>{item.desc}</Text>
        <Text style={[styles.mealMeta, { color: theme.faint }]}>
          {item.weight} · Alergény: {item.allergens.length ? item.allergens.join(', ') : '–'}
        </Text>
      </View>
      <Text style={[styles.price, { color: theme.green }]}>{formatPrice(item.price)}</Text>
    </View>
  );
}

export function RestaurantCard({
  restaurant,
  day,
  excluded,
  maxPrice,
  query,
  distance,
  selected = false,
  expanded = false,
  onToggleMenu,
}: {
  restaurant: Restaurant;
  day: number;
  excluded: string[];
  maxPrice: number;
  query: string;
  distance: number;
  selected?: boolean;
  expanded?: boolean;
  onToggleMenu?: () => void;
}) {
  const { theme: themeMode, loggedIn, favorites, toggleFavorite } = useMenufy();
  const theme = useMenufyTheme(themeMode);
  const status = openStatus(restaurant);
  const q = query.trim().toLocaleLowerCase('sk');
  const items = dailyFor(restaurant, day).filter(
    (item) =>
      item.price <= maxPrice &&
      !item.allergens.some((allergen) => excluded.includes(String(allergen))),
  );
  const publishesMenu = restaurant.daily.some((menu) => menu.length) || restaurant.standard.length > 0;
  const noun = items.length === 1 ? 'jedlo' : items.length >= 2 && items.length <= 4 ? 'jedlá' : 'jedál';
  const active = loggedIn && favorites.includes(restaurant.slug);

  const openDetail = () =>
    router.push({ pathname: '/restaurant/[slug]', params: { slug: restaurant.slug } });

  const onHeart = () => {
    if (!loggedIn) {
      router.push('/login');
      return;
    }
    toggleFavorite(restaurant.slug);
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.paper,
          borderColor: selected ? theme.green : theme.line,
          shadowColor: theme.shadow,
        },
        selected && styles.selected,
      ]}
    >
      <View style={styles.top}>
        <Pressable onPress={openDetail} accessibilityRole="button" accessibilityLabel={`Detail ${restaurant.name}`}>
          <Image source={{ uri: restaurant.image }} style={styles.image} resizeMode="cover" />
          <View style={[styles.initials, { backgroundColor: theme.green }]}>
            <Text style={styles.initialsText}>{restaurant.initials}</Text>
          </View>
        </Pressable>

        <View style={styles.info}>
          <View style={styles.titleRow}>
            <View style={styles.titleCopy}>
              <Text style={[styles.openLabel, { color: status.open ? theme.green : theme.danger }]}>
                {status.label}
              </Text>
              <Pressable onPress={openDetail}>
                <Text style={[styles.name, { color: theme.ink }]}>{restaurant.name}</Text>
              </Pressable>
              <Text style={[styles.tagline, { color: theme.muted }]}>{restaurant.tagline}</Text>
            </View>
            <HeartButton active={active} theme={theme} onPress={onHeart} />
          </View>

          <View style={styles.meta}>
            {restaurant.ratingCount > 0 && (
              <View style={styles.metaItem}>
                <SymbolView name="star.fill" size={13} tintColor={theme.amber} />
                <Text style={[styles.metaText, { color: theme.ink }]}>
                  {restaurant.rating.toFixed(1).replace('.', ',')} ({restaurant.ratingCount})
                </Text>
              </View>
            )}
            <View style={styles.metaItem}>
              <SymbolView name="location.fill" size={13} tintColor={theme.muted} />
              <Text style={[styles.metaText, { color: theme.muted }]}>{fmtKm(distance)}</Text>
            </View>
            {restaurant.delivery.available && (
              <View style={styles.metaItem}>
                <SymbolView name="truck.box.fill" size={13} tintColor={theme.muted} />
                <Text style={[styles.metaText, { color: theme.muted }]}>
                  Donáška{restaurant.delivery.eta ? ` · ${restaurant.delivery.eta}` : ''}
                </Text>
              </View>
            )}
          </View>

          <Text style={[styles.detailLine, { color: theme.muted }]}>{restaurant.address}</Text>
          <Text style={[styles.detailLine, { color: theme.muted }]}>{restaurant.todayHours}</Text>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={onToggleMenu}
        style={[styles.menuHeading, { borderTopColor: theme.line }]}
      >
        <Text style={[styles.menuHeadingText, { color: theme.ink }]}>Denné menu</Text>
        <View style={styles.menuDate}>
          <Text style={{ color: theme.muted, fontSize: 13 }}>
            {DAYS[day].short} · {publishesMenu ? `${items.length} ${noun}` : 'nezverejňuje'}
          </Text>
          <SymbolView name={expanded ? 'chevron.up' : 'chevron.down'} size={14} tintColor={theme.muted} />
        </View>
      </Pressable>

      {expanded ? (
        <View style={styles.menuList}>
          {items.map((item) => (
            <MenuRow key={item.name} item={item} hit={Boolean(q) && item.name.toLocaleLowerCase('sk').includes(q)} />
          ))}
          {items.length === 0 ? (
            <Text style={[styles.menuEmpty, { color: theme.muted }]}>
              {publishesMenu
                ? 'Žiadne jedlo nevyhovuje filtrom.'
                : 'Denné menu nezverejňuje. Ponuku nájdete u donáškovej služby.'}
            </Text>
          ) : null}
        </View>
      ) : null}

      <Pressable accessibilityRole="button" onPress={openDetail} style={styles.cardAction}>
        <Text style={[styles.cardActionText, { color: theme.green }]}>Zobraziť detail reštaurácie</Text>
        <SymbolView name="arrow.right" size={15} tintColor={theme.green} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 12,
    marginBottom: 14,
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  selected: { borderWidth: 2 },
  top: { flexDirection: 'row', gap: 12 },
  image: { width: 92, height: 92, borderRadius: 16, backgroundColor: '#dfe5e0' },
  initials: {
    position: 'absolute',
    left: 6,
    bottom: 6,
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: { color: '#fff', fontWeight: '800', fontSize: 11 },
  info: { flex: 1, gap: 4 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  titleCopy: { flexShrink: 1 },
  openLabel: { fontSize: 12, fontWeight: '700' },
  name: { fontSize: 18, fontWeight: '800', marginTop: 1 },
  tagline: { fontSize: 13, marginTop: 1 },
  meta: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12 },
  detailLine: { fontSize: 12, marginTop: 1 },
  menuHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 12,
  },
  menuHeadingText: { fontSize: 15, fontWeight: '700' },
  menuDate: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  menuList: { gap: 8, marginTop: 10 },
  menuRow: { flexDirection: 'row', gap: 10, borderRadius: 12, padding: 9 },
  menuCopy: { flex: 1 },
  mealName: { fontSize: 14, fontWeight: '700' },
  mealDesc: { fontSize: 12, marginTop: 2 },
  mealMeta: { fontSize: 11, marginTop: 4 },
  price: { fontSize: 14, fontWeight: '800' },
  menuEmpty: { fontSize: 13, paddingVertical: 8 },
  cardAction: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 12 },
  cardActionText: { fontSize: 14, fontWeight: '700' },
});
