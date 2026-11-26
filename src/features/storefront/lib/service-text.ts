/**
 * Customer-care copy is structured, not free text: details such as an
 * address or NIP sit in label/value rows, procedures are numbered steps,
 * and anything still unknown is a row without a value, shown as "to be
 * confirmed" in one place instead of being written into every sentence.
 */
export type ServiceRow = [label: string, value: string | null];

export type ServiceBlock =
  | string
  | { rows: ServiceRow[] }
  | { list: string[] }
  | { steps: string[] }
  | { address: string };

export type ServiceSection = { title: string; blocks: ServiceBlock[] };

export type ServiceText = {
  heading: string;
  close: string;
  draft: string;
  /** Shown for a row whose value is not known yet. */
  pending: string;
  labels: string[];
  pages: ServiceSection[][];
  safetyTitle: string;
  safetyMore: string;
};
