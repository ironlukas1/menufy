import { useEffect } from "react";
import Icon from "./Icon";

export default function Lightbox({
  images,
  index,
  alt,
  onClose,
  onIndex,
}: {
  images: string[];
  index: number;
  alt: string;
  onClose: () => void;
  onIndex: (i: number) => void;
}) {
  const n = images.length;
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") onIndex((index + 1) % n);
      else if (e.key === "ArrowLeft") onIndex((index - 1 + n) % n);
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [index, n, onClose, onIndex]);

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label="Fotogaléria" onClick={onClose}>
      <button className="lightbox-close" onClick={onClose} aria-label="Zavrieť">
        <Icon name="close" size={22} />
      </button>
      {n > 1 && (
        <button
          className="lightbox-nav prev"
          onClick={(e) => {
            e.stopPropagation();
            onIndex((index - 1 + n) % n);
          }}
          aria-label="Predchádzajúca fotka"
        >
          <Icon name="back" size={24} />
        </button>
      )}
      <img src={images[index]} alt={`${alt} – fotka ${index + 1}`} onClick={(e) => e.stopPropagation()} />
      {n > 1 && (
        <button
          className="lightbox-nav next"
          onClick={(e) => {
            e.stopPropagation();
            onIndex((index + 1) % n);
          }}
          aria-label="Ďalšia fotka"
        >
          <Icon name="arrow" size={24} />
        </button>
      )}
      <span className="lightbox-count">
        {index + 1} / {n}
      </span>
    </div>
  );
}
