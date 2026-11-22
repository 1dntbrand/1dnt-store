"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import {
  itemPrice,
  variantKey,
  type ProductVariant,
} from "@/domain/commerce/catalog";
import { useRecentlyAdded } from "../lib/use-recently-added";
import { useStorefront } from "../storefront-context";
import { CheckIcon } from "./icons";

/** The set builder of the current product, as the sticky bar needs it. */
export interface SetOffer {
  variants: readonly ProductVariant[];
  total: number;
  rate: number;
  available: boolean;
  section: RefObject<HTMLElement | null>;
  button: RefObject<HTMLButtonElement | null>;
}

const SetOfferContext = createContext<{
  offer: SetOffer | null;
  publish: (offer: SetOffer | null) => void;
} | null>(null);

/** One product block: its details, its set builder and one sticky bar. */
export function StickyBuyScope({ children }: { children: ReactNode }) {
  const [offer, publish] = useState<SetOffer | null>(null);
  const value = useMemo(() => ({ offer, publish }), [offer]);
  return (
    <SetOfferContext.Provider value={value}>
      {children}
    </SetOfferContext.Provider>
  );
}

/** Called by the set builder so the sticky bar can offer the whole set. */
export function usePublishSetOffer(offer: SetOffer) {
  const publish = useContext(SetOfferContext)?.publish;
  const { variants, total, rate, available, section, button } = offer;
  const key = variants.map(variantKey).join("|");
  useEffect(() => {
    if (!publish) return;
    publish({ variants, total, rate, available, section, button });
    return () => publish(null);
    // `variants` is represented by `key`; a new array with the same items
    // must not republish.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publish, key, total, rate, available, section, button]);
}

type Mode = "product" | "set";

const dockMedia = "(max-width: 800px) and (min-height: 480px)";
/** Height of the bar, so a button hidden behind it counts as off screen. */
const DOCK_HEIGHT = 64;
/** Distance between the show and hide points, so small scrolls never toggle. */
const BAND = 24;

/**
 * Decides what the bar offers while the shopper is inside a product block:
 * - "product" once the main Add to Cart has passed under the header and the
 *   shopper is still reading this product's details;
 * - "set" inside the set builder while its own button is not on screen;
 * - nothing when the relevant button is visible or the block has ended.
 */
function useStickyMode(
  active: boolean,
  regionRef: RefObject<HTMLElement | null>,
  buttonRef: RefObject<HTMLElement | null>,
  offer: SetOffer | null,
  productAvailable: boolean,
) {
  const [mode, setMode] = useState<Mode | null>(null);

  useEffect(() => {
    if (!active) return;
    const media = window.matchMedia(dockMedia);
    let current: Mode | null = null;
    let frame = 0;
    const apply = (next: Mode | null) => {
      if (next === current) return;
      current = next;
      setMode(next);
    };
    const decide = (): Mode | null => {
      const region = regionRef.current;
      const button = buttonRef.current;
      if (!media.matches || !region || !button) return null;
      const viewport = window.innerHeight;
      const focus = viewport * 0.5;
      const header =
        document.querySelector(".site-header")?.getBoundingClientRect()
          .bottom ?? 0;
      const set = offer?.available ? offer.section.current : null;
      const setRect = set?.getBoundingClientRect();

      if (setRect && setRect.top < focus && setRect.bottom > header + 120) {
        const setButton = offer?.button.current?.getBoundingClientRect();
        const lift = current === "set" ? BAND : 0;
        const buttonOnScreen =
          !!setButton &&
          setButton.top < viewport - DOCK_HEIGHT - lift &&
          setButton.bottom > header;
        return buttonOnScreen ? null : "set";
      }

      if (!productAvailable) return null;
      const band = current === "product" ? BAND : -BAND;
      const passed = button.getBoundingClientRect().bottom < header + band;
      // Leaving the set for the details is a hand-over, not a new show:
      // no band there, so the bar never blinks between the two.
      const detailsBand = current === null ? -BAND : BAND;
      const detailsEnd = setRect
        ? setRect.top
        : region.getBoundingClientRect().bottom;
      return passed && detailsEnd > focus - detailsBand ? "product" : null;
    };
    const update = () => {
      frame = 0;
      apply(decide());
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    media.addEventListener("change", schedule);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      media.removeEventListener("change", schedule);
      apply(null);
    };
  }, [active, regionRef, buttonRef, offer, productAvailable]);

  return active ? mode : null;
}

/** Compact bar at the bottom of phones that follows the product block. */
export function StickyBuy({
  active,
  variant,
  available,
  regionRef,
  buttonRef,
}: {
  active: boolean;
  variant: ProductVariant;
  available: boolean;
  regionRef: RefObject<HTMLElement | null>;
  buttonRef: RefObject<HTMLElement | null>;
}) {
  const offer = useContext(SetOfferContext)?.offer ?? null;
  const { t, money, choiceSummary, addItems } = useStorefront((state) => ({
    t: state.t,
    money: state.money,
    choiceSummary: state.choiceSummary,
    addItems: state.addItems,
  }));
  const mode = useStickyMode(active, regionRef, buttonRef, offer, available);
  const [shown, setShown] = useState<Mode>("product");
  if (mode && mode !== shown) setShown(mode);

  const setMode = shown === "set" && offer;
  const variants = setMode ? offer.variants : [variant];
  const justAdded = useRecentlyAdded(variants);

  if (!active) return null;

  return (
    <div
      className="purchase-dock"
      data-visible={mode ? true : undefined}
      aria-hidden={!mode}
      inert={!mode}
    >
      <div className="purchase-dock-content" key={shown}>
        <div className="purchase-dock-summary">
          <strong>{money(setMode ? offer.total : itemPrice(variant))}</strong>
          <span>
            {setMode
              ? t(offer.rate > 0 ? "setDockLine" : "setAddedLine", {
                  count: String(offer.variants.length),
                  rate: String(Math.round(offer.rate * 100)),
                })
              : choiceSummary(variant.colour, variant.size)}
          </span>
        </div>
        <button
          className="btn"
          type="button"
          data-added={justAdded || undefined}
          onClick={() => addItems(variants)}
        >
          {justAdded ? (
            <>
              <CheckIcon />
              {t("addedToBag")}
            </>
          ) : (
            t(setMode ? "addSetShort" : "addCart")
          )}
        </button>
      </div>
    </div>
  );
}
