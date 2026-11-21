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
import {
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_PRICE,
} from "@/domain/commerce/shipping";
import messages from "./data/messages.json";
import services from "./data/services.json";
import { languages, type Language } from "./lib/catalog";
import { variantColourLabel } from "./lib/product-options";
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
const serviceIds = [
  "contact",
  "delivery",
  "returns",
  "terms",
  "privacy",
  "cookies",
];
const languageHelpers = Object.fromEntries(
  languages.map((language) => {
    const formatter = new Intl.NumberFormat(
      { en: "en-IE", pl: "pl-PL", ru: "ru-RU", uk: "uk-UA" }[language],
      { style: "currency", currency: "PLN" },
    );
    const money = (cents: number) => formatter.format(cents / 100);
    const wholeMoney = new Intl.NumberFormat(
      formatter.resolvedOptions().locale,
      {
        style: "currency",
        currency: "PLN",
        maximumFractionDigits: 0,
      },
    );
    const shippingValues: Placeholders = {
      shippingPrice: money(SHIPPING_PRICE),
      freeShippingFrom: wholeMoney.format(FREE_SHIPPING_THRESHOLD / 100),
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
        choiceSummary: (colour: string, size: string) =>
          `${variantColourLabel(colour, t)} · ${size.includes(".") ? size.replace(".", language === "en" ? "." : ",") + " " + t("mUnit") : size}`,
      },
    ];
  }),
) as Record<
  Language,
  {
    t: (key: string, values?: Placeholders) => string;
    money: (cents: number) => string;
    service: typeof services.en;
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
  openService: (id: string) => void;
  addItems: (variants: readonly ProductVariant[]) => void;
  changeQuantity: (id: string, quantity: number) => void;
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

export function createStorefrontStore() {
  return createStore<StorefrontState>()((set, get) => {
    let applySize: ((size: string) => void) | undefined;
    function updateField(name: FieldName, value: string) {
      if (get().fields[name] === value || !validField(name, value))
        return false;
      const fields = { ...get().fields, [name]: value };
      set({ fields });
      saveSelection(get());
      return true;
    }
    return {
      language: "en",
      fields: { ...defaultFields },
      ...languageHelpers.en,
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
        const snapshot = readSnapshot();
        set({
          ...snapshot,
          ...languageHelpers[snapshot.language as Language],
          ...cartState(snapshot.cart),
        });
      },
      setLanguage(language) {
        if (!languages.includes(language as Language)) return;
        set({ language, ...languageHelpers[language as Language] });
        saveCartAndLanguage(get());
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
        if (id === "cartPanel")
          set({ activeDialog: id, cartNotice: null, lastAdded: null });
        else set({ activeDialog: id, lastAdded: null });
      },
      closeDialog() {
        applySize = undefined;
        set({ activeDialog: null });
      },
      openSizeGuide(kind, size, onSelect) {
        applySize = onSelect;
        set({
          guideSize: size,
          activeDialog: `${kind}SizeGuide`,
        });
      },
      applyGuideSize(size) {
        applySize?.(size);
        get().closeDialog();
      },
      openService(id) {
        applySize = undefined;
        set({
          serviceIndex: serviceIds.indexOf(id),
          activeDialog: "serviceDialog",
        });
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
            set({
              activeDialog: "cartPanel",
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
    };
  });
}
