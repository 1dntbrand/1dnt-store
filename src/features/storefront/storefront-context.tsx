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

const StorefrontContext = createContext<ReturnType<
  typeof createStorefrontStore
> | null>(null);

export function StorefrontProvider({ children }: { children: ReactNode }) {
  const [store] = useState(createStorefrontStore);
  useEffect(() => {
    store.getState().restore();
    function syncHash() {
      const requested = window.location.hash.split("/")[1];
      const state = store.getState();
      state.setCategory(
        ["collars", "leashes", "harnesses"].includes(requested)
          ? requested
          : "all",
      );
      state.closeDialog();
      if (window.location.hash.startsWith("#collection")) {
        requestAnimationFrame(() =>
          document
            .getElementById("collection")
            ?.scrollIntoView({ block: "start" }),
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
