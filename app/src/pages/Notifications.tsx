import { useEffect, useState } from "react";
import { Link } from "react-router";
import Icon, { type IconName } from "@/components/Icon";
import { useProto } from "@/proto/ProtoContext";
import { supabase } from "@/supabase";

type NoticeKind = "menu" | "offer" | "system";
type Notice = {
  id: string;
  kind: NoticeKind;
  title: string;
  body: string;
  time_label: string;
  restaurant_slug: string | null;
  notification_reads: { dismissed_at: string | null }[];
};

const kinds: Record<NoticeKind, { icon: IconName; label: string }> = {
  menu: { icon: "calendar", label: "Denné menu" },
  offer: { icon: "star", label: "Ponuka" },
  system: { icon: "bell", label: "Systém" },
};

const text = (value: unknown) => (typeof value === "string" ? value : "");
function normalizeNotice(value: unknown): Notice | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (typeof row.id !== "string" || !row.id) return null;
  const kind: NoticeKind = row.kind === "menu" || row.kind === "offer" || row.kind === "system" ? row.kind : "system";
  const reads = (Array.isArray(row.notification_reads) ? row.notification_reads : []).flatMap((read: unknown) => {
    if (!read || typeof read !== "object") return [];
    const entry = read as { dismissed_at?: unknown };
    return [{ dismissed_at: typeof entry.dismissed_at === "string" ? entry.dismissed_at : null }];
  });
  return {
    id: row.id, kind, title: text(row.title), body: text(row.body), time_label: text(row.time_label),
    restaurant_slug: typeof row.restaurant_slug === "string" && row.restaurant_slug ? row.restaurant_slug : null,
    notification_reads: reads,
  };
}

export default function Notifications() {
  const { userId } = useProto();
  const [items, setItems] = useState<Notice[] | null>(null);

  useEffect(() => {
    if (!userId) return;
    let live = true;
    supabase
      .from("notifications")
      .select("id, kind, title, body, time_label, restaurant_slug, notification_reads(dismissed_at)")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (!live) return;
        const notices = (Array.isArray(data) ? data : []).map(normalizeNotice)
          .filter((notice): notice is Notice => !!notice)
          .filter((notice) => !notice.notification_reads.some((read) => read.dismissed_at));
        setItems(notices);
      });
    return () => {
      live = false;
    };
  }, [userId]);

  const dismiss = (gone: Notice[]) => {
    if (!userId || !gone.length) return;
    const prev = items ?? [];
    const ids = new Set(gone.map((n) => n.id));
    setItems((l) => l && l.filter((n) => !ids.has(n.id)));
    const dismissed_at = new Date().toISOString();
    void supabase
      .from("notification_reads")
      .upsert(gone.map((n) => ({ notification_id: n.id, user_id: userId, dismissed_at })))
      .then(({ error }) => {
        if (error) setItems((l) => l && prev.filter((n) => ids.has(n.id) || l.includes(n)));
      });
  };

  if (!items) return <div className="page" />;

  return (
    <div className="page">
      <div className="page-head page-head-row">
        <div>
          <p className="section-kicker">Centrum upozornení</p>
          <h2>Upozornenia</h2>
        </div>
        <div className="page-head-actions">
          {items.length > 0 && (
            <button className="btn-ghost" onClick={() => dismiss(items)}>
              <Icon name="trash" size={16} /> Vymazať všetky
            </button>
          )}
          <Link to="/settings#notifications" className="btn-ghost">
            <Icon name="settings" size={16} /> Nastaviť upozornenia
          </Link>
        </div>
      </div>
      <ul className="notice-list">
        {items.map((n) => {
          const kind = kinds[n.kind] ?? kinds.system;
          return (
            <li key={n.id} className={`notice ${n.kind}`}>
              <span className="notice-icon">
                <Icon name={kind.icon} size={18} />
              </span>
              <div>
                <div className="notice-meta">
                  <span className="menu-tag">{kind.label}</span>
                  <small>{n.time_label}</small>
                </div>
                <strong>{n.title}</strong>
                <p>{n.body}</p>
                {n.restaurant_slug && (
                  <Link to={`/restaurant/${n.restaurant_slug}`} className="inline-link">
                    Zobraziť menu <Icon name="arrow" size={14} />
                  </Link>
                )}
              </div>
              <button
                className="notice-delete"
                onClick={() => dismiss([n])}
                aria-label={`Odstrániť upozornenie: ${n.title}`}
              >
                <Icon name="trash" size={16} />
              </button>
            </li>
          );
        })}
      </ul>
      {items.length === 0 && (
        <div className="empty-state">
          <span>
            <Icon name="bell" size={26} />
          </span>
          <h3>Žiadne upozornenia</h3>
          <p>Keď bude niečo nové, uvidíte to tu.</p>
        </div>
      )}
    </div>
  );
}
