"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { StorefrontProvider, useStorefront } from "./storefront-context";
import type { Language } from "./lib/catalog";
import { Header } from "./components/header";
import { Hero } from "./components/hero";
import { Elegant } from "./components/elegant";
import { Catalog } from "./components/catalog";
import { BrandStory } from "./components/brand-story";
import { Footer } from "./components/footer";
import { Menu } from "./components/menu";
import { Cart } from "./components/cart";
import { Dialog } from "./components/dialog";
import { CloseButton } from "./components/close-button";
import { CollarGuide } from "./components/collar-guide";
import { HarnessGuide } from "./components/harness-guide";
import { LeashGuide } from "./components/leash-guide";
import { ElegantLeashGuide } from "./components/elegant-leash-guide";
import { Service } from "./components/service";
import { AddedToast } from "./components/added-toast";

const Checkout = dynamic(
  () => import("./components/checkout").then((module) => module.Checkout),
  { loading: CheckoutLoading },
);

function CheckoutLoading() {
  const { t, closeDialog } = useStorefront((state) => ({
    t: state.t,
    closeDialog: state.closeDialog,
  }));

  return (
    <Dialog
      id="checkoutPanel"
      labelledBy="checkoutLoadingTitle"
      className="checkout-panel"
    >
      <div className="panel-top">
        <h2 id="checkoutLoadingTitle" role="status">
          {t("checkoutLoading")}
        </h2>
        <CloseButton label={t("guideClose")} onClick={closeDialog} />
      </div>
      <div className="checkout-skeleton" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>
    </Dialog>
  );
}

function DeferredCheckout() {
  const isOpen = useStorefront(
    (state) => state.activeDialog === "checkoutPanel",
  );
  const [hasOpened, setHasOpened] = useState(false);
  if (isOpen && !hasOpened) setHasOpened(true);
  return hasOpened ? <Checkout /> : null;
}

function StorefrontContent() {
  const { t } = useStorefront((state) => ({ t: state.t }));
  return (
    <>
      <a className="skip-link" href="#main">
        {t("skipContent")}
      </a>
      <Header />
      <main id="main">
        <Hero />
        <Catalog />
        <Elegant />
        <BrandStory />
      </main>
      <Footer />
      <Menu />
      <Cart />
      <DeferredCheckout />
      <CollarGuide />
      <HarnessGuide />
      <LeashGuide />
      <ElegantLeashGuide />
      <Service />
      <AddedToast />
    </>
  );
}
export function Storefront({ language }: { language: Language }) {
  return (
    <StorefrontProvider initialLanguage={language}>
      <StorefrontContent />
    </StorefrontProvider>
  );
}
