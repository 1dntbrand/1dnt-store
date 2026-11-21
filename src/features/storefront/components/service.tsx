"use client";
import { useStorefront } from "../storefront-context";
import { Dialog } from "./dialog";
import { CloseButton } from "./close-button";
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
      className="modal-sheet service-dialog"
      labelledBy="serviceTitle"
    >
      <div className="panel-top">
        <h2 id="serviceTitle">{service.labels[serviceIndex]}</h2>
        <CloseButton label={t("guideClose")} onClick={closeDialog} />
      </div>
      <div className="modal-body">
        <p className="service-draft">{service.draft}</p>
        <ServiceContent />
      </div>
    </Dialog>
  );
}
