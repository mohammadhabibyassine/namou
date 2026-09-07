import { StateCreator } from "zustand";
import { CartView } from "@/types/models/cart.model";

export interface CartSlice {
  cart: CartView | null;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  setCart: (cart: CartView | null) => void;
  clearLocalCart: () => void;
}

export const createCartSlice: StateCreator<CartSlice, [], [], CartSlice> = (
  set,
) => ({
  cart: null,
  isOpen: false,

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
  setCart: (cart) => set({ cart }),
  clearLocalCart: () => set({ cart: null }),
});
