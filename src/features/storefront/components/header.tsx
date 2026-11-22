"use client";
import { brandLinks } from "../data/brand";
import { languages } from "../lib/catalog";
import { useStorefront } from "../storefront-context";
import { InstagramIcon } from "./instagram-icon";

export function Header() {
  const { t, language, setLanguage, openDialog, cartCount, lastAdded } =
    useStorefront((state) => ({
      t: state.t,
      language: state.language,
      setLanguage: state.setLanguage,
      openDialog: state.openDialog,
      cartCount: state.cartCount,
      lastAdded: state.lastAdded,
    }));
  return (
    <header className="site-header">
      <div className="header-left">
        <button
          className="icon-button menu-trigger"
          type="button"
          data-panel="menuPanel"
          aria-label={t("menuOpen")}
          onClick={() => openDialog("menuPanel")}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
        {brandLinks.instagram && (
          <a
            className="icon-button instagram-link"
            href={brandLinks.instagram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram — 1DNT"
          >
            <InstagramIcon />
          </a>
        )}
      </div>
      <a className="brand" href="#" aria-label="ONE IDENTITY">
        <span className="mark">
          <span>1D</span>
          <span>NT</span>
        </span>
        <span className="brand-name">ONE IDENTITY</span>
      </a>
      <div className="header-tools">
        <select
          className="language-select select-control"
          aria-label={t("languageLabel")}
          value={language}
          onChange={(event) => setLanguage(event.target.value)}
        >
          {languages.map((code) => (
            <option key={code} value={code}>
              {code.toUpperCase()}
            </option>
          ))}
        </select>
        <button
          className="cart-button"
          type="button"
          data-panel="cartPanel"
          aria-label={`${t("bagAction")} (${cartCount})`}
          onClick={() => openDialog("cartPanel")}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path d="M5 8h14l1 13H4L5 8Z" />
            <path d="M9 8V6a3 3 0 0 1 6 0v2" />
          </svg>
          <span className="cart-label">{t("bagAction")}</span>
          <span
            className="cart-count"
            key={lastAdded?.stamp ?? "idle"}
            data-bump={lastAdded ? true : undefined}
          >
            {cartCount}
          </span>
        </button>
      </div>
    </header>
  );
}
