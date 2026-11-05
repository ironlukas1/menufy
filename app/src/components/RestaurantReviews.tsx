import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router";
import type { Restaurant } from "@/data/restaurants";
import { stars } from "@/lib";
import { useProto } from "@/proto/ProtoContext";
import { supabase } from "@/supabase";

type ReviewRow = {
  id: string;
  user_id: string | null;
  author: string;
  stars: number;
  reviewed_on: string;
  body: string;
};

export default function RestaurantReviews({ restaurant }: { restaurant: Restaurant }) {
  const { userId, displayName } = useProto();
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const submitting = useRef(false);
  const currentUser = useRef(userId);
  currentUser.current = userId;

  useEffect(() => {
    let live = true;
    setLoading(true);
    setLoadError(false);
    void (async () => {
      try {
        const place = await supabase.from("restaurants").select("id").eq("slug", restaurant.slug).single();
        if (place.error) throw place.error;
        const result = await supabase.from("restaurant_reviews")
          .select("id, user_id, author, stars, reviewed_on, body")
          .eq("restaurant_id", place.data.id).order("created_at", { ascending: false });
        if (result.error) throw result.error;
        if (live) {
          setRestaurantId(place.data.id);
          setReviews(result.data as ReviewRow[]);
        }
      } catch {
        if (live) setLoadError(true);
      } finally {
        if (live) setLoading(false);
      }
    })();
    return () => { live = false; };
  }, [restaurant.slug, attempt]);

  useEffect(() => {
    setRating(0);
    setBody("");
    setError(null);
    setSuccess(false);
  }, [userId]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting.current || !userId || !restaurantId) return;
    setError(null);
    setSuccess(false);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return setError("Vyberte hodnotenie od 1 do 5 hviezdičiek.");
    if (body.trim().length < 10 || body.trim().length > 2000) return setError("Recenzia musí mať 10 až 2 000 znakov.");
    submitting.current = true;
    setBusy(true);
    const memberId = userId;
    try {
      const result = await supabase.from("restaurant_reviews").insert({
        restaurant_id: restaurantId,
        user_id: memberId,
        author: displayName,
        stars: rating,
        body: body.trim(),
        reviewed_on: new Date().toLocaleDateString("sk-SK"),
      }).select("id, user_id, author, stars, reviewed_on, body").single();
      if (currentUser.current !== memberId) return;
      if (result.error) {
        setError(result.error.code === "23505"
          ? "Túto reštauráciu ste už hodnotili. Obnovte stránku a zobrazte svoju recenziu."
          : "Recenziu sa nepodarilo uložiť. Skontrolujte prihlásenie a skúste znova.");
        return;
      }
      setReviews((items) => [result.data as ReviewRow, ...items]);
      setBody("");
      setRating(0);
      setSuccess(true);
    } catch {
      if (currentUser.current === memberId) setError("Recenziu sa nepodarilo uložiť. Skúste znova.");
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  };

  const ownReview = userId && reviews.some((review) => review.user_id === userId);
  const average = reviews.length ? reviews.reduce((sum, review) => sum + review.stars, 0) / reviews.length : 0;

  return (
    <section className="panel" id="reviews" aria-labelledby="reviews-heading">
      <h3 id="reviews-heading">Hodnotenia</h3>
      <div className="rating-split">
        <div className="rating-box">
          <span className="rating-src">Google</span>
          <strong>{restaurant.rating.toFixed(1).replace(".", ",")}</strong>
          <span className="rating-stars">{stars(restaurant.rating)}</span>
          <small>{restaurant.ratingCount} hodnotení</small>
        </div>
        <div className="rating-box">
          <span className="rating-src">Komunita menufy</span>
          <strong>{loading || loadError || !reviews.length ? "—" : average.toFixed(1).replace(".", ",")}</strong>
          {reviews.length > 0 && !loadError && <span className="rating-stars">{stars(average)}</span>}
          <small>{loading ? "Načítavame…" : loadError ? "Hodnotenia nie sú dostupné" : `${reviews.length} recenzií`}</small>
        </div>
      </div>
      {success && <p className="success-note" role="status">Ďakujeme! Vaša recenzia bola zverejnená.</p>}
      {!userId ? (
        <div className="review-invite">
          <p>Navštívili ste túto reštauráciu? Podeľte sa o svoju skúsenosť.</p>
          <Link className="btn-primary" to={`/login?next=${encodeURIComponent(`/restaurant/${restaurant.slug}#reviews`)}`}>
            Prihlásiť sa a pridať recenziu
          </Link>
        </div>
      ) : !loading && !loadError && (ownReview ? (
        <p className="muted">Vaše hodnotenie už bolo pridané. Ďakujeme za vašu skúsenosť.</p>
      ) : (
        <form className="form review-form" onSubmit={submit}>
          <h4>Pridať recenziu</h4>
          <fieldset disabled={busy} className="review-fields">
            <fieldset className="review-rating">
              <legend>Vaše hodnotenie</legend>
              <div className="review-stars">
                {[1, 2, 3, 4, 5].map((value) => (
                  <label key={value}>
                    <input type="radio" name="review-rating" value={value} required checked={rating === value} onChange={() => setRating(value)} />
                    <span className={value <= rating ? "selected" : ""} aria-hidden="true">★</span>
                    <span className="review-sr-only">{value} z 5 hviezdičiek</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <p className="muted">Recenziu zverejníte ako <strong>{displayName}</strong>.</p>
            <label>Vaša skúsenosť
              <textarea required minLength={10} maxLength={2000} rows={4} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Ako vám chutilo? Aká bola obsluha a atmosféra?" />
              <small>{body.length} / 2 000 znakov · minimálne 10 znakov</small>
            </label>
            <button className="btn-primary" disabled={busy}>{busy ? "Odosielame…" : "Zverejniť recenziu"}</button>
          </fieldset>
        </form>
      ))}
      {error && <p className="form-error" role="alert">{error}</p>}
      {loading ? <p role="status" className="muted">Načítavame recenzie…</p> : loadError ? (
        <div className="form-error" role="alert">
          <p>Recenzie sa nepodarilo načítať.</p>
          <button className="btn-ghost" onClick={() => setAttempt((n) => n + 1)}>Skúsiť znova</button>
        </div>
      ) : reviews.length ? (
        <div className="reviews">
          {reviews.map((review) => (
            <div className="review" key={review.id}>
              <div className="review-top">
                <span className="mini-logo">{review.author[0]}</span>
                <strong>{review.author}</strong>
                {review.user_id === userId && <small>Vaša recenzia</small>}
                <span className="rating-stars" aria-label={`${review.stars} z 5 hviezdičiek`}>{stars(review.stars)}</span>
                <small>{review.reviewed_on}</small>
              </div>
              <p>{review.body}</p>
            </div>
          ))}
        </div>
      ) : <p className="muted">Zatiaľ žiadne recenzie. Buďte prvý, kto pridá svoju skúsenosť.</p>}
    </section>
  );
}
