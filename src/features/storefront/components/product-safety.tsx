"use client";
import { useStorefront } from "../storefront-context";
import { Disclosure } from "./disclosure";

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
  // Same order in every language: manufacturer, identification, use, warnings.
  const [manufacturer, , , warnings] = service.safety;
  return (
    <Disclosure className="product-safety" summary={service.safetyTitle}>
      {[manufacturer, warnings].map(([title, text]) => (
        <section key={title}>
          <h4>{title}</h4>
          <p>{text}</p>
        </section>
      ))}
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
