"use client";

import {
  createContext,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  type MouseEvent,
  type ReactNode,
} from "react";
import { EASE_OUT, MOTION, prefersReducedMotion } from "../lib/motion";

const DURATION_MS = MOTION.slow;
const EASE = EASE_OUT;

interface GroupItem {
  isOpen: () => boolean;
  collapse: () => void;
}

const GroupContext = createContext<Map<string, GroupItem> | null>(null);

/** Disclosures inside a group behave as one accordion: one open at a time. */
export function DisclosureGroup({ children }: { children: ReactNode }) {
  const items = useMemo(() => new Map<string, GroupItem>(), []);
  return (
    <GroupContext.Provider value={items}>{children}</GroupContext.Provider>
  );
}

/**
 * Keeps a tapped header where it was while the open item above it folds
 * away: the page follows the fold, so the header stays under the finger
 * and the folding text leaves upward instead of the header jumping.
 */
function keepInPlace(header: HTMLElement, start: number, duration: number) {
  const root = document.documentElement;
  const hold = () => {
    const drift = header.getBoundingClientRect().top - start;
    if (Math.abs(drift) <= 0.5) return;
    // Instant, whatever the page's smooth-scroll setting says.
    const behaviour = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    window.scrollBy(0, drift);
    root.style.scrollBehavior = behaviour;
  };
  // Without motion the fold is already done: one correction is enough.
  if (!duration) return hold();
  const end = performance.now() + duration + 60;
  const step = () => {
    hold();
    if (performance.now() < end) window.requestAnimationFrame(step);
  };
  window.requestAnimationFrame(step);
}

/** Whether the group item `key` sits above `header` in the page. */
function isAbove(key: string, header: HTMLElement) {
  const other = document.querySelector(
    `[data-disclosure="${CSS.escape(key)}"]`,
  );
  return (
    !!other &&
    !!(other.compareDocumentPosition(header) & Node.DOCUMENT_POSITION_FOLLOWING)
  );
}

/**
 * A native <details> that opens and closes smoothly in every browser
 * (Safari cannot animate to height: auto in CSS).
 *
 * In a group, opening an item folds the open one at the same time, so the
 * page reflows in one smooth movement instead of jumping. A second tap
 * mid-way reverses from the current height.
 */
export function Disclosure({
  summary,
  children,
  className,
  summaryClassName,
  contentClassName,
  defaultOpen = false,
  onToggle,
}: {
  summary: ReactNode;
  children: ReactNode;
  className?: string;
  summaryClassName?: string;
  contentClassName?: string;
  defaultOpen?: boolean;
  onToggle?: (open: boolean) => void;
}) {
  const group = useContext(GroupContext);
  const id = useId();
  const details = useRef<HTMLDetailsElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const animation = useRef<Animation | null>(null);
  const toggled = useRef(onToggle);
  useEffect(() => {
    toggled.current = onToggle;
  });

  /** Animate the content to open or closed from wherever it is now. */
  function animateTo(state: "open" | "closed") {
    const element = details.current;
    const body = content.current;
    if (!element || !body) return;
    const from = element.open ? body.getBoundingClientRect().height : 0;
    animation.current?.cancel();
    animation.current = null;

    const settle = () => {
      body.style.overflow = "";
      if (state === "closed") element.open = false;
      delete element.dataset.state;
      toggled.current?.(state === "open");
    };

    if (state === "open") {
      delete element.dataset.state;
      element.open = true;
    } else {
      // The +/− flips at once; the panel folds away underneath.
      element.dataset.state = "closing";
    }
    if (prefersReducedMotion()) return settle();

    const to = state === "open" ? body.scrollHeight : 0;
    body.style.overflow = "hidden";
    const running = body.animate(
      [
        { height: `${from}px`, opacity: state === "open" ? 0.25 : 1 },
        { height: `${to}px`, opacity: state === "open" ? 1 : 0 },
      ],
      { duration: DURATION_MS, easing: EASE },
    );
    animation.current = running;
    // The promise settles even when the page is not rendering (background
    // tab); a cancelled run rejects and simply does nothing.
    running.finished
      .then(() => {
        if (animation.current !== running) return;
        animation.current = null;
        settle();
      })
      .catch(() => {});
  }

  // The group calls the latest animateTo through a ref.
  const animateRef = useRef(animateTo);
  useEffect(() => {
    animateRef.current = animateTo;
  });
  useEffect(() => {
    if (!group) return;
    group.set(id, {
      isOpen: () =>
        !!details.current?.open && details.current.dataset.state !== "closing",
      collapse: () => animateRef.current("closed"),
    });
    return () => {
      group.delete(id);
    };
  }, [group, id]);

  function onSummaryClick(event: MouseEvent<HTMLElement>) {
    event.preventDefault();
    const element = details.current;
    if (!element) return;
    if (element.open && element.dataset.state !== "closing") {
      animateTo("closed");
      return;
    }
    const header = event.currentTarget;
    const headerTop = header.getBoundingClientRect().top;
    let foldsAbove = false;
    if (group)
      for (const [key, item] of group) {
        if (key === id || !item.isOpen()) continue;
        item.collapse();
        foldsAbove ||= isAbove(key, header);
      }
    animateTo("open");
    if (foldsAbove)
      keepInPlace(header, headerTop, prefersReducedMotion() ? 0 : DURATION_MS);
  }

  return (
    <details
      ref={details}
      className={className}
      open={defaultOpen}
      data-disclosure={id}
    >
      <summary className={summaryClassName} onClick={onSummaryClick}>
        {summary}
      </summary>
      {/* The animated wrapper has no padding or layout of its own, so it can
          fold to exactly zero; the styled content sits inside it. */}
      <div ref={content} className="disclosure-content">
        {contentClassName ? (
          <div className={contentClassName}>{children}</div>
        ) : (
          children
        )}
      </div>
    </details>
  );
}
