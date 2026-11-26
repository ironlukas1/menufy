import { useEffect, useState } from "react";
import { googleMapsUrl, websiteUrl } from "@/data/restaurantSettings";
import { stars } from "@/lib";

type Rating = { name: string; rating: number | null; ratingCount: number; mapsUrl: string; attributions: { name: string; url: string | null }[] };

function normalizeRating(value: unknown): Rating | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const rating = typeof raw.rating === "number" && Number.isFinite(raw.rating) && raw.rating >= 0 && raw.rating <= 5
    ? raw.rating : null;
  const ratingCount = typeof raw.ratingCount === "number" && Number.isFinite(raw.ratingCount) && raw.ratingCount >= 0
    ? Math.trunc(raw.ratingCount) : 0;
  const name = typeof raw.name === "string" && raw.name.trim() ? raw.name.trim().slice(0, 200) : "Google Maps";
  const mapsUrl = googleMapsUrl(raw.mapsUrl) ?? "";
  const attributions = (Array.isArray(raw.attributions) ? raw.attributions : []).flatMap((entry: unknown) => {
    if (!entry || typeof entry !== "object") return [];
    const item = entry as { name?: unknown; url?: unknown };
    if (typeof item.name !== "string" || !item.name.trim()) return [];
    // Google-hosted attributions are allowlisted; provider pages stay plain HTTPS.
    const url = googleMapsUrl(item.url) ?? websiteUrl(item.url);
    return [{ name: item.name.trim().slice(0, 120), url: url || null }];
  });
  return { name, rating, ratingCount, mapsUrl, attributions };
}

export default function GoogleRating({ slug }: { slug: string }) {
  const [data, setData] = useState<Rating | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canRetry, setCanRetry] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const abort = new AbortController();
    setData(null); setError(null); setLoading(true); setCanRetry(false);
    void (async () => {
      try {
        const response = await fetch(`/api/v1/restaurants/${encodeURIComponent(slug)}/google-rating`, { cache: "no-store", signal: abort.signal });
        const payload: unknown = await response.json();
        const envelope = (payload && typeof payload === "object" ? payload : {}) as { data?: unknown; error?: { code?: string } };
        const normalized = envelope.data ? normalizeRating(envelope.data) : null;
        if (abort.signal.aborted) return;
        if (!response.ok || !normalized) {
          setError(envelope.error?.code === "NOT_LINKED" ? "Google Maps zatiaľ nie sú prepojené." : "Google hodnotenie momentálne nie je dostupné.");
          setCanRetry(!["NOT_LINKED", "NOT_CONFIGURED", "NOT_FOUND"].includes(envelope.error?.code ?? ""));
        } else setData(normalized);
      } catch { if (!abort.signal.aborted) { setError("Google hodnotenie sa nepodarilo načítať."); setCanRetry(true); } }
      finally { if (!abort.signal.aborted) setLoading(false); }
    })();
    return () => abort.abort();
  }, [slug, attempt]);

  const rating = data?.rating ?? null;
  const safeRating = rating !== null ? Math.min(5, Math.max(0, rating)) : null;
  const count = data && Number.isFinite(data.ratingCount) ? data.ratingCount : 0;
  const mapsUrl = googleMapsUrl(data?.mapsUrl);
  return <div className="rating-box google-rating-box" id="google-rating" aria-label="Hodnotenie z Google Maps">
    <span className="google-maps-attribution" translate="no">Google Maps</span>
    {loading ? <p className="muted" role="status">Načítavame hodnotenie…</p> : data ? <>
      <strong>{safeRating === null ? "—" : safeRating.toFixed(1).replace(".", ",")}</strong>
      {safeRating !== null && <span className="rating-stars" aria-label={`${safeRating} z 5 hviezdičiek`}>{stars(safeRating)}</span>}
      <small>{count > 0 ? `${count.toLocaleString("sk-SK")} hodnotení` : "Zatiaľ bez hodnotení"}</small>
      {mapsUrl ? <a className="inline-link" href={mapsUrl} target="_blank" rel="noopener noreferrer">{data.name} ↗</a> : <span>{data.name}</span>}
      {data.attributions.map((entry, index) => <small key={index}>{entry.url ? <a href={entry.url} target="_blank" rel="noopener noreferrer">{entry.name}</a> : entry.name}</small>)}
      <a className="google-review-policy" href="https://support.google.com/contributionpolicy/answer/7400114" target="_blank" rel="noopener noreferrer">Ako Google kontroluje recenzie</a>
    </> : <><strong>—</strong><small>{error}</small>{canRetry && <button type="button" className="inline-link plain" onClick={() => setAttempt((value) => value + 1)}>Skúsiť znova</button>}</>}
  </div>;
}
