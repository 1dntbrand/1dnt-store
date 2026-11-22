"use client";
import { useStorefront } from "../storefront-context";
import { Dialog } from "./dialog";
import { CloseButton } from "./close-button";

export function Menu() {
  const { t, closeDialog } = useStorefront((state) => ({
    t: state.t,
    closeDialog: state.closeDialog,
  }));
  return (
    <Dialog
      id="menuPanel"
      className="site-panel left-panel"
      labelledBy="menuPanelTitle"
    >
      <div className="panel-top">
        <h2 id="menuPanelTitle">
          <span>{t("menuTitle")}</span>
        </h2>
        <CloseButton label={t("guideClose")} onClick={closeDialog} />
      </div>
      <nav className="drawer-nav" aria-label="Explore">
        <details className="menu-collections">
          <summary>
            <span>{t("menuCollections")}</span>
            <span className="disclosure-chevron" aria-hidden="true" />
          </summary>
          <div className="menu-collection-links">
            <a onClick={closeDialog} href="#collection">
              {"Base BioThane"}
              <sup>{"®"}</sup>
            </a>
            <a onClick={closeDialog} href="#elegant">
              {"Elegant BioThane"}
              <sup>{"®"}</sup>
            </a>
          </div>
        </details>
        <a onClick={closeDialog} href="#philosophy">
          <span>{t("menuAbout")}</span>
        </a>
        <a onClick={closeDialog} href="#faq">
          <span>{t("menuFAQ")}</span>
        </a>
      </nav>
      <div className="panel-signature">
        {"YOUR DOG."}
        <br />
        {"YOUR STYLE."}
        <br />
        {"ONE IDENTITY."}
      </div>
    </Dialog>
  );
}
