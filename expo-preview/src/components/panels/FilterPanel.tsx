import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { ALLERGENS, CUISINES, LOCATIONS } from '../../data/allergens';
import { DAYS } from '../../data/restaurants';
import { MAX_PRICE, useMenufy, type Sort } from '../../providers/MenufyProvider';
import { useMenufyTheme } from '../../theme';

function Choice({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { theme: themeMode } = useMenufy();
  const theme = useMenufyTheme(themeMode);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.choice,
        {
          backgroundColor: selected ? theme.green : theme.subtle,
          borderColor: selected ? theme.green : theme.line,
        },
      ]}
    >
      <Text style={[styles.choiceText, { color: selected ? '#fff' : theme.ink }]}>{label}</Text>
    </Pressable>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  const { theme: themeMode } = useMenufy();
  const theme = useMenufyTheme(themeMode);
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.ink }]}>{title}</Text>
      {hint ? <Text style={[styles.hint, { color: theme.faint }]}>{hint}</Text> : null}
      <View style={styles.chips}>{children}</View>
    </View>
  );
}

export function FilterPanel() {
  const { theme: themeMode, filters, setFilters, resetFilters, loggedIn, geo, activeCount } = useMenufy();
  const theme = useMenufyTheme(themeMode);
  const districts = LOCATIONS[filters.city] ?? [];
  const sortOptions: { value: Sort; label: string }[] = [
    { value: 'rating', label: 'Najlepšie hodnotené' },
    { value: 'price', label: 'Najnižšia cena' },
    ...(loggedIn ? ([{ value: 'favorites', label: 'Len obľúbené' }] as const) : []),
    { value: 'distance', label: geo === 'granted' ? 'Najbližšie' : 'Najbližšie k centru' },
  ];

  const toggleIn = (key: 'cuisines' | 'excluded', value: string) => {
    const current = filters[key];
    setFilters({
      [key]: current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    });
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={[styles.intro, { color: theme.muted }]}>
        Prispôsobte si výsledky podľa vašich preferencií
      </Text>

      <Section title="Zoradiť výsledky">
        {sortOptions.map((option) => (
          <Choice
            key={option.value}
            label={option.label}
            selected={filters.sort === option.value}
            onPress={() => setFilters({ sort: option.value })}
          />
        ))}
      </Section>

      <Section title="Deň">
        {DAYS.map((day, index) => (
          <Choice
            key={day.date}
            label={index === 0 ? 'Dnes' : index === 1 ? 'Zajtra' : day.short}
            selected={filters.day === index}
            onPress={() => setFilters({ day: index })}
          />
        ))}
      </Section>

      <Section title="Mesto">
        {Object.keys(LOCATIONS).map((city) => (
          <Choice
            key={city}
            label={city}
            selected={filters.city === city}
            onPress={() =>
              setFilters({ city, district: 'Všetky časti' })
            }
          />
        ))}
      </Section>

      <Section title="Mestská časť">
        {['Všetky časti', ...districts].map((district) => (
          <Choice
            key={district}
            label={district}
            selected={filters.district === district}
            onPress={() => setFilters({ district })}
          />
        ))}
      </Section>

      <Section title="Kuchyňa">
        {CUISINES.map((cuisine) => (
          <Choice
            key={cuisine}
            label={cuisine}
            selected={filters.cuisines.includes(cuisine)}
            onPress={() => toggleIn('cuisines', cuisine)}
          />
        ))}
      </Section>

      <Section title="Bez alergénov" hint="(vylúčiť jedlá obsahujúce)">
        {ALLERGENS.map((allergen) => (
          <Choice
            key={allergen.code}
            label={allergen.name}
            selected={filters.excluded.includes(allergen.code)}
            onPress={() => toggleIn('excluded', allergen.code)}
          />
        ))}
      </Section>

      <Section title="Max. cena:">
        {[5, 8, 10, 12, MAX_PRICE].map((price) => (
          <Choice
            key={price}
            label={price === MAX_PRICE ? 'bez limitu' : `${price} €`}
            selected={filters.maxPrice === price}
            onPress={() => setFilters({ maxPrice: price })}
          />
        ))}
      </Section>

      <Section title="Otvorené o">
        {[
          { value: '', label: 'Kedykoľvek' },
          { value: '08:00', label: '08:00' },
          { value: '11:00', label: '11:00' },
          { value: '13:00', label: '13:00' },
          { value: '18:00', label: '18:00' },
        ].map((option) => (
          <Choice
            key={option.value}
            label={option.label}
            selected={filters.openAt === option.value}
            onPress={() => setFilters({ openAt: option.value })}
          />
        ))}
      </Section>

      <Section title="Hodnotenie">
        {[0, 3, 4, 5].map((value) => (
          <Choice
            key={value}
            label={value === 0 ? 'Akékoľvek hodnotenie' : `${value}+ ★`}
            selected={filters.minRating === value}
            onPress={() => setFilters({ minRating: value })}
          />
        ))}
      </Section>

      <View style={styles.switchRow}>
        <Text style={[styles.switchLabel, { color: theme.ink }]}>Len s donáškou</Text>
        <Switch
          value={filters.delivery}
          onValueChange={(value) => setFilters({ delivery: value })}
          tintColor={theme.green}
          thumbColor="#fff"
        />
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={resetFilters}
        style={[styles.reset, { borderColor: theme.line }]}
      >
        <Text style={[styles.resetText, { color: theme.green }]}>
          Zrušiť filtre{activeCount ? ` (${activeCount})` : ''}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  intro: { fontSize: 14, marginBottom: 14 },
  section: { marginBottom: 18 },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 8 },
  hint: { fontSize: 12, marginTop: -5, marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  choice: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },
  choiceText: { fontSize: 13, fontWeight: '600' },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    marginBottom: 12,
  },
  switchLabel: { fontSize: 15, fontWeight: '600' },
  reset: { borderWidth: 1, borderRadius: 999, paddingVertical: 12, alignItems: 'center', marginBottom: 8 },
  resetText: { fontWeight: '700' },
});
