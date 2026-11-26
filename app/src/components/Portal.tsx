import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * Renders children into <body>. Open windows must escape the top bar: an
 * ancestor with `backdrop-filter` becomes the containing block for
 * `position: fixed`, which would clip the overlay to the 64px strip.
 */
export default function Portal({ children }: { children: ReactNode }) {
  const [host, setHost] = useState<HTMLElement | null>(null);
  useEffect(() => setHost(document.body), []);
  return host ? createPortal(children, host) : null;
}
