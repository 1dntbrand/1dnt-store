/** Shared media queries and motion preferences, read at call time. */

/** Phone layout: matches the CSS breakpoint used for stacked product pages. */
export const phoneLayoutQuery = "(max-width: 800px)";

/**
 * One timing system for the whole storefront, mirrored by the CSS custom
 * properties --motion-* and --ease-*: small state changes are fast, things
 * that move or open take a little longer, and exits are quicker than
 * entrances.
 */
export const MOTION = { fast: 150, base: 240, slow: 320, exit: 180 } as const;
export const EASE_OUT = "cubic-bezier(0.22, 1, 0.36, 1)";
export const EASE_IN = "cubic-bezier(0.4, 0, 1, 1)";

export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Smooth unless the shopper asked for less motion. */
export function scrollBehavior(): ScrollBehavior {
  return prefersReducedMotion() ? "auto" : "smooth";
}
