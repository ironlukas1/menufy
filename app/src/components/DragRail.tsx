import { useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";

type Lens = { left: number; top: number; width: number; height: number };

/**
 * A rail of items (chrome buttons, bottom tabs) with a glass lens that follows
 * the finger while it is held down. Sliding onto another item lights that item
 * up as if it were the current one, and releasing actually switches to it —
 * the "slide to choose" feel of a native glass segmented control.
 *
 * Items are found by `[data-rail-item]`, so any button or link can take part.
 * Tracking runs on `document` instead of pointer capture, so a plain tap still
 * produces its normal click.
 */
export default function DragRail({
  className,
  label,
  role = "group",
  children,
}: {
  className: string;
  label?: string;
  role?: "group" | "navigation" | "toolbar";
  children: ReactNode;
}) {
  const rail = useRef<HTMLDivElement>(null);
  const hot = useRef<HTMLElement | null>(null);
  const [lens, setLens] = useState<Lens | null>(null);
  const [pressed, setPressed] = useState(false);

  const itemAt = (x: number, y: number) =>
    document.elementFromPoint(x, y)?.closest<HTMLElement>("[data-rail-item]") ?? null;

  const markHot = (el: HTMLElement | null) => {
    if (hot.current === el) return;
    hot.current?.classList.remove("is-hot");
    el?.classList.add("is-hot");
    hot.current = el;
  };

  const track = (el: HTMLElement | null) => {
    const box = rail.current?.getBoundingClientRect();
    if (!el || !box) {
      setLens(null);
      return;
    }
    const item = el.getBoundingClientRect();
    setLens({ left: item.left - box.left, top: item.top - box.top, width: item.width, height: item.height });
  };

  const start = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const from = itemAt(e.clientX, e.clientY);
    if (!from) return;

    setPressed(true);
    track(from);
    markHot(from);

    const down = { x: e.clientX, y: e.clientY };
    let moved = false;

    const move = (ev: PointerEvent) => {
      if (Math.hypot(ev.clientX - down.x, ev.clientY - down.y) > 6) moved = true;
      const el = itemAt(ev.clientX, ev.clientY);
      track(el);
      markHot(el);
    };

    const stop = () => {
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", up);
      document.removeEventListener("pointercancel", stop);
      setPressed(false);
      setLens(null);
      markHot(null);
    };

    const up = (ev: PointerEvent) => {
      const to = itemAt(ev.clientX, ev.clientY);
      stop();
      // A tap (or a drag that ends on the item it started on) keeps its native
      // click. A drag to another item switches to that one on release.
      if (!to || to === from || !moved) return;
      ev.preventDefault();
      swallowNextClick();
      to.click();
    };

    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", up);
    document.addEventListener("pointercancel", stop);
  };

  return (
    <div
      ref={rail}
      className={`drag-rail ${className}${pressed ? " is-dragging" : ""}`}
      role={role}
      aria-label={label}
      onPointerDown={start}
    >
      {lens && <span className="drag-lens" style={lens} aria-hidden="true" />}
      {children}
    </div>
  );
}

/**
 * After a drag the browser can still fire a stray click on the item the finger
 * started on, which would undo the switch. Swallow clicks for a moment — our
 * own `.click()` above runs before this is attached.
 */
function swallowNextClick() {
  const swallow = (ev: MouseEvent) => {
    ev.stopPropagation();
    ev.preventDefault();
  };
  document.addEventListener("click", swallow, true);
  setTimeout(() => document.removeEventListener("click", swallow, true), 350);
}
