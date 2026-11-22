"use client";
import { ExternalIcon } from "./icons";
import { useState } from "react";
import { useStorefront } from "../storefront-context";
import { fidlockVideo } from "../data/brand";

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
              src={fidlockVideo.embed}
              title={t("fidlockVideo")}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <button className="btn" type="button" onClick={() => setPlay(true)}>
              {t("fidlockVideo")}
              <ExternalIcon />
            </button>
          )}
        </div>
        <a
          className="video-source"
          href={fidlockVideo.watch}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("watchYoutube")}
        </a>
      </div>
    </details>
  );
}
