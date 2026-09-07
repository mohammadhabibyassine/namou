"use client";

import { Heart } from "lucide-react";
import { useState } from "react";
import {
  useAddToWishlist,
  useRemoveFromWishlist,
  useWishlist,
} from "@/hooks/wishlist";
import { useGuestCommerce } from "@/providers/guest-commerce-provider";
import { useSession } from "@/providers/session-provider";
import { announceCommerceFeedback } from "@/lib/commerce/feedback";
import type { ProductListItem } from "@/types/api";
import { cn } from "@/lib/utils/cn";

export function ProductSaveButton({ product }: { product: ProductListItem }) {
  const { authenticated } = useSession();
  const guestItems = useGuestCommerce((state) => state.wishlistItems);
  const toggleGuest = useGuestCommerce((state) => state.toggleWishlistItem);
  const wishlist = useWishlist({ pageSize: 100 }, { enabled: authenticated });
  const add = useAddToWishlist();
  const remove = useRemoveFromWishlist();
  const [optimisticSaved, setOptimisticSaved] = useState<{
    value: boolean;
    base: boolean;
  } | null>(null);
  const savedItem = authenticated
    ? wishlist.data?.items.find(
        (item) => item.productId === product.id && item.variantId === null,
      )
    : guestItems.find(
        (item) => item.productId === product.id && item.variantId === null,
      );
  const savedFromData = Boolean(savedItem);
  const saved =
    optimisticSaved?.base === savedFromData
      ? optimisticSaved.value
      : savedFromData;

  function announce(nextSaved: boolean) {
    announceCommerceFeedback({
      message: nextSaved ? "Saved object" : "Removed from saved",
      detail: product.title,
      tone: "success",
      target: "wishlist",
    });
  }

  function fail() {
    setOptimisticSaved(null);
    announceCommerceFeedback({
      message: "Saved objects interrupted",
      detail: "Please try that action again.",
      tone: "error",
      target: "wishlist",
    });
  }

  return (
    <button
      type="button"
      onClick={() => {
        const nextSaved = !saved;
        setOptimisticSaved({ value: nextSaved, base: savedFromData });
        if (authenticated) {
          if (savedItem && "id" in savedItem) {
            remove.mutate(savedItem.id, {
              onSuccess: () => announce(nextSaved),
              onError: fail,
            });
          } else {
            add.mutate(
              { productId: product.id, variantId: null },
              {
                onSuccess: () => announce(nextSaved),
                onError: fail,
              },
            );
          }
        } else {
          toggleGuest({
            productId: product.id,
            variantId: null,
            title: product.title,
            slug: product.slug,
            imageUrl: product.primaryImageUrl ?? null,
            price: product.minimumPrice,
            currencyCode: product.currencyCode,
          });
          announce(nextSaved);
        }
      }}
      disabled={add.isPending || remove.isPending}
      className={cn(
        "absolute top-3 right-3 grid size-9 place-items-center rounded-full border border-black/5 backdrop-blur-sm transition-[transform,background-color,color] active:scale-90 disabled:opacity-50 motion-safe:hover:scale-110",
        saved ? "bg-acid text-ink" : "bg-surface/85",
      )}
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
