"use client";

import { useId, useState, type ReactNode } from "react";

/**
 * An accordion item: a button and the panel it opens.
 *
 * Deliberately simple, so it behaves the same in every browser:
 * - the panel folds on its own grid row (0fr ↔ 1fr), a plain CSS
 *   transition with nothing measured or animated from script;
 * - items open and close independently. Opening one never folds another,
 *   so nothing above the tapped header changes and the page never has to
 *   be moved to keep it under the finger.
 *
 * A closed panel stays in the page, folded and inert: hidden from screen
 * readers and the keyboard, and a second tap mid-way simply reverses.
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
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <div
      className={className ? `disclosure ${className}` : "disclosure"}
      data-open={open || undefined}
    >
      <button
        type="button"
        className={
          summaryClassName
            ? `disclosure-summary ${summaryClassName}`
            : "disclosure-summary"
        }
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => {
          setOpen(!open);
          onToggle?.(!open);
        }}
      >
        {summary}
      </button>
      <div id={panelId} className="disclosure-panel" inert={!open}>
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
