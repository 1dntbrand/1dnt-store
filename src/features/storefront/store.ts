import { createStore } from "zustand/vanilla";
import {
  calculateCart,
  isProductVariant,
  variantKey,
  type CartItem,
  type Collection,
  type ProductKind,
  type ProductVariant,
} from "@/domain/commerce/catalog";
import { cartLineLimit, variantLimit } from "@/domain/commerce/availability";
import { SHIPPING_PRICE } from "@/domain/commerce/shipping";
import messages from "./data/messages.json";
import serviceData from "./data/services.json";
import { languages, type Language } from "./lib/catalog";
import { readLanguageCookie, rememberLanguage } from "./lib/language";
import { variantColourLabel } from "./lib/product-options";
import type { ServiceText } from "./lib/service-text";
import {
  defaultBundleExtras,
  defaultCategories,
  defaultFields,
  readSnapshot,
  saveCartAndLanguage,
  saveSelection,
  validField,
  type Category,
  type FieldName,
  type Snapshot,
} from "./lib/storage";

const dictionary: Record<string, Partial<Record<Language, string>>> = messages;

const services = serviceData as Record<Language, ServiceText>;
type Placeholders = Record<string, string>;

/** Replace `{name}` placeholders; unknown names stay visible for review. */
function fillPlaceholders(text: string, values: Placeholders) {
  return text.replace(/\{(\w+)\}/g, (match, name: string) =>
    Object.hasOwn(values, name) ? values[name] : match,
  );
}

function fillServiceText<T>(value: T, values: Placeholders): T {
  if (typeof value === "string") return fillPlaceholders(value, values) as T;
  if (Array.isArray(value))
    return value.map((item) => fillServiceText(item, values)) as T;
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        fillServiceText(item, values),
      ]),
    ) as T;
  return value;
}
export const serviceIds = [
  "contact",
  "delivery",
  "returns",
  "safety",
  "terms",
  "privacy",
  "cookies",
] as const;
export type ServiceId = (typeof serviceIds)[number];
const languageHelpers = Object.fromEntries(
  languages.map((language) => {
    const formatter = new Intl.NumberFormat(
      { en: "en-IE", pl: "pl-PL", ru: "ru-RU", uk: "uk-UA" }[language],
      { style: "currency", currency: "PLN" },
    );
    const money = (cents: number) => formatter.format(cents / 100);
    const decimal = language === "en" ? "." : ",";
    const metres = (value: string | number, digits?: number) =>
      `${(typeof value === "number" ? value.toFixed(digits ?? 1) : value).replace(".", decimal)} ${t("mUnit")}`;
    const shippingValues: Placeholders = {
      shippingPrice: money(SHIPPING_PRICE),
    };
    const t = (key: string, values?: Placeholders) =>
      fillPlaceholders(
        dictionary[key]?.[language] ?? dictionary[key]?.en ?? key,
        values ? { ...shippingValues, ...values } : shippingValues,
      );
    return [
      language,
      {
        t,
        money,
        service: fillServiceText(services[language], shippingValues),
        metres,
        centimetres: (value: string) => `${value} ${t("centimetreUnit")}`,
        choiceSummary: (colour: string, size: string) =>
          `${variantColourLabel(colour, t)} · ${size.includes(".") ? metres(size) : size}`,
      },
    ];
  }),
) as Record<
  Language,
  {
    t: (key: string, values?: Placeholders) => string;
    money: (cents: number) => string;
    service: ServiceText;
    /** "1.5" → "1.5 m" / "1,5 м"; numbers keep the digits asked for. */
    metres: (value: string | number, digits?: number) => string;
    centimetres: (value: string) => string;
    choiceSummary: (colour: string, size: string) => string;
  }
>;

function cartState(cart: CartItem[]) {
  return {
    cart,
    cartCount: cart.reduce((sum, item) => sum + item.qty, 0),
    pricing: calculateCart(cart),
    cartHasStockIssue: cart.some((item) => item.qty > variantLimit(item)),
  };
}
interface StorefrontActions {
  restore: () => void;
  setLanguage: (language: string) => void;
  setField: (name: FieldName, value: string) => void;
  setView: (kind: ProductKind, view: number) => void;
  chooseColour: (name: FieldName, value: string, kind: ProductKind) => void;
  setCategory: (collection: Collection, category: Category) => void;
  setBundleExtra: (collection: Collection, includeExtra: boolean) => void;
  openDialog: (id: string) => void;
  closeDialog: () => void;
  openSizeGuide: (
    kind: ProductKind,
    size: string,
    onSelect?: (size: string) => void,
  ) => void;
  applyGuideSize: (size: string) => void;
  openService: (id: ServiceId) => void;
  addItems: (variants: readonly ProductVariant[]) => void;
  changeQuantity: (id: string, quantity: number) => void;
  /** Several lines at once, e.g. every piece of a set: one update. */
  changeQuantities: (changes: { id: string; qty: number }[]) => void;
  dismissAdded: () => void;
}

/** The latest successful add, shown as a short confirmation. */
export interface AddedNotice {
  stamp: number;
  variants: readonly ProductVariant[];
}
export type StorefrontState = Snapshot &
  StorefrontActions &
  typeof languageHelpers.en &
  ReturnType<typeof cartState> & {
    activeDialog: string | null;
    guideSize: string;
    cartNotice: string | null;
    lastAdded: AddedNotice | null;
    serviceIndex: number;
    views: Record<ProductKind, number>;
  };

