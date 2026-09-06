"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Price } from "@/components/commerce/price";
import { ProductMedia } from "@/components/commerce/product-media";
import { StatusBadge } from "@/components/orders/order-status";
import { useOrderDetail } from "@/hooks/orders";

const pieces = Array.from({ length: 34 }, (_, index) => ({
  left: `${(index * 37) % 100}%`,
  delay: `${(index % 9) * 0.08}s`,
  duration: `${2.2 + (index % 7) * 0.18}s`,
  drift: `${((index % 5) - 2) * 34}px`,
  color: index % 3 === 0 ? "#b8ff00" : index % 3 === 1 ? "#f3f1ec" : "#7a7f79",
}));

export function OrderConfirmationView({ orderId }: { orderId: string }) {
  const query = useOrderDetail(orderId);
  if (query.isPending)
    return (
      <div className="namou-container py-8">
        <div className="bg-ink h-[40rem] animate-pulse rounded-xl" />
      </div>
    );
  if (query.isError)
    return (
      <div className="namou-container py-8">
        <div className="hairline-panel p-10 text-center">
          <h1 className="display-title text-6xl">Order link interrupted.</h1>
          <Link
            href="/orders"
            className="bg-acid mt-6 inline-block rounded-lg px-5 py-3 font-mono text-[10px] uppercase"
          >
            View orders
          </Link>
        </div>
      </div>
    );
  const order = query.data;
  return (
    <div className="namou-container py-4 sm:py-7">
      <section className="bg-ink relative isolate min-h-[34rem] overflow-hidden rounded-xl p-6 text-white sm:p-10">
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          aria-hidden="true"
        >
          {pieces.map((piece, index) => (
            <span
              key={index}
              className="confetti-piece absolute top-0 h-3 w-1"
              style={
                {
                  left: piece.left,
                  background: piece.color,
                  "--delay": piece.delay,
                  "--duration": piece.duration,
                  "--drift": piece.drift,
                } as CSSProperties
              }
            />
          ))}
        </div>
        <div className="absolute top-1/2 right-[-8%] aspect-square w-[58%] -translate-y-1/2 rounded-full border border-dashed border-white/15 sm:w-[42%]">
          <div className="absolute inset-[12%] rounded-full border border-white/10" />
          <div className="bg-acid absolute inset-[29%] rotate-45 rounded-[34%] shadow-[0_0_80px_rgb(184_255_0/.25)]" />
          <div className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 gap-5">
            <span className="bg-ink size-3 rounded-full" />
            <span className="bg-ink size-3 rounded-full" />
          </div>
          <span className="border-ink absolute bottom-[29%] left-1/2 h-2 w-10 -translate-x-1/2 rounded-b-full border-b-2" />
        </div>
        <div className="relative z-10 flex min-h-[29rem] max-w-4xl flex-col justify-between">
          <div>
            <p className="technical-label text-acid">
              Order confirmed / System active
            </p>
            <h1 className="display-title mt-6 max-w-4xl text-[clamp(5rem,12vw,10rem)]">
              Your order is in.
            </h1>
            <p className="mt-5 font-mono text-xs break-all text-white/65 uppercase">
              {order.orderNumber}
            </p>
            <div className="mt-4">
              <StatusBadge status={order.status} />
            </div>
          </div>
          <p className="max-w-md font-mono text-[9px] leading-5 text-white/50 uppercase">
            We will keep your movement status updated as this order moves
            through the system.
          </p>
        </div>
      </section>
      <div className="mt-3 grid gap-3 md:grid-cols-[.6fr_.8fr_1.6fr]">
        <div className="hairline-panel p-5">
          <p className="technical-label text-subtle">Total</p>
          <Price
            amount={order.total}
            currencyCode={order.currencyCode}
            className="display-title mt-4 block font-[family-name:var(--font-anton)] text-5xl"
          />
        </div>
        <div className="hairline-panel p-5">
          <p className="technical-label text-subtle">Destination</p>
          <p className="mt-4 font-mono text-xs uppercase">
            {order.shippingAddress.city}, {order.shippingAddress.countryCode}
          </p>
        </div>
        <div className="hairline-panel p-5">
          <p className="technical-label text-subtle">
            Objects / {order.items.length}
          </p>
          <div className="mt-3 flex gap-3 overflow-x-auto">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="grid min-w-44 grid-cols-[3.5rem_1fr] items-center gap-2"
              >
                <ProductMedia
                  src={item.imageUrl}
                  alt={item.productTitle}
                  slug={item.productTitle}
                  className="aspect-square rounded-lg"
                  sizes="56px"
                />
                <div>
                  <p className="line-clamp-1 font-mono text-[9px] uppercase">
                    {item.productTitle}
                  </p>
                  <p className="text-subtle mt-1 font-mono text-[8px]">
                    QTY {item.quantity}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Link
          href={`/orders/${order.id}`}
          className="bg-ink inline-flex min-h-11 items-center justify-between gap-8 rounded-lg px-5 font-mono text-[10px] text-white uppercase"
        >
          View order <ArrowRight size={15} />
        </Link>
        <Link
          href="/shop"
          className="border-line inline-flex min-h-11 items-center justify-between gap-8 rounded-lg border px-5 font-mono text-[10px] uppercase"
        >
          Continue shopping <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}
