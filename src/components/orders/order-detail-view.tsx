"use client";

import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import { Price } from "@/components/commerce/price";
import { ProductMedia } from "@/components/commerce/product-media";
import {
  OrderStatusTimeline,
  StatusBadge,
} from "@/components/orders/order-status";
import { useOrderDetail } from "@/hooks/orders";
import { formatDateTime } from "@/lib/format/date";

export function OrderDetailView({ orderId }: { orderId: string }) {
  const query = useOrderDetail(orderId);
  if (query.isPending)
    return (
      <div className="namou-container py-10">
        <div className="bg-muted h-[38rem] animate-pulse rounded-xl" />
      </div>
    );
  if (query.isError)
    return (
      <div className="namou-container py-10">
        <div className="hairline-panel p-10 text-center">
          <h1 className="display-title text-6xl">Order unavailable.</h1>
          <Link
            href="/orders"
            className="bg-ink mt-6 inline-block rounded-lg px-5 py-3 font-mono text-[10px] text-white uppercase"
          >
            Back to orders
          </Link>
        </div>
      </div>
    );
  const order = query.data;
  return (
    <div className="namou-container py-7 sm:py-10">
      <div className="border-line flex flex-col justify-between gap-5 border-b pb-7 lg:flex-row lg:items-end">
        <div>
          <p className="technical-label text-subtle">
            Account / Orders / {order.orderNumber}
          </p>
          <h1 className="display-title mt-2 text-6xl sm:text-8xl">
            Order detail
          </h1>
        </div>
        <div className="lg:text-right">
          <StatusBadge status={order.status} />
          <p className="text-subtle mt-3 font-mono text-[10px] uppercase">
            {formatDateTime(order.createdAt)}
          </p>
        </div>
      </div>
      <div className="border-line bg-surface my-7 rounded-xl border p-5 sm:p-7">
        <OrderStatusTimeline status={order.status} />
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.35fr_.65fr]">
        <section className="hairline-panel overflow-hidden">
          <div className="border-line border-b p-5">
            <h2 className="technical-label">Objects / {order.items.length}</h2>
          </div>
          <div className="divide-line divide-y">
            {order.items.map((item) => (
              <article
                key={item.id}
                className="grid grid-cols-[6rem_1fr_auto] items-center gap-4 p-4"
              >
                <ProductMedia
                  src={item.imageUrl}
                  alt={item.productTitle}
                  className="aspect-square rounded-lg"
                  sizes="96px"
                />
                <div className="min-w-0">
                  <h3 className="font-mono text-[10px] font-semibold uppercase">
                    {item.productTitle}
                  </h3>
                  <p className="text-subtle mt-2 font-mono text-[8px] uppercase">
                    {item.variantLabel ?? item.sku}
                  </p>
                  <p className="mt-1 font-mono text-[8px] uppercase">
                    Qty {item.quantity} ×{" "}
                    <Price
                      amount={item.unitPrice}
                      currencyCode={order.currencyCode}
                      className="text-[8px]"
                    />
                  </p>
                </div>
                <Price
                  amount={item.lineTotal}
                  currencyCode={order.currencyCode}
                />
              </article>
            ))}
          </div>
          <div className="border-line border-t p-5">
            <h2 className="technical-label">Order status history</h2>
            <ol className="mt-4 space-y-3">
              {order.statusHistory.map((entry) => (
                <li
                  key={entry.id}
                  className="border-acid flex items-center justify-between gap-4 border-l-2 pl-4 font-mono text-[9px] uppercase"
                >
                  <span>
                    {entry.fromStatus ? `${entry.fromStatus} → ` : ""}
                    {entry.toStatus}
                  </span>
                  <time className="text-subtle">
                    {formatDateTime(entry.createdAt)}
                  </time>
                </li>
              ))}
            </ol>
          </div>
        </section>
        <aside className="space-y-4">
          <div className="hairline-panel p-5">
            <div className="flex items-center gap-3">
              <MapPin size={16} />
              <h2 className="technical-label">Shipping address</h2>
            </div>
            <p className="text-subtle mt-4 text-sm leading-6">
              {order.shippingAddress.recipientName}
              <br />
              {order.shippingAddress.addressLine1}
              {order.shippingAddress.addressLine2 ? (
                <>
                  <br />
                  {order.shippingAddress.addressLine2}
                </>
              ) : null}
              <br />
              {order.shippingAddress.city}
              {order.shippingAddress.state
                ? `, ${order.shippingAddress.state}`
                : ""}{" "}
              {order.shippingAddress.postalCode}
              <br />
              {order.shippingAddress.countryCode}
            </p>
          </div>
          {order.notes ? (
            <div className="hairline-panel p-5">
              <h2 className="technical-label">Order notes</h2>
              <p className="text-subtle mt-3 text-sm leading-6">
                {order.notes}
              </p>
            </div>
          ) : null}
          <div className="bg-ink rounded-xl p-5 font-mono text-[10px] text-white uppercase">
            <div className="flex justify-between py-2">
              <span className="text-white/55">Subtotal</span>
              <Price
                amount={order.subtotal}
                currencyCode={order.currencyCode}
                className="text-white"
              />
            </div>
            <div className="flex justify-between py-2">
              <span className="text-white/55">Discount</span>
              <Price
                amount={order.discountAmount}
                currencyCode={order.currencyCode}
                className="text-white"
              />
            </div>
            <div className="flex justify-between py-2">
              <span className="text-white/55">Shipping</span>
              <Price
                amount={order.shippingCost}
                currencyCode={order.currencyCode}
                className="text-white"
              />
            </div>
            <div className="flex justify-between py-2">
              <span className="text-white/55">Tax</span>
              <Price
                amount={order.taxAmount}
                currencyCode={order.currencyCode}
                className="text-white"
              />
            </div>
            <div className="mt-2 flex justify-between border-t border-white/15 pt-4 text-sm">
              <span>Total</span>
              <Price
                amount={order.total}
                currencyCode={order.currencyCode}
                className="text-acid text-sm"
              />
            </div>
          </div>
        </aside>
      </div>
      <Link
        href="/orders"
        className="mt-6 inline-flex items-center gap-3 font-mono text-[10px] uppercase"
      >
        <ArrowLeft size={15} /> Back to orders
      </Link>
    </div>
  );
}
