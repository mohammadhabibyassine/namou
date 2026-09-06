import { createStore } from "zustand/vanilla";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import { z } from "zod";

const guestCartItemSchema = z.object({
  variantId: z.uuid(),
  productId: z.uuid(),
  title: z.string(),
  slug: z.string(),
  imageUrl: z.string().nullable(),
  sku: z.string(),
  options: z.array(z.object({ attributeType: z.string(), value: z.string() })),
  unitPrice: z.string(),
  currencyCode: z.string(),
  quantity: z.number().int().min(1).max(999),
});

const guestWishlistItemSchema = z.object({
  productId: z.uuid(),
  variantId: z.uuid().nullable(),
  title: z.string(),
  slug: z.string(),
  imageUrl: z.string().nullable(),
  price: z.string(),
  currencyCode: z.string(),
});

const persistedStateSchema = z.object({
  cartItems: z.array(guestCartItemSchema).max(100),
  wishlistItems: z.array(guestWishlistItemSchema).max(100),
});

export type GuestCartItem = z.infer<typeof guestCartItemSchema>;
export type GuestWishlistItem = z.infer<typeof guestWishlistItemSchema>;

interface GuestCommerceState {
  cartItems: GuestCartItem[];
  wishlistItems: GuestWishlistItem[];
}

interface GuestCommerceActions {
  addCartItem: (
    item: Omit<GuestCartItem, "quantity">,
    quantity?: number,
  ) => void;
  setCartQuantity: (variantId: string, quantity: number) => void;
  removeCartItem: (variantId: string) => void;
  toggleWishlistItem: (item: GuestWishlistItem) => void;
  clearGuestState: () => void;
}

export type GuestCommerceStore = GuestCommerceState & GuestCommerceActions;
export type GuestCommerceStoreApi = ReturnType<typeof createGuestCommerceStore>;

const initialState: GuestCommerceState = { cartItems: [], wishlistItems: [] };

export function createGuestCommerceStore() {
  return createStore<GuestCommerceStore>()(
    devtools(
      persist(
        (set) => ({
          ...initialState,
          addCartItem: (item, quantity = 1) =>
            set(
              (state) => {
                const existing = state.cartItems.find(
                  (candidate) => candidate.variantId === item.variantId,
                );
                if (!existing) {
                  return {
                    cartItems: [
                      ...state.cartItems,
                      {
                        ...item,
                        quantity: Math.min(999, Math.max(1, quantity)),
                      },
                    ],
                  };
                }
                return {
                  cartItems: state.cartItems.map((candidate) =>
                    candidate.variantId === item.variantId
                      ? {
                          ...candidate,
                          quantity: Math.min(
                            999,
                            candidate.quantity + quantity,
                          ),
                        }
                      : candidate,
                  ),
                };
              },
              false,
              "guest-commerce/add-cart-item",
            ),
          setCartQuantity: (variantId, quantity) =>
            set(
              (state) => ({
                cartItems: state.cartItems.map((item) =>
                  item.variantId === variantId
                    ? {
                        ...item,
                        quantity: Math.min(999, Math.max(1, quantity)),
                      }
                    : item,
                ),
              }),
              false,
              "guest-commerce/set-cart-quantity",
            ),
          removeCartItem: (variantId) =>
            set(
              (state) => ({
                cartItems: state.cartItems.filter(
                  (item) => item.variantId !== variantId,
                ),
              }),
              false,
              "guest-commerce/remove-cart-item",
            ),
          toggleWishlistItem: (item) =>
            set(
              (state) => ({
                wishlistItems: state.wishlistItems.some(
                  (candidate) =>
                    candidate.productId === item.productId &&
                    candidate.variantId === item.variantId,
                )
                  ? state.wishlistItems.filter(
                      (candidate) =>
                        candidate.productId !== item.productId ||
                        candidate.variantId !== item.variantId,
                    )
                  : [...state.wishlistItems, item],
              }),
              false,
              "guest-commerce/toggle-wishlist-item",
            ),
          clearGuestState: () =>
            set(initialState, false, "guest-commerce/clear"),
        }),
        {
          name: "namou.guest-commerce",
          version: 1,
          storage: createJSONStorage(() => localStorage),
          skipHydration: true,
          partialize: (state) => ({
            cartItems: state.cartItems,
            wishlistItems: state.wishlistItems,
          }),
          merge: (persisted, current) => {
            const parsed = persistedStateSchema.safeParse(persisted);
            return parsed.success ? { ...current, ...parsed.data } : current;
          },
        },
      ),
      { name: "Namou guest commerce" },
    ),
  );
}
