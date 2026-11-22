"use client";

import { brandLinks } from "../data/brand";
import { serviceIds } from "../store";
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
      <div className="footer-top">
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
      <nav className="service-footer" aria-label={service.heading}>
        <p className="service-heading">{service.heading}</p>
        <div className="service-links">
          {serviceIds.map((id, index) => (
            <button key={id} type="button" onClick={() => openService(id)}>
              {service.labels[index]}
            </button>
          ))}
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
