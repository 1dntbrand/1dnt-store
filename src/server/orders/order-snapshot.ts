import { CartItem, itemPrice } from "@/domain/commerce/catalog";
import { type parseCheckoutInput } from "./checkout-input";

import messages from "@/features/storefront/data/messages.json";
import { productTitleKey } from "@/features/storefront/lib/product-options";

type ParsedCheckout = Extract<
  ReturnType<typeof parseCheckoutInput>,
  { ok: true }
>["value"];

type OrderLine = {
  title: string;
  unitPrice: number;
  discount: number;
  lineTotal: number;
  priceGroups: { qty: number; unitAmount: number }[];
} & CartItem;

type BuildOrderSnapshotInput = {
  checkout: ParsedCheckout;
  pickupPoint: {
    id: string;
    country: "PL";
    address: string;
  };
  orderId: string;
  createdAt: string; // ISO-строка
};

type OrderSnapshot = {
  orderId: string;
  items: OrderLine[];
  total: number;
  language: string;
  createdAt: string;
  attemptId: string;
  currency: "PLN";
  shippingAmount: number;
  paymentStatus: "pending" | "new";
  fulfillmentStatus: "pending" | "new";
  contact: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  pickupPoint: {
    id: string;
    country: "PL";
    address: string;
  };
  pricing: {
    subtotal: number;
    discount: number;
    shipping: number;
    total: number;
  };
};

const dictionary: Record<
  string,
  Partial<Record<ParsedCheckout["language"], string>>
> = messages;

export const buildOrderSnapshot = (
  input: BuildOrderSnapshotInput,
): OrderSnapshot => {
  const { checkout } = input;

  const items = checkout.items.map((item): OrderLine => {
    const unitPrice = itemPrice(item);
    const discount = checkout.pricing.discounts[item.id] ?? 0;
    const lineTotal = unitPrice * item.qty - discount;

    const key = productTitleKey(item);
    const title =
      dictionary[key]?.[checkout.language] ?? dictionary[key]?.en ?? key;

    return {
      ...item,
      title,
      unitPrice,
      discount,
      lineTotal,
      priceGroups: (checkout.pricing.groupsByItemId[item.id] ?? []).map(
        (group) => ({ ...group }),
      ),
    };
  });

  return {
    orderId: input.orderId,
    items,
    total: checkout.pricing.grandTotal,
    language: checkout.language,
    createdAt: input.createdAt,
    contact: {
      firstName: checkout.contact.firstName,
      lastName: checkout.contact.lastName,
      email: checkout.contact.email,
      phone: checkout.contact.phone,
    },
    pickupPoint: { ...input.pickupPoint },
    pricing: {
      subtotal: checkout.pricing.subtotal,
      discount: checkout.pricing.discount,
      shipping: checkout.pricing.shipping,
      total: checkout.pricing.grandTotal,
    },
    attemptId: input.checkout.attemptId,
    currency: "PLN",
    shippingAmount: checkout.pricing.shipping,
    paymentStatus: "pending",
    fulfillmentStatus: "new",
  };
};
