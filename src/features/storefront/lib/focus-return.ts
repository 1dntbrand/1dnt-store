/**
 * Where focus goes back to when an overlay closes.
 *
 * Only a real control is restored: on iPhone a tap does not focus the
 * button, so the active element can be a container, and focusing that
 * paints a system focus ring around a whole section. Focus also never
 * scrolls the page; closing a dialog must leave the shopper where they are.
 */
const controls =
  "a[href], button, input, select, textarea, summary, [role='tab']";

export function captureReturnFocus(): HTMLElement | null {
  const element = document.activeElement;
  return element instanceof HTMLElement && element.matches(controls)
    ? element
    : null;
}

export function returnFocus(
  element: HTMLElement | null,
  overlay: HTMLElement | null,
) {
  if (element?.isConnected) {
    element.focus({ preventScroll: true });
    return;
  }
  // Nothing to return to: do not leave focus parked on a closed overlay.
  const active = document.activeElement;
  if (overlay && active instanceof HTMLElement && overlay.contains(active))
    active.blur();
}
