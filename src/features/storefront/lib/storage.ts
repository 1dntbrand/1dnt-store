import { cartLineLimit } from "@/domain/commerce/availability";
import {
  collections,
  variantColours,
  variantKey,
  variantPrices,
  type CartItem,
  type Collection,
} from "@/domain/commerce/catalog";
import { isCartItem, languages } from "./catalog";

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
  elegantCollarColour: "dark-brown",
  elegantCollarSize: "S",
  elegantLeashColour: "dark-brown",
  elegantHarnessColour: "dark-brown",
  elegantHarnessSize: "S",
  elegantCollarSetLeashColour: "dark-brown",
  elegantHarnessSetLeashColour: "dark-brown",
  elegantTripleCollarColour: "dark-brown",
  elegantTripleCollarSize: "S",
};
export type FieldName = keyof typeof defaultFields;
export type Fields = typeof defaultFields;
export type Category = "all" | "collars" | "leashes" | "harnesses";

export const defaultCategories: Record<Collection, Category> = {
  base: "all",
  elegant: "leashes",
};
export const defaultBundleExtras: Record<Collection, boolean> = {
  base: true,
  elegant: false,
};

export function validCategory(
  collection: Collection,
  value: unknown,
): value is Category {
  return (
    (collection === "base" && value === "all") ||
    value === "collars" ||
    value === "leashes" ||
    value === "harnesses"
  );
}

export interface Snapshot {
  language: string;
  fields: Fields;
  categories: Record<Collection, Category>;
  bundleExtras: Record<Collection, boolean>;
  cart: CartItem[];
}

const STORAGE_KEY = "one-identity-store-v1";
const SELECTION_KEY = "one-identity-selection-v1";
const baseCollarColours = variantColours("base", "collar");
const baseLeashColours = variantColours("base", "leash");
const baseCollarSizes = Object.keys(variantPrices("base", "collar"));
const baseLeashLengths = Object.keys(variantPrices("base", "leash"));
const elegantColours = variantColours("elegant", "collar");
const elegantCollarSizes = Object.keys(variantPrices("elegant", "collar"));
const allowed: Record<FieldName, readonly string[]> = {
  collarColour: baseCollarColours,
  collarProductSize: baseCollarSizes,
  leashColour: baseLeashColours,
  length: baseLeashLengths,
  collarBundleColour: baseCollarColours,
  collarSize: baseCollarSizes,
  harnessColour: variantColours("base", "harness"),
  harnessSize: Object.keys(variantPrices("base", "harness")),
  collarSetLeashColour: baseLeashColours,
  collarSetLeashLength: baseLeashLengths,
  tripleCollarColour: baseCollarColours,
  tripleCollarSize: baseCollarSizes,
  harnessSetLeashColour: baseLeashColours,
  harnessSetLeashLength: baseLeashLengths,
  elegantCollarColour: elegantColours,
  elegantCollarSize: elegantCollarSizes,
  elegantLeashColour: elegantColours,
  elegantHarnessColour: elegantColours,
  elegantHarnessSize: Object.keys(variantPrices("elegant", "harness")),
  elegantCollarSetLeashColour: elegantColours,
  elegantHarnessSetLeashColour: elegantColours,
  elegantTripleCollarColour: elegantColours,
  elegantTripleCollarSize: elegantCollarSizes,
};

