"use client";

import { Heart } from "lucide-react";
import {
  useAddToWishlist,
  useRemoveFromWishlist,
  useWishlist,
} from "@/hooks/wishlist";
import { useGuestCommerce } from "@/providers/guest-commerce-provider";
import { useSession } from "@/providers/session-provider";
import type { ProductListItem } from "@/types/api";

export function ProductSaveButton({ product }: { product: ProductListItem }) {
  const { authenticated } = useSession();
  const guestItems = useGuestCommerce((state) => state.wishlistItems);
  const toggleGuest = useGuestCommerce((state) => state.toggleWishlistItem);
  const wishlist = useWishlist({ pageSize: 100 });
  const add = useAddToWishlist();
  const remove = useRemoveFromWishlist();
  const savedItem = authenticated
    ? wishlist.data?.items.find(
        (item) => item.productId === product.id && item.variantId === null,
      )
    : guestItems.find(
        (item) => item.productId === product.id && item.variantId === null,
      );
  const saved = Boolean(savedItem);

  return (
    <button
      type="button"
      onClick={() => {
        if (authenticated) {
          if (savedItem && "id" in savedItem) remove.mutate(savedItem.id);
          else add.mutate({ productId: product.id, variantId: null });
        } else {
          toggleGuest({
            productId: product.id,
            variantId: null,
            title: product.title,
            slug: product.slug,
            imageUrl: product.primaryImageUrl,
            price: product.minimumPrice,
            currencyCode: product.currencyCode,
          });
        }
      }}
      disabled={add.isPending || remove.isPending}
      className="bg-surface/75 absolute top-3 right-3 grid size-9 place-items-center rounded-full backdrop-blur-sm transition-transform disabled:opacity-50 motion-safe:hover:scale-110"
      aria-label={`${saved ? "Remove" : "Save"} ${product.title}${saved ? " from wishlist" : " to wishlist"}`}
      aria-pressed={saved}
    >
      <Heart
        size={17}
        strokeWidth={1.5}
        fill={saved ? "currentColor" : "none"}
        aria-hidden="true"
      />
    </button>
  );
}
