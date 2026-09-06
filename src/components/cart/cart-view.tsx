"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, ShoppingBag, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/commerce/empty-state";
import { Price } from "@/components/commerce/price";
import { ProductMedia } from "@/components/commerce/product-media";
import { QuantityStepper } from "@/components/commerce/quantity-stepper";
import {
  useCart,
  useRemoveCartItem,
  useSetCartItemQuantity,
} from "@/hooks/cart";
import { multiplyMoney, sumMoney } from "@/lib/format/money";
import { announceCommerceFeedback } from "@/lib/commerce/feedback";
import {
  useGuestCommerce,
  useGuestCommerceHydrated,
} from "@/providers/guest-commerce-provider";
import { useSession } from "@/providers/session-provider";

export function CartView() {
  const { authenticated, status } = useSession();
  const hydrated = useGuestCommerceHydrated();
  const guestItems = useGuestCommerce((state) => state.cartItems);
  const setGuestQuantity = useGuestCommerce((state) => state.setCartQuantity);
  const removeGuestItem = useGuestCommerce((state) => state.removeCartItem);
  const cartQuery = useCart();
  const quantityMutation = useSetCartItemQuantity();
  const removeMutation = useRemoveCartItem();
  const mutationPending =
    quantityMutation.isPending || removeMutation.isPending;

  const items = authenticated
    ? (cartQuery.data?.items ?? []).map((item) => ({
        id: item.id,
        variantId: item.variantId,
        title: item.product.title,
        slug: item.product.slug,
        imageUrl: item.product.imageUrl,
        sku: item.variant.sku,
        options: item.variant.options,
        unitPrice: item.unitPrice,
        currencyCode: item.currencyCode,
        quantity: item.quantity,
        availableQuantity: item.availableQuantity,
        available: item.available,
      }))
    : guestItems.map((item) => ({
        ...item,
        id: item.variantId,
        availableQuantity: 999,
        available: true,
      }));
  const currencyCode = items[0]?.currencyCode ?? "USD";
  const subtotal = sumMoney(
    items.map((item) => multiplyMoney(item.unitPrice, item.quantity)),
  );

  if (
    status === "loading" ||
    (!authenticated && !hydrated) ||
    (authenticated && cartQuery.isPending)
  ) {
    return (
      <div className="namou-container py-10">
        <div className="bg-muted h-20 w-64 animate-pulse rounded-xl" />
        <div className="bg-muted mt-8 h-[30rem] animate-pulse rounded-xl" />
      </div>
    );
  }
  if (authenticated && cartQuery.isError) {
    return (
      <div className="namou-container py-8">
        <EmptyState
          code="N/ERR"
          title="Cart link interrupted."
          message="We could not load your cart. Your items are still stored safely on the server."
          actionLabel="Try again"
          actionHref="/cart"
        />
      </div>
    );
  }
  if (!items.length) {
    return (
      <div className="namou-container py-8">
        <EmptyState
          code="N/00"
          title="Your cart has room to move."
          message="Nothing here yet. Enter the system and find an object built for your next move."
          actionLabel="Enter the shop"
        />
      </div>
    );
  }

  function updateQuantity(variantId: string, quantity: number) {
    if (authenticated) {
      quantityMutation.mutate(
        { variantId, input: { quantity } },
        {
          onSuccess: () =>
            announceCommerceFeedback({
              message: "Cart quantity synchronized",
              tone: "success",
              target: "cart",
            }),
        },
      );
    } else {
      setGuestQuantity(variantId, quantity);
    }
  }
  function remove(variantId: string) {
    const item = items.find((candidate) => candidate.variantId === variantId);
    const notify = () =>
      announceCommerceFeedback({
        message: "Removed from cart",
        detail: item?.title,
        tone: "success",
        target: "cart",
      });
    if (authenticated) {
      removeMutation.mutate(variantId, { onSuccess: notify });
    } else {
      removeGuestItem(variantId);
      notify();
    }
  }

  return (
    <div className="namou-container py-7 sm:py-10">
      <div className="grid gap-8 lg:grid-cols-[1fr_23rem]">
        <section>
          <p className="technical-label text-subtle">Loadout / Review</p>
          <h1 className="display-title mt-2 text-7xl sm:text-9xl">
            Cart / {String(items.length).padStart(2, "0")}
          </h1>
          <div className="divide-line border-line mt-7 divide-y border-y">
            {items.map((item) => (
              <article
                key={item.id}
                className="grid grid-cols-[7rem_1fr] gap-4 py-5 sm:grid-cols-[9rem_1fr_auto] sm:items-center"
              >
                <Link
                  href={`/shop/${item.slug}`}
                  className="group border-line overflow-hidden rounded-xl border"
                >
                  <ProductMedia
                    src={item.imageUrl}
                    alt={item.title}
                    slug={item.slug}
                    className="aspect-square"
                    sizes="150px"
                  />
                </Link>
                <div className="min-w-0">
                  <h2 className="font-mono text-xs font-semibold uppercase">
                    <Link href={`/shop/${item.slug}`}>{item.title}</Link>
                  </h2>
                  <p className="text-subtle mt-1 font-mono text-[9px] uppercase">
                    {item.sku}
                  </p>
                  <p className="mt-2 font-mono text-[9px] uppercase">
                    {item.options
                      .map(
                        (option) => `${option.attributeType}: ${option.value}`,
                      )
                      .join(" / ") || "Standard"}
                  </p>
                  {!item.available ? (
                    <p className="text-danger mt-2 font-mono text-[9px] uppercase">
                      Currently unavailable
                    </p>
                  ) : null}
                  <div className="mt-4 flex flex-wrap items-center gap-4 sm:hidden">
                    <QuantityStepper
                      value={item.quantity}
                      max={item.availableQuantity || 1}
                      onChange={(value) =>
                        updateQuantity(item.variantId, value)
                      }
                      disabled={mutationPending}
                    />
                    <button
                      onClick={() => remove(item.variantId)}
                      className="font-mono text-[9px] uppercase underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <div className="border-line col-span-2 flex items-center justify-between border-t pt-3 sm:col-span-1 sm:block sm:border-0 sm:pt-0 sm:text-right">
                  <Price
                    amount={multiplyMoney(item.unitPrice, item.quantity)}
                    currencyCode={item.currencyCode}
                  />
                  <div className="mt-3 hidden sm:flex sm:items-center sm:justify-end sm:gap-4">
                    <QuantityStepper
                      value={item.quantity}
                      max={item.availableQuantity || 1}
                      onChange={(value) =>
                        updateQuantity(item.variantId, value)
                      }
                      disabled={mutationPending}
                    />
                    <button
                      onClick={() => remove(item.variantId)}
                      className="hover:bg-muted grid size-9 place-items-center rounded-lg"
                      aria-label={`Remove ${item.title}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <Link
                    href={`/shop/${item.slug}`}
                    className="font-mono text-[9px] uppercase underline underline-offset-4 sm:mt-3 sm:block"
                  >
                    Change options
                  </Link>
                </div>
              </article>
            ))}
          </div>
          <Link
            href="/shop"
            className="mt-5 inline-flex items-center gap-3 font-mono text-[10px] uppercase"
          >
            <ArrowLeft size={15} /> Continue shopping
          </Link>
        </section>

        <aside className="bg-ink h-fit rounded-xl p-6 text-white lg:sticky lg:top-24">
          <div className="grid min-h-48 place-items-center rounded-full border border-dashed border-white/20">
            <div className="text-center">
              <ShoppingBag className="text-acid mx-auto" strokeWidth={1.2} />
              <p className="mt-3 font-mono text-[10px] uppercase">
                Namou cart system
              </p>
              <p className="mt-1 font-mono text-[9px] text-white/45">
                {items.reduce((sum, item) => sum + item.quantity, 0)} units
                loaded
              </p>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between border-t border-white/15 pt-5 font-mono text-xs">
            <span className="uppercase">Subtotal</span>
            <Price
              amount={subtotal}
              currencyCode={currencyCode}
              className="text-white"
            />
          </div>
          <p className="mt-2 font-mono text-[9px] leading-4 text-white/45">
            Final totals are confirmed when the order is placed.
          </p>
          <Link
            href={authenticated ? "/checkout" : "/login?next=/checkout"}
            className="bg-acid text-ink mt-6 flex min-h-12 items-center justify-between rounded-lg px-5 font-mono text-xs uppercase transition-transform motion-safe:hover:scale-[1.025]"
          >
            Checkout <ArrowRight size={17} />
          </Link>
          {!authenticated ? (
            <p className="mt-3 text-center font-mono text-[9px] text-white/55 uppercase">
              Login is required at checkout
            </p>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
