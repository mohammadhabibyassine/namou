import { Minus, Plus } from "lucide-react";
import { clampQuantity } from "@/lib/commerce/quantity";

export function QuantityStepper({
  value,
  onChange,
  disabled = false,
  max = 999,
  label = "Quantity",
}: {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  max?: number;
  label?: string;
}) {
  const normalizedMax = Math.max(1, max);
  const normalizedValue = clampQuantity(value, normalizedMax);

  return (
    <div className="border-line bg-surface inline-flex items-center rounded-lg border">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, normalizedValue - 1))}
        disabled={disabled || normalizedValue <= 1}
        className="grid size-9 place-items-center disabled:opacity-30"
        aria-label={`Decrease ${label}`}
      >
        <Minus size={13} />
      </button>
      <output
        className="w-8 text-center font-mono text-[10px] tabular-nums"
        aria-label={`${label}: ${value}`}
      >
        {normalizedValue}
      </output>
      <button
        type="button"
        onClick={() => onChange(Math.min(normalizedMax, normalizedValue + 1))}
        disabled={disabled || normalizedValue >= normalizedMax}
        className="grid size-9 place-items-center disabled:opacity-30"
        aria-label={`Increase ${label}`}
      >
        <Plus size={13} />
      </button>
    </div>
  );
}
