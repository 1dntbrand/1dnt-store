"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { blurProps } from "../lib/image-placeholder";
import { useStorefront } from "../storefront-context";
import type { GalleryPhoto } from "./media-gallery";
import { useSlideSync } from "./media-gallery";

const ZOOM = 2.2;

/** Fullscreen photos: swipe or arrows between photos, tap to zoom and pan. */
export function Lightbox({
  open,
  photos,
  index,
  onIndexChange,
  onClose,
}: {
  open: boolean;
  photos: readonly GalleryPhoto[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}) {
  const t = useStorefront((state) => state.t);
  const dialog = useRef<HTMLDialogElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [zoomed, setZoomed] = useState<number | null>(null);
  const multiple = photos.length > 1;
  useSlideSync(track, index, (next) => {
    setZoomed(null);
    onIndexChange(next);
  });

  useEffect(() => {
    const element = dialog.current;
    if (!element || !open) return;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;
    element.showModal();
    document.body.style.overflow = "hidden";
    // Jump straight to the photo that was tapped.
    track.current?.scrollTo({ left: index * track.current.clientWidth });
    return () => {
      element.close();
      document.body.style.overflow = previousOverflow;
      setZoomed(null);
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
    // Opening position only; later changes come from swiping.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function go(step: number) {
    setZoomed(null);
    onIndexChange((index + step + photos.length) % photos.length);
  }

  function toggleZoom(event: MouseEvent<HTMLButtonElement>, slide: number) {
    if (zoomed === slide) {
      setZoomed(null);
      return;
    }
    const frame = event.currentTarget;
    const bounds = frame.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;
    setZoomed(slide);
    // Centre the zoomed image on the point that was tapped.
    requestAnimationFrame(() => {
      const scroller = frame.parentElement;
      if (!scroller) return;
      scroller.scrollLeft = x * scroller.scrollWidth - scroller.clientWidth / 2;
      scroller.scrollTop =
        y * scroller.scrollHeight - scroller.clientHeight / 2;
    });
  }

  return (
    <dialog
      ref={dialog}
      className="lightbox"
      aria-label={t("productPhotos")}
      data-zoomed={zoomed !== null || undefined}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onKeyDown={(event) => {
        if (!multiple) return;
        if (event.key === "ArrowRight") go(1);
        else if (event.key === "ArrowLeft") go(-1);
      }}
    >
      <div className="lightbox-top">
        <span className="lightbox-count" aria-live="polite">
          {index + 1} / {photos.length}
        </span>
        <button
          type="button"
          className="icon-button lightbox-close"
          aria-label={t("guideClose")}
          onClick={onClose}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path d="m6 6 12 12M6 18 18 6" />
          </svg>
        </button>
      </div>
      <div className="lightbox-track" ref={track}>
        {photos.map((photo, slide) => (
          <div
            key={`${slide}-${photo.src}`}
            className="lightbox-slide"
            aria-hidden={slide !== index}
          >
            <button
              type="button"
              className="lightbox-frame"
              style={
                zoomed === slide
                  ? { width: `${ZOOM * 100}%`, height: `${ZOOM * 100}%` }
                  : undefined
              }
              aria-label={`${photo.alt} · ${t(zoomed === slide ? "galleryZoomOut" : "galleryZoomIn")}`}
              tabIndex={slide === index ? 0 : -1}
              onClick={(event) => toggleZoom(event, slide)}
            >
              <Image
                src={photo.src}
                alt=""
                fill
                sizes={zoomed === slide ? "220vw" : "100vw"}
                {...blurProps(photo.src)}
              />
            </button>
          </div>
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
            <span aria-hidden="true">←</span>
          </button>
          <button
            type="button"
            className="media-arrow media-arrow-next"
            aria-label={t("galleryNext")}
            onClick={() => go(1)}
          >
            <span aria-hidden="true">→</span>
          </button>
        </>
      )}
    </dialog>
  );
}
