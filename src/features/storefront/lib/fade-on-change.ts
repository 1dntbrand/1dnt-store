"use client";

import { useEffect, useRef, type RefObject } from "react";
import { prefersReducedMotion } from "./motion";

/** Set once the first frame is on screen; before that nothing animates. */
export function markPageReady() {
  window.requestAnimationFrame(() =>
    window.requestAnimationFrame(() => {
      document.documentElement.dataset.ready = "";
    }),
  );
}

function pageReady() {
  return document.documentElement.hasAttribute("data-ready");
}

/**
 * Crossfades an element in when `value` changes because of something the
 * shopper did. The first render and the state restored before the first
 * paint never animate, so a page load does not replay any motion.
 */
export function useFadeOnChange(
  ref: RefObject<HTMLElement | null>,
  value: unknown,
  when = true,
  keyframes: Keyframe[] = FADE_IN,
) {
  const previous = useRef(value);
  useEffect(() => {
    if (Object.is(previous.current, value)) return;
    previous.current = value;
    const element = ref.current;
    if (!when || !element || !pageReady() || prefersReducedMotion()) return;
    element.animate(keyframes, {
      duration: 220,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    });
  }, [ref, value, when, keyframes]);
}

const FADE_IN: Keyframe[] = [{ opacity: 0 }, { opacity: 1 }];
/** A changed number settles in place: noticeable, never distracting. */
const TICK: Keyframe[] = [
  { opacity: 0.25, transform: "translateY(-3px)" },
  { opacity: 1, transform: "none" },
];

/** A figure (price, count) that briefly ticks when the shopper changes it. */
export function useTickOnChange(
  ref: RefObject<HTMLElement | null>,
  value: unknown,
) {
  useFadeOnChange(ref, value, true, TICK);
}
