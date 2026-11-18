import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { ErrorText, Field, Muted, Panel, PrimaryButton, SectionTitle, SuccessText } from './NativeUi';
import type { Restaurant } from '../data/restaurants';
import { stars } from '../data/lib';
import { supabase, supabaseConfigured } from '../lib/supabase';
import { useMenufy } from '../providers/MenufyProvider';
import { useMenufyTheme } from '../theme';

type ReviewRow = {
  id: string;
  user_id: string | null;
  author: string;
  stars: number;
  reviewed_on: string;
  body: string;
};

export function RestaurantReviews({ restaurant }: { restaurant: Restaurant }) {
  const { theme: themeMode, userId, displayName } = useMenufy();
  const theme = useMenufyTheme(themeMode);

  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const submitting = useRef(false);
  const currentUser = useRef(userId);
  currentUser.current = userId;

  useEffect(() => {
    if (!supabaseConfigured) {
      setLoading(false);
      return;
    }
    let live = true;
    setLoading(true);
    setLoadError(false);
    void (async () => {
      try {
        const place = await supabase.from('restaurants').select('id').eq('slug', restaurant.slug).single();
        if (place.error) throw place.error;
        const result = await supabase
          .from('restaurant_reviews')
          .select('id, user_id, author, stars, reviewed_on, body')
          .eq('restaurant_id', place.data.id)
          .order('created_at', { ascending: false });
        if (result.error) throw result.error;
        if (live) {
          setRestaurantId(place.data.id);
          setReviews((result.data ?? []) as ReviewRow[]);
        }
      } catch {
        if (live) setLoadError(true);
      } finally {
        if (live) setLoading(false);
      }
    })();
    return () => {
      live = false;
    };
  }, [restaurant.slug, attempt]);

  useEffect(() => {
    setRating(0);
    setBody('');
    setError(null);
    setSuccess(false);
  }, [userId]);

  const submit = async () => {
    if (submitting.current || !userId || !restaurantId) return;
    setError(null);
    setSuccess(false);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      setError('Vyberte hodnotenie od 1 do 5 hviezdičiek.');
      return;
    }
    if (body.trim().length < 10 || body.trim().length > 2000) {
      setError('Recenzia musí mať 10 až 2 000 znakov.');
      return;
    }
    submitting.current = true;
    setBusy(true);
    const memberId = userId;
    try {
      const result = await supabase
        .from('restaurant_reviews')
        .insert({
          restaurant_id: restaurantId,
          user_id: memberId,
          author: displayName,
          stars: rating,
          body: body.trim(),
          reviewed_on: new Date().toLocaleDateString('sk-SK'),
        })
        .select('id, user_id, author, stars, reviewed_on, body')
        .single();
      if (currentUser.current !== memberId) return;
      if (result.error) {
        setError(
          result.error.code === '23505'
            ? 'Túto reštauráciu ste už hodnotili. Obnovte stránku a zobrazte svoju recenziu.'
            : 'Recenziu sa nepodarilo uložiť. Skontrolujte prihlásenie a skúste znova.',
        );
        return;
      }
      setReviews((items) => [result.data as ReviewRow, ...items]);
      setBody('');
      setRating(0);
      setSuccess(true);
    } catch {
      if (currentUser.current === memberId) setError('Recenziu sa nepodarilo uložiť. Skúste znova.');
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  };

  const ownReview = userId && reviews.some((review) => review.user_id === userId);
  const average = reviews.length ? reviews.reduce((sum, review) => sum + review.stars, 0) / reviews.length : 0;

  return (
    <Panel theme={theme}>
      <SectionTitle theme={theme}>Hodnotenia</SectionTitle>

      <View style={styles.ratingSplit}>
        <View style={[styles.ratingBox, { backgroundColor: theme.subtle }]}>
          <Text style={[styles.ratingSource, { color: theme.muted }]}>Google</Text>
          <Text style={[styles.ratingValue, { color: theme.ink }]}>
            {restaurant.rating.toFixed(1).replace('.', ',')}
          </Text>
          <Text style={{ color: theme.amber, fontSize: 16 }}>{stars(restaurant.rating)}</Text>
          <Text style={[styles.ratingCount, { color: theme.faint }]}>{restaurant.ratingCount} hodnotení</Text>
        </View>
        <View style={[styles.ratingBox, { backgroundColor: theme.subtle }]}>
          <Text style={[styles.ratingSource, { color: theme.muted }]}>Komunita menufy</Text>
          <Text style={[styles.ratingValue, { color: theme.ink }]}>
            {loading || loadError || !reviews.length ? '—' : average.toFixed(1).replace('.', ',')}
          </Text>
          <Text style={{ color: theme.amber, fontSize: 16 }}>
            {reviews.length > 0 && !loadError ? stars(average) : ''}
          </Text>
          <Text style={[styles.ratingCount, { color: theme.faint }]}>
            {loading ? 'Načítavame…' : loadError ? 'Hodnotenia nie sú dostupné' : `${reviews.length} recenzií`}
          </Text>
        </View>
      </View>

      {success ? <SuccessText theme={theme}>Ďakujeme! Vaša recenzia bola zverejnená.</SuccessText> : null}
      {error ? <ErrorText theme={theme}>{error}</ErrorText> : null}

      {!userId ? (
        <View style={styles.invite}>
          <Muted theme={theme}>Navštívili ste túto reštauráciu? Podeľte sa o svoju skúsenosť.</Muted>
          <PrimaryButton theme={theme} title="Prihlásiť sa a pridať recenziu" onPress={() => router.push('/login')} />
        </View>
      ) : null}

      {userId && !loading && !loadError && ownReview ? (
        <Muted theme={theme}>Vaše hodnotenie už bolo pridané. Ďakujeme za vašu skúsenosť.</Muted>
      ) : null}

      {userId && !loading && !loadError && !ownReview ? (
        <View style={styles.form}>
          <Text style={[styles.formTitle, { color: theme.ink }]}>Pridať recenziu</Text>
          <Text style={[styles.fieldLabel, { color: theme.ink }]}>Vaše hodnotenie</Text>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((value) => (
              <Pressable
                key={value}
                accessibilityRole="button"
                accessibilityLabel={`${value} z 5 hviezdičiek`}
                onPress={() => setRating(value)}
                hitSlop={4}
              >
                <Text style={{ color: value <= rating ? theme.amber : theme.faint, fontSize: 27 }}>
                  {value <= rating ? '★' : '☆'}
                </Text>
              </Pressable>
            ))}
          </View>
          <Muted theme={theme}>Recenziu zverejníte ako {displayName}.</Muted>
          <Field
            theme={theme}
            label="Vaša skúsenosť"
            value={body}
            onChangeText={setBody}
            placeholder="Ako vám chutilo? Aká bola obsluha a atmosféra?"
            multiline
            hint={`${body.length} / 2 000 znakov · minimálne 10 znakov`}
          />
          <PrimaryButton
            theme={theme}
            title={busy ? 'Odosielame…' : 'Zverejniť recenziu'}
            onPress={() => void submit()}
            disabled={busy}
          />
        </View>
      ) : null}

      {loading ? <Muted theme={theme}>Načítavame recenzie…</Muted> : null}
      {loadError ? (
        <View>
          <Muted theme={theme}>Recenzie sa nepodarilo načítať.</Muted>
          <Pressable accessibilityRole="button" onPress={() => setAttempt((value) => value + 1)}>
            <Text style={[styles.retry, { color: theme.green }]}>Skúsiť znova</Text>
          </Pressable>
        </View>
      ) : null}

      {!loading && !loadError && reviews.length > 0 ? (
        <View style={styles.reviews}>
          {reviews.map((review) => (
            <View key={review.id} style={[styles.review, { backgroundColor: theme.subtle }]}>
              <View style={styles.reviewTop}>
                <View style={[styles.avatar, { backgroundColor: theme.green }]}>
                  <Text style={styles.avatarText}>{review.author[0]?.toLocaleUpperCase('sk')}</Text>
                </View>
                <View style={{ flexShrink: 1 }}>
                  <Text style={[styles.reviewAuthor, { color: theme.ink }]}>{review.author}</Text>
                  <Text style={[styles.reviewDate, { color: theme.faint }]}>
                    {review.user_id === userId ? 'Vaša recenzia · ' : ''}
                    {review.reviewed_on}
                  </Text>
                </View>
                <Text style={{ color: theme.amber, fontSize: 14 }}>{stars(review.stars)}</Text>
              </View>
              <Text style={[styles.reviewBody, { color: theme.ink }]}>{review.body}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {!loading && !loadError && reviews.length === 0 ? (
        <Muted theme={theme}>Zatiaľ žiadne recenzie. Buďte prvý, kto pridá svoju skúsenosť.</Muted>
      ) : null}
    </Panel>
  );
}

const styles = StyleSheet.create({
  ratingSplit: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  ratingBox: { flex: 1, borderRadius: 14, padding: 12, alignItems: 'center' },
  ratingSource: { fontSize: 12, fontWeight: '600' },
  ratingValue: { fontSize: 25, fontWeight: '800', marginTop: 2 },
  ratingCount: { fontSize: 11, marginTop: 3, textAlign: 'center' },
  invite: { marginVertical: 12 },
  form: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#dfe5e0' },
  formTitle: { fontSize: 15, fontWeight: '800', marginBottom: 8 },
  fieldLabel: { fontSize: 13, fontWeight: '700' },
  stars: { flexDirection: 'row', gap: 6, paddingVertical: 8 },
  reviews: { gap: 8, marginTop: 12 },
  review: { borderRadius: 14, padding: 12 },
  reviewTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatar: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  reviewAuthor: { fontSize: 13, fontWeight: '700' },
  reviewDate: { fontSize: 11, marginTop: 1 },
  reviewBody: { fontSize: 13, lineHeight: 19, marginTop: 8 },
  retry: { fontSize: 13, fontWeight: '700', marginTop: 8 },
});
