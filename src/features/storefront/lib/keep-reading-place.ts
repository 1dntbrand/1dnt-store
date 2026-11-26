/**
 * Runs a change that re-flows the page (a new language: every text changes
 * length) and keeps what the shopper was reading where it was on screen.
 * The change must render synchronously (wrap it in flushSync) so the
 * correction lands before the next paint.
 */
export function keepReadingPlace(change: () => void) {
  if (window.scrollY < 1) return change();
  const header =
    document.querySelector(".site-header")?.getBoundingClientRect().bottom ?? 0;
  const y = header + (window.innerHeight - header) / 3;
  const anchor = document.elementFromPoint(window.innerWidth / 2, y);
  const before = anchor?.getBoundingClientRect().top;
  change();
  if (!anchor?.isConnected || before === undefined) return;
  const drift = anchor.getBoundingClientRect().top - before;
  if (Math.abs(drift) < 1) return;
  const root = document.documentElement;
  const behaviour = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  window.scrollBy(0, drift);
  root.style.scrollBehavior = behaviour;
}
