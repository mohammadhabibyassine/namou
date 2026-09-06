"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowDown, ArrowRight } from "lucide-react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Price } from "@/components/commerce/price";
import { StatusBadge } from "@/components/orders/order-status";
import { ordersApi } from "@/features/orders/api";
import { formatDate } from "@/lib/format/date";
import { queryKeys } from "@/lib/query/keys";
import type { OrderStatus } from "@/types/api";

export function AdminOrders() {
  const [status, setStatus] = useState<"" | OrderStatus>("");
  const query = useInfiniteQuery({
    queryKey: queryKeys.admin.orders({ status }),
    initialPageParam: "",
    queryFn: ({ pageParam }) =>
      ordersApi.adminList({
        ...(status ? { status } : {}),
        ...(pageParam ? { cursor: pageParam } : {}),
        pageSize: 25,
      }),
    getNextPageParam: (page) =>
      page.pageInfo.hasNextPage
        ? (page.pageInfo.endCursor ?? undefined)
        : undefined,
  });
  const orders = query.data?.pages.flatMap((page) => page.items) ?? [];
  return (
    <div className="p-4 sm:p-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="technical-label text-subtle">Operations / Fulfilment</p>
          <h1 className="display-title mt-2 text-6xl sm:text-8xl">Orders</h1>
        </div>
        <label className="flex items-center gap-3">
          <span className="technical-label">Status</span>
          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as "" | OrderStatus)
            }
            className="border-line bg-surface h-11 rounded-lg border px-4 font-mono text-[10px] uppercase"
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>
      </div>
      <section className="hairline-panel mt-7 overflow-hidden">
        <div className="border-line bg-muted/60 text-subtle hidden grid-cols-[1.4fr_.8fr_.7fr_.7fr_auto] gap-4 border-b px-4 py-3 font-mono text-[8px] uppercase sm:grid">
          <span>Order</span>
          <span>Created</span>
          <span>Status</span>
          <span>Total</span>
          <span>Action</span>
        </div>
        {query.isPending ? (
          <div className="bg-muted h-72 animate-pulse" />
        ) : query.isError ? (
          <div className="text-danger p-10 text-center text-sm">
            Order queue could not be loaded.
          </div>
        ) : orders.length ? (
          <div className="divide-line divide-y">
            {orders.map((order) => (
              <article
                key={order.id}
                className="grid gap-3 p-4 sm:grid-cols-[1.4fr_.8fr_.7fr_.7fr_auto] sm:items-center"
              >
                <div>
                  <span className="technical-label text-subtle sm:hidden">
                    Order
                  </span>
                  <p className="font-mono text-[9px] break-all uppercase">
                    {order.orderNumber}
                  </p>
                </div>
                <p className="font-mono text-[9px] uppercase">
                  {formatDate(order.createdAt)}
                </p>
                <div>
                  <StatusBadge status={order.status} />
                </div>
                <Price
                  amount={order.total}
                  currencyCode={order.currencyCode}
                  className="text-[9px]"
                />
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="bg-ink inline-flex min-h-9 items-center justify-between gap-5 rounded-lg px-4 font-mono text-[9px] text-white uppercase"
                >
                  View <ArrowRight size={13} />
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center">
            <p className="display-title text-4xl">Queue clear.</p>
          </div>
        )}
      </section>
      {query.hasNextPage ? (
        <button
          onClick={() => query.fetchNextPage()}
          className="border-line mx-auto mt-5 flex min-h-10 items-center gap-4 rounded-lg border px-6 font-mono text-[9px] uppercase"
        >
          Load more <ArrowDown size={13} />
        </button>
      ) : null}
    </div>
  );
}
