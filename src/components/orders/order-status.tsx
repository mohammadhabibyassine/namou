import type { OrderStatus } from "@/types/api";
import { cn } from "@/lib/utils/cn";

const steps: Exclude<OrderStatus, "cancelled">[] = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
];

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded px-2 py-1 font-mono text-[9px] uppercase",
        status === "cancelled"
          ? "text-danger bg-red-50"
          : status === "delivered"
            ? "bg-ink text-white"
            : "bg-acid text-ink",
      )}
    >
      <span aria-hidden="true">●</span>
      {status}
    </span>
  );
}

export function OrderStatusTimeline({ status }: { status: OrderStatus }) {
  const activeIndex = status === "cancelled" ? -1 : steps.indexOf(status);
  if (status === "cancelled")
    return (
      <div className="border-danger/30 text-danger rounded-lg border bg-red-50 p-4 font-mono text-[10px] uppercase">
        This order was cancelled.
      </div>
    );
  return (
    <ol className="grid grid-cols-4" aria-label={`Order status: ${status}`}>
      {steps.map((step, index) => (
        <li key={step} className="relative text-center">
          <div
            className={cn(
              "absolute top-2 right-0 left-0 h-px",
              index <= activeIndex ? "bg-ink" : "bg-line",
              index === 0 && "left-1/2",
              index === steps.length - 1 && "right-1/2",
            )}
          />
          <span
            className={cn(
              "relative mx-auto block size-4 rounded-full border-4",
              index <= activeIndex
                ? "border-ink bg-acid"
                : "border-line bg-surface",
            )}
          />
          <span
            className={cn(
              "mt-2 block font-mono text-[8px] uppercase",
              index <= activeIndex ? "text-foreground" : "text-subtle",
            )}
          >
            {step}
          </span>
        </li>
      ))}
    </ol>
  );
}
