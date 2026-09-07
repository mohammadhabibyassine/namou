"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useStore } from "zustand";
import {
  createGuestCommerceStore,
  type GuestCommerceStore,
  type GuestCommerceStoreApi,
} from "@/stores/guest-commerce-store";

const GuestCommerceContext = createContext<GuestCommerceStoreApi | null>(null);
const GuestCommerceHydrationContext = createContext(false);

export function GuestCommerceProvider({ children }: { children: ReactNode }) {
  const [store] = useState<GuestCommerceStoreApi>(createGuestCommerceStore);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    void Promise.resolve(store.persist.rehydrate()).finally(() =>
      setHydrated(true),
    );
  }, [store]);

  return (
    <GuestCommerceContext.Provider value={store}>
      <GuestCommerceHydrationContext.Provider value={hydrated}>
        {children}
      </GuestCommerceHydrationContext.Provider>
    </GuestCommerceContext.Provider>
  );
}

export function useGuestCommerce<T>(
  selector: (state: GuestCommerceStore) => T,
): T {
  const store = useContext(GuestCommerceContext);
  if (!store) {
    throw new Error(
      "useGuestCommerce must be used inside GuestCommerceProvider",
    );
  }
  return useStore(store, selector);
}

export function useGuestCommerceHydrated(): boolean {
  return useContext(GuestCommerceHydrationContext);
}
