"use client";
import { useState } from "react";
import { useStorefront } from "../storefront-context";

export function FidlockFaq() {
  const { t } = useStorefront((state) => ({ t: state.t }));
  const [play, setPlay] = useState(false);
  return (
    <details
      className="faq-question fidlock-faq"
      onToggle={(event) => {
        if (!event.currentTarget.open) setPlay(false);
      }}
    >
      <summary>
        <span>{t("fidlockQuestion")}</span>
      </summary>
      <div className="faq-category-body">
        <p>{t("fidlockExplanation")}</p>
        <div className="hardware-video">
          {play ? (
            <iframe
              src="https://www.youtube-nocookie.com/embed/7zd1MJYeSAs?autoplay=1"
              title={t("fidlockVideo")}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <button className="btn" type="button" onClick={() => setPlay(true)}>
              {t("fidlockVideo")} ↗
            </button>
          )}
        </div>
        <a
          className="video-source"
          href="https://www.youtube.com/watch?v=7zd1MJYeSAs"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("watchYoutube")}
        </a>
      </div>
    </details>
  );
}
