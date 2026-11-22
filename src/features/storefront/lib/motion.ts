/** Shared media queries and motion preferences, read at call time. */

/** Phone layout: matches the CSS breakpoint used for stacked product pages. */
export const phoneLayoutQuery = "(max-width: 800px)";

export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Smooth unless the shopper asked for less motion. */
export function scrollBehavior(): ScrollBehavior {
  return prefersReducedMotion() ? "auto" : "smooth";
}
