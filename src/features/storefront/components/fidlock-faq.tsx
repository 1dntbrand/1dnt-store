"use client";
import { ExternalIcon } from "./icons";
import { useState } from "react";
import { useStorefront } from "../storefront-context";
import { fidlockVideo } from "../data/brand";
import { Disclosure } from "./disclosure";

export function FidlockFaq() {
  const { t } = useStorefront((state) => ({ t: state.t }));
  const [play, setPlay] = useState(false);
  return (
    <Disclosure
      className="faq-question fidlock-faq"
      contentClassName="faq-category-body"
      summary={<span>{t("fidlockQuestion")}</span>}
      onToggle={(open) => {
        if (!open) setPlay(false);
      }}
    >
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
    </Disclosure>
  );
}
