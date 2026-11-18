"use client";
import { useStorefront } from "../storefront-context";
import { Dialog } from "./dialog";
import { ServiceContent } from "./service-content";

export function Service() {
  const { t, closeDialog, service, serviceIndex } = useStorefront((state) => ({
    t: state.t,
    closeDialog: state.closeDialog,
    service: state.service,
    serviceIndex: state.serviceIndex,
  }));
  return (
    <Dialog
      id="serviceDialog"
      className="service-dialog"
      labelledBy="serviceTitle"
    >
      <div className="service-dialog-top">
        <h2 id="serviceTitle">{service.labels[serviceIndex]}</h2>
        <button type="button" id="serviceClose" onClick={closeDialog}>
          {t("guideClose")}
        </button>
      </div>
      <p className="service-draft">{service.draft}</p>
      <ServiceContent />
    </Dialog>
  );
}
