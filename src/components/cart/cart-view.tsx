"use client";

import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CircleAlert,
  ShieldCheck,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { EmptyState } from "@/components/commerce/empty-state";
import { Price } from "@/components/commerce/price";
import { ProductMedia } from "@/components/commerce/product-media";
import { QuantityStepper } from "@/components/commerce/quantity-stepper";
import {
  useCart,
  useRemoveCartItem,
  useSetCartItemQuantity,
} from "@/hooks/cart";
import { announceCommerceFeedback } from "@/lib/commerce/feedback";
import { objectName } from "@/lib/commerce/object-name";
import { multiplyMoney, sumMoney } from "@/lib/format/money";
import {
  useGuestCommerce,
  useGuestCommerceHydrated,
} from "@/providers/guest-commerce-provider";
import { useSession } from "@/providers/session-provider";

type CartLine = {
  id: string;
  variantId: string;
  title: string;
  slug: string;
  imageUrl: string | null;
  sku: string;
  options: { attributeType: string; value: string }[];
  unitPrice: string;
  currencyCode: string;
  quantity: number;
  availableQuantity: number;
  available: boolean;
};

export function CartView() {
  const { authenticated, status } = useSession();
  const hydrated = useGuestCommerceHydrated();
  const guestItems = useGuestCommerce((state) => state.cartItems);
  const setGuestQuantity = useGuestCommerce((state) => state.setCartQuantity);
  const removeGuestItem = useGuestCommerce((state) => state.removeCartItem);
  const cartQuery = useCart({ enabled: authenticated });
  const quantityMutation = useSetCartItemQuantity();
  const removeMutation = useRemoveCartItem();
  const mutationPending =
    quantityMutation.isPending || removeMutation.isPending;

  const items: CartLine[] = authenticated
    ? (cartQuery.data?.items ?? []).map((item) => ({
        id: item.id,
        variantId: item.variantId,
        title: objectName(item.product?.title, item.product?.slug ?? ""),
        slug: item.product?.slug ?? "",
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
        imageUrl: item.imageUrl ?? null,
        availableQuantity: 999,
        available: true,
      }));

  const currencyCodes = Array.from(
    new Set(items.map((item) => item.currencyCode)),
  );
  const currencyCode = currencyCodes[0] ?? "USD";
  const subtotal = sumMoney(
    items.map((item) => multiplyMoney(item.unitPrice, item.quantity)),
  );
  const unitCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const unavailableItems = items.filter((item) => !item.available);
  const hasMixedCurrencies = currencyCodes.length > 1;
  const checkoutBlocked = unavailableItems.length > 0 || hasMixedCurrencies;

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
          icon={
            <AlertCircle
              className="size-14 stroke-[1.25] text-amber-600 sm:size-16"
              aria-hidden="true"
            />
          }
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
          icon={
            <ShoppingBag
              className="size-14 stroke-[1.25] sm:size-16"
              aria-hidden="true"
            />
          }
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
      <header className="border-line border-b pb-7 sm:pb-9">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="technical-label text-subtle">Cart / Your selection</p>
          <p className="technical-label text-subtle">
            {String(unitCount).padStart(2, "0")} units / {items.length} objects
          </p>
        </div>
        <div className="mt-5 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <h1 className="display-title text-7xl leading-[0.86] sm:text-9xl">
              Your cart
            </h1>
            <p className="text-subtle mt-4 max-w-md text-sm leading-6">
              A considered selection of objects, held here until you are ready
              to place the order.
            </p>
          </div>
          <Link
            href="/shop"
            className="border-signal-border text-signal hover:bg-signal hover:text-signal-foreground inline-flex min-h-10 items-center gap-3 self-start rounded-lg border px-4 font-mono text-[10px] uppercase transition-colors sm:self-end"
          >
            Keep exploring <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </header>

      <div className="mt-7 grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-10">
        <section aria-labelledby="cart-items-heading">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="technical-label text-subtle">01 / Selection</p>
              <h2 id="cart-items-heading" className="mt-1 text-lg font-medium">
                Selected objects
              </h2>
            </div>
            <span className="border-line rounded-full border px-3 py-1 font-mono text-[10px] uppercase">
              {items.length} {items.length === 1 ? "item" : "items"}
            </span>
          </div>

          <div className="border-line divide-y overflow-hidden rounded-xl border bg-white/35">
            {items.map((item, index) => (
              <article
                key={item.id}
                className="group grid gap-5 p-4 sm:grid-cols-[9rem_minmax(0,1fr)_auto] sm:p-5 lg:grid-cols-[10rem_minmax(0,1fr)_10rem]"
              >
                <div className="border-line relative block overflow-hidden rounded-lg border bg-[#e4e1da]">
                  <span className="bg-ink text-acid absolute top-2 left-2 z-10 grid size-7 place-items-center rounded-full font-mono text-[9px]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {item.available ? (
                    <Link href={`/shop/${item.slug}`} aria-label={`View ${item.title}`}>
                      <ProductMedia
                        src={item.imageUrl}
                        alt={item.title}
                        slug={item.slug}
                        className="aspect-square transition-transform duration-500 group-hover:scale-[1.03]"
                        sizes="160px"
                      />
                    </Link>
                  ) : (
                    <ProductMedia
                      src={item.imageUrl}
                      alt={item.title}
                      slug={item.slug}
                      className="aspect-square grayscale"
                      sizes="160px"
                    />
                  )}
                </div>

                <div className="flex min-w-0 flex-col justify-between gap-5">
                  <div>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base leading-tight font-medium">
                          {item.available ? (
                            <Link
                              href={`/shop/${item.slug}`}
                              className="hover:underline hover:underline-offset-4"
                            >
                              {item.title}
                            </Link>
                          ) : (
                            item.title
                          )}
                        </h3>
                        <p className="text-subtle mt-1 font-mono text-[9px] uppercase">
                          {item.sku}
                        </p>
                      </div>
                      <Price
                        amount={multiplyMoney(item.unitPrice, item.quantity)}
                        currencyCode={item.currencyCode}
                        className="text-sm font-semibold"
                      />
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {item.options.length ? (
                        item.options.map((option) => (
                          <span
                            key={`${option.attributeType}-${option.value}`}
                            className="bg-muted rounded-full px-2.5 py-1 font-mono text-[9px] uppercase"
                          >
                            {option.attributeType}: {option.value}
                          </span>
                        ))
                      ) : (
                        <span className="bg-muted rounded-full px-2.5 py-1 font-mono text-[9px] uppercase">
                          Standard
                        </span>
                      )}
                    </div>

                    {item.available ? (
                      <p className="text-success mt-3 inline-flex items-center gap-1.5 font-mono text-[9px] uppercase">
                        <Check size={12} aria-hidden="true" />
                        {item.availableQuantity} available
                      </p>
                    ) : (
                      <p className="text-danger mt-3 inline-flex items-center gap-1.5 font-mono text-[9px] uppercase">
                        <CircleAlert size={12} aria-hidden="true" />
                        Currently unavailable
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <QuantityStepper
                      value={item.quantity}
                      max={
                        item.available ? item.availableQuantity : item.quantity
                      }
                      onChange={(value) =>
                        updateQuantity(item.variantId, value)
                      }
                      disabled={mutationPending || !item.available}
                    />
                    <button
                      type="button"
                      onClick={() => remove(item.variantId)}
                      disabled={mutationPending}
                      className="text-subtle hover:text-danger inline-flex items-center gap-1.5 font-mono text-[9px] uppercase underline underline-offset-4 disabled:opacity-40"
                    >
                      <Trash2 size={12} aria-hidden="true" />
                      Remove
                    </button>
                  </div>
                </div>

                <div className="border-line flex items-end justify-between border-t pt-4 sm:hidden">
                  <span className="text-subtle font-mono text-[9px] uppercase">
                    Unit price
                  </span>
                  <Price
                    amount={item.unitPrice}
                    currencyCode={item.currencyCode}
                  />
                </div>
              </article>
            ))}
          </div>

          <Link
            href="/shop"
            className="text-subtle hover:text-ink mt-5 inline-flex items-center gap-3 font-mono text-[10px] uppercase transition-colors"
          >
            <ArrowLeft size={15} aria-hidden="true" /> Continue shopping
          </Link>
        </section>

        <aside
          aria-labelledby="order-summary-heading"
          className="bg-ink h-fit overflow-hidden rounded-xl text-white lg:sticky lg:top-24"
        >
          <div className="border-b border-white/10 p-6 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="technical-label text-white/45">02 / Checkout</p>
                <h2
                  id="order-summary-heading"
                  className="mt-2 text-2xl font-medium"
                >
                  Order summary
                </h2>
              </div>
              <div className="bg-acid text-ink grid size-10 place-items-center rounded-full">
                <ShoppingBag size={18} strokeWidth={1.8} aria-hidden="true" />
              </div>
            </div>

            <dl className="mt-8 space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-white/55 uppercase">Items</dt>
                <dd>{unitCount} units</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-white/55 uppercase">Subtotal</dt>
                <dd>
                  <Price
                    amount={subtotal}
                    currencyCode={currencyCode}
                    className="text-white"
                  />
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-white/55 uppercase">Delivery</dt>
                <dd className="text-white/55">Calculated next</dd>
              </div>
            </dl>

            <div className="mt-6 flex items-end justify-between gap-4 border-t border-white/15 pt-5">
              <span className="font-mono text-xs uppercase">
                Total before delivery
              </span>
              <Price
                amount={subtotal}
                currencyCode={currencyCode}
                className="text-acid text-lg"
              />
            </div>
            <p className="mt-3 font-mono text-[9px] leading-4 text-white/45">
              Shipping and taxes are confirmed at checkout. Payment is not
              collected on this step.
            </p>
          </div>

          <div className="p-6 sm:p-7">
            {checkoutBlocked ? (
              <div className="border-warning/40 bg-warning/10 text-warning flex gap-3 rounded-lg border p-3">
                <CircleAlert
                  className="mt-0.5 shrink-0"
                  size={15}
                  aria-hidden="true"
                />
                <p className="font-mono text-[9px] leading-4 uppercase">
                  {hasMixedCurrencies
                    ? "Separate currencies into different orders before checkout."
                    : "Remove unavailable items before checkout."}
                </p>
              </div>
            ) : null}

            {checkoutBlocked ? (
              <span className="bg-muted/10 mt-4 flex min-h-12 cursor-not-allowed items-center justify-between rounded-lg px-5 font-mono text-xs text-white/35 uppercase">
                Checkout unavailable <ArrowRight size={17} aria-hidden="true" />
              </span>
            ) : (
              <Link
                href={authenticated ? "/checkout" : "/login?next=/checkout"}
                className="action-button flex min-h-12 items-center justify-between rounded-lg px-5 font-mono text-xs uppercase"
              >
                {authenticated ? "Continue to checkout" : "Login to checkout"}
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            )}

            {!authenticated && !checkoutBlocked ? (
              <p className="mt-3 text-center font-mono text-[9px] text-white/55 uppercase">
                Your guest cart will be kept when you sign in
              </p>
            ) : null}

            <div className="mt-7 grid gap-3 border-t border-white/10 pt-5 font-mono text-[9px] text-white/55 uppercase sm:grid-cols-2">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck
                  className="text-acid"
                  size={14}
                  aria-hidden="true"
                />
                Secure session
              </span>
              <span className="inline-flex items-center gap-2 sm:justify-end">
                <Check className="text-acid" size={14} aria-hidden="true" />
                Inventory checked
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
