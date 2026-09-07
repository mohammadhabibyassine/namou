"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Check, MapPin, Plus } from "lucide-react";
import { Price } from "@/components/commerce/price";
import { ProductMedia } from "@/components/commerce/product-media";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useCart } from "@/hooks/cart";
import { useCheckout } from "@/hooks/orders";
import { useUserAddresses } from "@/hooks/users";
import { multiplyMoney, sumMoney } from "@/lib/format/money";
import { cn } from "@/lib/utils/cn";

export function CheckoutView() {
  const router = useRouter();
  const cart = useCart();
  const addresses = useUserAddresses();
  const [addressId, setAddressId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const selectedAddressId =
    addressId ||
    addresses.data?.find((address) => address.isDefault)?.id ||
    addresses.data?.[0]?.id ||
    "";
  const subtotal = sumMoney(
    cart.data?.items.map((item) =>
      multiplyMoney(item.unitPrice, item.quantity),
    ) ?? [],
  );
  const currency = cart.data?.items[0]?.currencyCode ?? "USD";
  const checkout = useCheckout();

  if (cart.isPending || addresses.isPending)
    return (
      <div className="namou-container py-10">
        <div className="bg-muted h-[38rem] animate-pulse rounded-xl" />
      </div>
    );
  if (cart.isError || addresses.isError)
    return (
      <div className="namou-container py-10">
        <div className="hairline-panel p-10 text-center">
          <h1 className="display-title text-6xl">Checkout interrupted.</h1>
          <p className="text-subtle mt-3 text-sm">
            Your cart is unchanged. Reload when the connection is available.
          </p>
        </div>
      </div>
    );
  if (!cart.data?.items.length)
    return (
      <div className="namou-container py-10">
        <div className="hairline-panel p-10 text-center">
          <h1 className="display-title text-6xl">Nothing to review.</h1>
          <Link
            href="/shop"
            className="action-button mt-6 inline-block rounded-lg px-5 py-3 font-mono text-[10px] uppercase"
          >
            Enter the shop
          </Link>
        </div>
      </div>
    );

  return (
    <div className="namou-container py-7 sm:py-10">
      <div className="grid gap-7 lg:grid-cols-[1fr_23rem]">
        <section>
          <p className="technical-label text-subtle">Checkout / Final review</p>
          <h1 className="display-title mt-2 text-6xl sm:text-8xl">
            Review / Place order
          </h1>
          <fieldset className="mt-8">
            <legend className="technical-label mb-3">Shipping address</legend>
            <div className="space-y-3">
              {addresses.data?.map((address) => {
                const active = selectedAddressId === address.id;
                return (
                  <label
                    key={address.id}
                    className={cn(
                      "flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition",
                      active
                        ? "border-acid bg-surface shadow-[inset_4px_0_0_var(--acid)]"
                        : "border-line",
                    )}
                  >
                    <input
                      type="radio"
                      name="address"
                      value={address.id}
                      checked={active}
                      onChange={() => setAddressId(address.id)}
                      className="sr-only"
                    />
                    <span
                      className={cn(
                        "mt-1 grid size-6 place-items-center rounded-full border",
                        active ? "border-ink bg-ink text-acid" : "border-line",
                      )}
                    >
                      <Check size={12} />
                    </span>
                    <span className="flex-1">
                      <span className="font-mono text-xs font-semibold uppercase">
                        {address.label ?? "Address"}
                        {address.isDefault ? (
                          <span className="bg-acid ml-2 rounded px-2 py-1 text-[8px]">
                            Default
                          </span>
                        ) : null}
                      </span>
                      <span className="text-subtle mt-2 block text-sm leading-5">
                        {address.recipientName}
                        <br />
                        {address.addressLine1}, {address.city},{" "}
                        {address.countryCode}
                      </span>
                    </span>
                    <MapPin size={16} />
                  </label>
                );
              })}
            </div>
            {!addresses.data?.length ? (
              <div className="border-line rounded-xl border p-6 text-center">
                <p className="text-subtle text-sm">
                  A saved address is required to place an order.
                </p>
                <Link
                  href="/account/addresses"
                  className="bg-ink mt-4 inline-flex items-center gap-3 rounded-lg px-4 py-3 font-mono text-[10px] text-white uppercase"
                >
                  <Plus size={14} /> Add address
                </Link>
              </div>
            ) : (
              <Link
                href="/account/addresses"
                className="mt-3 inline-flex items-center gap-3 font-mono text-[9px] uppercase"
              >
                <Plus size={13} /> Manage addresses
              </Link>
            )}
          </fieldset>
          <label className="mt-8 block">
            <span className="technical-label">Order notes / optional</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              maxLength={5000}
              rows={5}
              className="border-line bg-surface focus:border-ink mt-3 w-full resize-y rounded-xl border p-4 text-sm outline-none"
              placeholder="Access details or delivery notes"
            />
          </label>
        </section>
        <aside className="bg-ink h-fit rounded-xl p-6 text-white lg:sticky lg:top-24">
          <p className="technical-label text-white/55">Order summary</p>
          <div className="mt-5 space-y-4">
            {cart.data.items.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[4.5rem_1fr_auto] items-center gap-3"
              >
                <ProductMedia
                  src={item.product.imageUrl}
                  alt={item.product.title}
                  slug={item.product.slug}
                  className="aspect-square rounded-lg"
                  sizes="72px"
                />
                <div className="min-w-0">
                  <p className="truncate font-mono text-[10px] uppercase">
                    {item.product.title}
                  </p>
                  <p className="mt-1 font-mono text-[8px] text-white/45 uppercase">
                    {item.variant.sku} / Qty {item.quantity}
                  </p>
                </div>
                <Price
                  amount={multiplyMoney(item.unitPrice, item.quantity)}
                  currencyCode={item.currencyCode}
                  className="text-[9px] text-white"
                />
              </div>
            ))}
          </div>
          <div className="mt-6 space-y-3 border-t border-white/15 pt-5 font-mono text-[10px] uppercase">
            <div className="flex justify-between">
              <span className="text-white/55">Subtotal</span>
              <Price
                amount={subtotal}
                currencyCode={currency}
                className="text-white"
              />
            </div>
            <div className="flex justify-between">
              <span className="text-white/55">Shipping / Tax</span>
              <span>At order</span>
            </div>
            <div className="flex justify-between border-t border-white/15 pt-4 text-xs">
              <span>Total</span>
              <Price
                amount={subtotal}
                currencyCode={currency}
                className="text-sm text-white"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              checkout.mutate(
                {
                  addressId: selectedAddressId,
                  ...(notes.trim() ? { notes: notes.trim() } : {}),
                },
                {
                  onSuccess: (order) =>
                    router.push(`/order-confirmation/${order.id}`),
                },
              )
            }
            disabled={
              !selectedAddressId ||
              checkout.isPending ||
              cart.data.items.some((item) => !item.available)
            }
            className="action-button mt-6 flex min-h-12 w-full items-center justify-between rounded-lg px-5 font-mono text-xs uppercase"
          >
            {checkout.isPending ? (
              <>
                <LoadingSpinner size="sm" /> Placing…
              </>
            ) : (
              <>
                Place order <ArrowRight size={16} />
              </>
            )}
          </button>
          {checkout.error ? (
            <p className="mt-3 text-sm text-red-300" role="alert">
              {checkout.error.message}
            </p>
          ) : null}
          <p className="mt-4 font-mono text-[8px] leading-4 text-white/45">
            Stock is confirmed when the order is placed.
          </p>
        </aside>
      </div>
    </div>
  );
}
