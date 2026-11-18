import { router, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import {
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GlassIconButton } from '../../components/Glass';
import { HeartButton } from '../../components/HeartButton';
import {
  EmptyState,
  Muted,
  Panel,
  PrimaryButton,
  SectionTitle,
} from '../../components/NativeUi';
import { RestaurantReviews } from '../../components/RestaurantReviews';
import { DAYS, dailyFor, formatPrice, type MenuItem } from '../../data/restaurants';
import { openStatus } from '../../data/lib';
import { useMenufy } from '../../providers/MenufyProvider';
import { useMenufyTheme } from '../../theme';

function DetailMenuRow({ item }: { item: MenuItem }) {
  const { theme: themeMode } = useMenufy();
  const theme = useMenufyTheme(themeMode);
  return (
    <View style={[styles.menuRow, { backgroundColor: theme.subtle }]}>
      <View style={{ flexShrink: 1 }}>
        <Text style={[styles.mealName, { color: theme.ink }]}>{item.name}</Text>
        {item.desc ? <Text style={[styles.mealDesc, { color: theme.muted }]}>{item.desc}</Text> : null}
        <Text style={[styles.mealMeta, { color: theme.faint }]}>
          {item.weight} · Alergény: {item.allergens.length ? item.allergens.join(', ') : '–'}
        </Text>
      </View>
      <Text style={[styles.mealPrice, { color: theme.green }]}>{formatPrice(item.price)}</Text>
    </View>
  );
}

export default function RestaurantDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { theme: themeMode, restaurants, loggedIn, favorites, toggleFavorite } = useMenufy();
  const theme = useMenufyTheme(themeMode);

  const [menuTab, setMenuTab] = useState<'daily' | 'standard'>('daily');
  const [day, setDay] = useState(0);
  const [photo, setPhoto] = useState<number | null>(null);

  const restaurant = restaurants.find((place) => place.slug === slug);

  if (!restaurant) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: theme.canvas }]} edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.topBar}>
          <GlassIconButton icon="chevron.left" label="Späť" theme={theme} onPress={() => router.back()} />
        </View>
        <EmptyState
          theme={theme}
          title="Reštaurácia sa nenašla"
          message="Možno už nie je v ponuke alebo sa zmenil jej odkaz."
          action={<PrimaryButton theme={theme} title="Späť na výsledky" onPress={() => router.back()} />}
        />
      </SafeAreaView>
    );
  }

  const status = openStatus(restaurant);
  const active = loggedIn && favorites.includes(restaurant.slug);
  const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
  const daily = dailyFor(restaurant, day);

  const onHeart = () => {
    if (!loggedIn) {
      router.push('/login');
      return;
    }
    toggleFavorite(restaurant.slug);
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.canvas }]} edges={['top', 'left', 'right']}>
      <View style={styles.topBar}>
        <GlassIconButton icon="chevron.left" label="Späť na výsledky" theme={theme} onPress={() => router.back()} />
        <Text style={[styles.topTitle, { color: theme.ink }]}>Detail reštaurácie</Text>
        <HeartButton active={active} theme={theme} onPress={onHeart} size={44} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Image source={{ uri: restaurant.image }} style={styles.heroImage} resizeMode="cover" />
          <View style={styles.heroShade} />
          <View style={styles.heroCopy}>
            <Text style={[styles.openLabel, { color: status.open ? '#b8f0cf' : '#ffd0cd' }]}>{status.label}</Text>
            <Text style={styles.heroTitle}>{restaurant.name}</Text>
            <Text style={styles.heroTagline}>{restaurant.tagline}</Text>
          </View>
        </View>

        <Panel theme={theme}>
          <SectionTitle theme={theme}>Kontakt</SectionTitle>
          <ContactLine icon="location.fill" text={restaurant.address} theme={theme} />
          {restaurant.phone ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => void Linking.openURL(`tel:${restaurant.phone.replace(/\s/g, '')}`)}
              style={styles.contactLine}
            >
              <SymbolView name="phone.fill" size={15} tintColor={theme.muted} />
              <Text style={[styles.contactText, { color: theme.green }]}>{restaurant.phone}</Text>
            </Pressable>
          ) : null}
          {restaurant.email ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => void Linking.openURL(`mailto:${restaurant.email}`)}
              style={styles.contactLine}
            >
              <SymbolView name="envelope.fill" size={15} tintColor={theme.muted} />
              <Text style={[styles.contactText, { color: theme.green }]}>{restaurant.email}</Text>
            </Pressable>
          ) : null}
          {restaurant.web ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => void Linking.openURL(`https://${restaurant.web}`)}
              style={styles.contactLine}
            >
              <SymbolView name="globe" size={15} tintColor={theme.muted} />
              <Text style={[styles.contactText, { color: theme.green }]}>{restaurant.web}</Text>
            </Pressable>
          ) : null}
        </Panel>

        <Panel theme={theme}>
          <SectionTitle theme={theme}>Otváracie hodiny</SectionTitle>
          {restaurant.hours.length === 0 ? (
            <Muted theme={theme}>Otváracie hodiny zatiaľ neboli uvedené.</Muted>
          ) : (
            restaurant.hours.map(([label, hours], index) => (
              <View
                key={label}
                style={[
                  styles.hoursRow,
                  index === todayIdx && { backgroundColor: theme.greenSoft, borderRadius: 8, paddingHorizontal: 6 },
                ]}
              >
                <Text style={[styles.hoursLabel, { color: theme.ink, fontWeight: index === todayIdx ? '800' : '600' }]}>{label}</Text>
                <Text style={[styles.hoursValue, { color: theme.muted }]}>{hours}</Text>
              </View>
            ))
          )}
        </Panel>

        <Panel theme={theme}>
          <SectionTitle theme={theme}>Donáška</SectionTitle>
          {restaurant.delivery.available ? (
            <View style={styles.delivery}
            >
              <SymbolView name="truck.box.fill" size={18} tintColor={theme.green} />
              <View>
                <Text style={[styles.deliveryTitle, { color: theme.ink }]}>Donáška k dispozícii</Text>
                <Text style={[styles.deliveryEta, { color: theme.muted }]}>{restaurant.delivery.eta}</Text>
              </View>
            </View>
          ) : (
            <Muted theme={theme}>Reštaurácia donášku neposkytuje.</Muted>
          )}
          {restaurant.delivery.links?.map((link) => (
            <Pressable
              key={link.url}
              accessibilityRole="button"
              onPress={() => void Linking.openURL(link.url)}
              style={[styles.deliveryLink, { borderColor: theme.line }]}
            >
              <Text style={[styles.deliveryLinkText, { color: theme.green }]}>Objednať cez {link.name}</Text>
              <SymbolView name="arrow.up.right" size={14} tintColor={theme.green} />
            </Pressable>
          ))}
        </Panel>

        <Panel theme={theme}>
          <SectionTitle theme={theme}>Menu</SectionTitle>
          <View style={[styles.segmented, { backgroundColor: theme.subtle, borderColor: theme.line }]}>
            {(['daily', 'standard'] as const).map((tab) => (
              <Pressable
                key={tab}
                accessibilityRole="button"
                accessibilityState={{ selected: menuTab === tab }}
                onPress={() => setMenuTab(tab)}
                style={[styles.segment, menuTab === tab && { backgroundColor: theme.green }]}
              >
                <Text style={[styles.segmentText, { color: menuTab === tab ? '#fff' : theme.ink }]}>
                  {tab === 'daily' ? 'Denné menu' : 'Stále menu'}
                </Text>
              </Pressable>
            ))}
          </View>

          {menuTab === 'daily' ? (
            <>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayChips}>
                {DAYS.map((label, index) => (
                  <Pressable
                    key={label.date}
                    accessibilityRole="button"
                    onPress={() => setDay(index)}
                    style={[
                      styles.dayChip,
                      { borderColor: theme.line, backgroundColor: theme.subtle },
                      day === index && { backgroundColor: theme.green, borderColor: theme.green },
                    ]}
                  >
                    <Text style={[styles.dayChipText, { color: day === index ? '#fff' : theme.ink }]}>
                      {index === 0 ? 'Dnes' : index === 1 ? 'Zajtra' : label.short}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
              {daily.length === 0 ? (
                <Muted theme={theme}>Na tento deň zatiaľ nebolo zverejnené menu.</Muted>
              ) : (
                daily.map((item) => <DetailMenuRow key={item.name} item={item} />)
              )}
              <Muted theme={theme}>
                {restaurant.live ? 'Menu zverejňuje reštaurácia.' : 'Denné menu sa aktualizuje automaticky každé ráno.'}
              </Muted>
            </>
          ) : restaurant.standard.length === 0 ? (
            <Muted theme={theme}>Stále menu zatiaľ nebolo zverejnené.</Muted>
          ) : (
            restaurant.standard.map((item) => <DetailMenuRow key={item.name} item={item} />)
          )}
        </Panel>

        <Panel theme={theme}>
          <SectionTitle theme={theme}>Fotogaléria</SectionTitle>
          {restaurant.gallery.length === 0 ? (
            <Muted theme={theme}>Reštaurácia zatiaľ nepridala fotografie.</Muted>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gallery}>
              {restaurant.gallery.map((uri, index) => (
                <Pressable key={index} accessibilityRole="button" onPress={() => setPhoto(index)}>
                  <Image source={{ uri }} style={styles.galleryImage} resizeMode="cover" />
                </Pressable>
              ))}
            </ScrollView>
          )}
        </Panel>

        <RestaurantReviews restaurant={restaurant} />
      </ScrollView>

      <Modal visible={photo !== null} transparent animationType="fade" onRequestClose={() => setPhoto(null)}>
        <Pressable style={styles.lightbox} onPress={() => setPhoto(null)}>
          {photo !== null && restaurant.gallery[photo] ? (
            <Image
              source={{ uri: restaurant.gallery[photo] }}
              style={styles.lightboxImage}
              resizeMode="contain"
            />
          ) : null}
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function ContactLine({ icon, text, theme }: { icon: 'location.fill'; text: string; theme: ReturnType<typeof useMenufyTheme> }) {
  return (
    <View style={styles.contactLine}>
      <SymbolView name={icon} size={15} tintColor={theme.muted} />
      <Text style={[styles.contactText, { color: theme.ink }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  topTitle: { flex: 1, fontSize: 15, fontWeight: '700', textAlign: 'center' },
  content: { paddingHorizontal: 16, paddingBottom: 40 },
  hero: { height: 210, borderRadius: 24, overflow: 'hidden', marginBottom: 14, backgroundColor: '#dfe5e0' },
  heroImage: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  heroShade: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(8,20,13,0.48)',
  },
  heroCopy: { position: 'absolute', left: 18, right: 18, bottom: 18 },
  openLabel: { fontSize: 12, fontWeight: '800' },
  heroTitle: { color: '#fff', fontSize: 27, fontWeight: '800', marginTop: 4 },
  heroTagline: { color: 'rgba(255,255,255,0.88)', fontSize: 14, marginTop: 3 },
  contactLine: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 7 },
  contactText: { fontSize: 13, flexShrink: 1 },
  hoursRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7 },
  hoursLabel: { fontSize: 13 },
  hoursValue: { fontSize: 13 },
  delivery: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  deliveryTitle: { fontSize: 14, fontWeight: '700' },
  deliveryEta: { fontSize: 13, marginTop: 2 },
  deliveryLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 12,
    marginTop: 10,
  },
  deliveryLinkText: { fontSize: 14, fontWeight: '700' },
  segmented: { flexDirection: 'row', borderWidth: 1, borderRadius: 999, padding: 3, marginBottom: 12 },
  segment: { flex: 1, borderRadius: 999, paddingVertical: 9, alignItems: 'center' },
  segmentText: { fontSize: 13, fontWeight: '700' },
  dayChips: { marginBottom: 12 },
  dayChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1, marginRight: 8 },
  dayChipText: { fontSize: 13, fontWeight: '700' },
  menuRow: { flexDirection: 'row', gap: 10, borderRadius: 12, padding: 10, marginBottom: 8 },
  mealName: { fontSize: 14, fontWeight: '700' },
  mealDesc: { fontSize: 12, marginTop: 2 },
  mealMeta: { fontSize: 11, marginTop: 4 },
  mealPrice: { fontSize: 14, fontWeight: '800' },
  gallery: { marginTop: 4 },
  galleryImage: { width: 130, height: 100, borderRadius: 12, marginRight: 8 },
  lightbox: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', alignItems: 'center', justifyContent: 'center' },
  lightboxImage: { width: '100%', height: '80%' },
});
