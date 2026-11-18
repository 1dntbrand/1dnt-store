"use client";

import { StorefrontProvider, useStorefront } from "./storefront-context";
import { Header } from "./components/header";
import { Hero } from "./components/hero";
import { Elegant } from "./components/elegant";
import { Catalog } from "./components/catalog";
import { BrandStory } from "./components/brand-story";
import { Footer } from "./components/footer";
import { Menu } from "./components/menu";
import { Cart } from "./components/cart";
import { Checkout } from "./components/checkout";
import { CollarGuide } from "./components/collar-guide";
import { HarnessGuide } from "./components/harness-guide";
import { LeashGuide } from "./components/leash-guide";
import { Service } from "./components/service";

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
      <Checkout />
      <CollarGuide />
      <HarnessGuide />
      <LeashGuide />
      <Service />
    </>
  );
}
export function Storefront() {
  return (
    <StorefrontProvider>
      <StorefrontContent />
    </StorefrontProvider>
  );
}
