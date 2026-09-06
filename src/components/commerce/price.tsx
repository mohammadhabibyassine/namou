import { formatMoney } from "@/lib/format/money";
import { cn } from "@/lib/utils/cn";

export function Price({
  amount,
  currencyCode,
  className,
}: {
  amount: string;
  currencyCode: string;
  className?: string;
}) {
  return (
    <span className={cn("font-mono text-xs tabular-nums", className)}>
      {formatMoney(amount, currencyCode)}
    </span>
  );
}
