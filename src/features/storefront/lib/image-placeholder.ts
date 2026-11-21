import placeholders from "../data/image-placeholders.json";

const blurData: Record<string, string> = placeholders;

/** Blurred preview while a photo loads; regenerate with scripts/media. */
export function blurProps(src: string) {
  const blurDataURL = blurData[src];
  return blurDataURL ? { placeholder: "blur" as const, blurDataURL } : {};
}
