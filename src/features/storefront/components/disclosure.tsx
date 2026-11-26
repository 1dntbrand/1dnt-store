"use client";

import {
  createContext,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { flushSync } from "react-dom";

interface GroupItem {
  root: () => HTMLElement | null;
  isOpen: () => boolean;
  /** Folds the item; `instant` skips the transition. */
  close: (instant: boolean) => void;
}

const GroupContext = createContext<Map<string, GroupItem> | null>(null);

/** Items inside a group form one accordion: opening one closes the others. */
export function DisclosureGroup({ children }: { children: ReactNode }) {
  const items = useMemo(() => new Map<string, GroupItem>(), []);
  return (
    <GroupContext.Provider value={items}>{children}</GroupContext.Provider>
  );
}

/**
 * An accordion item: a button and the panel it opens.
 *
 * The panel folds on its own grid row (0fr ↔ 1fr), one plain CSS
 * transition with nothing measured or animated from script. A folded panel
 * stays in the page, inert; a second tap mid-way simply reverses.
 *
 * In a group, opening an item closes the open one:
 * - one below folds with the usual transition; the tapped header is above
 *   it, so nothing under the finger moves;
 * - one above closes at once, and in the same frame, before anything is
 *   painted, the page is moved up by exactly what it gave back. The tapped
 *   header stays where it was; one measurement, one scroll, no animation
 *   to keep in step with.
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
  const root = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(defaultOpen);
  const [instant, setInstant] = useState(false);
  const openRef = useRef(open);
  const toggled = useRef(onToggle);
  useEffect(() => {
    openRef.current = open;
    toggled.current = onToggle;
  });

  // The transition comes back once the instant change is on screen.
  useEffect(() => {
    if (!instant) return;
    const frame = window.requestAnimationFrame(() => setInstant(false));
    return () => window.cancelAnimationFrame(frame);
  }, [instant]);

  useEffect(() => {
    if (!group) return;
    group.set(id, {
      root: () => root.current,
      isOpen: () => openRef.current,
      close: (now) => {
        if (now) setInstant(true);
        setOpen(false);
        openRef.current = false;
        toggled.current?.(false);
      },
    });
    return () => {
      group.delete(id);
    };
  }, [group, id]);

  function toggle(header: HTMLElement) {
    const next = !open;
    if (next && group) {
      const others = [...group].filter(
        ([key, item]) => key !== id && item.isOpen(),
      );
      const above = others.filter(([, item]) => {
        const element = item.root();
        return (
          !!element &&
          !!(
            element.compareDocumentPosition(header) &
            Node.DOCUMENT_POSITION_FOLLOWING
          )
        );
      });
      for (const [key, item] of others)
        if (!above.some(([other]) => other === key)) item.close(false);
      if (above.length) {
        const before = header.getBoundingClientRect().top;
        flushSync(() => above.forEach(([, item]) => item.close(true)));
        const shift = header.getBoundingClientRect().top - before;
        if (shift) window.scrollBy({ top: shift, behavior: "instant" });
      }
    }
    setOpen(next);
    openRef.current = next;
    onToggle?.(next);
  }

  return (
    <div
      ref={root}
      className={className ? `disclosure ${className}` : "disclosure"}
      data-open={open || undefined}
      data-instant={instant || undefined}
    >
      <button
        type="button"
        className={
          summaryClassName
            ? `disclosure-summary ${summaryClassName}`
            : "disclosure-summary"
        }
        aria-expanded={open}
        aria-controls={id}
        onClick={(event) => toggle(event.currentTarget)}
      >
        {summary}
      </button>
      <div id={id} className="disclosure-panel" inert={!open}>
        {/* The row that folds has no padding of its own, so it can reach
            exactly zero; the styled content sits inside it. */}
        <div className="disclosure-content">
          {contentClassName ? (
            <div className={contentClassName}>{children}</div>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
}
