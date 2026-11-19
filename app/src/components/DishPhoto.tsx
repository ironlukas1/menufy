import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Icon from "./Icon";
import { restaurantImageUrl } from "@/supabase";

export default function DishPhoto({ image, name }: { image?: string; name: string }) {
  const [open, setOpen] = useState(false);
  const src = image ? restaurantImageUrl(image) : "";

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!src) return (
    <div className="dish-photo-empty" title="Reštaurácia nenahrala fotografiu tohto jedla" aria-label="Bez fotografie jedla">
      <Icon name="image" size={18} />
      <span>Bez fotky</span>
    </div>
  );

  return <>
    <button type="button" className="dish-photo" onClick={() => setOpen(true)} aria-label={`Zobraziť fotografiu jedla ${name}`} title="Kliknutím zobrazíte fotografiu">
      <img src={src} alt={name} loading="lazy" />
    </button>
    {open && createPortal(
      <div className="dish-lightbox" role="dialog" aria-modal="true" aria-label={`Fotografia jedla ${name}`} onClick={() => setOpen(false)}>
        <button type="button" className="dish-lightbox-close" onClick={() => setOpen(false)} aria-label="Zavrieť fotografiu">
          <Icon name="close" size={20} />
        </button>
        <figure onClick={(event) => event.stopPropagation()}>
          <img src={src} alt={name} />
          <figcaption>{name}</figcaption>
        </figure>
      </div>,
      document.body,
    )}
  </>;
}
