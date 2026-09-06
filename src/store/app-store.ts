import { createStore } from "zustand/vanilla";
import { type AuthSlice, createAuthSlice } from "./slices/authSlice";
import { type CartSlice, createCartSlice } from "./slices/cartSlice";
import { type UiSlice, createUiSlice } from "./slices/uiSlice";

export type RootStoreState = AuthSlice & CartSlice & UiSlice;
export type AppStoreApi = ReturnType<typeof createAppStore>;

export function createAppStore() {
  return createStore<RootStoreState>()((...args) => ({
    ...createAuthSlice(...args),
    ...createCartSlice(...args),
    ...createUiSlice(...args),
  }));
}
