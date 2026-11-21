"use client";

import { brandLinks } from "../data/brand";
import { useStorefront } from "../storefront-context";
import { InstagramIcon } from "./instagram-icon";

export function Footer() {
  const { t, openService, service } = useStorefront((state) => ({
    t: state.t,
    openService: state.openService,
    service: state.service,
  }));
  return (
    <footer className="site-footer">
      <div className="footer-top" data-reveal>
        <div className="footer-brand">
          <div className="footer-title">{t("footerTogether")}</div>
          {brandLinks.instagram && (
            <a
              className="instagram-footer"
              aria-label="Instagram — 1DNT"
              href={brandLinks.instagram}
              target="_blank"
              rel="noopener noreferrer"
            >
              <InstagramIcon />
            </a>
          )}
        </div>
        <div className="footer-links">
          <a href="#collection">
            <span>{t("footerCollectionLink")}</span>
          </a>
          <a href="#philosophy">
            <span>{t("footerAboutLink")}</span>
          </a>
          <a href="#faq">
            <span>{t("footerFaqLink")}</span>
          </a>
        </div>
      </div>
      <nav className="service-footer" aria-label="Customer care">
        <p className="service-heading">{service.heading}</p>
        <div className="service-links">
          <button
            type="button"
            data-service="contact"
            onClick={() => openService("contact")}
          >
            {service.labels[0]}
          </button>
          <button
            type="button"
            data-service="delivery"
            onClick={() => openService("delivery")}
          >
            {service.labels[1]}
          </button>
          <button
            type="button"
            data-service="returns"
            onClick={() => openService("returns")}
          >
            {service.labels[2]}
          </button>
          <button
            type="button"
            data-service="terms"
            onClick={() => openService("terms")}
          >
            {service.labels[3]}
          </button>
          <button
            type="button"
            data-service="privacy"
            onClick={() => openService("privacy")}
          >
            {service.labels[4]}
          </button>
          <button
            type="button"
            data-service="cookies"
            onClick={() => openService("cookies")}
          >
            {service.labels[5]}
          </button>
        </div>
      </nav>
      <div className="footer-bottom">
        <span>{"© 2026 1DNT"}</span>
        <span>{t("footerSignature")}</span>
        <span>
          <span>{t("previewStatus")}</span>
        </span>
      </div>
    </footer>
  );
}
