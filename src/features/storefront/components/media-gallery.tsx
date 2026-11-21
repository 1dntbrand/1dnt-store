"use client";

import { ArrowIcon } from "./icons";
import Image from "next/image";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { blurProps } from "../lib/image-placeholder";
import { useStorefront } from "../storefront-context";
import { Lightbox } from "./lightbox";

export interface GalleryPhoto {
  src: string;
  alt: string;
  label: string;
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Scroll a snap track to a slide without fighting the user's own swipe. */
export function scrollToSlide(track: HTMLElement | null, index: number) {
  if (!track) return;
  const left = index * track.clientWidth;
  if (Math.abs(track.scrollLeft - left) < 2) return;
  track.scrollTo({
    left,
    behavior: prefersReducedMotion() ? "auto" : "smooth",
  });
}

/** Keep the active index in step with a horizontally scrolled snap track. */
export function useSlideSync(
  track: React.RefObject<HTMLElement | null>,
  index: number,
  onIndexChange: (index: number) => void,
) {
  const latest = useRef({ index, onIndexChange });
  useEffect(() => {
    latest.current = { index, onIndexChange };
  });

  useEffect(() => {
    const element = track.current;
    if (!element) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const width = element.clientWidth || 1;
        const next = Math.round(element.scrollLeft / width);
        if (next !== latest.current.index) latest.current.onIndexChange(next);
      });
    };
    element.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      element.removeEventListener("scroll", onScroll);
    };
  }, [track]);

  useEffect(() => {
    scrollToSlide(track.current, index);
  }, [track, index]);
}

/**
 * Product photos: swipe on touch screens, arrows and thumbnails with a
 * pointer, and a fullscreen view with zoom on click or tap.
 */
export function MediaGallery({
  photos,
  index,
  onIndexChange,
  sizes,
  className,
}: {
  photos: readonly GalleryPhoto[];
  index: number;
  onIndexChange: (index: number) => void;
  sizes: string;
  className?: string;
}) {
  const t = useStorefront((state) => state.t);
  const track = useRef<HTMLDivElement>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const active = Math.min(index, photos.length - 1);
  const multiple = photos.length > 1;
  useSlideSync(track, active, onIndexChange);

  function go(step: number) {
    const next = (active + step + photos.length) % photos.length;
    onIndexChange(next);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!multiple) return;
    if (event.key === "ArrowRight") go(1);
    else if (event.key === "ArrowLeft") go(-1);
    else return;
    event.preventDefault();
  }

  return (
    <div className={`media-gallery ${className ?? ""}`}>
      <div className="media-stage" onKeyDown={onKeyDown}>
        <div className="media-track" ref={track}>
          {photos.map((photo, slide) => (
            <button
              key={`${slide}-${photo.src}`}
              type="button"
              className="media-slide"
              aria-label={`${photo.alt} · ${t("galleryOpen")}`}
              aria-hidden={slide !== active}
              tabIndex={slide === active ? 0 : -1}
              onClick={() => setLightboxOpen(true)}
            >
              <Image
                className="photo-swap"
                src={photo.src}
                alt=""
                fill
                sizes={sizes}
                {...blurProps(photo.src)}
              />
            </button>
          ))}
        </div>
        {multiple && (
          <>
            <button
              type="button"
              className="media-arrow media-arrow-prev"
              aria-label={t("galleryPrev")}
              onClick={() => go(-1)}
            >
              <ArrowIcon direction="left" />
            </button>
            <button
              type="button"
              className="media-arrow media-arrow-next"
              aria-label={t("galleryNext")}
              onClick={() => go(1)}
            >
              <ArrowIcon />
            </button>
            <div className="media-dots" aria-hidden="true">
              {photos.map((photo, slide) => (
                <span key={photo.src} data-active={slide === active} />
              ))}
            </div>
          </>
        )}
      </div>
      {multiple && (
        <div
          className="gallery-thumbs"
          role="group"
          aria-label={t("productPhotos")}
        >
          {photos.map((photo, slide) => (
            <button
              key={photo.src}
              type="button"
              className="gallery-thumb"
              aria-label={photo.label}
              aria-pressed={slide === active}
              onClick={() => onIndexChange(slide)}
            >
              <Image src={photo.src} alt="" fill sizes="72px" />
            </button>
          ))}
        </div>
      )}
      <Lightbox
        open={lightboxOpen}
        photos={photos}
        index={active}
        onIndexChange={onIndexChange}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  );
}
