"use client";
import { useStorefront } from "../storefront-context";
import { serviceIds } from "../store";
import { Disclosure } from "./disclosure";
import { ServiceSections } from "./service-sections";

/**
 * What the product page itself has to carry (GPSR, art. 19): who makes it
 * and the warnings. The page already identifies the product; the rest of
 * the safety text lives on its own customer-care page.
 */
export function ProductSafety() {
  const { service, openService } = useStorefront((state) => ({
    service: state.service,
    openService: state.openService,
  }));
  // Same order in every language: manufacturer first, warnings last.
  const page = service.pages[serviceIds.indexOf("safety")];
  const [manufacturer, warnings] = [page[0], page[page.length - 1]];
  return (
    <Disclosure className="product-safety" summary={service.safetyTitle}>
      <ServiceSections
        sections={[manufacturer, warnings]}
        pending={service.pending}
        heading="h4"
      />
      <button
        className="text-button"
        type="button"
        onClick={() => openService("safety")}
      >
        {service.safetyMore}
      </button>
    </Disclosure>
  );
}