export function createStorefrontStore(initialLanguage: Language = "en") {
  return createStore<StorefrontState>()((set, get) => {
    let applySize: ((size: string) => void) | undefined;
    /** Every way of opening a dialog: one place clears the add toast. */
    function showDialog(
      activeDialog: string,
      extra: Partial<StorefrontState> = {},
    ) {
      set({ ...extra, activeDialog, lastAdded: null });
    }
    function updateField(name: FieldName, value: string) {
      if (get().fields[name] === value || !validField(name, value))
        return false;
      const fields = { ...get().fields, [name]: value };
      set({ fields });
      saveSelection(get());
      return true;
    }
    return {
      language: initialLanguage,
      fields: { ...defaultFields },
      ...languageHelpers[initialLanguage],
      ...cartState([]),
      cartNotice: null,
      lastAdded: null,
      categories: { ...defaultCategories },
      bundleExtras: { ...defaultBundleExtras },
      activeDialog: null,
      guideSize: "S",
      serviceIndex: 0,
      views: { collar: 0, leash: 0, harness: 0 },
      restore() {
        const snapshot = readSnapshot(get().language);
        // With a cookie the server already rendered the shopper's language;
        // storage only decides for visits from before the cookie existed.
        const language = (readLanguageCookie() ??
          snapshot.language) as Language;
        set({
          ...snapshot,
          language,
          ...languageHelpers[language],
          ...cartState(snapshot.cart),
        });
        rememberLanguage(language);
      },
      setLanguage(language) {
        if (!languages.includes(language as Language)) return;
        set({ language, ...languageHelpers[language as Language] });
        saveCartAndLanguage(get());
        rememberLanguage(language as Language);
      },
      setField: updateField,
      setView(kind, view) {
        set((state) => ({ views: { ...state.views, [kind]: view } }));
      },
      chooseColour(name, value, kind) {
        if (updateField(name, value)) get().setView(kind, 0);
      },
      setCategory(collection, category) {
        const { categories } = get();
        if (categories[collection] === category) return;
        set({ categories: { ...categories, [collection]: category } });
        saveSelection(get());
      },
      setBundleExtra(collection, includeExtra) {
        set((state) => ({
          bundleExtras: { ...state.bundleExtras, [collection]: includeExtra },
        }));
        saveSelection(get());
      },
      openDialog(id) {
        if (id === "checkoutPanel" && get().cartHasStockIssue) return;
        applySize = undefined;
        showDialog(id, id === "cartPanel" ? { cartNotice: null } : {});
      },
      closeDialog() {
        applySize = undefined;
        set({ activeDialog: null });
      },
      openSizeGuide(kind, size, onSelect) {
        applySize = onSelect;
        showDialog(`${kind}SizeGuide`, { guideSize: size });
      },
      applyGuideSize(size) {
        applySize?.(size);
        get().closeDialog();
      },
      openService(id) {
        applySize = undefined;
        showDialog("serviceDialog", { serviceIndex: serviceIds.indexOf(id) });
      },
      addItems(variants) {
        if (!variants.length) return;
        const next = new Map(get().cart.map((item) => [item.id, item]));
        for (const variant of variants) {
          if (!isProductVariant(variant)) return;
          const id = variantKey(variant);
          const qty = (next.get(id)?.qty ?? 0) + 1;
          const limit = variantLimit(variant);
          if (qty > limit) {
            showDialog("cartPanel", {
              cartNotice:
                limit === cartLineLimit ? "quantityLimit" : "cartStockLimit",
            });
            return;
          }
          next.set(id, { ...variant, id, qty });
        }
        // Stay on the product: confirm with a toast instead of the bag panel.
        set({
          ...cartState([...next.values()]),
          cartNotice: null,
          lastAdded: { stamp: Date.now(), variants: [...variants] },
        });
        saveCartAndLanguage(get());
      },
      dismissAdded() {
        set({ lastAdded: null });
      },
      changeQuantity(id, quantity) {
        if (!Number.isInteger(quantity)) return;
        const line = get().cart.find((item) => item.id === id);
        if (!line || (quantity > line.qty && quantity > variantLimit(line)))
          return;
        const cart = get()
          .cart.map((item) =>
            item.id === id ? { ...item, qty: quantity } : item,
          )
          .filter((item) => item.qty > 0);
        set({ ...cartState(cart), cartNotice: null });
        saveCartAndLanguage(get());
      },
      changeQuantities(changes) {
        const next = new Map(changes.map(({ id, qty }) => [id, qty]));
        for (const line of get().cart) {
          const quantity = next.get(line.id);
          if (quantity === undefined) continue;
          if (!Number.isInteger(quantity) || quantity < 0) return;
          if (quantity > line.qty && quantity > variantLimit(line)) return;
        }
        const cart = get()
          .cart.map((item) =>
            next.has(item.id) ? { ...item, qty: next.get(item.id)! } : item,
          )
          .filter((item) => item.qty > 0);
        set({ ...cartState(cart), cartNotice: null });
        saveCartAndLanguage(get());
      },
    };
  });
}
