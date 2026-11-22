/**
 * Lets the browser's Back button (and the phone's back gesture) close an
 * open overlay instead of leaving the page.
 *
 * Opening adds one history entry with the same URL, tagged with an id.
 * Back leaves that entry and closes the overlay. Closing from the page
 * steps back over the entry only while it is still the current one: a link
 * inside the overlay that navigated elsewhere has already moved past it.
 */
const marker = "storefrontOverlay";
let ownEntry: string | null = null;

function entryId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function withoutMarker(state: unknown) {
  if (!state || typeof state !== "object") return state;
  const rest: Record<string, unknown> = { ...state };
  delete rest[marker];
  return rest;
}

export function pushOverlayEntry() {
  if (ownEntry && window.history.state?.[marker] === ownEntry) return;
  ownEntry = entryId();
  window.history.pushState({ ...window.history.state, [marker]: ownEntry }, "");
}

export function dropOverlayEntry() {
  const id = ownEntry;
  ownEntry = null;
  // Let a link click finish first: its navigation creates a newer entry.
  window.setTimeout(() => {
    if (id && window.history.state?.[marker] === id) window.history.back();
  }, 0);
}

/**
 * Clears a leftover overlay entry, e.g. one restored after a reload or one a
 * link inside an overlay stepped past. Without the tag it is a plain entry.
 */
export function forgetStaleOverlayEntry() {
  const tag = window.history.state?.[marker];
  if (tag && tag !== ownEntry)
    window.history.replaceState(withoutMarker(window.history.state), "");
}

export function onOverlayBack(close: () => void) {
  const listener = () => {
    ownEntry = null;
    close();
    forgetStaleOverlayEntry();
  };
  window.addEventListener("popstate", listener);
  return () => window.removeEventListener("popstate", listener);
}
