"use client";
import { useStorefront } from "../storefront-context";
import { Disclosure } from "./disclosure";

export function ProductSafety() {
  const { service } = useStorefront((state) => ({ service: state.service }));
  return (
    <Disclosure className="product-safety" summary={service.safetyTitle}>
      {service.safety.map(([title, text]) => (
        <section key={title}>
          <h4>{title}</h4>
          <p>{text}</p>
        </section>
      ))}
    </Disclosure>
  );
}
