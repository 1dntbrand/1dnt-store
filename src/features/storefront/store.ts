import { createStore } from "zustand/vanilla";
import {
  calculateCart,
  isProductVariant,
  variantKey,
  type CartItem,
  type ProductKind,
  type ProductVariant,
} from "@/domain/commerce/catalog";
import { cartLineLimit, variantLimit } from "@/domain/commerce/availability";
import messages from "./data/messages.json";
import services from "./data/services.json";
import { languages, type Language } from "./lib/catalog";
import { variantColourLabel } from "./lib/product-options";
import {
  defaultFields,
  readSnapshot,
  saveSnapshot,
  validField,
  type FieldName,
  type Snapshot,
} from "./lib/storage";

const dictionary: Record<string, Partial<Record<Language, string>>> = messages;
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
    const t = (key: string) =>
      dictionary[key]?.[language] ?? dictionary[key]?.en ?? key;
    return [
      language,
      {
        t,
        money: (cents: number) => formatter.format(cents / 100),
        service: services[language],
        choiceSummary: (colour: string, size: string) =>
          `${variantColourLabel(colour, t)} · ${size.includes(".") ? size.replace(".", language === "en" ? "." : ",") + " " + t("mUnit") : size}`,
      },
    ];
  }),
) as Record<
  Language,
  {
    t: (key: string) => string;
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
  setCategory: (category: string) => void;
  openDialog: (id: string) => void;
  closeDialog: () => void;
  openSizeGuide: (kind: ProductKind, size: string) => void;
  openService: (id: string) => void;
  addItems: (variants: readonly ProductVariant[]) => void;
  changeQuantity: (id: string, quantity: number) => void;
}
export type StorefrontState = Snapshot &
  StorefrontActions &
  typeof languageHelpers.en &
  ReturnType<typeof cartState> & {
    category: string;
    activeDialog: string | null;
    guideSize: string;
    cartNotice: string | null;
    serviceIndex: number;
    views: Record<ProductKind, number>;
  };

export function createStorefrontStore() {
  return createStore<StorefrontState>()((set, get) => {
    function save() {
      saveSnapshot(get());
    }
    function updateField(name: FieldName, value: string) {
      if (!validField(name, value)) return;
      const fields = { ...get().fields, [name]: value };
      set({ fields });
      save();
    }
    return {
      language: "en",
      fields: { ...defaultFields },
      ...languageHelpers.en,
      ...cartState([]),
      cartNotice: null,
      category: "all",
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
        save();
      },
      setField: updateField,
      setView(kind, view) {
        set((state) => ({ views: { ...state.views, [kind]: view } }));
      },
      chooseColour(name, value, kind) {
        updateField(name, value);
        get().setView(kind, 0);
      },
      setCategory(category) {
        set({ category });
      },
      openDialog(id) {
        if (id === "checkoutPanel" && get().cartHasStockIssue) return;
        set({ activeDialog: id });
      },
      closeDialog() {
        set({ activeDialog: null });
      },
      openSizeGuide(kind, size) {
        set({
          guideSize: size,
          activeDialog: `${kind}SizeGuide`,
        });
      },
      openService(id) {
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
        set({
          ...cartState([...next.values()]),
          activeDialog: "cartPanel",
          cartNotice: null,
        });
        save();
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
        save();
      },
    };
  });
}
