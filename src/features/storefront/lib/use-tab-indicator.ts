"use client";

import { useLayoutEffect, useRef } from "react";

/**
 * Moves one underline between tabs instead of switching borders.
 * The container gets --indicator-left/--indicator-width and data-indicator;
 * without JavaScript the per-tab border stays as the fallback.
 */
export function useTabIndicator<T extends HTMLElement>(
  activeSelector: string,
  activeKey: string,
) {
  const ref = useRef<T>(null);

  useLayoutEffect(() => {
    const container = ref.current;
    if (!container) return;
    const place = () => {
      const active = container.querySelector<HTMLElement>(activeSelector);
      if (!active) {
        delete container.dataset.indicator;
        return;
      }
      container.style.setProperty("--indicator-left", `${active.offsetLeft}px`);
      container.style.setProperty(
        "--indicator-width",
        `${active.offsetWidth}px`,
      );
      container.dataset.indicator = "ready";
    };
    place();
    const observer = new ResizeObserver(place);
    observer.observe(container);
    return () => observer.disconnect();
  }, [activeSelector, activeKey]);

  return ref;
}
