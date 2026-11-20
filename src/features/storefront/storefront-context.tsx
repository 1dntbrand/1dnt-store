"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useStore } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { createStorefrontStore, type StorefrontState } from "./store";
import { validCategory } from "./lib/storage";

const StorefrontContext = createContext<ReturnType<
  typeof createStorefrontStore
> | null>(null);

export function StorefrontProvider({ children }: { children: ReactNode }) {
  const [store] = useState(createStorefrontStore);
  useEffect(() => {
    store.getState().restore();
    let pendingScroll = 0;
    function syncHash() {
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
        pendingScroll = window.requestAnimationFrame(() =>
          document.getElementById(section)?.scrollIntoView({ block: "start" }),
        );
      }
    }
    syncHash();
    document.documentElement.lang = store.getState().language;
    const unsubscribe = store.subscribe((state, previous) => {
      if (state.language !== previous.language)
        document.documentElement.lang = state.language;
    });
    window.addEventListener("hashchange", syncHash);
    return () => {
      unsubscribe();
      window.cancelAnimationFrame(pendingScroll);
      window.removeEventListener("hashchange", syncHash);
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
