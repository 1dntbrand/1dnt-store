import { isCartItem, type CartItem, languages } from "./catalog";

export const defaultFields = {
  collarColour: "khaki",
  collarProductSize: "S",
  leashColour: "black",
  length: "1.5",
  collarBundleColour: "black",
  collarSize: "S",
  harnessColour: "khaki",
  harnessSize: "S",
  collarSetLeashColour: "black",
  collarSetLeashLength: "1.5",
  tripleCollarColour: "black",
  tripleCollarSize: "S",
  harnessSetLeashColour: "black",
  harnessSetLeashLength: "1.5",
};
export type FieldName = keyof typeof defaultFields;
export type Fields = typeof defaultFields;
export interface Snapshot {
  language: string;
  fields: Fields;
  cart: CartItem[];
}
const STORAGE_KEY = "one-identity-store-v1";
const allowed: Record<FieldName, string[]> = Object.fromEntries(
  Object.keys(defaultFields).map((key) => [
    key,
    /[Ss]ize/.test(key)
      ? ["S", "M", "L"]
      : /[Ll]ength/.test(key)
        ? ["1.5", "2.5"]
        : /collarColour|collarBundleColour|tripleCollarColour/.test(key)
          ? ["black", "khaki", "orange"]
          : ["black", "khaki", "orange", "khaki-orange", "black-orange"],
  ]),
) as Record<FieldName, string[]>;

export function validField(name: FieldName, value: string) {
  return allowed[name].includes(value);
}
function read(key: string) {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "null");
  } catch {
    return null;
  }
}

/** Keep the original device's cart, including its older bundled item formats. */
function migrateCart(values: unknown): CartItem[] {
  if (!Array.isArray(values)) return [];
  const items: CartItem[] = [];
  for (const value of values.slice(0, 300)) {
    if (!value || typeof value !== "object") continue;
    const raw = value as Record<string, unknown>;
    const kind = raw.kind;
    if (["set", "collar-set", "harness-set"].includes(String(kind))) {
      const accessory = kind === "harness-set" ? "harness" : "collar";
      items.push({
        id: `${raw.id}-leash`,
        kind: "leash",
        colour: raw.colour as string,
        size: raw.length as string,
        qty: raw.qty as number,
      });
      if (kind === "harness-set" && raw.collarSize)
        items.push({
          id: `${raw.id}-collar`,
          kind: "collar",
          colour: raw.collarColour as string,
          size: raw.collarSize as string,
          qty: raw.qty as number,
        });
      items.push({
        id: `${raw.id}-${accessory}`,
        kind: accessory,
        colour: raw[`${accessory}Colour`] as string,
        size: raw[`${accessory}Size`] as string,
        qty: raw.qty as number,
      });
    } else {
      items.push({
        ...raw,
        size: kind === "leash" ? (raw.length ?? raw.size) : raw.size,
      } as CartItem);
    }
  }
  return items
    .filter(isCartItem)
    .filter(
      (item, i, all) => all.findIndex((other) => other.id === item.id) === i,
    );
}

export function readSnapshot(): Snapshot {
  const saved = read(STORAGE_KEY);
  const fields = { ...defaultFields };
  const oldChoices = [
    ["collar-choice", { colour: "collarColour", size: "collarProductSize" }],
    ["leash-choice", { colour: "leashColour", length: "length" }],
    ["harness-choice", { colour: "harnessColour", size: "harnessSize" }],
    [
      "collar-set-choice",
      { colour: "collarSetLeashColour", length: "collarSetLeashLength" },
    ],
    [
      "harness-set-choice",
      { colour: "harnessSetLeashColour", length: "harnessSetLeashLength" },
    ],
  ] as const;
  for (const [key, mapping] of oldChoices) {
    const choice = read(`one-identity-${key}`);
    for (const [oldKey, field] of Object.entries(mapping)) {
      const value = choice?.[oldKey];
      if (typeof value === "string" && validField(field as FieldName, value))
        fields[field as FieldName] = value;
    }
  }
  for (const name of Object.keys(defaultFields) as FieldName[]) {
    const value = saved?.fields?.[name];
    if (typeof value === "string" && validField(name, value))
      fields[name] = value;
  }
  let language = saved?.language;
  try {
    language ??= localStorage.getItem("one-identity-language");
  } catch {
    /* Storage can be unavailable in private browsing. */
  }
  if (!languages.includes(language)) language = "en";
  return {
    language,
    fields,
    cart: migrateCart(saved?.cart ?? read("one-identity-cart-v1")),
  };
}

export function saveSnapshot(snapshot: Snapshot) {
  const { language, fields, cart } = snapshot;
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ language, fields, cart }),
    );
  } catch {
    /* Continue in memory when browser storage is unavailable. */
  }
}
