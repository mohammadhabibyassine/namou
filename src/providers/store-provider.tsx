"use client";

import { createContext, type ReactNode, useContext, useState } from "react";
import { useStore as useZustandStore } from "zustand";
import {
  createAppStore,
  type AppStoreApi,
  type RootStoreState,
} from "@/store/app-store";

const StoreContext = createContext<AppStoreApi | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [store] = useState<AppStoreApi>(createAppStore);

  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
}

export function useAppStore<T>(selector: (state: RootStoreState) => T): T {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useAppStore must be used inside StoreProvider");
  return useZustandStore(store, selector);
}
