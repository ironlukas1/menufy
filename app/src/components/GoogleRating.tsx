import { useEffect, useState } from "react";
import { stars } from "@/lib";

type Rating = { name: string; rating: number | null; ratingCount: number; mapsUrl: string; attributions: { name: string; url: string | null }[] };
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
        const result = await response.json();
        if (abort.signal.aborted) return;
        if (!response.ok || !result.data) {
          setError(result.error?.code === "NOT_LINKED" ? "Google Maps zatiaľ nie sú prepojené." : "Google hodnotenie momentálne nie je dostupné.");
          setCanRetry(!["NOT_LINKED", "NOT_CONFIGURED", "NOT_FOUND"].includes(result.error?.code));
        } else setData(result.data);
      } catch { if (!abort.signal.aborted) { setError("Google hodnotenie sa nepodarilo načítať."); setCanRetry(true); } }
      finally { if (!abort.signal.aborted) setLoading(false); }
    })();
    return () => abort.abort();
  }, [slug, attempt]);
  return <div className="rating-box google-rating-box" id="google-rating" aria-label="Hodnotenie z Google Maps">
    <span className="google-maps-attribution" translate="no">Google Maps</span>
    {loading ? <p className="muted" role="status">Načítavame hodnotenie…</p> : data ? <>
      <strong>{data.rating === null ? "—" : data.rating.toFixed(1).replace(".", ",")}</strong>
      {data.rating !== null && <span className="rating-stars" aria-label={`${data.rating} z 5 hviezdičiek`}>{stars(data.rating)}</span>}
      <small>{data.ratingCount > 0 ? `${data.ratingCount.toLocaleString("sk-SK")} hodnotení` : "Zatiaľ bez hodnotení"}</small>
      <a className="inline-link" href={data.mapsUrl} target="_blank" rel="noopener noreferrer">{data.name} ↗</a>
      {data.attributions.map((entry, index) => <small key={index}>{entry.url ? <a href={entry.url} target="_blank" rel="noopener noreferrer">{entry.name}</a> : entry.name}</small>)}
      <a className="google-review-policy" href="https://support.google.com/contributionpolicy/answer/7400114" target="_blank" rel="noopener noreferrer">Ako Google kontroluje recenzie</a>
    </> : <><strong>—</strong><small>{error}</small>{canRetry && <button type="button" className="inline-link plain" onClick={() => setAttempt((value) => value + 1)}>Skúsiť znova</button>}</>}
  </div>;
}
