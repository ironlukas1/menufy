import { router } from 'expo-router';
import { View } from 'react-native';

import { EmptyState, PageHead, PrimaryButton, Screen } from '../../components/NativeUi';
import { RestaurantCard } from '../../components/RestaurantCard';
import { CITY_CENTER, distanceKm } from '../../data/lib';
import { useMenufy } from '../../providers/MenufyProvider';
import { useMenufyTheme } from '../../theme';

export default function SavedScreen() {
  const { theme: themeMode, restaurants, favorites, geo, userPosition } = useMenufy();
  const theme = useMenufyTheme(themeMode);

  const list = restaurants.filter((restaurant) => favorites.includes(restaurant.slug));
  const origin = geo === 'granted' && userPosition ? userPosition : CITY_CENTER;

  return (
    <Screen theme={theme}>
      <PageHead
        theme={theme}
        kicker="Obľúbené"
        title="Uložené reštaurácie"
        subtitle={`${list.length} uložených`}
      />

      {list.length === 0 ? (
        <EmptyState
          theme={theme}
          title="Zatiaľ nemáte žiadne obľúbené"
          message="Kliknite na srdce pri reštaurácii a nájdete ju tu."
          action={
            <PrimaryButton
              theme={theme}
              title="Prezrieť menu"
              onPress={() => router.push('/')}
            />
          }
        />
      ) : (
        <View>
          {list.map((restaurant) => (
            <RestaurantCard
              key={restaurant.slug}
              restaurant={restaurant}
              day={0}
              excluded={[]}
              maxPrice={99}
              query=""
              distance={distanceKm(origin, restaurant)}
            />
          ))}
        </View>
      )}
    </Screen>
  );
}
