"use client";
import { useStorefront } from "../storefront-context";
import { ServiceSections } from "./service-sections";

export function ServiceContent() {
  const { service, serviceIndex } = useStorefront((state) => ({
    service: state.service,
    serviceIndex: state.serviceIndex,
  }));
  return (
    <div id="serviceContent">
      <ServiceSections
        sections={service.pages[serviceIndex]}
        pending={service.pending}
      />
    </div>
  );
}
