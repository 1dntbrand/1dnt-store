"use client";
import { useStorefront } from "../storefront-context";
export function ServiceContent() {
  const { service, serviceIndex } = useStorefront((state) => ({
    service: state.service,
    serviceIndex: state.serviceIndex,
  }));
  return (
    <div id="serviceContent">
      {service.pages[serviceIndex].map(([title, text]) => (
        <section key={title}>
          <h3>{title}</h3>
          <p>{text}</p>
        </section>
      ))}
    </div>
  );
}
