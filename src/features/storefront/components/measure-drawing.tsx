/**
 * The brand's line drawing of where to measure. The letters on it match the
 * legend beside it.
 */
export function MeasureDrawing({
  src,
  width,
  height,
  alt,
}: {
  src: string;
  width: number;
  height: number;
  alt: string;
}) {
  return (
    <div className="measure-drawing">
      {/* A static line drawing; next/image adds nothing here. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} width={width} height={height} alt={alt} decoding="async" />
    </div>
  );
}

/** Letter keys beside a measuring drawing. */
export function MeasureLegend({
  items,
}: {
  items: readonly { label: string; text: string }[];
}) {
  return (
    <ul className="measure-legend">
      {items.map(({ label, text }) => (
        <li key={label}>
          <span className="measure-badge" aria-hidden="true">
            {label}
          </span>
          {text}
        </li>
      ))}
    </ul>
  );
}
