"use client";
import { useStorefront } from "../storefront-context";

export function ProductSafety() {
  const { service } = useStorefront((state) => ({ service: state.service }));
  return (
    <details className="product-safety">
      <summary>{service.safetyTitle}</summary>
      <div>
        {service.safety.map(([title, text]) => (
          <section key={title}>
            <h4>{title}</h4>
            <p>{text}</p>
          </section>
        ))}
      </div>
    </details>
  );
}
