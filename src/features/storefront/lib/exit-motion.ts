import { prefersReducedMotion } from "./motion";

const EXIT_MS = 180;
const EXIT_EASE = "cubic-bezier(0.4, 0, 1, 1)";

/** Where a closing overlay goes: back the way it came in. */
function exitTransform(element: HTMLElement) {
  if (element.classList.contains("left-panel")) return "translateX(-24px)";
  if (element.classList.contains("site-panel")) return "translateX(24px)";
  if (element.classList.contains("lightbox")) return "none";
  const phone = window.matchMedia("(max-width: 640px)").matches;
  if (element.classList.contains("modal-sheet") && phone)
    return "translateY(32px)";
  return "translateY(8px)";
}

/**
 * Plays a short exit on a dialog (and its backdrop) before it closes.
 * Resolves immediately when the shopper prefers reduced motion.
 */
export function playDialogExit(dialog: HTMLDialogElement): Animation | null {
  if (prefersReducedMotion()) return null;
  const options = { duration: EXIT_MS, easing: EXIT_EASE, fill: "forwards" };
  try {
    dialog.animate([{ opacity: 0 }], {
      ...options,
      pseudoElement: "::backdrop",
    } as KeyframeAnimationOptions);
  } catch {
    /* Older browsers cannot animate ::backdrop; the panel still fades. */
  }
  return dialog.animate(
    [{ opacity: 0, transform: exitTransform(dialog) }],
    options as KeyframeAnimationOptions,
  );
}

/** Folds an element away (height and opacity), then runs `done`. */
export function foldAway(element: HTMLElement | null, done: () => void) {
  if (!element || prefersReducedMotion()) return done();
  if (element.dataset.leaving) return;
  element.dataset.leaving = "";
  const height = element.getBoundingClientRect().height;
  element.style.overflow = "hidden";
  element
    .animate(
      [
        { height: `${height}px`, opacity: 1 },
        { height: "0px", opacity: 0, paddingBlock: "0px", marginBlock: "0px" },
      ],
      {
        duration: 240,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "forwards",
      },
    )
    .finished.then(done, done);
}

/** A short fade on something that is about to disappear. */
export function fadeAway(element: HTMLElement | null, done: () => void) {
  if (!element || prefersReducedMotion()) return done();
  // A second trigger (timer and close at once) must not finish it twice.
  if (element.dataset.leaving) return;
  element.dataset.leaving = "";
  element
    .animate([{ opacity: 0, transform: "translateY(6px)" }], {
      duration: EXIT_MS,
      easing: EXIT_EASE,
      fill: "forwards",
    })
    .finished.then(done, done);
}
