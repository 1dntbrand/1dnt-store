"use client";

import { useEffect } from "react";

/**
 * Fades `[data-reveal]` blocks in as they scroll into view.
 * Content stays visible without JavaScript and with reduced motion,
 * because the hidden state applies only under `html[data-motion]`.
 */
export function useRevealOnScroll() {
  useEffect(() => {
    if (
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const root = document.documentElement;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.06 },
    );
    for (const element of document.querySelectorAll("[data-reveal]")) {
      const bounds = element.getBoundingClientRect();
      const onScreen =
        bounds.height > 0 &&
        bounds.top < window.innerHeight &&
        bounds.bottom > 0;
      if (onScreen) element.classList.add("is-visible");
      else observer.observe(element);
    }
    root.dataset.motion = "on";
    return () => {
      observer.disconnect();
      delete root.dataset.motion;
    };
  }, []);
}