export function validField(name: FieldName, value: string) {
  return allowed[name].includes(value);
}
function read(
  key: string,
  storage: "localStorage" | "sessionStorage" = "localStorage",
) {
  try {
    return JSON.parse(window[storage].getItem(key) ?? "null");
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
    const collection =
      raw.collection == null || raw.collection === "Base"
        ? "base"
        : raw.collection === "Elegant"
          ? "elegant"
          : raw.collection;
    if (collection !== "base" && collection !== "elegant") continue;
    if (["set", "collar-set", "harness-set"].includes(String(kind))) {
      const accessory = kind === "harness-set" ? "harness" : "collar";
      items.push({
        collection,
        id: `${raw.id}-leash`,
        kind: "leash",
        colour: raw.colour as string,
        size: raw.length as string,
        qty: raw.qty as number,
      });
      if (kind === "harness-set" && raw.collarSize)
        items.push({
          collection,
          id: `${raw.id}-collar`,
          kind: "collar",
          colour: raw.collarColour as string,
          size: raw.collarSize as string,
          qty: raw.qty as number,
        });
      items.push({
        collection,
        id: `${raw.id}-${accessory}`,
        kind: accessory,
        colour: raw[`${accessory}Colour`] as string,
        size: raw[`${accessory}Size`] as string,
        qty: raw.qty as number,
      });
    } else {
      items.push({
        id: raw.id,
        collection,
        kind,
        colour: raw.colour,
        size: kind === "leash" ? (raw.length ?? raw.size) : raw.size,
        qty: raw.qty,
      } as CartItem);
    }
  }
  const seen = new Set<string>();
  const lines = new Map<string, CartItem>();
  for (const item of items) {
    if (!isCartItem(item) || seen.has(item.id)) continue;
    seen.add(item.id);
    const id = variantKey(item);
    const qty = Math.min(cartLineLimit, (lines.get(id)?.qty ?? 0) + item.qty);
    lines.set(id, { ...item, id, qty });
  }
  return [...lines.values()];
}

export function readSnapshot(): Snapshot {
  const saved = read(STORAGE_KEY);
  const savedSelection = read(SELECTION_KEY, "sessionStorage");
  const selection = savedSelection ?? saved;
  const legacyKeys: string[] = [];
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
  if (savedSelection === null) {
    for (const [name, mapping] of oldChoices) {
      const key = `one-identity-${name}`;
      const choice = read(key);
      if (choice === null) continue;
      legacyKeys.push(key);
      for (const [oldKey, field] of Object.entries(mapping)) {
        const value = choice[oldKey];
        if (typeof value === "string" && validField(field, value))
          fields[field] = value;
      }
    }
  }
  for (const name of Object.keys(defaultFields) as FieldName[]) {
    const value = selection?.fields?.[name];
    if (typeof value === "string" && validField(name, value))
      fields[name] = value;
  }
  const categories = { ...defaultCategories };
  const bundleExtras = { ...defaultBundleExtras };
  for (const collection of collections) {
    const category: unknown = selection?.categories?.[collection];
    const includeExtra: unknown = selection?.bundleExtras?.[collection];
    if (validCategory(collection, category)) categories[collection] = category;
    if (typeof includeExtra === "boolean")
      bundleExtras[collection] = includeExtra;
  }
  let language = saved?.language;
  try {
    language ??= localStorage.getItem("one-identity-language");
  } catch {
    /* Storage can be unavailable in private browsing. */
  }
  if (!languages.includes(language)) language = "en";
  const snapshot: Snapshot = {
    language,
    fields,
    categories,
    bundleExtras,
    cart: migrateCart(saved?.cart ?? read("one-identity-cart-v1")),
  };

  const hasLegacySelection =
    saved?.fields || saved?.categories || saved?.bundleExtras;
  if ((hasLegacySelection || legacyKeys.length) && saveSelection(snapshot)) {
    if (!hasLegacySelection || saveCartAndLanguage(snapshot)) {
      try {
        for (const key of legacyKeys) localStorage.removeItem(key);
      } catch {
        /* The session copy remains available when cleanup is blocked. */
      }
    }
  }
  return snapshot;
}

export function saveSelection({
  fields,
  categories,
  bundleExtras,
}: Pick<Snapshot, "fields" | "categories" | "bundleExtras">) {
  try {
    sessionStorage.setItem(
      SELECTION_KEY,
      JSON.stringify({ fields, categories, bundleExtras }),
    );
    return true;
  } catch {
    return false;
  }
}

export function saveCartAndLanguage({
  language,
  cart,
}: Pick<Snapshot, "language" | "cart">) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ language, cart }));
    return true;
  } catch {
    return false;
  }
}
