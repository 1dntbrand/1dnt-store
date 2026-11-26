"use client";
import { PlayIcon, YouTubeIcon } from "./icons";
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
          <button
            className="hardware-video-play"
            type="button"
            onClick={() => setPlay(true)}
          >
            <span className="btn">
              <PlayIcon />
              {t("fidlockVideo")}
            </span>
          </button>
        )}
      </div>
      <a
        className="video-source video-link"
        href={fidlockVideo.watch}
        target="_blank"
        rel="noopener noreferrer"
      >
        <YouTubeIcon />
        <span>{t("watchYoutube")}</span>
      </a>
    </Disclosure>
  );
}
