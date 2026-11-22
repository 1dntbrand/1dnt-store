/** Small line icons drawn on one 24px grid with one stroke weight. */
const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

export function CheckIcon({ className = "icon" }: { className?: string }) {
  return (
    <svg {...base} className={className}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

export function ArrowIcon({
  direction = "right",
  className = "icon",
}: {
  direction?: "left" | "right";
  className?: string;
}) {
  return (
    <svg {...base} className={className}>
      <path
        d={
          direction === "right"
            ? "M5 12h13M13 6.5l5.5 5.5-5.5 5.5"
            : "M19 12H6M11 6.5 5.5 12l5.5 5.5"
        }
      />
    </svg>
  );
}

/** A crossed circle: this option cannot be ordered right now. */
export function UnavailableIcon({
  className = "icon",
}: {
  className?: string;
}) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="8" />
      <path d="M6.5 17.5 17.5 6.5" />
    </svg>
  );
}

export function PlayIcon({ className = "icon" }: { className?: string }) {
  return (
    <svg {...base} className={className}>
      <path d="M9 6.5v11l8.5-5.5z" fill="currentColor" />
    </svg>
  );
}

export function ExternalIcon({ className = "icon" }: { className?: string }) {
  return (
    <svg {...base} className={className}>
      <path d="M8 16 16.5 7.5M9.5 7.5h7v7" />
    </svg>
  );
}
