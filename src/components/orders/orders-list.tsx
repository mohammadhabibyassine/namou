"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowDown, ArrowRight } from "lucide-react";
import { AccountTabs } from "@/components/account/account-tabs";
import { Price } from "@/components/commerce/price";
import {
  OrderStatusTimeline,
  StatusBadge,
} from "@/components/orders/order-status";
import { useInfiniteOrders } from "@/hooks/orders";
import { formatDate } from "@/lib/format/date";
import type { OrderStatus } from "@/types/api";
import { cn } from "@/lib/utils/cn";

const filters: Array<"all" | OrderStatus> = [
  "all",
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
];

export function OrdersList() {
  const [status, setStatus] = useState<"all" | OrderStatus>("all");
  const query = useInfiniteOrders(status === "all" ? undefined : status);
  const orders = query.data?.pages.flatMap((page) => page.items) ?? [];
  return (
    <div className="namou-container py-7 sm:py-10">
      <p className="technical-label text-subtle">Account / Movement log</p>
      <h1 className="display-title mt-2 text-7xl sm:text-9xl">Orders</h1>
      <div className="mt-7">
        <AccountTabs />
      </div>
      <div
        className="hide-scrollbar mt-5 flex gap-2 overflow-x-auto pb-2"
        role="group"
        aria-label="Filter orders by status"
      >
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setStatus(filter)}
            aria-pressed={status === filter}
            className={cn(
              "shrink-0 rounded-lg px-5 py-3 font-mono text-[9px] uppercase",
              status === filter ? "bg-acid" : "bg-surface hover:bg-muted",
            )}
          >
            {filter}
          </button>
        ))}
      </div>
      {query.isPending ? (
        <div className="bg-muted mt-4 h-80 animate-pulse rounded-xl" />
      ) : query.isError ? (
        <div className="hairline-panel mt-4 p-10 text-center">
          <p className="display-title text-5xl">Order link interrupted.</p>
        </div>
      ) : orders.length ? (
        <div className="mt-4 space-y-3">
          {orders.map((order) => (
            <article
              key={order.id}
              className="hairline-panel grid gap-5 p-4 sm:grid-cols-[1.3fr_.8fr_.8fr_auto] sm:items-center"
            >
              <div>
                <p className="technical-label text-subtle">Order</p>
                <p className="mt-2 font-mono text-[10px] break-all uppercase">
                  {order.orderNumber}
                </p>
              </div>
              <div>
                <p className="technical-label text-subtle">Created</p>
                <p className="mt-2 font-mono text-[10px] uppercase">
                  {formatDate(order.createdAt)}
                </p>
              </div>
              <div className="flex items-center justify-between gap-5 sm:block">
                <div>
                  <p className="technical-label text-subtle">Total</p>
                  <Price
                    amount={order.total}
                    currencyCode={order.currencyCode}
                    className="mt-2 block"
                  />
                </div>
                <StatusBadge status={order.status} />
              </div>
              <Link
                href={`/orders/${order.id}`}
                className="bg-ink inline-flex min-h-10 items-center justify-between gap-7 rounded-lg px-4 font-mono text-[9px] text-white uppercase"
              >
                View order <ArrowRight size={14} />
              </Link>
              <div className="sm:col-span-4">
                <OrderStatusTimeline status={order.status} />
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="hairline-panel mt-4 p-10 text-center">
          <p className="display-title text-5xl">No movements logged.</p>
          <Link
            href="/shop"
            className="bg-acid mt-5 inline-block rounded-lg px-5 py-3 font-mono text-[10px] uppercase"
          >
            Enter the shop
          </Link>
        </div>
      )}
      {query.hasNextPage ? (
        <div className="mt-6 text-center">
          <button
            onClick={() => query.fetchNextPage()}
            disabled={query.isFetchingNextPage}
            className="border-line inline-flex min-h-11 items-center gap-5 rounded-lg border px-8 font-mono text-[10px] uppercase"
          >
            {query.isFetchingNextPage ? "Loading…" : "Load more"}
            <ArrowDown size={14} />
          </button>
        </div>
      ) : null}
    </div>
  );
}
