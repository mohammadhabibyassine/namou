"use client";

import Link from "next/link";
import { ArrowRight, MoveRight, X } from "lucide-react";
import { EmptyState } from "@/components/commerce/empty-state";
import { Price } from "@/components/commerce/price";
import { ProductMedia } from "@/components/commerce/product-media";
import {
  useInfiniteWishlist,
  useMoveWishlistItemToCart,
  useRemoveFromWishlist,
} from "@/hooks/wishlist";
import {
  useGuestCommerce,
  useGuestCommerceHydrated,
} from "@/providers/guest-commerce-provider";
import { useSession } from "@/providers/session-provider";
import { announceCommerceFeedback } from "@/lib/commerce/feedback";

export function WishlistView() {
  const { authenticated, status } = useSession();
  const hydrated = useGuestCommerceHydrated();
  const guestItems = useGuestCommerce((state) => state.wishlistItems);
  const toggleGuest = useGuestCommerce((state) => state.toggleWishlistItem);
  const addGuestCart = useGuestCommerce((state) => state.addCartItem);
  const query = useInfiniteWishlist();
  const removeMutation = useRemoveFromWishlist();
  const moveMutation = useMoveWishlistItemToCart();
  const items = authenticated
    ? (query.data?.pages.flatMap((page) => page.items) ?? []).map((item) => ({
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        title: item.product.title,
        slug: item.product.slug,
        imageUrl: item.product.imageUrl,
        price: item.price,
        currencyCode: item.currencyCode,
        available: item.available,
        sku: item.variant?.sku ?? null,
      }))
    : guestItems.map((item) => ({
        ...item,
        id: `${item.productId}:${item.variantId ?? "product"}`,
        available: true,
        sku: null,
      }));

  if (
    status === "loading" ||
    (!authenticated && !hydrated) ||
    (authenticated && query.isPending)
  )
    return (
      <div className="namou-container py-10">
        <div className="bg-muted h-[34rem] animate-pulse rounded-xl" />
      </div>
    );
  if (!items.length)
    return (
      <div className="namou-container py-8">
        <EmptyState
          code="N/00"
          title="Nothing saved yet."
          message="Build a collection of objects to return to later. Your saved system stays ready when you do."
          actionLabel="View all objects"
        />
      </div>
    );

  return (
    <div className="namou-container py-7 sm:py-10">
      <div className="border-line flex flex-col justify-between gap-4 border-b pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="technical-label text-subtle">
            Personal archive / {String(items.length).padStart(2, "0")}
          </p>
          <h1 className="display-title mt-2 text-7xl sm:text-9xl">
            Saved objects
          </h1>
        </div>
        <p className="text-subtle max-w-sm text-sm leading-6">
          Your saved system stays available across sessions when you sign in.
        </p>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {items.map((item) => (
          <article
            key={item.id}
            className="group border-line bg-surface overflow-hidden rounded-xl border"
          >
            <div className="relative">
              <Link href={`/shop/${item.slug}`}>
                <ProductMedia
                  src={item.imageUrl}
                  alt={item.title}
                  slug={item.slug}
                  className="aspect-[4/3.55]"
                />
              </Link>
              <button
                onClick={() => {
                  const notify = () =>
                    announceCommerceFeedback({
                      message: "Removed from saved",
                      detail: item.title,
                      tone: "success",
                      target: "wishlist",
                    });
                  if (authenticated) {
                    removeMutation.mutate(item.id, { onSuccess: notify });
                  } else {
                    toggleGuest(item);
                    notify();
                  }
                }}
                className="bg-surface/80 absolute top-3 right-3 grid size-8 place-items-center rounded-full"
                aria-label={`Remove ${item.title}`}
              >
                <X size={14} />
              </button>
            </div>
            <div className="border-line border-t p-3">
              <h2 className="truncate font-mono text-xs font-semibold uppercase">
                {item.title}
              </h2>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-subtle truncate font-mono text-[9px] uppercase">
                  {item.sku ?? "Product level"}
                </span>
                <Price
                  amount={item.price}
                  currencyCode={item.currencyCode}
                  className="text-[10px]"
                />
              </div>
              {item.variantId ? (
                <button
                  onClick={() => {
                    const notify = () =>
                      announceCommerceFeedback({
                        message: "Moved to cart",
                        detail: item.title,
                        tone: "success",
                        target: "cart",
                      });
                    if (authenticated) {
                      moveMutation.mutate(
                        {
                          variantId: item.variantId!,
                          wishlistItemId: item.id,
                        },
                        { onSuccess: notify },
                      );
                    } else {
                      addGuestCart(
                        {
                          variantId: item.variantId!,
                          productId: item.productId,
                          title: item.title,
                          slug: item.slug,
                          imageUrl: item.imageUrl,
                          sku: item.sku ?? "Saved variant",
                          options: [],
                          unitPrice: item.price,
                          currencyCode: item.currencyCode,
                        },
                        1,
                      );
                      toggleGuest(item);
                      notify();
                    }
                  }}
                  disabled={!item.available || moveMutation.isPending}
                  className="bg-ink mt-4 flex min-h-11 w-full items-center justify-between rounded-lg px-4 font-mono text-[10px] text-white uppercase disabled:opacity-40"
                >
                  Move to cart <MoveRight size={15} />
                </button>
              ) : (
                <Link
                  href={`/shop/${item.slug}`}
                  className="bg-acid mt-4 flex min-h-11 items-center justify-between rounded-lg px-4 font-mono text-[10px] uppercase"
                >
                  Choose options <ArrowRight size={15} />
                </Link>
              )}
            </div>
          </article>
        ))}
      </div>
      {authenticated && query.hasNextPage ? (
        <div className="mt-6 text-center">
          <button
            onClick={() => query.fetchNextPage()}
            disabled={query.isFetchingNextPage}
            className="border-line min-h-11 rounded-lg border px-7 font-mono text-[9px] uppercase"
          >
            {query.isFetchingNextPage ? "Loading…" : "Load more"}
          </button>
        </div>
      ) : null}
      <Link
        href="/shop"
        className="border-line mt-7 inline-flex min-h-11 items-center gap-4 rounded-lg border px-5 font-mono text-[10px] uppercase"
      >
        Continue shopping <ArrowRight size={15} />
      </Link>
    </div>
  );
}
