import { createStore } from "zustand/vanilla";
import type { KeyboardEvent } from "react";
import messages from "./data/messages.json";
import services from "./data/services.json";
import {
  calculateCart,
  languages,
  setPrices,
  triplePrices,
  type CartItem,
  type Language,
  type ProductKind,
} from "./lib/catalog";
import {
  defaultFields,
  readSnapshot,
  saveSnapshot,
  validField,
  type FieldName,
  type Fields,
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
          `${t(colour)} · ${size.includes(".") ? size.replace(".", language === "en" ? "." : ",") + " " + t("mUnit") : size}`,
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

function configurationPrices(fields: Fields) {
  return {
    bundlePrices: setPrices("collar", fields.length, fields.collarSize),
    collarSetPrices: setPrices(
      "collar",
      fields.collarSetLeashLength,
      fields.collarProductSize,
    ),
    harnessSetPrices: triplePrices(
      fields.harnessSetLeashLength,
      fields.harnessSize,
      fields.tripleCollarSize,
    ),
  };
}
function cartState(cart: CartItem[]) {
  return {
    cart,
    cartCount: cart.reduce((sum, item) => sum + item.qty, 0),
    pricing: calculateCart(cart),
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
  openSizeGuide: (kind: string, field: FieldName) => void;
  openService: (id: string) => void;
  copySetToProduct: (kind: "collar" | "harness") => void;
  addItem: (kind: string) => void;
  changeQuantity: (id: string, quantity: number) => void;
  setElegantTab: (tab: string) => void;
  setElegantView: (kind: "collar" | "leash", view: string) => void;
  elegantPhoto: (kind: "collar" | "leash") => string;
  navigateElegantTab: (
    event: KeyboardEvent<HTMLButtonElement>,
    tab: string,
  ) => void;
}
export type StorefrontState = Snapshot &
  StorefrontActions &
  typeof languageHelpers.en &
  ReturnType<typeof configurationPrices> &
  ReturnType<typeof cartState> & {
    category: string;
    activeDialog: string | null;
    guideSize: string;
    cartNotice: string | null;
    serviceIndex: number;
    views: Record<ProductKind, number>;
    elegantTab: string;
    elegantViews: Record<"collar" | "leash", string>;
  };

export function createStorefrontStore() {
  return createStore<StorefrontState>()((set, get) => {
    function save() {
      saveSnapshot(get());
    }
    function updateField(name: FieldName, value: string) {
      if (!validField(name, value)) return;
      const fields = { ...get().fields, [name]: value };
      set({ fields, ...configurationPrices(fields) });
      save();
    }
    return {
      language: "en",
      fields: { ...defaultFields },
      ...languageHelpers.en,
      ...configurationPrices(defaultFields),
      ...cartState([]),
      cartNotice: null,
      category: "all",
      activeDialog: null,
      guideSize: "S",
      serviceIndex: 0,
      views: { collar: 0, leash: 0, harness: 0 },
      elegantTab: "leashes",
      elegantViews: { collar: "product", leash: "product" },
      restore() {
        const snapshot = readSnapshot();
        set({
          ...snapshot,
          ...languageHelpers[snapshot.language as Language],
          ...configurationPrices(snapshot.fields),
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
        set({ activeDialog: id });
      },
      closeDialog() {
        set({ activeDialog: null });
      },
      openSizeGuide(kind, field) {
        set({
          guideSize: get().fields[field],
          activeDialog: `${kind}SizeGuide`,
        });
      },
      openService(id) {
        set({
          serviceIndex: serviceIds.indexOf(id),
          activeDialog: "serviceDialog",
        });
      },
      copySetToProduct(kind) {
        const fields = get().fields;
        updateField(
          "leashColour",
          fields[
            kind === "collar" ? "collarSetLeashColour" : "harnessSetLeashColour"
          ],
        );
        updateField(
          "length",
          fields[
            kind === "collar" ? "collarSetLeashLength" : "harnessSetLeashLength"
          ],
        );
        get().setView("leash", 0);
      },
      addItem(kind) {
        const { fields, cart } = get();
        const additions: Omit<CartItem, "id" | "qty">[] = [];
        if (kind === "collar")
          additions.push({
            kind,
            colour: fields.collarColour,
            size: fields.collarProductSize,
          });
        if (kind === "leash")
          additions.push({
            kind,
            colour: fields.leashColour,
            size: fields.length,
          });
        if (kind === "harness")
          additions.push({
            kind,
            colour: fields.harnessColour,
            size: fields.harnessSize,
          });
        if (kind === "set")
          additions.push(
            { kind: "leash", colour: fields.leashColour, size: fields.length },
            {
              kind: "collar",
              colour: fields.collarBundleColour,
              size: fields.collarSize,
            },
          );
        if (kind === "collar-set")
          additions.push(
            {
              kind: "collar",
              colour: fields.collarColour,
              size: fields.collarProductSize,
            },
            {
              kind: "leash",
              colour: fields.collarSetLeashColour,
              size: fields.collarSetLeashLength,
            },
          );
        if (kind === "harness-set" || kind === "harness-pair")
          additions.push(
            {
              kind: "harness",
              colour: fields.harnessColour,
              size: fields.harnessSize,
            },
            {
              kind: "leash",
              colour: fields.harnessSetLeashColour,
              size: fields.harnessSetLeashLength,
            },
          );
        if (kind === "harness-set")
          additions.push({
            kind: "collar",
            colour: fields.tripleCollarColour,
            size: fields.tripleCollarSize,
          });
        const atCapacity = additions.some((addition) =>
          cart.some(
            (item) =>
              item.kind === addition.kind &&
              item.colour === addition.colour &&
              item.size === addition.size &&
              item.qty >= 99,
          ),
        );
        if (atCapacity) {
          set({ activeDialog: "cartPanel", cartNotice: "quantityLimit" });
          return;
        }
        const next = cart.map((item) => ({ ...item }));
        for (const addition of additions) {
          const match = next.find(
            (item) =>
              item.kind === addition.kind &&
              item.colour === addition.colour &&
              item.size === addition.size,
          );
          if (match) match.qty = Math.min(99, match.qty + 1);
          else next.push({ ...addition, id: crypto.randomUUID(), qty: 1 });
        }
        set({
          ...cartState(next),
          activeDialog: "cartPanel",
          cartNotice: null,
        });
        save();
      },
      changeQuantity(id, quantity) {
        if (!Number.isFinite(quantity)) return;
        const cart = get()
          .cart.map((item) =>
            item.id === id
              ? { ...item, qty: Math.min(99, Math.floor(quantity)) }
              : item,
          )
          .filter((item) => item.qty > 0);
        set({ ...cartState(cart), cartNotice: null });
        save();
      },
      setElegantTab(tab) {
        set({ elegantTab: tab });
      },
      setElegantView(kind, view) {
        set((state) => ({
          elegantViews: { ...state.elegantViews, [kind]: view },
        }));
      },
      elegantPhoto(kind) {
        const views = get().elegantViews;
        if (kind === "collar")
          return views.collar === "product"
            ? "/assets/elegant-collar-brown.webp"
            : "/assets/elegant-collar-lifestyle.webp";
        return `/assets/elegant-leash-brown-${views.leash}.webp`;
      },
      navigateElegantTab(event, tab) {
        const tabs = ["collars", "leashes", "harnesses"];
        const index = tabs.indexOf(tab);
        let next = index;
        if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
        else if (event.key === "ArrowLeft")
          next = (index + tabs.length - 1) % tabs.length;
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = tabs.length - 1;
        else return;
        event.preventDefault();
        set({ elegantTab: tabs[next] });
        event.currentTarget.parentElement
          ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
          [next].focus();
      },
    };
  });
}
