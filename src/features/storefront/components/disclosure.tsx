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
import { prefersReducedMotion } from "../lib/motion";

const OPEN_MS = 300;
const CLOSE_MS = 220;
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

interface GroupItem {
  isOpen: () => boolean;
  closeNow: () => void;
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
 * A native <details> that opens and closes smoothly in every browser
 * (Safari cannot animate to height: auto in CSS).
 *
 * Opening one item in a group closes the open one at once and keeps the
 * tapped header exactly where it was on screen, so the page never jumps.
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

  useEffect(() => {
    if (!group) return;
    group.set(id, {
      isOpen: () => !!details.current?.open,
      closeNow: () => {
        const element = details.current;
        if (!element?.open) return;
        animation.current?.cancel();
        animation.current = null;
        if (content.current) content.current.style.overflow = "";
        element.open = false;
        delete element.dataset.state;
        toggled.current?.(false);
      },
    });
    return () => {
      group.delete(id);
    };
  }, [group, id]);

  function stop() {
    animation.current?.cancel();
    animation.current = null;
    if (content.current) content.current.style.overflow = "";
  }

  function run(keyframes: Keyframe[], duration: number, done?: () => void) {
    const body = content.current;
    if (!body) return done?.();
    stop();
    body.style.overflow = "hidden";
    const running = body.animate(keyframes, { duration, easing: EASE });
    animation.current = running;
    // The promise settles even when the page is not rendering (background
    // tab); a cancelled run rejects and simply does nothing.
    running.finished
      .then(() => {
        if (animation.current !== running) return;
        animation.current = null;
        body.style.overflow = "";
        done?.();
      })
      .catch(() => {});
  }

  /** Close the group's open item without moving the tapped header. */
  function closeOthers(header: HTMLElement) {
    if (!group) return;
    const before = header.getBoundingClientRect().top;
    let closed = false;
    for (const [key, item] of group)
      if (key !== id && item.isOpen()) {
        item.closeNow();
        closed = true;
      }
    if (!closed) return;
    const shift = header.getBoundingClientRect().top - before;
    if (Math.abs(shift) > 0.5)
      window.scrollBy({ top: shift, behavior: "instant" });
  }

  function open(header: HTMLElement) {
    const element = details.current;
    const body = content.current;
    if (!element || !body) return;
    closeOthers(header);
    delete element.dataset.state;
    element.open = true;
    toggled.current?.(true);
    if (prefersReducedMotion()) return;
    run(
      [
        { height: "0px", opacity: 0 },
        { height: `${body.scrollHeight}px`, opacity: 1 },
      ],
      OPEN_MS,
    );
  }

  function close() {
    const element = details.current;
    const body = content.current;
    if (!element || !body) return;
    const finish = () => {
      element.open = false;
      delete element.dataset.state;
      toggled.current?.(false);
    };
    if (prefersReducedMotion()) return finish();
    // The +/− flips at once; the panel folds away underneath.
    element.dataset.state = "closing";
    run(
      [
        { height: `${body.offsetHeight}px`, opacity: 1 },
        { height: "0px", opacity: 0 },
      ],
      CLOSE_MS,
      finish,
    );
  }

  function onSummaryClick(event: MouseEvent<HTMLElement>) {
    event.preventDefault();
    const element = details.current;
    if (!element) return;
    if (element.open && element.dataset.state !== "closing") close();
    else open(event.currentTarget);
  }

  return (
    <details ref={details} className={className} open={defaultOpen}>
      <summary className={summaryClassName} onClick={onSummaryClick}>
        {summary}
      </summary>
      <div
        ref={content}
        className={`disclosure-content ${contentClassName ?? ""}`}
      >
        {children}
      </div>
    </details>
  );
}
