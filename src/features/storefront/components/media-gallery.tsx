"use client";

import { ArrowIcon } from "./icons";
import Image from "next/image";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { blurProps } from "../lib/image-placeholder";
import { useStorefront } from "../storefront-context";
import { Lightbox } from "./lightbox";
import { scrollBehavior } from "../lib/motion";

export interface GalleryPhoto {
  src: string;
  alt: string;
  label: string;
  /** Which part of the photo stays in view when the frame crops it. */
  position?: string;
}

/** Scroll a snap track to a slide without fighting the user's own swipe. */
function scrollToSlide(
  track: HTMLElement | null,
  index: number,
  instant = false,
) {
  if (!track) return;
  const left = index * track.clientWidth;
  if (Math.abs(track.scrollLeft - left) < 2) return;
  const behavior = instant ? "instant" : scrollBehavior();
  // While an arrow or thumbnail glides the track, its passing positions are
  // not the shopper choosing a photo; the sync waits for the target.
  if (behavior === "smooth") track.dataset.gliding = String(left);
  track.scrollTo({ left, behavior });
}

/** Keep the active index in step with a horizontally scrolled snap track. */
export function useSlideSync(
  track: React.RefObject<HTMLElement | null>,
  index: number,
  onIndexChange: (index: number) => void,
  /** Changes when the photo set itself changes (a new colour). */
  resetKey?: string,
) {
  const latest = useRef({ index, onIndexChange });
  const shownSet = useRef(resetKey);
  useEffect(() => {
    latest.current = { index, onIndexChange };
  });

  useEffect(() => {
    const element = track.current;
    if (!element) return;
    let frame = 0;
    let settle = 0;
    const stopGliding = () => {
      window.clearTimeout(settle);
      delete element.dataset.gliding;
    };
    const onScroll = () => {
      const gliding = element.dataset.gliding;
      if (gliding !== undefined) {
        // Not there yet: let the glide finish (with a safety net in case
        // the browser never reports the end).
        if (Math.abs(element.scrollLeft - Number(gliding)) >= 2) {
          window.clearTimeout(settle);
          settle = window.setTimeout(() => {
            stopGliding();
            onScroll();
          }, 600);
          return;
        }
        stopGliding();
      }
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        // A hidden track (closed viewer, inactive tab) has no width; its
        // scroll position says nothing about the photo being shown.
        const width = element.clientWidth;
        if (!width) return;
        const next = Math.round(element.scrollLeft / width);
        if (next !== latest.current.index) latest.current.onIndexChange(next);
      });
    };
    // A finger or wheel on the track takes over from any glide at once.
    const takeOver = () => stopGliding();
    element.addEventListener("scroll", onScroll, { passive: true });
    element.addEventListener("scrollend", onScroll);
    element.addEventListener("pointerdown", takeOver, { passive: true });
    element.addEventListener("touchstart", takeOver, { passive: true });
    element.addEventListener("wheel", takeOver, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      stopGliding();
      element.removeEventListener("scroll", onScroll);
      element.removeEventListener("scrollend", onScroll);
      element.removeEventListener("pointerdown", takeOver);
      element.removeEventListener("touchstart", takeOver);
      element.removeEventListener("wheel", takeOver);
    };
  }, [track]);

  useEffect(() => {
    // A new colour starts on its first photo at once; arrows and thumbs glide.
    const newSet = shownSet.current !== resetKey;
    shownSet.current = resetKey;
    scrollToSlide(track.current, index, newSet);
  }, [track, index, resetKey]);
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
  useSlideSync(track, active, onIndexChange, photos[0]?.src);

  function go(step: number) {
    const next = (active + step + photos.length) % photos.length;
    onIndexChange(next);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!multiple) return;
    const step =
      event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = (active + step + photos.length) % photos.length;
    onIndexChange(next);
    // Keep focus on the photo being shown, not on the one that just hid.
    if (
      event.target instanceof HTMLElement &&
      track.current?.contains(event.target)
    )
      track.current
        .querySelectorAll<HTMLElement>(".media-slide")
        [next]?.focus({ preventScroll: true });
  }

  return (
    <div className={`media-gallery ${className ?? ""}`}>
      <div className="media-stage" onKeyDown={onKeyDown}>
        <div className="media-track" ref={track}>
          {photos.map((photo, slide) => (
            <button
              key={slide}
              type="button"
              className="media-slide"
              aria-label={`${photo.alt} · ${t("galleryOpen")}`}
              aria-hidden={slide !== active}
              tabIndex={slide === active ? 0 : -1}
              onClick={() => setLightboxOpen(true)}
            >
              <Image
                src={photo.src}
                alt=""
                fill
                sizes={sizes}
                style={
                  photo.position
                    ? { objectPosition: photo.position }
                    : undefined
                }
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
