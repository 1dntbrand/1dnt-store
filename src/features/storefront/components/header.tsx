"use client";
import { useStorefront } from "../storefront-context";

export function Header() {
  const { t, language, setLanguage, openDialog, cartCount } = useStorefront(
    (state) => ({
      t: state.t,
      language: state.language,
      setLanguage: state.setLanguage,
      openDialog: state.openDialog,
      cartCount: state.cartCount,
    }),
  );
  return (
    <header className="site-header">
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
      <a className="brand" href="#" aria-label="ONE IDENTITY">
        <span className="mark">
          <span>1D</span>
          <span>NT</span>
        </span>
        <span className="brand-name">ONE IDENTITY</span>
      </a>
      <nav className="primary-nav" aria-label={t("menuTitle")}>
        <a href="#collection">Base</a>
        <a href="#elegant">Elegant</a>
        <a href="#philosophy">{t("navAbout")}</a>
      </nav>
      <div className="header-tools">
        <select
          className="language-select select-control"
          aria-label={t("languageLabel")}
          value={language}
          onChange={(event) => setLanguage(event.target.value)}
        >
          <option value="pl">PL</option>
          <option value="en">EN</option>
          <option value="ru">RU</option>
          <option value="uk">UK</option>
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
          <span className="cart-count">{cartCount}</span>
        </button>
      </div>
    </header>
  );
}
