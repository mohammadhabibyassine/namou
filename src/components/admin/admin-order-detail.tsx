"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Price } from "@/components/commerce/price";
import { ProductMedia } from "@/components/commerce/product-media";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  OrderStatusTimeline,
  StatusBadge,
} from "@/components/orders/order-status";
import { ordersApi } from "@/features/orders/api";
import { formatDateTime } from "@/lib/format/date";
import { queryKeys } from "@/lib/query/keys";
import type { OrderStatus } from "@/types/api";

const transitions: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

export function AdminOrderDetail({ orderId }: { orderId: string }) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: queryKeys.admin.order(orderId),
    queryFn: () => ordersApi.adminDetail(orderId),
  });
  const update = useMutation({
    mutationFn: (status: OrderStatus) =>
      ordersApi.updateStatus(orderId, status),
    onSuccess: (order) => {
      queryClient.setQueryData(queryKeys.admin.order(orderId), order);
      void queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
  });
  if (query.isPending)
    return (
      <div className="p-7">
        <div className="bg-muted h-[38rem] animate-pulse rounded-xl" />
      </div>
    );
  if (query.isError)
    return (
      <div className="p-7">
        <div className="hairline-panel text-danger p-10 text-center">
          Order record could not be loaded.
        </div>
      </div>
    );
  const order = query.data;
  return (
    <div className="p-4 sm:p-7">
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-3 font-mono text-[9px] uppercase"
      >
        <ArrowLeft size={13} /> Orders
      </Link>
      <div className="border-line mt-5 flex flex-col justify-between gap-4 border-b pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="technical-label text-subtle">Order record</p>
          <h1 className="display-title mt-2 text-5xl sm:text-7xl">
            {order.orderNumber}
          </h1>
        </div>
        <StatusBadge status={order.status} />
      </div>
      <div className="border-line bg-surface my-6 rounded-xl border p-5">
        <OrderStatusTimeline status={order.status} />
      </div>
      <div className="grid gap-4 xl:grid-cols-[1fr_21rem]">
        <section className="hairline-panel overflow-hidden">
          <div className="border-line border-b p-4">
            <h2 className="technical-label">Items / {order.items.length}</h2>
          </div>
          <div className="divide-line divide-y">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[4rem_1fr_auto] items-center gap-3 p-4"
              >
                <ProductMedia
                  src={item.imageUrl}
                  alt={item.productTitle}
                  slug={item.productTitle}
                  className="aspect-square rounded-lg"
                  sizes="64px"
                />
                <div>
                  <p className="font-mono text-[9px] uppercase">
                    {item.productTitle}
                  </p>
                  <p className="text-subtle mt-1 font-mono text-[8px] uppercase">
                    {item.sku} / Qty {item.quantity}
                  </p>
                </div>
                <Price
                  amount={item.lineTotal}
                  currencyCode={order.currencyCode}
                  className="text-[9px]"
                />
              </div>
            ))}
          </div>
          <div className="border-line grid gap-4 border-t p-4 md:grid-cols-2">
            <div>
              <h2 className="technical-label">Customer / destination</h2>
              <p className="text-subtle mt-3 text-sm leading-6">
                Customer {order.userId}
                <br />
                {order.shippingAddress.recipientName}
                <br />
                {order.shippingAddress.addressLine1}
                <br />
                {order.shippingAddress.city},{" "}
                {order.shippingAddress.countryCode}
              </p>
            </div>
            <div>
              <h2 className="technical-label">Status log</h2>
              <ol className="mt-3 space-y-2">
                {order.statusHistory.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex justify-between gap-3 font-mono text-[8px] uppercase"
                  >
                    <span>
                      {entry.fromStatus ?? "created"} → {entry.toStatus}
                    </span>
                    <time className="text-subtle">
                      {formatDateTime(entry.createdAt)}
                    </time>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>
        <aside className="space-y-4">
          <div className="bg-ink rounded-xl p-5 text-white">
            <p className="technical-label text-white/55">Total</p>
            <Price
              amount={order.total}
              currencyCode={order.currencyCode}
              className="text-acid mt-3 block text-xl"
            />
          </div>
          <div className="hairline-panel p-5">
            <h2 className="technical-label">Allowed transitions</h2>
            <div className="mt-4 space-y-2">
              {transitions[order.status].length ? (
                transitions[order.status].map((status) => (
                  <button
                    key={status}
                    onClick={() => update.mutate(status)}
                    disabled={update.isPending}
                    className={
                      status === "cancelled"
                        ? "border-danger text-danger flex min-h-11 w-full items-center justify-between rounded-lg border px-4 font-mono text-[9px] uppercase"
                        : "action-button flex min-h-11 w-full items-center justify-between rounded-lg px-4 font-mono text-[9px] uppercase"
                    }
                  >
                    {status === "cancelled"
                      ? "Cancel order"
                      : `Mark as ${status}`}
                    {update.isPending ? (
                      <LoadingSpinner size="xs" />
                    ) : (
                      <ArrowRight size={13} />
                    )}
                  </button>
                ))
              ) : (
                <p className="text-subtle text-sm">
                  No further status changes are allowed.
                </p>
              )}
            </div>
            {update.error ? (
              <p className="text-danger mt-3 text-sm" role="alert">
                {update.error.message}
              </p>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  );
}
