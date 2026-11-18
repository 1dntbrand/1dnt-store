"use client";
import { useStorefront } from "../storefront-context";
import { Dialog } from "./dialog";

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
        <button
          className="icon-button panel-close"
          aria-label="Close"
          onClick={closeDialog}
          type="button"
        >
          <svg
            viewBox="0 0 24 24"
            width="22"
            height="22"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.35"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m6 6 12 12M6 18 18 6"></path>
          </svg>
        </button>
      </div>
      <nav className="drawer-nav" aria-label="Explore">
        <details className="menu-collections">
          <summary>
            <span>{t("menuCollections")}</span>
            <span className="menu-toggle" aria-hidden="true">
              {"+"}
            </span>
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
