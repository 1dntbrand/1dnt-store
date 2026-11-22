import type { ReactNode } from "react";

/**
 * Button text that changes ("Add to Cart" → "Added") without changing the
 * button's size: every variant occupies the same grid cell and only the
 * current one is visible, so the button is always as wide as the longest.
 */
export function SwapLabel({
  options,
  shown,
}: {
  options: readonly ReactNode[];
  shown: number;
}) {
  return (
    <span className="swap-label">
      {options.map((option, index) => (
        <span
          key={index}
          data-shown={index === shown || undefined}
          aria-hidden={index !== shown}
        >
          {option}
        </span>
      ))}
    </span>
  );
}
