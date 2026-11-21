"use client";

/** One close control for every dialog: same size, icon and hover state. */
export function CloseButton({
  label,
  onClick,
  className = "",
}: {
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={`icon-button dialog-close ${className}`}
      aria-label={label}
      onClick={onClick}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="m6 6 12 12M6 18 18 6" />
      </svg>
    </button>
  );
}
