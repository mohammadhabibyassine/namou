import { mergeCart } from "@/services/api/v1/cart.api";
import { mergeWishlist } from "@/services/api/v1/wishlist.api";
import type {
  GuestCartItem,
  GuestWishlistItem,
} from "@/stores/guest-commerce-store";

export async function mergeGuestCommerce(input: {
  cartItems: GuestCartItem[];
  wishlistItems: GuestWishlistItem[];
}): Promise<void> {
  const operations: Promise<unknown>[] = [];

  if (input.cartItems.length > 0) {
    operations.push(
      mergeCart({
        items: input.cartItems
          .slice(0, 100)
          .map(({ variantId, quantity }) => ({ variantId, quantity })),
      }),
    );
  }

  if (input.wishlistItems.length > 0) {
    operations.push(
      mergeWishlist({
        items: input.wishlistItems
          .slice(0, 100)
          .map(({ productId, variantId }) => ({ productId, variantId })),
      }),
    );
  }

  await Promise.all(operations);
}
