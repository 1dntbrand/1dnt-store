/**
 * Lets the browser's Back button (and the phone's back gesture) close an
 * open overlay instead of leaving the page.
 *
 * Opening adds one history entry with the same URL. Back removes it and
 * closes the overlay. Closing from the page removes the entry again, unless
 * a link inside the overlay has already navigated to a new address.
 */
const marker = "storefrontOverlay";

export function pushOverlayEntry() {
  if (window.history.state?.[marker]) return;
  window.history.pushState({ ...window.history.state, [marker]: true }, "");
}

export function dropOverlayEntry() {
  // Let a link click finish first: its navigation replaces the entry.
  window.setTimeout(() => {
    if (window.history.state?.[marker]) window.history.back();
  }, 0);
}

export function onOverlayBack(close: () => void) {
  const listener = () => close();
  window.addEventListener("popstate", listener);
  return () => window.removeEventListener("popstate", listener);
}
