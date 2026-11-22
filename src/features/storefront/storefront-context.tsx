"use client";

import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
  type ReactNode,
} from "react";
import { useStore } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { createStorefrontStore, type StorefrontState } from "./store";
import { validCategory } from "./lib/storage";
import { markPageReady } from "./lib/fade-on-change";
import { scrollBehavior } from "./lib/motion";
import type { Language } from "./lib/catalog";
import {
  dropOverlayEntry,
  forgetStaleOverlayEntry,
  onOverlayBack,
  pushOverlayEntry,
} from "./lib/back-closes";

const StorefrontContext = createContext<ReturnType<
  typeof createStorefrontStore
> | null>(null);

export function StorefrontProvider({
  initialLanguage,
  children,
}: {
  initialLanguage: Language;
  children: ReactNode;
}) {
  const [store] = useState(() => createStorefrontStore(initialLanguage));
  // Saved choices (category, colours, bag) apply before the first paint, so
  // the page never shows defaults first and then rearranges itself.
  useLayoutEffect(() => {
    store.getState().restore();
    markPageReady();
  }, [store]);
  useEffect(() => {
    // An overlay entry restored with the page after a reload has no overlay.
    forgetStaleOverlayEntry();
    let pendingScroll = 0;
    // A reload or Back/Forward restores the shopper's own scroll position;
    // only a fresh visit to a shared #collection/... link should move.
    const navigation = performance.getEntriesByType("navigation")[0] as
      PerformanceNavigationTiming | undefined;
    let scrollToSection = !navigation || navigation.type === "navigate";
    let lastTraversal = -Infinity;
    function syncHash(arriving = false) {
      window.cancelAnimationFrame(pendingScroll);
      const [section, requested] = window.location.hash.slice(1).split("/");
      const state = store.getState();
      state.closeDialog();
      const collection =
        section === "collection"
          ? "base"
          : section === "elegant"
            ? "elegant"
            : null;
      if (collection) {
        if (validCategory(collection, requested))
          state.setCategory(collection, requested);
        const traversed = performance.now() - lastTraversal < 500;
        if (scrollToSection && !traversed)
          pendingScroll = window.requestAnimationFrame(() =>
            document.getElementById(section)?.scrollIntoView({
              block: "start",
              // Arriving on a shared link lands there; a click glides.
              behavior: arriving ? "instant" : scrollBehavior(),
            }),
          );
      }
      // Links clicked later are explicit navigation and scroll; Back and
      // Forward (a popstate just before) keep the position the browser restores.
      scrollToSection = true;
    }
    const onTraverse = () => {
      lastTraversal = performance.now();
    };
    window.addEventListener("popstate", onTraverse);
    syncHash(true);
    const onHashChange = () => syncHash();
    document.documentElement.lang = store.getState().language;
    const unsubscribe = store.subscribe((state, previous) => {
      if (state.language !== previous.language)
        document.documentElement.lang = state.language;
      // One history entry per open overlay, whichever dialog is showing.
      if (state.activeDialog && !previous.activeDialog) pushOverlayEntry();
      if (!state.activeDialog && previous.activeDialog) dropOverlayEntry();
    });
    const stopBack = onOverlayBack(() => {
      if (store.getState().activeDialog) store.getState().closeDialog();
    });
    window.addEventListener("hashchange", onHashChange);
    return () => {
      unsubscribe();
      stopBack();
      window.cancelAnimationFrame(pendingScroll);
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener("popstate", onTraverse);
    };
  }, [store]);
  return (
    <StorefrontContext.Provider value={store}>
      {children}
    </StorefrontContext.Provider>
  );
}

export function useStorefront<T>(selector: (state: StorefrontState) => T): T {
  const store = useContext(StorefrontContext);
  if (!store) throw new Error("StorefrontProvider is required");
  return useStore(store, useShallow(selector));
}
