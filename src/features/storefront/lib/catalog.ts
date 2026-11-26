import {
  isProductVariant,
  type CartItem,
  type ProductKind,
  type ProductVariant,
} from "@/domain/commerce/catalog";
import { cartLineLimit } from "@/domain/commerce/availability";
import { elegantProducts, type ElegantColour } from "../data/elegant-products";

export const languages = ["en", "pl", "ru", "uk"] as const;
export type Language = (typeof languages)[number];

export function productPhoto(kind: ProductKind, colour: string, view = 0) {
  if (colour === "black-orange" && view > 0)
    return "/assets/black-orange-lifestyle.webp";
  const suffix =
    kind === "collar" ? ["", "-left", "-right"][view] : ["", "-walk"][view];
  return `/assets/${kind}-${colour}${suffix ?? ""}.webp`;
}

/**
 * Where a gallery frame crops a photo. The collar close-ups are portraits
 * of the dog: the frame keeps the top, so the ears are never cut.
 */
export function productPhotoPosition(kind: ProductKind, view = 0) {
  return kind === "collar" && view > 0 ? "50% 0%" : undefined;
}

export function variantPhoto(variant: ProductVariant) {
  if (variant.collection === "base")
    return productPhoto(variant.kind, variant.colour);
  const product = elegantProducts.find(({ kind }) => kind === variant.kind)!;
  return `/assets/${product.gallery[variant.colour as ElegantColour].product}`;
}

export function isCartItem(value: unknown): value is CartItem {
  if (!isProductVariant(value)) return false;
  const item = value as CartItem;
  return (
    typeof item.id === "string" &&
    Number.isInteger(item.qty) &&
    item.qty > 0 &&
    item.qty <= cartLineLimit
  );
}
